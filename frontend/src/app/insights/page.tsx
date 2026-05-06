'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Lightbulb } from 'lucide-react'
import { insightsAPI } from '@/lib/api'
import type { Insight, InsightCreate } from '@/lib/types'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<InsightCreate>({
    name: '',
    description: '',
    active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      const data = await insightsAPI.getAll()
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await insightsAPI.update(editingId, formData)
      } else {
        await insightsAPI.create(formData)
      }
      await loadInsights()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save insight')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this insight?')) return
    try {
      await insightsAPI.delete(id)
      await loadInsights()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete insight')
    }
  }

  async function handleToggleActive(insight: Insight) {
    try {
      await insightsAPI.update(insight.id, { active: !insight.active })
      await loadInsights()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update insight')
    }
  }

  function startEdit(insight: Insight) {
    setEditingId(insight.id)
    setFormData({
      name: insight.name,
      description: insight.description,
      active: insight.active,
    })
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', active: true })
  }

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
          <h1 className="text-2xl font-bold sm:text-3xl">Insights</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Define custom insights to extract from conversations
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Insight
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-muted-foreground hover:underline"
          >
            Dismiss
          </button>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Insight' : 'New Insight'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., User Sentiment"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                placeholder="Describe what insight to extract from conversations..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <span className="text-sm">Active for analysis</span>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? <Spinner size="sm" /> : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Insights List */}
      {insights.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">No insights defined yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add insights like &quot;User sentiment&quot;, &quot;Purchase
            intent&quot;, or &quot;Pain points&quot;
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{insight.name}</h3>
                    <Badge variant={insight.active ? 'success' : 'outline'}>
                      {insight.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Switch
                    checked={insight.active}
                    onCheckedChange={() => handleToggleActive(insight)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(insight)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(insight.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
