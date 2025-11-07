import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '360° РАБОТА - Админ-панель',
  description: 'Административная панель платформы 360° РАБОТА',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
