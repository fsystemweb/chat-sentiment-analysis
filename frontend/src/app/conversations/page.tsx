'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { conversationsAPI } from '@/lib/api';
import type { ConversationSummary } from '@/lib/types';

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'analyzed' | 'pending'>('all');

    useEffect(() => {
        loadConversations();
    }, []);

    async function loadConversations() {
        try {
            const data = await conversationsAPI.getAll();
            setConversations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }

    const filteredConversations = conversations.filter((conv) => {
        if (filter === 'analyzed') return conv.has_analysis;
        if (filter === 'pending') return !conv.has_analysis;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Conversations</h1>
                    <p className="text-[var(--muted)] mt-2">
                        View and analyze your conversations
                    </p>
                </div>
            </div>

            {error && (
                <div className="card border-[var(--danger)]">
                    <p className="text-[var(--danger)]">{error}</p>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['all', 'analyzed', 'pending'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {f === 'all' && `All (${conversations.length})`}
                        {f === 'analyzed' && `Analyzed (${conversations.filter(c => c.has_analysis).length})`}
                        {f === 'pending' && `Pending (${conversations.filter(c => !c.has_analysis).length})`}
                    </button>
                ))}
            </div>

            {/* Conversations List */}
            {filteredConversations.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">💬</p>
                    <p className="text-[var(--muted)]">No conversations found.</p>
                    <p className="text-sm text-[var(--muted)] mt-2">
                        Add conversation files to the backend/data/conversations directory
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredConversations.map((conv) => (
                        <Link key={conv.id} href={`/conversations/${conv.id}`}>
                            <div className="card cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg group-hover:text-[var(--primary)] transition-colors">
                                            {conv.title}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)]">
                                            <span>💬 {conv.message_count} messages</span>
                                            {conv.source && (
                                                <span className="badge badge-primary">{conv.source}</span>
                                            )}
                                            {conv.date && (
                                                <span>📅 {new Date(conv.date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {conv.has_analysis ? (
                                            <span className="badge badge-success">✓ Analyzed</span>
                                        ) : (
                                            <span className="badge badge-warning">Pending</span>
                                        )}
                                        <span className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
