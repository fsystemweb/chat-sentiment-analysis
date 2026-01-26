'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  conversationsAPI,
  insightsAPI,
  questionsAPI,
  analysisAPI,
} from '@/lib/api'
import type {
  ConversationSummary,
  Insight,
  Question,
  AggregateAnalysis,
} from '@/lib/types'

export default function Dashboard() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [aggregate, setAggregate] = useState<AggregateAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [convs, ins, ques, agg] = await Promise.all([
          conversationsAPI.getAll(),
          insightsAPI.getAll(),
          questionsAPI.getAll(),
          analysisAPI.getAggregate().catch(() => null),
        ])
        setConversations(convs)
        setInsights(ins)
        setQuestions(ques)
        setAggregate(agg)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-[var(--danger)]">
        <p className="text-[var(--danger)]">Error: {error}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Make sure the backend server is running at http://localhost:8000
        </p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Conversations',
      value: conversations.length,
      icon: '💬',
      href: '/conversations',
      color: 'var(--primary)',
    },
    {
      label: 'Active Insights',
      value: insights.filter((i) => i.active).length,
      icon: '💡',
      href: '/insights',
      color: 'var(--secondary)',
    },
    {
      label: 'Active Questions',
      value: questions.filter((q) => q.active).length,
      icon: '❓',
      href: '/questions',
      color: 'var(--warning)',
    },
    {
      label: 'Analyzed',
      value: aggregate?.analyzed_conversations || 0,
      icon: '📈',
      href: '/analysis',
      color: 'var(--primary)',
    },
  ]

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-[var(--muted)]">
          Welcome to the Conversation Insights Analyzer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="card group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{stat.icon}</span>
                <span
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
              <p className="mt-2 text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]">
                {stat.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/insights" className="btn btn-primary">
            <span>💡</span> Manage Insights
          </Link>
          <Link href="/questions" className="btn btn-primary">
            <span>❓</span> Manage Questions
          </Link>
          <Link href="/conversations" className="btn btn-secondary">
            <span>💬</span> View Conversations
          </Link>
          <Link href="/analysis" className="btn btn-secondary">
            <span>📈</span> View Analysis
          </Link>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Conversations</h2>
          <Link
            href="/conversations"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        {conversations.length === 0 ? (
          <p className="text-[var(--muted)]">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="block rounded-lg bg-[var(--background)] p-4 transition-colors hover:bg-[var(--card-hover)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{conv.title}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {conv.message_count} messages
                      {conv.source && ` • ${conv.source}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.has_analysis ? (
                      <span className="badge badge-success">Analyzed</span>
                    ) : (
                      <span className="badge badge-neutral">Pending</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
