'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Calendar, ArrowRight, CheckCircle, Clock, Upload } from 'lucide-react'
import { conversationsAPI } from '@/lib/api'
import type { ConversationSummary } from '@/lib/types'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ImportDialog } from '@/components/conversations/import-dialog'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      const data = await conversationsAPI.getAll()
      setConversations(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load conversations'
      )
    } finally {
      setLoading(false)
    }
  }

  const analyzedConversations = conversations.filter((c) => c.has_analysis)
  const pendingConversations = conversations.filter((c) => !c.has_analysis)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Conversations</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and analyze your conversations
          </p>
        </div>
        <Button onClick={() => setImportDialogOpen(true)} className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Import Conversation
        </Button>
      </div>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={loadConversations}
      />

      {error && (
        <Card className="border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="analyzed">
            <CheckCircle className="mr-1 h-4 w-4" />
            Analyzed ({analyzedConversations.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="mr-1 h-4 w-4" />
            Pending ({pendingConversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ConversationList conversations={conversations} />
        </TabsContent>
        <TabsContent value="analyzed">
          <ConversationList conversations={analyzedConversations} />
        </TabsContent>
        <TabsContent value="pending">
          <ConversationList conversations={pendingConversations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConversationList({ conversations }: { conversations: ConversationSummary[] }) {
  if (conversations.length === 0) {
    return (
      <Card className="py-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-muted-foreground">No conversations found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add conversation files to the backend/data/conversations directory
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {conversations.map((conv) => (
        <Link key={conv.id} href={`/conversations/${conv.id}`}>
          <Card className="group cursor-pointer hover:border-primary">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold transition-colors group-hover:text-primary sm:text-lg">
                  {conv.title}
                </h3>
                <div className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {conv.message_count} messages
                  </span>
                  {conv.source && (
                    <Badge variant="default">{conv.source}</Badge>
                  )}
                  {conv.date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(conv.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {conv.has_analysis ? (
                  <Badge variant="success" className="text-xs sm:text-sm">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Analyzed
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-xs sm:text-sm">Pending</Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary sm:h-5 sm:w-5" />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
