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
    <>
      {/* Mobile Sidebar */}
      <aside className="fixed left-0 right-0 top-0 flex h-20 w-full flex-row items-center border-b border-border bg-card lg:hidden">
        <div className="border-r border-border p-4">
          <h1 className="text-sm font-bold text-primary">CA</h1>
        </div>

        <nav className="flex flex-1 justify-center gap-1 overflow-x-auto px-2">
          <ul className="flex gap-1">
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
                      size="sm"
                      className={cn(
                        'gap-1',
                        !isActive && 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden text-xs font-medium sm:inline">
                        {item.label.split(' ')[0]}
                      </span>
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border p-6">
          <h1 className="text-xl font-bold text-primary">
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
    </>
  )
}
