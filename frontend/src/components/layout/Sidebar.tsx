'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  BarChart3,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-6">
        <h1 className="text-primary text-xl font-bold">
          Conversation Insights
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">AI-Powered Analysis</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      !isActive && 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <p>Powered by LangChain + GPT-4</p>
        </div>
      </div>
    </aside>
  )
}
