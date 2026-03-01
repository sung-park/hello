import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  if (!filename || filename.includes('/') || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const buffer = await readFile(join(UPLOAD_DIR, filename))
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
