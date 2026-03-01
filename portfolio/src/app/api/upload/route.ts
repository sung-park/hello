import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return new NextResponse('No file', { status: 400 })
  if (file.size > MAX_SIZE) return new NextResponse('File too large', { status: 413 })

  await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${randomUUID()}.webp`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(UPLOAD_DIR, filename), buffer)

  return NextResponse.json({ url: `/api/uploads/${filename}` })
}
