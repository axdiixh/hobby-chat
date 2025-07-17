import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hobby Chatbot',
  description: 'A chatbot to explore your hobbies',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
