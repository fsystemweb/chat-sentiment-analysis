"""Analysis API routes."""

import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.models.analysis import AnalysisRequest, ConversationAnalysis, AggregateAnalysis
from app.services.conversation_service import get_conversation_service
from app.agent.chains import get_analysis_chain
from app.services.storage_service import StorageService

router = APIRouter()


async def _get_analysis_storage() -> StorageService:
    """Get the analysis results storage service."""
    settings = get_settings()
    return StorageService(settings.analysis_results_file, ConversationAnalysis)


@router.post("/analysis", response_model=ConversationAnalysis)
async def run_analysis(request: AnalysisRequest):
    """Run analysis on a conversation."""
    # Get the conversation
    conversation_service = get_conversation_service()
    conversation = await conversation_service.get_by_id(request.conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{request.conversation_id}' not found"
        )
    
    # Run analysis
    chain = get_analysis_chain()
    try:
        result = await chain.analyze_conversation(
            conversation,
            insight_ids=request.insight_ids,
            question_ids=request.question_ids
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )
    
    # Store the result
    storage = await _get_analysis_storage()
    await storage.create(result)
    
    return result


@router.get("/analysis/{conversation_id}", response_model=Optional[ConversationAnalysis])
async def get_analysis(conversation_id: str):
    """Get the latest analysis for a conversation."""
    storage = await _get_analysis_storage()
    all_results = await storage.get_all()
    
    # Find the latest analysis for this conversation
    results_for_conv = [r for r in all_results if r.conversation_id == conversation_id]
    if not results_for_conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No analysis found for conversation '{conversation_id}'"
        )
    
    # Return the most recent
    return max(results_for_conv, key=lambda r: r.analyzed_at)


@router.get("/analysis", response_model=List[ConversationAnalysis])
async def list_all_analyses():
    """Get all analysis results."""
    storage = await _get_analysis_storage()
    return await storage.get_all()


@router.get("/analysis/aggregate", response_model=AggregateAnalysis)
async def get_aggregate_analysis():
    """Get aggregate analysis across all conversations."""
    from datetime import datetime
    
    storage = await _get_analysis_storage()
    all_results = await storage.get_all()
    
    conversation_service = get_conversation_service()
    all_conversations = await conversation_service.get_all()
    
    # Aggregate insight data
    insight_summaries = {}
    question_summaries = {}
    
    for result in all_results:
        for insight in result.insights:
            if insight.insight_name not in insight_summaries:
                insight_summaries[insight.insight_name] = {
                    "total_extractions": 0,
                    "avg_confidence": 0,
                    "values": []
                }
            insight_summaries[insight.insight_name]["total_extractions"] += 1
            insight_summaries[insight.insight_name]["avg_confidence"] += insight.confidence
            insight_summaries[insight.insight_name]["values"].append({
                "conversation_id": result.conversation_id,
                "value": insight.value,
                "confidence": insight.confidence
            })
        
        for question in result.questions:
            if question.question_text not in question_summaries:
                question_summaries[question.question_text] = {
                    "total_checked": 0,
                    "times_answered": 0,
                    "answers": []
                }
            question_summaries[question.question_text]["total_checked"] += 1
            if question.answered:
                question_summaries[question.question_text]["times_answered"] += 1
                question_summaries[question.question_text]["answers"].append({
                    "conversation_id": result.conversation_id,
                    "answer": question.answer
                })
    
    # Calculate averages
    for name, data in insight_summaries.items():
        if data["total_extractions"] > 0:
            data["avg_confidence"] /= data["total_extractions"]
    
    return AggregateAnalysis(
        total_conversations=len(all_conversations),
        analyzed_conversations=len(set(r.conversation_id for r in all_results)),
        insight_summaries=insight_summaries,
        question_summaries=question_summaries,
        generated_at=datetime.utcnow()
    )
