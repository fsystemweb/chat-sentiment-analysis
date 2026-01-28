"""LangChain orchestrator for AI-powered conversation analysis."""

from pathlib import Path
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from .structured_output import InsightResult, AnswerResult, Summary

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
    
    async def extract_insights(self, conversation_text: str, insights_text: str) -> list:
        """Extract insights from a conversation using LLM with structured output validation."""
        parser = PydanticOutputParser(pydantic_object=InsightResult)
        prompt = self._create_prompt_template("insight_extraction")
        
        # Create the full prompt with format instructions
        full_prompt = PromptTemplate(
            template=prompt.template + "\n\n{format_instructions}",
            input_variables=prompt.input_variables,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = full_prompt | self.llm | parser
        result = await chain.ainvoke({
            "conversation": conversation_text,
            "insights": insights_text
        })
        # Extract the list from the wrapper object
        return result.insights
    
    async def answer_questions(self, conversation_text: str, questions_text: str) -> list:
        """Find answers to qualifying questions in a conversation with structured output validation."""
        parser = PydanticOutputParser(pydantic_object=AnswerResult)
        prompt = self._create_prompt_template("question_answering")
        
        # Create the full prompt with format instructions
        full_prompt = PromptTemplate(
            template=prompt.template + "\n\n{format_instructions}",
            input_variables=prompt.input_variables,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = full_prompt | self.llm | parser
        result = await chain.ainvoke({
            "conversation": conversation_text,
            "questions": questions_text
        })
        # Extract the list from the wrapper object
        return result.questions
    
    async def generate_summary(self, conversation_text: str) -> str:
        """Generate a summary of the conversation with structured output validation."""
        parser = PydanticOutputParser(pydantic_object=Summary)
        prompt = self._create_prompt_template("conversation_summary")
        
        # Create the full prompt with format instructions
        full_prompt = PromptTemplate(
            template=prompt.template + "\n\n{format_instructions}",
            input_variables=prompt.input_variables,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = full_prompt | self.llm | parser
        result = await chain.ainvoke({
            "conversation": conversation_text
        })
        # Extract the summary string from the wrapper object
        return result.summary


# Singleton instance
_orchestrator: Optional[ConversationOrchestrator] = None


def get_orchestrator() -> ConversationOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ConversationOrchestrator()
    return _orchestrator
