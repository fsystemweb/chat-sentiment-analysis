'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analysisAPI } from '@/lib/api';
import type { AggregateAnalysis, ConversationAnalysis } from '@/lib/types';

export default function AnalysisPage() {
    const [aggregate, setAggregate] = useState<AggregateAnalysis | null>(null);
    const [allAnalyses, setAllAnalyses] = useState<ConversationAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'overview' | 'insights' | 'questions'>('overview');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [agg, all] = await Promise.all([
                analysisAPI.getAggregate(),
                analysisAPI.getAll(),
            ]);
            setAggregate(agg);
            setAllAnalyses(all);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analysis data');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-[var(--danger)]">
                <p className="text-[var(--danger)]">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold">Analysis Overview</h1>
                <p className="text-[var(--muted)] mt-2">
                    Aggregate insights and question results across all conversations
                </p>
            </div>

            {/* Stats */}
            {aggregate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card">
                        <div className="text-4xl mb-2">💬</div>
                        <div className="text-3xl font-bold">{aggregate.total_conversations}</div>
                        <div className="text-[var(--muted)]">Total Conversations</div>
                    </div>
                    <div className="card">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="text-3xl font-bold text-[var(--secondary)]">
                            {aggregate.analyzed_conversations}
                        </div>
                        <div className="text-[var(--muted)]">Analyzed</div>
                    </div>
                    <div className="card">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-3xl font-bold text-[var(--primary)]">
                            {Math.round((aggregate.analyzed_conversations / aggregate.total_conversations) * 100) || 0}%
                        </div>
                        <div className="text-[var(--muted)]">Coverage</div>
                    </div>
                </div>
            )}

            {/* View Tabs */}
            <div className="flex gap-2">
                {(['overview', 'insights', 'questions'] as const).map((view) => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === view
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {view === 'overview' && '📋 Recent Analyses'}
                        {view === 'insights' && '💡 Insight Trends'}
                        {view === 'questions' && '❓ Question Stats'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeView === 'overview' && (
                <div className="space-y-4">
                    {allAnalyses.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-4xl mb-4">📊</p>
                            <p className="text-[var(--muted)]">No analyses yet.</p>
                            <Link href="/conversations" className="btn btn-primary mt-4">
                                Analyze Conversations
                            </Link>
                        </div>
                    ) : (
                        allAnalyses.map((analysis) => (
                            <Link key={analysis.id} href={`/conversations/${analysis.conversation_id}`}>
                                <div className="card cursor-pointer hover:border-[var(--primary)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">Conversation: {analysis.conversation_id}</h3>
                                        <span className="text-sm text-[var(--muted)]">
                                            {new Date(analysis.analyzed_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {analysis.summary && (
                                        <p className="text-[var(--muted)] text-sm mb-3">{analysis.summary}</p>
                                    )}
                                    <div className="flex gap-4 text-sm">
                                        <span className="badge badge-primary">
                                            💡 {analysis.insights.length} insights
                                        </span>
                                        <span className="badge badge-success">
                                            ✓ {analysis.questions.filter(q => q.answered).length}/{analysis.questions.length} answered
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {activeView === 'insights' && aggregate && (
                <div className="space-y-4">
                    {Object.keys(aggregate.insight_summaries).length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-4xl mb-4">💡</p>
                            <p className="text-[var(--muted)]">No insight data yet. Analyze some conversations first.</p>
                        </div>
                    ) : (
                        Object.entries(aggregate.insight_summaries).map(([name, data]) => (
                            <div key={name} className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">{name}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-[var(--muted)]">
                                            Extracted {data.total_extractions} times
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-[var(--muted)]">Avg confidence:</span>
                                            <span className="font-medium" style={{
                                                color: data.avg_confidence > 0.7
                                                    ? 'var(--secondary)'
                                                    : data.avg_confidence > 0.4
                                                        ? 'var(--warning)'
                                                        : 'var(--danger)'
                                            }}>
                                                {Math.round(data.avg_confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {data.values.slice(0, 5).map((val, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                                            <Link
                                                href={`/conversations/${val.conversation_id}`}
                                                className="text-[var(--primary)] hover:underline text-sm"
                                            >
                                                {val.conversation_id}
                                            </Link>
                                            <span className="flex-1 mx-4 text-[var(--muted)]">{val.value}</span>
                                            <span className="text-sm font-medium">{Math.round(val.confidence * 100)}%</span>
                                        </div>
                                    ))}
                                    {data.values.length > 5 && (
                                        <p className="text-sm text-[var(--muted)] text-center">
                                            +{data.values.length - 5} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeView === 'questions' && aggregate && (
                <div className="space-y-4">
                    {Object.keys(aggregate.question_summaries).length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-4xl mb-4">❓</p>
                            <p className="text-[var(--muted)]">No question data yet. Analyze some conversations first.</p>
                        </div>
                    ) : (
                        Object.entries(aggregate.question_summaries).map(([question, data]) => (
                            <div key={question} className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">{question}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${data.times_answered / data.total_checked > 0.7
                                                ? 'badge-success'
                                                : data.times_answered / data.total_checked > 0.3
                                                    ? 'badge-warning'
                                                    : 'badge-danger'
                                            }`}>
                                            {data.times_answered}/{data.total_checked} answered
                                        </span>
                                        <span className="text-sm text-[var(--muted)]">
                                            ({Math.round((data.times_answered / data.total_checked) * 100)}%)
                                        </span>
                                    </div>
                                </div>

                                {/* Answer rate bar */}
                                <div className="confidence-bar mb-4">
                                    <div
                                        className="confidence-fill"
                                        style={{
                                            width: `${(data.times_answered / data.total_checked) * 100}%`,
                                            background: data.times_answered / data.total_checked > 0.7
                                                ? 'var(--secondary)'
                                                : data.times_answered / data.total_checked > 0.3
                                                    ? 'var(--warning)'
                                                    : 'var(--danger)',
                                        }}
                                    />
                                </div>

                                {data.answers.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-[var(--muted)]">Answers found:</h4>
                                        {data.answers.slice(0, 5).map((ans, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-lg">
                                                <Link
                                                    href={`/conversations/${ans.conversation_id}`}
                                                    className="text-[var(--primary)] hover:underline text-sm"
                                                >
                                                    {ans.conversation_id}
                                                </Link>
                                                <span className="text-[var(--foreground)]">{ans.answer}</span>
                                            </div>
                                        ))}
                                        {data.answers.length > 5 && (
                                            <p className="text-sm text-[var(--muted)] text-center">
                                                +{data.answers.length - 5} more
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
