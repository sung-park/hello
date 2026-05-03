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
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page') ?? 'resume'
  const lang = searchParams.get('lang') ?? 'ko'

  if (!VALID_PAGES.includes(pageParam as PageType)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 })
  }
  const page = pageParam as PageType

  // Use internal localhost URL — avoids nginx HTTPS termination issues when
  // Puppeteer navigates from within the same container.
  const internalOrigin = `http://localhost:${process.env.PORT ?? 3000}`

  const executablePath = getExecutablePath()

  let browser
  try {
    browser = await puppeteer.launch({
      executablePath,
      userDataDir: '/tmp/puppeteer-data',
      // HOME=/nonexistent (system user) prevents Chrome from finding its crashpad db path
      env: { ...process.env, HOME: '/tmp' },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--no-first-run',
        '--disable-extensions',
      ],
      headless: true,
    })

    const tab = await browser.newPage()

    // Suppress console noise from the rendered page
    tab.on('console', () => {})

    await tab.goto(`${internalOrigin}/${page}?lang=${lang}`, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    })

    // Wait for fonts to finish loading
    await tab.evaluateHandle('document.fonts.ready')

    // Remove ThemeProvider's dark class so CSS variables revert to light-theme values
    await tab.evaluate(() => {
      document.documentElement.classList.remove('dark')
    })

    // Strip decorative root-layout elements for a clean document PDF
    await tab.addStyleTag({
      content: `
        html, body, .min-h-screen { background: #ffffff !important; }
        canvas { display: none !important; }
        .no-print { display: none !important; }
        [class*="fixed"][class*="inset-0"] { display: none !important; }
      `,
    })

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
