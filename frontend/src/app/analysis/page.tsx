'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  CheckCircle,
  BarChart3,
  Lightbulb,
  HelpCircle,
  FileText,
} from 'lucide-react'
import { analysisAPI } from '@/lib/api'
import type { AggregateAnalysis, ConversationAnalysis } from '@/lib/types'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function AnalysisPage() {
  const [aggregate, setAggregate] = useState<AggregateAnalysis | null>(null)
  const [allAnalyses, setAllAnalyses] = useState<ConversationAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [agg, all] = await Promise.all([
        analysisAPI.getAggregate(),
        analysisAPI.getAll(),
      ])
      setAggregate(agg)
      setAllAnalyses(all)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load analysis data'
      )
    } finally {
      setLoading(false)
    }
  }

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
        <p className="text-destructive">{error}</p>
      </Card>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Analysis Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Aggregate insights and question results across all conversations
        </p>
      </div>

      {/* Stats */}
      {aggregate && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <MessageSquare className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {aggregate.total_conversations}
                </div>
                <div className="text-muted-foreground">Total Conversations</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-3xl font-bold text-success">
                  {aggregate.analyzed_conversations}
                </div>
                <div className="text-muted-foreground">Analyzed</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(
                    (aggregate.analyzed_conversations /
                      aggregate.total_conversations) *
                    100
                  ) || 0}
                  %
                </div>
                <div className="text-muted-foreground">Coverage</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="mr-1 h-4 w-4" />
            Recent Analyses
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="mr-1 h-4 w-4" />
            Insight Trends
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="mr-1 h-4 w-4" />
            Question Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {allAnalyses.length === 0 ? (
              <Card className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">No analyses yet.</p>
                <Link href="/conversations">
                  <Button className="mt-4">Analyze Conversations</Button>
                </Link>
              </Card>
            ) : (
              allAnalyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/conversations/${analysis.conversation_id}`}
                >
                  <Card className="cursor-pointer hover:border-primary">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">
                        Conversation: {analysis.conversation_id}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(analysis.analyzed_at).toLocaleString()}
                      </span>
                    </div>
                    {analysis.summary && (
                      <p className="mb-3 text-sm text-muted-foreground">
                        {analysis.summary}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <Badge variant="default">
                        <Lightbulb className="mr-1 h-3 w-3" />
                        {analysis.insights.length} insights
                      </Badge>
                      <Badge variant="success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {analysis.questions.filter((q) => q.answered).length}/
                        {analysis.questions.length} answered
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {!aggregate || Object.keys(aggregate.insight_summaries).length === 0 ? (
              <Card className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  No insight data yet. Analyze some conversations first.
                </p>
              </Card>
            ) : (
              Object.entries(aggregate.insight_summaries).map(([name, data]) => (
                <Card key={name}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Extracted {data.total_extractions} times
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Avg confidence:
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            color:
                              data.avg_confidence > 0.7
                                ? 'rgb(var(--success))'
                                : data.avg_confidence > 0.4
                                  ? 'rgb(var(--warning))'
                                  : 'rgb(var(--destructive))',
                          }}
                        >
                          {Math.round(data.avg_confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.values.slice(0, 5).map((val, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <Link
                          href={`/conversations/${val.conversation_id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {val.conversation_id}
                        </Link>
                        <span className="mx-4 flex-1 text-muted-foreground">
                          {val.value}
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(val.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                    {data.values.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        +{data.values.length - 5} more
                      </p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-4">
            {!aggregate || Object.keys(aggregate.question_summaries).length === 0 ? (
              <Card className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-warning/10 p-4">
                    <HelpCircle className="h-8 w-8 text-warning" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  No question data yet. Analyze some conversations first.
                </p>
              </Card>
            ) : (
              Object.entries(aggregate.question_summaries).map(
                ([question, data]) => (
                  <Card key={question}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">{question}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            data.times_answered / data.total_checked > 0.7
                              ? 'success'
                              : data.times_answered / data.total_checked > 0.3
                                ? 'warning'
                                : 'destructive'
                          }
                        >
                          {data.times_answered}/{data.total_checked} answered
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          (
                          {Math.round(
                            (data.times_answered / data.total_checked) * 100
                          )}
                          %)
                        </span>
                      </div>
                    </div>

                    {/* Answer rate bar */}
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(data.times_answered / data.total_checked) * 100}%`,
                          backgroundColor:
                            data.times_answered / data.total_checked > 0.7
                              ? 'rgb(var(--success))'
                              : data.times_answered / data.total_checked > 0.3
                                ? 'rgb(var(--warning))'
                                : 'rgb(var(--destructive))',
                        }}
                      />
                    </div>

                    {data.answers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Answers found:
                        </h4>
                        {data.answers.slice(0, 5).map((ans, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                          >
                            <Link
                              href={`/conversations/${ans.conversation_id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {ans.conversation_id}
                            </Link>
                            <span className="text-foreground">
                              {ans.answer}
                            </span>
                          </div>
                        ))}
                        {data.answers.length > 5 && (
                          <p className="text-center text-sm text-muted-foreground">
                            +{data.answers.length - 5} more
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                )
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
