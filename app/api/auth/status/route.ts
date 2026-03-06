import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.json({
        authenticated: true,
        email: user.email,
        id: user.id,
        isPro: true,
      });
    }

    return NextResponse.json({
      authenticated: false,
      email: null,
      id: null,
      isPro: false,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      email: null,
      id: null,
      isPro: false,
    });
  }
}
