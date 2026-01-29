import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import {
  NotificationProvider,
  ToastContainer,
} from '@/components/notifications'

export const metadata: Metadata = {
  title: 'Conversation Insights Analyzer',
  description: 'Extract insights from AI conversations using LLM analysis',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <NotificationProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">{children}</main>
          </div>
          <ToastContainer />
        </NotificationProvider>
      </body>
    </html>
  )
}

