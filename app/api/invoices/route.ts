import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice, items } = body;

    if (!invoice || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invoice and items are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoice)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 }
      );
    }

    const itemsWithInvoiceId = items.map(
      (item: { description: string; quantity: number; unit_price: number; amount: number; sort_order: number }, index: number) => ({
        ...item,
        invoice_id: invoiceData.id,
        sort_order: index,
      })
    );

    const { data: itemsData, error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId)
      .select();

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
      items: itemsData,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    const supabase = await createClient();

    let query = supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .order("created_at", { ascending: false });

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
