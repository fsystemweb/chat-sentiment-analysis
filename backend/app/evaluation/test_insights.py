"""DeepEval tests for insight extraction."""

import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric, GEval
from deepeval.metrics.g_eval import GEvalMetric

from app.evaluation.config import LangChainOpenAI, THRESHOLDS
from app.evaluation.datasets import INSIGHT_TEST_CASES
from app.agent.orchestrator import get_orchestrator


@pytest.fixture
def eval_model():
    return LangChainOpenAI()


@pytest.mark.asyncio
async def test_insight_extraction_relevancy(eval_model):
    """Test that extracted insights are relevant to the requested insights."""
    orchestrator = get_orchestrator()

    for test_case in INSIGHT_TEST_CASES:
        result = await orchestrator.extract_insights(
            test_case["input"], test_case["insights"]
        )

        # Convert result to string for evaluation
        actual_output = "\n".join(
            f"{insight.key}: {insight.value}" for insight in result.insights
        )

        test = LLMTestCase(
            input=test_case["insights"],
            actual_output=actual_output,
            retrieval_context=[test_case["input"]],
        )

        relevancy_metric = AnswerRelevancyMetric(
            threshold=THRESHOLDS["answer_relevancy"],
            model=eval_model,
        )

        assert_test(test, [relevancy_metric])


@pytest.mark.asyncio
async def test_insight_extraction_accuracy(eval_model):
    """Test that extracted insights are accurate using G-Eval."""
    orchestrator = get_orchestrator()

    for test_case in INSIGHT_TEST_CASES:
        result = await orchestrator.extract_insights(
            test_case["input"], test_case["insights"]
        )

        actual_output = "\n".join(
            f"{insight.key}: {insight.value}" for insight in result.insights
        )

        test = LLMTestCase(
            input=test_case["insights"],
            actual_output=actual_output,
            expected_output=", ".join(test_case["expected_context"]),
        )

        accuracy_metric = GEval(
            name="Insight Accuracy",
            criteria="Determine if the extracted insights accurately capture the key information from the conversation. The insights should match the expected values.",
            evaluation_params=["input", "actual_output", "expected_output"],
            threshold=0.7,
            model=eval_model,
        )

        assert_test(test, [accuracy_metric])
