'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { conversationsAPI, analysisAPI } from '@/lib/api'
import type { Conversation, ConversationAnalysis } from '@/lib/types'

export default function ConversationDetailPage() {
  const params = useParams()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    'conversation' | 'insights' | 'questions'
  >('conversation')

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
    setAnalyzing(true)
    setError(null)
    try {
      const result = await analysisAPI.run({ conversation_id: conversationId })
      setAnalysis(result)
      setActiveTab('insights')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="card py-12 text-center">
        <p className="mb-4 text-4xl">❌</p>
        <p className="text-[var(--danger)]">Conversation not found</p>
        <Link href="/conversations" className="btn btn-secondary mt-4">
          ← Back to Conversations
        </Link>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/conversations"
            className="mb-2 inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back to Conversations
          </Link>
          <h1 className="text-3xl font-bold">{conversation.metadata.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--muted)]">
            {conversation.metadata.source && (
              <span className="badge badge-primary">
                {conversation.metadata.source}
              </span>
            )}
            <span>💬 {conversation.messages.length} messages</span>
            {conversation.metadata.date && (
              <span>
                📅 {new Date(conversation.metadata.date).toLocaleDateString()}
              </span>
            )}
            {conversation.metadata.participants &&
              conversation.metadata.participants.length > 0 && (
                <span>👥 {conversation.metadata.participants.join(', ')}</span>
              )}
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="btn btn-primary"
        >
          {analyzing ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : analysis ? (
            '🔄 Re-analyze'
          ) : (
            '🔍 Run Analysis'
          )}
        </button>
      </div>

      {error && (
        <div className="card border-[var(--danger)]">
          <p className="text-[var(--danger)]">{error}</p>
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div className="card from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)]/30 bg-gradient-to-r">
          <h3 className="mb-2 font-semibold">📝 AI Summary</h3>
          <p className="text-[var(--muted)]">{analysis.summary}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2">
        {(['conversation', 'insights', 'questions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border border-[var(--border)] border-b-[var(--card)] bg-[var(--card)] text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab === 'conversation' && '💬 Conversation'}
            {tab === 'insights' &&
              `💡 Insights ${analysis ? `(${analysis.insights.length})` : ''}`}
            {tab === 'questions' &&
              `❓ Questions ${analysis ? `(${analysis.questions.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'conversation' && (
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'message-user' : 'message-agent'}`}
            >
              <div className="mb-1 text-xs uppercase text-[var(--muted)]">
                {message.role}
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="card py-12 text-center">
              <p className="mb-4 text-4xl">💡</p>
              <p className="text-[var(--muted)]">
                No analysis yet. Click &quot;Run Analysis&quot; to extract
                insights.
              </p>
            </div>
          ) : analysis.insights.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-[var(--muted)]">
                No insights were extracted. Make sure you have active insights
                defined.
              </p>
              <Link href="/insights" className="btn btn-secondary mt-4">
                Manage Insights
              </Link>
            </div>
          ) : (
            analysis.insights.map((insight, index) => (
              <div key={index} className="card">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold">{insight.insight_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--muted)]">
                      Confidence:
                    </span>
                    <div className="confidence-bar w-24">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${insight.confidence * 100}%`,
                          background:
                            insight.confidence > 0.7
                              ? 'var(--secondary)'
                              : insight.confidence > 0.4
                                ? 'var(--warning)'
                                : 'var(--danger)',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-[var(--foreground)]">{insight.value}</p>
                {insight.evidence && (
                  <div className="mt-3 rounded-lg border-l-2 border-[var(--primary)] bg-[var(--background)] p-3">
                    <p className="text-sm italic text-[var(--muted)]">
                      &quot;{insight.evidence}&quot;
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="card py-12 text-center">
              <p className="mb-4 text-4xl">❓</p>
              <p className="text-[var(--muted)]">
                No analysis yet. Click &quot;Run Analysis&quot; to check
                qualifying questions.
              </p>
            </div>
          ) : analysis.questions.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-[var(--muted)]">
                No questions were checked. Make sure you have active questions
                defined.
              </p>
              <Link href="/questions" className="btn btn-secondary mt-4">
                Manage Questions
              </Link>
            </div>
          ) : (
            analysis.questions.map((question, index) => (
              <div key={index} className="card">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold">{question.question_text}</h3>
                  <span
                    className={`badge ${question.answered ? 'badge-success' : 'badge-danger'}`}
                  >
                    {question.answered ? '✓ Answered' : '✗ Not Answered'}
                  </span>
                </div>
                {question.answered && question.answer ? (
                  <>
                    <p className="font-medium text-[var(--foreground)]">
                      {question.answer}
                    </p>
                    {question.evidence && (
                      <div className="mt-3 rounded-lg border-l-2 border-[var(--secondary)] bg-[var(--background)] p-3">
                        <p className="text-sm italic text-[var(--muted)]">
                          &quot;{question.evidence}&quot;
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[var(--muted)]">
                    This question was not addressed in the conversation.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
