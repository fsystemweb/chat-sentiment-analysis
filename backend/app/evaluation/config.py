"""DeepEval evaluation configuration."""

from deepeval.models import DeepEvalBaseLLM
from langchain_openai import ChatOpenAI
from app.config import get_settings


class LangChainOpenAI(DeepEvalBaseLLM):
    """Wrapper to use LangChain's ChatOpenAI as DeepEval's evaluation model."""

    def __init__(self):
        settings = get_settings()
        self.model = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=0,
        )

    def load_model(self):
        return self.model

    def generate(self, prompt: str) -> str:
        return self.model.invoke(prompt).content

    async def a_generate(self, prompt: str) -> str:
        response = await self.model.ainvoke(prompt)
        return response.content

    def get_model_name(self) -> str:
        return self.model.model_name


# Metric thresholds
THRESHOLDS = {
    "answer_relevancy": 0.7,
    "faithfulness": 0.7,
    "summarization": 0.6,
    "hallucination": 0.3,  # Lower is better for hallucination
}
