"""Analysis chains and utilities for conversation analysis."""

import json
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
    
    def _parse_insight_results(self, llm_response: str) -> List[InsightResult]:
        """Parse LLM response into InsightResult objects."""
        try:
            # Try to extract JSON from the response
            response = llm_response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            
            data = json.loads(response.strip())
            return [InsightResult(**item) for item in data]
        except Exception as e:
            print(f"Error parsing insight results: {e}")
            return []
    
    def _parse_question_results(self, llm_response: str) -> List[QuestionResult]:
        """Parse LLM response into QuestionResult objects."""
        try:
            response = llm_response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            
            data = json.loads(response.strip())
            return [QuestionResult(**item) for item in data]
        except Exception as e:
            print(f"Error parsing question results: {e}")
            return []
    
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
            llm_response = await self.orchestrator.extract_insights(conversation_text, insights_text)
            insight_results = self._parse_insight_results(llm_response)
        
        # Answer questions
        question_results = []
        if questions:
            questions_text = self._format_questions_for_prompt(questions)
            llm_response = await self.orchestrator.answer_questions(conversation_text, questions_text)
            question_results = self._parse_question_results(llm_response)
        
        # Generate summary
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
