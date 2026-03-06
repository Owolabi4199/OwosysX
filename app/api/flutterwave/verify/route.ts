import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Verify a Flutterwave transaction and activate Pro
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to verify payment" },
        { status: 401 }
      );
    }

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Verify with Flutterwave API
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const flwData = await flwRes.json();

    if (flwData.status !== "success" || flwData.data?.status !== "successful") {
      return NextResponse.json(
        { error: "Payment not verified. Please check your transaction ID." },
        { status: 400 }
      );
    }

    const txData = flwData.data;

    // Check if already used
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("flutterwave_tx_id", String(txData.id))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This transaction has already been applied." },
        { status: 400 }
      );
    }

    // Calculate expiry: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create subscription record
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      flutterwave_tx_id: String(txData.id),
      flutterwave_tx_ref: txData.tx_ref,
      amount: txData.amount,
      currency: txData.currency,
      status: "active",
      paid_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (subError) {
      console.error("[v0] Subscription insert error:", subError);
      return NextResponse.json(
        { error: "Failed to activate Pro. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Pro plan activated! Enjoy unlimited invoices for 30 days.",
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[v0] Verify error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
