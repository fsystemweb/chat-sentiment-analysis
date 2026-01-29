'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  Search,
  MessageSquare,
  Calendar,
  Users,
  Lightbulb,
  HelpCircle,
  Check,
  X,
  FileText,
} from 'lucide-react'
import { conversationsAPI, analysisAPI } from '@/lib/api'
import type { Conversation, ConversationAnalysis } from '@/lib/types'
import { useNotifications } from '@/components/notifications'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function ConversationDetailPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { addNotification, removeNotification } = useNotifications()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const conv = await conversationsAPI.getById(conversationId)
      setConversation(conv)

      // Try to load existing analysis
      try {
        const existingAnalysis =
          await analysisAPI.getForConversation(conversationId)
        setAnalysis(existingAnalysis)
      } catch {
        // No analysis yet, that's fine
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load conversation'
      )
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function runAnalysis() {
    const loadingNotificationId = `analysis-${conversationId}`

    setAnalyzing(true)
    setError(null)

    // Show loading notification - persistent until analysis completes
    addNotification({
      id: loadingNotificationId,
      type: 'loading',
      title: 'Analysis in progress',
      message: 'This may take a moment. You\'ll be notified when it\'s complete.',
    })

    try {
      const result = await analysisAPI.run({ conversation_id: conversationId })
      setAnalysis(result)

      // Remove loading notification and show success
      removeNotification(loadingNotificationId)
      addNotification({
        type: 'success',
        title: 'Analysis complete',
        message: 'Conversation has been analyzed successfully.',
        duration: 5000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run analysis'
      setError(errorMessage)

      // Remove loading notification and show error
      removeNotification(loadingNotificationId)
      addNotification({
        type: 'error',
        title: 'Analysis failed',
        message: errorMessage,
        duration: 8000,
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <Card className="py-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <X className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <p className="text-destructive">Conversation not found</p>
        <Link href="/conversations">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Conversations
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/conversations"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Conversations
          </Link>
          <h1 className="text-3xl font-bold">{conversation.metadata.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {conversation.metadata.source && (
              <Badge variant="default">{conversation.metadata.source}</Badge>
            )}
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {conversation.messages.length} messages
            </span>
            {conversation.metadata.date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(conversation.metadata.date).toLocaleDateString()}
              </span>
            )}
            {conversation.metadata.participants &&
              conversation.metadata.participants.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {conversation.metadata.participants.join(', ')}
                </span>
              )}
          </div>
        </div>
        <Button onClick={runAnalysis} disabled={analyzing}>
          {analyzing ? (
            <>
              <Spinner size="sm" />
              Analyzing...
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Re-analyze
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">AI Summary</h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="conversation">
        <TabsList>
          <TabsTrigger value="conversation">
            <MessageSquare className="mr-1 h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="mr-1 h-4 w-4" />
            Insights {analysis ? `(${analysis.insights.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="mr-1 h-4 w-4" />
            Questions {analysis ? `(${analysis.questions.length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation">
          <div className="space-y-4">
            {conversation.messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'message-user' : 'message-agent'}`}
              >
                <div className="mb-1 text-xs font-medium uppercase opacity-70">
                  {message.role}
                </div>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {!analysis ? (
              <Card className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  No analysis yet. Click &quot;Run Analysis&quot; to extract
                  insights.
                </p>
              </Card>
            ) : analysis.insights.length === 0 ? (
              <Card className="py-12 text-center">
                <p className="text-muted-foreground">
                  No insights were extracted. Make sure you have active insights
                  defined.
                </p>
                <Link href="/insights">
                  <Button variant="outline" className="mt-4">
                    Manage Insights
                  </Button>
                </Link>
              </Card>
            ) : (
              analysis.insights.map((insight, index) => (
                <Card key={index}>
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold">{insight.insight_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Confidence:
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${insight.confidence * 100}%`,
                            backgroundColor:
                              insight.confidence > 0.7
                                ? 'rgb(var(--success))'
                                : insight.confidence > 0.4
                                  ? 'rgb(var(--warning))'
                                  : 'rgb(var(--destructive))',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground">{insight.value}</p>
                  {insight.evidence && (
                    <div className="mt-3 rounded-lg border-l-2 border-primary bg-muted/50 p-3">
                      <p className="text-sm italic text-muted-foreground">
                        &quot;{insight.evidence}&quot;
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-4">
            {!analysis ? (
              <Card className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-warning/10 p-4">
                    <HelpCircle className="h-8 w-8 text-warning" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  No analysis yet. Click &quot;Run Analysis&quot; to check
                  qualifying questions.
                </p>
              </Card>
            ) : analysis.questions.length === 0 ? (
              <Card className="py-12 text-center">
                <p className="text-muted-foreground">
                  No questions were checked. Make sure you have active questions
                  defined.
                </p>
                <Link href="/questions">
                  <Button variant="outline" className="mt-4">
                    Manage Questions
                  </Button>
                </Link>
              </Card>
            ) : (
              analysis.questions.map((question, index) => (
                <Card key={index}>
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold">{question.question_text}</h3>
                    <Badge variant={question.answered ? 'success' : 'destructive'}>
                      {question.answered ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Answered
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3" />
                          Not Answered
                        </>
                      )}
                    </Badge>
                  </div>
                  {question.answered && question.answer ? (
                    <>
                      <p className="font-medium text-foreground">
                        {question.answer}
                      </p>
                      {question.evidence && (
                        <div className="mt-3 rounded-lg border-l-2 border-success bg-muted/50 p-3">
                          <p className="text-sm italic text-muted-foreground">
                            &quot;{question.evidence}&quot;
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      This question was not addressed in the conversation.
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
