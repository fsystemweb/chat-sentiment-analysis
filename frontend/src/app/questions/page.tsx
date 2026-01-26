'use client'

import { useEffect, useState } from 'react'
import { questionsAPI } from '@/lib/api'
import type { Question, QuestionCreate } from '@/lib/types'

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
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Qualifying Questions</h1>
          <p className="mt-2 text-[var(--muted)]">
            Define questions to look for and extract answers from conversations
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <span>+</span> Add Question
        </button>
      </div>

      {error && (
        <div className="card border-[var(--danger)]">
          <p className="text-[var(--danger)]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-[var(--muted)] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card mx-4 w-full max-w-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {editingId ? 'Edit Question' : 'New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Question
                </label>
                <input
                  type="text"
                  className="input"
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
                  <span className="text-[var(--muted)]">(optional)</span>
                </label>
                <textarea
                  className="input"
                  placeholder="Additional context about what you're looking for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`toggle ${formData.active ? 'active' : ''}`}
                  onClick={() =>
                    setFormData({ ...formData, active: !formData.active })
                  }
                />
                <span className="text-sm">Active for analysis</span>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? (
                    <span className="spinner" />
                  ) : editingId ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="mb-4 text-4xl">❓</p>
          <p className="text-[var(--muted)]">
            No qualifying questions defined yet.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add questions like &quot;What&apos;s your role?&quot; or
            &quot;What&apos;s your budget?&quot;
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <div key={question.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {question.question}
                    </h3>
                    <span
                      className={`badge ${question.active ? 'badge-success' : 'badge-neutral'}`}
                    >
                      {question.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {question.description && (
                    <p className="mt-2 text-[var(--muted)]">
                      {question.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(question)}
                    className={`toggle ${question.active ? 'active' : ''}`}
                    title={question.active ? 'Deactivate' : 'Activate'}
                  />
                  <button
                    onClick={() => startEdit(question)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
