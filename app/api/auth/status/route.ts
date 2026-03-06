import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 3-tier system:
// Guest (not logged in): FREE_INVOICE_LIMIT invoices, no save
// Free (logged in, no subscription): FREE_INVOICE_LIMIT invoices, can save
// Pro (logged in, active subscription): unlimited invoices, all features

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest user - not logged in
      return NextResponse.json({
        authenticated: false,
        tier: "guest",
        email: null,
        id: null,
        isPro: false,
        expiresAt: null,
      });
    }

    // User is logged in - check for active subscription
    const now = new Date().toISOString();
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Also expire any old subscriptions
    await supabase
      .from("subscriptions")
      .update({ status: "expired", updated_at: now })
      .eq("user_id", user.id)
      .eq("status", "active")
      .lt("expires_at", now);

    if (subscription) {
      // Pro user - has active subscription
      return NextResponse.json({
        authenticated: true,
        tier: "pro",
        email: user.email,
        id: user.id,
        isPro: true,
        expiresAt: subscription.expires_at,
      });
    }

    // Free user - logged in but no active subscription
    return NextResponse.json({
      authenticated: true,
      tier: "free",
      email: user.email,
      id: user.id,
      isPro: false,
      expiresAt: null,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      tier: "guest",
      email: null,
      id: null,
      isPro: false,
      expiresAt: null,
    });
  }
}
