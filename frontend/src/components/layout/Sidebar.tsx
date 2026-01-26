'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/insights', label: 'Insights', icon: '💡' },
  { href: '/questions', label: 'Questions', icon: '❓' },
  { href: '/conversations', label: 'Conversations', icon: '💬' },
  { href: '/analysis', label: 'Analysis', icon: '📈' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] p-6">
        <h1 className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-xl font-bold text-transparent">
          Conversation Insights
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">AI-Powered Analysis</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <div className="text-xs text-[var(--muted)]">
          <p>Powered by LangChain + GPT-4</p>
        </div>
      </div>
    </aside>
  )
}
