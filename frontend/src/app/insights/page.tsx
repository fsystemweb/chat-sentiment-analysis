'use client'

import { useEffect, useState } from 'react'
import { insightsAPI } from '@/lib/api'
import type { Insight, InsightCreate } from '@/lib/types'

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
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="mt-2 text-[var(--muted)]">
            Define custom insights to extract from conversations
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <span>+</span> Add Insight
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
              {editingId ? 'Edit Insight' : 'New Insight'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="input"
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
                <textarea
                  className="input"
                  placeholder="Describe what insight to extract from conversations..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
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

      {/* Insights List */}
      {insights.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="mb-4 text-4xl">💡</p>
          <p className="text-[var(--muted)]">No insights defined yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add insights like &quot;User sentiment&quot;, &quot;Purchase
            intent&quot;, or &quot;Pain points&quot;
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <div key={insight.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{insight.name}</h3>
                    <span
                      className={`badge ${insight.active ? 'badge-success' : 'badge-neutral'}`}
                    >
                      {insight.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-2 text-[var(--muted)]">
                    {insight.description}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(insight)}
                    className={`toggle ${insight.active ? 'active' : ''}`}
                    title={insight.active ? 'Deactivate' : 'Activate'}
                  />
                  <button
                    onClick={() => startEdit(insight)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(insight.id)}
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
