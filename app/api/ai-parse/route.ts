import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const invoiceSchema = z.object({
  clientName: z.string().describe("Client or customer name"),
  clientEmail: z.string().nullable().describe("Client email if mentioned, null if not"),
  clientAddress: z.string().nullable().describe("Client address if mentioned, null if not"),
  items: z.array(
    z.object({
      description: z.string().describe("Line item description"),
      quantity: z.number().describe("Quantity, default 1"),
      unitPrice: z.number().describe("Unit price in dollars"),
    })
  ).describe("Line items for the invoice"),
  taxRate: z.number().nullable().describe("Tax rate as a percentage number, e.g. 10 for 10%. Null if not mentioned."),
  dueDate: z.string().nullable().describe("Due date in YYYY-MM-DD format. If relative like 'tomorrow' or 'next week', calculate from today. Null if not mentioned."),
  notes: z.string().nullable().describe("Any additional notes. Null if none."),
  currency: z.string().describe("Currency code like USD, EUR, GBP. Default USD if not mentioned."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: invoiceSchema,
      prompt: `You are an invoice parsing assistant. Today's date is ${today}. Parse the following natural language input into structured invoice data. Extract client name, line items with quantities and prices, tax rate, due date, and any notes. If a due date is relative (like "tomorrow", "next week", "in 30 days"), calculate the actual date from today. If quantity is not specified, assume 1. If currency is not mentioned, default to USD.

Input: "${prompt}"`,
    });

    return NextResponse.json({ success: true, data: result.object });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI parsing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
