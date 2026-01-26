// API types matching the backend models

export interface Insight {
  id: string
  name: string
  description: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface InsightCreate {
  name: string
  description: string
  active?: boolean
}

export interface InsightUpdate {
  name?: string
  description?: string
  active?: boolean
}

export interface InsightResult {
  insight_id: string
  insight_name: string
  value: string
  confidence: number
  evidence: string | null
}

export interface Question {
  id: string
  question: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface QuestionCreate {
  question: string
  description?: string
  active?: boolean
}

export interface QuestionUpdate {
  question?: string
  description?: string
  active?: boolean
}

export interface QuestionResult {
  question_id: string
  question_text: string
  answered: boolean
  answer: string | null
  evidence: string | null
}

export interface Message {
  role: string
  content: string
  timestamp?: string
}

export interface ConversationMetadata {
  title: string
  source?: string
  date?: string
  participants?: string[]
  tags?: string[]
}

export interface Conversation {
  id: string
  metadata: ConversationMetadata
  messages: Message[]
}

export interface ConversationSummary {
  id: string
  title: string
  source?: string
  date?: string
  message_count: number
  has_analysis: boolean
}

export interface ConversationAnalysis {
  id: string
  conversation_id: string
  analyzed_at: string
  insights: InsightResult[]
  questions: QuestionResult[]
  summary: string | null
}

export interface AggregateAnalysis {
  total_conversations: number
  analyzed_conversations: number
  insight_summaries: Record<
    string,
    {
      total_extractions: number
      avg_confidence: number
      values: Array<{
        conversation_id: string
        value: string
        confidence: number
      }>
    }
  >
  question_summaries: Record<
    string,
    {
      total_checked: number
      times_answered: number
      answers: Array<{
        conversation_id: string
        answer: string
      }>
    }
  >
  generated_at: string
}

export interface AnalysisRequest {
  conversation_id: string
  insight_ids?: string[]
  question_ids?: string[]
}
