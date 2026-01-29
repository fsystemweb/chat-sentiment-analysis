# Agent Assistant

An AI-powered assistant application built with **FastAPI** (backend) and **Next.js** (frontend).

## 🌐 Live Demo

- **Application**: http://agent-assistant-alb-1868298832.us-east-1.elb.amazonaws.com/
- **API Documentation (Swagger)**: http://agent-assistant-alb-1868298832.us-east-1.elb.amazonaws.com/docs

## 📋 Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** or **yarn**
- **OpenAI API Key**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/fsystemweb/agent-assistant.git
cd agent-assitant
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment variables file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your-actual-api-key
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## ▶️ Running the Application

### Start the Backend Server

```bash
# From the backend directory (with venv activated)
cd backend
source venv/bin/activate  # if not already activated
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: `http://localhost:8000`

### Start the Frontend Development Server

```bash
# From the frontend directory (in a new terminal)
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 📁 Project Structure

```
agent-assitant/
├── backend/
│   ├── app/
│   │   ├── agent/       # AI agent logic
│   │   ├── api/         # API routes
│   │   ├── evaluation/  # DeepEval test suites
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   ├── config.py    # Configuration
│   │   └── main.py      # FastAPI app entry point
│   ├── data/            # Data files
│   ├── .env.example     # Environment variables template
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/             # Next.js source code
│   ├── public/          # Static assets
│   └── package.json     # Node.js dependencies
└── README.md
```

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `OPENAI_MODEL` | OpenAI model to use (default: `gpt-4`) | No |
| `DATA_DIR` | Path to data directory (default: `./data`) | No |

## 🛠️ Development

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`

## 🧪 Evaluation

The project uses [DeepEval](https://docs.confident-ai.com/) to evaluate the LangChain agent's performance.

### Running Evaluations

```bash
cd backend
source venv/bin/activate

# Install evaluation dependencies (if not already)
pip install -r requirements.txt

# Run all evaluations
deepeval test run app/evaluation/

# Run with verbose output
deepeval test run app/evaluation/ -v
```

### Metrics

| Task | Metrics |
|------|---------|
| Insight Extraction | Answer Relevancy, G-Eval (Accuracy) |
| Question Answering | Answer Relevancy, Faithfulness |
| Summary Generation | Summarization, Hallucination |

## 📝 TODO

### Scalability Improvements
- **Chunk Processing for Large Imports**: Currently, the application works perfectly for an MVP, but if we need to support 1000+ chat conversations for initial import, we should improve the code to process data in chunks to avoid memory issues and timeouts.

### Database Migration
- **Move from JSON to Relational Database**: The current MVP uses JSON files as a storage solution. This is fine for an MVP, but for production we should migrate to a relational database (e.g., PostgreSQL). This will allow us to:
  - Create separate tables with proper IDs and foreign keys
  - Establish relationships between entities (conversations, insights, analysis results)
  - Enable efficient querying and indexing
  - Support concurrent access and transactions

### CI/CD & Deployment
- **Automated Deployments**: Currently, deployment requires running a manual script. Ideally, this should be connected to a webhook (e.g., GitHub Actions) that triggers automatic deployment on push to the main branch.
- **Multi-Environment Setup**: Add a separate development environment apart from production for testing changes before they go live.

## 📝 License

MIT License
