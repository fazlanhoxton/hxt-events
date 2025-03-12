import './globals.css'

export const metadata = {
  title: 'Events',
  description: 'Hoxton Events',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
}