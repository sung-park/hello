import puppeteer from 'puppeteer-core'
import { NextRequest, NextResponse } from 'next/server'

const VALID_PAGES = ['resume', 'cv', 'combined'] as const
type PageType = (typeof VALID_PAGES)[number]

const FILENAMES: Record<PageType, Record<string, string>> = {
  resume:   { ko: '박성근_이력서',           en: 'SunggeunPark_Resume' },
  cv:       { ko: '박성근_경력기술서',        en: 'SunggeunPark_CV' },
  combined: { ko: '박성근_이력서_경력기술서', en: 'SunggeunPark_Resume_CV' },
}

function getExecutablePath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
  return '/usr/bin/chromium'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const pageParam = searchParams.get('page') ?? 'resume'
  const lang = searchParams.get('lang') ?? 'ko'

  if (!VALID_PAGES.includes(pageParam as PageType)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 })
  }
  const page = pageParam as PageType

  const executablePath = getExecutablePath()

  let browser
  try {
    browser = await puppeteer.launch({
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-crash-reporter',
        '--crash-dumps-dir=/tmp',
        '--no-first-run',
        '--disable-extensions',
      ],
      headless: true,
    })

    const tab = await browser.newPage()

    // Suppress console noise from the rendered page
    tab.on('console', () => {})

    await tab.goto(`${origin}/${page}?lang=${lang}`, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    })

    // Wait for fonts to finish loading
    await tab.evaluateHandle('document.fonts.ready')

    const pdfBytes = await tab.pdf({
      format: 'A4',
      printBackground: true,
      // @page { margin } in print.css handles all margins
    })
    const pdf = Buffer.from(pdfBytes)

    const filename = FILENAMES[page][lang] ?? `${page}-${lang}`

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}.pdf`,
      },
    })
  } catch (err) {
    console.error('[pdf] generation failed:', err)
    return NextResponse.json(
      { error: 'PDF generation failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  } finally {
    await browser?.close()
  }
}
