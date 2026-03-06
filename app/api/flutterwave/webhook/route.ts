import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Flutterwave sends webhook events here after payment
export async function POST(req: NextRequest) {
  try {
    // Verify the webhook comes from Flutterwave using the secret hash
    const secretHash = process.env.FLUTTERWAVE_SECRET_KEY;
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload.event;
    const data = payload.data;

    // Only process successful charges
    if (event === "charge.completed" && data.status === "successful") {
      const txId = String(data.id);
      const txRef = data.tx_ref;
      const amount = data.amount;
      const currency = data.currency;
      const customerEmail = data.customer?.email;

      if (!customerEmail) {
        return NextResponse.json({ error: "No customer email" }, { status: 400 });
      }

      const supabase = await createClient();

      // Find the user by email
      // Use admin client to look up user by email in auth.users
      const { data: users } = await supabase
        .from("waitlist") // We'll also check auth
        .select("*")
        .limit(1);

      // Look up user via Supabase Auth admin
      // Since we can't list users with anon key, we match by tx_ref which contains user ID
      // tx_ref format: "vtx_pro_{userId}_{timestamp}"
      const userIdMatch = txRef?.match(/vtx_pro_([a-f0-9-]+)_/);
      const userId = userIdMatch ? userIdMatch[1] : null;

      if (!userId) {
        console.error("[v0] Could not extract user ID from tx_ref:", txRef);
        return NextResponse.json({ error: "Invalid tx_ref format" }, { status: 400 });
      }

      // Calculate expiry: 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Upsert subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            flutterwave_tx_id: txId,
            flutterwave_tx_ref: txRef,
            amount,
            currency,
            status: "active",
            paid_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "flutterwave_tx_id",
          }
        );

      if (subError) {
        console.error("[v0] Subscription upsert error:", subError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ status: "success" });
    }

    // For other events, just acknowledge
    return NextResponse.json({ status: "acknowledged" });
  } catch (err) {
    console.error("[v0] Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
