"""DeepEval tests for summary generation."""

import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import SummarizationMetric, HallucinationMetric

from app.evaluation.config import LangChainOpenAI, THRESHOLDS
from app.evaluation.datasets import SUMMARY_TEST_CASES
from app.agent.orchestrator import get_orchestrator


@pytest.fixture
def eval_model():
    return LangChainOpenAI()


@pytest.mark.asyncio
async def test_summary_quality(eval_model):
    """Test that generated summaries accurately capture the conversation."""
    orchestrator = get_orchestrator()

    for test_case in SUMMARY_TEST_CASES:
        result = await orchestrator.generate_summary(test_case["input"])

        test = LLMTestCase(
            input=test_case["input"],
            actual_output=result.summary,
        )

        summarization_metric = SummarizationMetric(
            threshold=THRESHOLDS["summarization"],
            model=eval_model,
        )

        assert_test(test, [summarization_metric])


@pytest.mark.asyncio
async def test_summary_no_hallucination(eval_model):
    """Test that summaries don't contain fabricated information."""
    orchestrator = get_orchestrator()

    for test_case in SUMMARY_TEST_CASES:
        result = await orchestrator.generate_summary(test_case["input"])

        test = LLMTestCase(
            input=test_case["input"],
            actual_output=result.summary,
            context=[test_case["input"]],
        )

        hallucination_metric = HallucinationMetric(
            threshold=THRESHOLDS["hallucination"],
            model=eval_model,
        )

        assert_test(test, [hallucination_metric])
