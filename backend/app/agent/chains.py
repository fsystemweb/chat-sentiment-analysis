"""Analysis chains and utilities for conversation analysis."""

import uuid
from typing import List, Optional
from datetime import datetime

from app.models.insight import Insight, InsightResult
from app.models.question import Question, QuestionResult
from app.models.conversation import Conversation
from app.models.analysis import ConversationAnalysis
from app.agent.orchestrator import get_orchestrator
from app.services.insight_service import get_insight_service
from app.services.question_service import get_question_service


class AnalysisChain:
    """Chain for running complete conversation analysis."""
    
    def __init__(self):
        self.orchestrator = get_orchestrator()
        self.insight_service = get_insight_service()
        self.question_service = get_question_service()
    
    def _format_insights_for_prompt(self, insights: List[Insight]) -> str:
        """Format insights list for the LLM prompt."""
        lines = []
        for insight in insights:
            lines.append(f"- ID: {insight.id}")
            lines.append(f"  Name: {insight.name}")
            lines.append(f"  Description: {insight.description}")
            lines.append("")
        return "\n".join(lines)
    
    def _format_questions_for_prompt(self, questions: List[Question]) -> str:
        """Format questions list for the LLM prompt."""
        lines = []
        for question in questions:
            lines.append(f"- ID: {question.id}")
            lines.append(f"  Question: {question.question}")
            if question.description:
                lines.append(f"  Context: {question.description}")
            lines.append("")
        return "\n".join(lines)
    

    
    async def analyze_conversation(
        self,
        conversation: Conversation,
        insight_ids: Optional[List[str]] = None,
        question_ids: Optional[List[str]] = None
    ) -> ConversationAnalysis:
        """Run complete analysis on a conversation."""
        
        conversation_text = conversation.full_text
        
        # Get insights to analyze
        if insight_ids:
            all_insights = await self.insight_service.get_all()
            insights = [i for i in all_insights if i.id in insight_ids]
        else:
            insights = await self.insight_service.get_active()
        
        # Get questions to analyze
        if question_ids:
            all_questions = await self.question_service.get_all()
            questions = [q for q in all_questions if q.id in question_ids]
        else:
            questions = await self.question_service.get_active()
        
        # Extract insights
        insight_results = []
        if insights:
            insights_text = self._format_insights_for_prompt(insights)
            structured_insights = await self.orchestrator.extract_insights(conversation_text, insights_text)
            # Convert structured output items to domain models
            insight_results = [
                InsightResult(
                    insight_id=item.insight_id,
                    insight_name=item.insight_name,
                    value=item.value,
                    confidence=item.confidence,
                    evidence=item.evidence
                )
                for item in structured_insights
            ]
        
        # Answer questions
        question_results = []
        if questions:
            questions_text = self._format_questions_for_prompt(questions)
            structured_questions = await self.orchestrator.answer_questions(conversation_text, questions_text)
            # Convert structured output items to domain models
            question_results = [
                QuestionResult(
                    question_id=item.question_id,
                    question_text=item.question_text,
                    answered=item.answered,
                    answer=item.answer,
                    evidence=None  # Not provided in structured output
                )
                for item in structured_questions
            ]
        
        # Generate summary (already returns string)
        summary = await self.orchestrator.generate_summary(conversation_text)
        
        return ConversationAnalysis(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            analyzed_at=datetime.utcnow(),
            insights=insight_results,
            questions=question_results,
            summary=summary
        )


# Singleton instance
_analysis_chain: Optional[AnalysisChain] = None


def get_analysis_chain() -> AnalysisChain:
    """Get or create the analysis chain singleton."""
    global _analysis_chain
    if _analysis_chain is None:
        _analysis_chain = AnalysisChain()
    return _analysis_chain
