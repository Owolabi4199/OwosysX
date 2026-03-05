import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = createClient()

    // Update email log with open
    const { error } = await supabase
      .from('email_logs')
      .update({
        opened_at: new Date().toISOString(),
      })
      .eq('tracking_token', token)

    if (error) {
      console.error('Error tracking open:', error)
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a,
      0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
    ])

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': String(pixel.length),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error in tracking route:', error)
    return new NextResponse(null, { status: 500 })
  }
}
