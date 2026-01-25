"""LangChain orchestrator for AI-powered conversation analysis."""

from pathlib import Path
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

from app.config import get_settings


class ConversationOrchestrator:
    """Orchestrates LLM calls for conversation analysis using LangChain."""
    
    def __init__(self):
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=0.1,  # Low temperature for more consistent analysis
        )
        self.prompts_dir = settings.prompts_dir
    
    def _load_prompt(self, prompt_name: str) -> str:
        """Load a prompt template from file."""
        prompt_path = self.prompts_dir / f"{prompt_name}.txt"
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt template not found: {prompt_path}")
        return prompt_path.read_text()
    
    def _create_prompt_template(self, prompt_name: str) -> PromptTemplate:
        """Create a LangChain PromptTemplate from a file."""
        template = self._load_prompt(prompt_name)
        # Extract input variables from template
        import re
        variables = re.findall(r'\{(\w+)\}', template)
        return PromptTemplate(template=template, input_variables=list(set(variables)))
    
    async def extract_insights(self, conversation_text: str, insights_text: str) -> str:
        """Extract insights from a conversation using LLM."""
        prompt = self._create_prompt_template("insight_extraction")
        chain = prompt | self.llm
        result = await chain.ainvoke({
            "conversation": conversation_text,
            "insights": insights_text
        })
        return result.content
    
    async def answer_questions(self, conversation_text: str, questions_text: str) -> str:
        """Find answers to qualifying questions in a conversation."""
        prompt = self._create_prompt_template("question_answering")
        chain = prompt | self.llm
        result = await chain.ainvoke({
            "conversation": conversation_text,
            "questions": questions_text
        })
        return result.content
    
    async def generate_summary(self, conversation_text: str) -> str:
        """Generate a summary of the conversation."""
        prompt = self._create_prompt_template("conversation_summary")
        chain = prompt | self.llm
        result = await chain.ainvoke({
            "conversation": conversation_text
        })
        return result.content


# Singleton instance
_orchestrator: Optional[ConversationOrchestrator] = None


def get_orchestrator() -> ConversationOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ConversationOrchestrator()
    return _orchestrator
