from pydantic import BaseModel
from typing import List

class Insight(BaseModel):
    key: str
    value: str

class InsightResult(BaseModel):
    insights: List[Insight]

class Answer(BaseModel):
    question: str
    answer: str

class AnswerResult(BaseModel):
    answers: List[Answer]

class Summary(BaseModel):
    summary: str
