"""Test script to verify the Pydantic validation fix."""

import asyncio
from app.agent.structured_output import InsightItem, InsightResult, QuestionItem, AnswerResult


async def test_structured_output_models():
    """Test that structured output models can be instantiated correctly."""
    
    # Test InsightItem
    insight_item = InsightItem(
        insight_id="test-123",
        insight_name="Test Insight",
        value="Test Value",
        confidence=0.95,
        evidence="This is evidence"
    )
    print(f"✓ InsightItem created: {insight_item.insight_name}")
    
    # Test InsightResult wrapper
    insight_result = InsightResult(
        insights=[insight_item]
    )
    print(f"✓ InsightResult wrapper created with {len(insight_result.insights)} insights")
    
    # Test QuestionItem
    question_item = QuestionItem(
        question_id="q-456",
        question_text="Is this a test?",
        answered=True,
        answer="Yes, this is a test",
        confidence=0.9
    )
    print(f"✓ QuestionItem created: {question_item.question_text}")
    
    # Test AnswerResult wrapper
    answer_result = AnswerResult(
        questions=[question_item]
    )
    print(f"✓ AnswerResult wrapper created with {len(answer_result.questions)} questions")
    
    # Test that models can be serialized
    insight_dict = insight_result.model_dump()
    print(f"✓ InsightResult serialized: {insight_dict}")
    
    answer_dict = answer_result.model_dump()
    print(f"✓ AnswerResult serialized: {answer_dict}")
    
    print("\n✅ All structured output model tests passed!")


if __name__ == "__main__":
    asyncio.run(test_structured_output_models())
