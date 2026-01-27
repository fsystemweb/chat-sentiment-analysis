'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Lightbulb,
  HelpCircle,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
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

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

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
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <p className="text-destructive">Error: {error}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure the backend server is running at http://localhost:8000
        </p>
      </Card>
    )
  }

  const stats = [
    {
      label: 'Conversations',
      value: conversations.length,
      icon: MessageSquare,
      href: '/conversations',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Active Insights',
      value: insights.filter((i) => i.active).length,
      icon: Lightbulb,
      href: '/insights',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Active Questions',
      value: questions.filter((q) => q.active).length,
      icon: HelpCircle,
      href: '/questions',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Analyzed',
      value: aggregate?.analyzed_conversations || 0,
      icon: BarChart3,
      href: '/analysis',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the Conversation Insights Analyzer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="group cursor-pointer hover:border-primary">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="mt-3 text-muted-foreground transition-colors group-hover:text-foreground">
                  {stat.label}
                </p>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/insights">
            <Button>
              <Lightbulb className="h-4 w-4" />
              Manage Insights
            </Button>
          </Link>
          <Link href="/questions">
            <Button>
              <HelpCircle className="h-4 w-4" />
              Manage Questions
            </Button>
          </Link>
          <Link href="/conversations">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4" />
              View Conversations
            </Button>
          </Link>
          <Link href="/analysis">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4" />
              View Analysis
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Conversations</h2>
          <Link
            href="/conversations"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {conversations.length === 0 ? (
          <p className="text-muted-foreground">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="block rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{conv.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {conv.message_count} messages
                      {conv.source && ` • ${conv.source}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.has_analysis ? (
                      <Badge variant="success">Analyzed</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
