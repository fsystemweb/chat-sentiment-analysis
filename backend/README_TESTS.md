# Backend Integration Tests

This directory contains integration tests for all backend API endpoints.

## Test Structure

```
tests/
├── __init__.py
├── conftest.py          # Pytest fixtures and configuration
├── test_health.py       # Health check endpoints
├── test_insights.py     # Insights CRUD operations
├── test_questions.py    # Questions CRUD operations
├── test_conversations.py # Conversations endpoints
└── test_analysis.py     # Analysis endpoints
```

## Running Tests

### Run All Tests

```bash
# From the backend directory
pytest

# With verbose output
pytest -v

# With coverage
pytest --cov=app --cov-report=html
```

### Run Specific Test Files

```bash
# Run only insights tests
pytest tests/test_insights.py

# Run only analysis tests
pytest tests/test_analysis.py
```

### Run Specific Tests

```bash
# Run a specific test function
pytest tests/test_insights.py::test_create_insight

# Run tests matching a pattern
pytest -k "create"
```

## Test Coverage

The tests cover:

### Health Endpoints
- ✅ Root endpoint (`/`)
- ✅ Health check endpoint (`/health`)

### Insights Endpoints (`/api/insights`)
- ✅ List all insights
- ✅ List active insights
- ✅ Get insight by ID
- ✅ Create insight
- ✅ Update insight
- ✅ Delete insight
- ✅ Error handling (404s)

### Questions Endpoints (`/api/questions`)
- ✅ List all questions
- ✅ List active questions
- ✅ Get question by ID
- ✅ Create question
- ✅ Update question
- ✅ Delete question
- ✅ Error handling (404s)

### Conversations Endpoints (`/api/conversations`)
- ✅ List all conversations
- ✅ Get conversation by ID
- ✅ Create conversation
- ✅ Multiple messages handling
- ✅ Error handling (404s)

### Analysis Endpoints (`/api/analysis`)
- ✅ Run analysis on conversation
- ✅ Get analysis by conversation ID
- ✅ List all analyses
- ✅ Aggregate analysis
- ✅ Error handling (404s, 500s)
- ✅ Mocked LLM calls

## Test Fixtures

The `conftest.py` file provides:

- **test_data_dir**: Temporary directory for test data
- **test_settings**: Overridden settings for testing
- **client**: FastAPI test client
- **clean_data_files**: Auto-cleanup between tests

## Environment Variables

Tests use the following environment variables:

- `OPENAI_API_KEY`: OpenAI API key (defaults to "test-key" for mocked tests)

## Notes

- Tests use a temporary data directory that's cleaned up after each test
- Analysis tests mock the LLM calls to avoid API costs
- All tests are isolated and can run in any order
- The test client automatically handles CORS and middleware
