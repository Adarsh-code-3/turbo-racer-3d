import './globals.css'

export const metadata = {
  title: 'Turbo Racer 3D',
  description: 'High-speed 3D racing game with tilt controls',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  )
}
