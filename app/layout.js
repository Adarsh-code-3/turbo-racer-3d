import './globals.css'

export const metadata = {
  title: 'Turbo Racer 3D',
  description: 'High-speed 3D racing game with tilt controls',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Turbo Racer',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden" style={{ height: '100dvh' }}>{children}</body>
    </html>
  )
}
