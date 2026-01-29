"""DeepEval tests for question answering."""

import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric

from app.evaluation.config import LangChainOpenAI, THRESHOLDS
from app.evaluation.datasets import QUESTION_TEST_CASES
from app.agent.orchestrator import get_orchestrator


@pytest.fixture
def eval_model():
    return LangChainOpenAI()


@pytest.mark.asyncio
async def test_question_answering_relevancy(eval_model):
    """Test that answers are relevant to the questions asked."""
    orchestrator = get_orchestrator()

    for test_case in QUESTION_TEST_CASES:
        result = await orchestrator.answer_questions(
            test_case["input"], test_case["questions"]
        )

        actual_output = "\n".join(
            f"Q: {answer.question}\nA: {answer.answer}" for answer in result
        )

        test = LLMTestCase(
            input=test_case["questions"],
            actual_output=actual_output,
            retrieval_context=[test_case["input"]],
        )

        relevancy_metric = AnswerRelevancyMetric(
            threshold=THRESHOLDS["answer_relevancy"],
            model=eval_model,
        )

        assert_test(test, [relevancy_metric])


@pytest.mark.asyncio
async def test_question_answering_faithfulness(eval_model):
    """Test that answers are grounded in the conversation (no hallucinations)."""
    orchestrator = get_orchestrator()

    for test_case in QUESTION_TEST_CASES:
        result = await orchestrator.answer_questions(
            test_case["input"], test_case["questions"]
        )

        actual_output = "\n".join(
            f"Q: {answer.question}\nA: {answer.answer}" for answer in result
        )

        test = LLMTestCase(
            input=test_case["questions"],
            actual_output=actual_output,
            retrieval_context=[test_case["input"]],
        )

        faithfulness_metric = FaithfulnessMetric(
            threshold=THRESHOLDS["faithfulness"],
            model=eval_model,
        )

        assert_test(test, [faithfulness_metric])
