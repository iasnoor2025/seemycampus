export default function AttendanceQRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Return children without dashboard layout (no sidebar/header)
  return <>{children}</>
}
