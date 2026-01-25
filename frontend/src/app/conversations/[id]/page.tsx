'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { conversationsAPI, analysisAPI } from '@/lib/api';
import type { Conversation, ConversationAnalysis } from '@/lib/types';

export default function ConversationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.id as string;

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'conversation' | 'insights' | 'questions'>('conversation');

    useEffect(() => {
        loadData();
    }, [conversationId]);

    async function loadData() {
        try {
            const conv = await conversationsAPI.getById(conversationId);
            setConversation(conv);

            // Try to load existing analysis
            try {
                const existingAnalysis = await analysisAPI.getForConversation(conversationId);
                setAnalysis(existingAnalysis);
            } catch {
                // No analysis yet, that's fine
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversation');
        } finally {
            setLoading(false);
        }
    }

    async function runAnalysis() {
        setAnalyzing(true);
        setError(null);
        try {
            const result = await analysisAPI.run({ conversation_id: conversationId });
            setAnalysis(result);
            setActiveTab('insights');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to run analysis');
        } finally {
            setAnalyzing(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="card text-center py-12">
                <p className="text-4xl mb-4">❌</p>
                <p className="text-[var(--danger)]">Conversation not found</p>
                <Link href="/conversations" className="btn btn-secondary mt-4">
                    ← Back to Conversations
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link href="/conversations" className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm mb-2 inline-block">
                        ← Back to Conversations
                    </Link>
                    <h1 className="text-3xl font-bold">{conversation.metadata.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)]">
                        {conversation.metadata.source && (
                            <span className="badge badge-primary">{conversation.metadata.source}</span>
                        )}
                        <span>💬 {conversation.messages.length} messages</span>
                        {conversation.metadata.date && (
                            <span>📅 {new Date(conversation.metadata.date).toLocaleDateString()}</span>
                        )}
                        {conversation.metadata.participants && conversation.metadata.participants.length > 0 && (
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
                <div className="card bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)]/30">
                    <h3 className="font-semibold mb-2">📝 AI Summary</h3>
                    <p className="text-[var(--muted)]">{analysis.summary}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border)] pb-2">
                {(['conversation', 'insights', 'questions'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === tab
                                ? 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] border-b-[var(--card)]'
                                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {tab === 'conversation' && '💬 Conversation'}
                        {tab === 'insights' && `💡 Insights ${analysis ? `(${analysis.insights.length})` : ''}`}
                        {tab === 'questions' && `❓ Questions ${analysis ? `(${analysis.questions.length})` : ''}`}
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
                            <div className="text-xs text-[var(--muted)] mb-1 uppercase">
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
                        <div className="card text-center py-12">
                            <p className="text-4xl mb-4">💡</p>
                            <p className="text-[var(--muted)]">No analysis yet. Click "Run Analysis" to extract insights.</p>
                        </div>
                    ) : analysis.insights.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-[var(--muted)]">No insights were extracted. Make sure you have active insights defined.</p>
                            <Link href="/insights" className="btn btn-secondary mt-4">
                                Manage Insights
                            </Link>
                        </div>
                    ) : (
                        analysis.insights.map((insight, index) => (
                            <div key={index} className="card">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold">{insight.insight_name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[var(--muted)]">Confidence:</span>
                                        <div className="w-24 confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{
                                                    width: `${insight.confidence * 100}%`,
                                                    background: insight.confidence > 0.7
                                                        ? 'var(--secondary)'
                                                        : insight.confidence > 0.4
                                                            ? 'var(--warning)'
                                                            : 'var(--danger)',
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}%</span>
                                    </div>
                                </div>
                                <p className="text-[var(--foreground)]">{insight.value}</p>
                                {insight.evidence && (
                                    <div className="mt-3 p-3 bg-[var(--background)] rounded-lg border-l-2 border-[var(--primary)]">
                                        <p className="text-sm text-[var(--muted)] italic">"{insight.evidence}"</p>
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
                        <div className="card text-center py-12">
                            <p className="text-4xl mb-4">❓</p>
                            <p className="text-[var(--muted)]">No analysis yet. Click "Run Analysis" to check qualifying questions.</p>
                        </div>
                    ) : analysis.questions.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-[var(--muted)]">No questions were checked. Make sure you have active questions defined.</p>
                            <Link href="/questions" className="btn btn-secondary mt-4">
                                Manage Questions
                            </Link>
                        </div>
                    ) : (
                        analysis.questions.map((question, index) => (
                            <div key={index} className="card">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold">{question.question_text}</h3>
                                    <span className={`badge ${question.answered ? 'badge-success' : 'badge-danger'}`}>
                                        {question.answered ? '✓ Answered' : '✗ Not Answered'}
                                    </span>
                                </div>
                                {question.answered && question.answer ? (
                                    <>
                                        <p className="text-[var(--foreground)] font-medium">{question.answer}</p>
                                        {question.evidence && (
                                            <div className="mt-3 p-3 bg-[var(--background)] rounded-lg border-l-2 border-[var(--secondary)]">
                                                <p className="text-sm text-[var(--muted)] italic">"{question.evidence}"</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-[var(--muted)]">This question was not addressed in the conversation.</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
