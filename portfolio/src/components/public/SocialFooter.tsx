export function SocialFooter() {
  return (
    <footer className="py-12 text-center">
      <p className="text-xs text-slate-600">
        Built with Next.js &amp; Tailwind CSS &middot;{' '}
        <a href="/admin/login" className="transition-colors hover:text-slate-400">
          admin
        </a>
      </p>
    </footer>
  )
}
