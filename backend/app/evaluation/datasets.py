"""Sample evaluation datasets (golden test cases)."""

# Sample conversation for testing
SAMPLE_CONVERSATION = """
Agent: Hello! How can I help you today?
Customer: Hi, I'm interested in your enterprise plan. My company has about 500 employees.
Agent: Great! Our enterprise plan would be perfect for a company your size. Can I ask what industry you're in?
Customer: We're in healthcare - specifically hospital administration.
Agent: Excellent. Healthcare is one of our strongest sectors. What's your current solution for managing patient records?
Customer: We're using an outdated system from 2015. It's slow and doesn't integrate well with our billing.
Agent: I understand. Our platform offers seamless integration with major billing systems and is HIPAA compliant. What's your timeline for making a decision?
Customer: We're looking to implement something by Q2 next year.
Agent: That's a reasonable timeline. I'd love to schedule a demo for your team. What budget range are you working with?
Customer: Around $50,000 to $75,000 annually.
Agent: Perfect, that fits well within our enterprise pricing. Can I get your email to send over some materials?
Customer: Sure, it's john.smith@hospital.org
"""

# Expected insights to extract
SAMPLE_INSIGHTS = """
- Company Size: Number of employees
- Industry: What sector the company operates in
- Current Solution: Existing tools or systems
- Budget: Expected spending range
- Timeline: When they plan to make a decision
"""

# Expected questions to answer
SAMPLE_QUESTIONS = """
- What is the customer's email address?
- How many employees does the company have?
- What is the customer's budget range?
- When does the customer want to implement the solution?
"""

# Golden test cases for evaluation
INSIGHT_TEST_CASES = [
    {
        "input": SAMPLE_CONVERSATION,
        "insights": SAMPLE_INSIGHTS,
        "expected_context": ["500 employees", "healthcare", "$50,000 to $75,000", "Q2 next year"],
    }
]

QUESTION_TEST_CASES = [
    {
        "input": SAMPLE_CONVERSATION,
        "questions": SAMPLE_QUESTIONS,
        "expected_answers": {
            "email": "john.smith@hospital.org",
            "employees": "500",
            "budget": "$50,000 to $75,000",
            "timeline": "Q2 next year",
        },
    }
]

SUMMARY_TEST_CASES = [
    {
        "input": SAMPLE_CONVERSATION,
        "expected_topics": ["enterprise plan", "healthcare", "500 employees", "demo"],
    }
]
