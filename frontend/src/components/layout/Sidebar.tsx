'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/insights', label: 'Insights', icon: '💡' },
    { href: '/questions', label: 'Questions', icon: '❓' },
    { href: '/conversations', label: 'Conversations', icon: '💬' },
    { href: '/analysis', label: 'Analysis', icon: '📈' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col">
            <div className="p-6 border-b border-[var(--border)]">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                    Conversation Insights
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">AI-Powered Analysis</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--muted)]">
                    <p>Powered by LangChain + GPT-4</p>
                </div>
            </div>
        </aside>
    );
}
