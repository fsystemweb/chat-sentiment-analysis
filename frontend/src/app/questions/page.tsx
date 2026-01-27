'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'
import { questionsAPI } from '@/lib/api'
import type { Question, QuestionCreate } from '@/lib/types'

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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<QuestionCreate>({
    question: '',
    description: '',
    active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    try {
      const data = await questionsAPI.getAll()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await questionsAPI.update(editingId, formData)
      } else {
        await questionsAPI.create(formData)
      }
      await loadQuestions()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await questionsAPI.delete(id)
      await loadQuestions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  async function handleToggleActive(question: Question) {
    try {
      await questionsAPI.update(question.id, { active: !question.active })
      await loadQuestions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question')
    }
  }

  function startEdit(question: Question) {
    setEditingId(question.id)
    setFormData({
      question: question.question,
      description: question.description || '',
      active: question.active,
    })
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ question: '', description: '', active: true })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Qualifying Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Define questions to look for and extract answers from conversations
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Question
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
              {editingId ? 'Edit Question' : 'New Question'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Question
              </label>
              <Input
                placeholder="e.g., How many employees do you have?"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Additional context about what you're looking for..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-warning/10 p-4">
              <HelpCircle className="h-8 w-8 text-warning" />
            </div>
          </div>
          <p className="text-muted-foreground">
            No qualifying questions defined yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add questions like &quot;What&apos;s your role?&quot; or
            &quot;What&apos;s your budget?&quot;
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {question.question}
                    </h3>
                    <Badge variant={question.active ? 'success' : 'outline'}>
                      {question.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {question.description && (
                    <p className="mt-2 text-muted-foreground">
                      {question.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Switch
                    checked={question.active}
                    onCheckedChange={() => handleToggleActive(question)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(question.id)}
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
