// API client for communicating with the FastAPI backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api')

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// Insights API
export const insightsAPI = {
  getAll: () => fetchAPI<import('./types').Insight[]>('/insights'),
  getActive: () => fetchAPI<import('./types').Insight[]>('/insights/active'),
  getById: (id: string) =>
    fetchAPI<import('./types').Insight>(`/insights/${id}`),
  create: (data: import('./types').InsightCreate) =>
    fetchAPI<import('./types').Insight>('/insights', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: import('./types').InsightUpdate) =>
    fetchAPI<import('./types').Insight>(`/insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/insights/${id}`, { method: 'DELETE' }),
}

// Questions API
export const questionsAPI = {
  getAll: () => fetchAPI<import('./types').Question[]>('/questions'),
  getActive: () => fetchAPI<import('./types').Question[]>('/questions/active'),
  getById: (id: string) =>
    fetchAPI<import('./types').Question>(`/questions/${id}`),
  create: (data: import('./types').QuestionCreate) =>
    fetchAPI<import('./types').Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: import('./types').QuestionUpdate) =>
    fetchAPI<import('./types').Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/questions/${id}`, { method: 'DELETE' }),
}

// Conversations API
export const conversationsAPI = {
  getAll: () =>
    fetchAPI<import('./types').ConversationSummary[]>('/conversations'),
  getById: (id: string) =>
    fetchAPI<import('./types').Conversation>(`/conversations/${id}`),
  import: (conversation: import('./types').Conversation) =>
    fetchAPI<import('./types').Conversation>('/conversations/import', {
      method: 'POST',
      body: JSON.stringify(conversation),
    }),
}

// Analysis API
export const analysisAPI = {
  run: (data: import('./types').AnalysisRequest) =>
    fetchAPI<import('./types').ConversationAnalysis>('/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getForConversation: (conversationId: string) =>
    fetchAPI<import('./types').ConversationAnalysis>(
      `/analysis/${conversationId}`
    ),
  getAll: () => fetchAPI<import('./types').ConversationAnalysis[]>('/analysis'),
  getAggregate: () =>
    fetchAPI<import('./types').AggregateAnalysis>('/analysis/aggregate'),
}
