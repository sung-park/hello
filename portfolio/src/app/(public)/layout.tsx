export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 lg:px-12">
      {children}
    </div>
  )
}
