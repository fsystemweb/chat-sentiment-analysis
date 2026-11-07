# AGENTS.md

Chat sentiment analysis: a FastAPI backend with a LangChain/OpenAI agent that extracts insights from conversations, and a Next.js frontend. Deployed to AWS ECS with Terraform.

## Commands
Backend (run in `backend/`, Python 3.10+; the Docker image uses 3.11):
- Install: `pip install -r requirements.txt` (inside a venv)
- Dev server: `uvicorn app.main:app --reload --port 8000` (Swagger at `/docs`)
- Test: `pytest` (config in `backend/pytest.ini`, tests in `backend/tests/`)
- Evaluations: `deepeval test run app/evaluation/` (calls the real OpenAI API)

Frontend (run in `frontend/`, Node 18+):
- Install: `npm install`
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Frontend tests: none yet

Whole stack: `docker-compose.yml` (backend on 8000, frontend on 3000).

## Conventions
- Backend layout in `backend/app/`: `agent/` (chains, orchestrator, `prompts/*.txt`), `api/routes/`, `models/`, `services/`, `evaluation/`, `config.py`, `main.py`. API routes are mounted under the `api_prefix` setting.
- Storage is JSON files in `backend/data/` (no database). Tests reset these files via `conftest.py`, so never point tests at real data.
- Backend tests mock the LLM chain with `unittest.mock.patch`; keep new tests offline.
- Frontend: Next.js 13 App Router, React 18, TypeScript, Tailwind, Radix UI. Code lives in `frontend/src/` (`app/`, `components/ui/`, `components/notifications/`, `lib/api.ts`). The API base URL comes from `NEXT_PUBLIC_API_URL`.
- Env vars (names in `backend/.env.example`): `OPENAI_API_KEY`, `OPENAI_MODEL`, `DATA_DIR`. Terraform takes `openai_api_key` from a local tfvars file (see the example file in `terraform/`).
- `terraform/` and `deploy.sh` push images to ECR and force new ECS deployments; see `DEPLOYMENT.md` and `ARCHITECTURE.md`.
- `.agent/skills/` holds third-party skill files unrelated to this stack (one is for NestJS); ignore them when working on the app.
- `docker-compose.yml` maps the frontend to `3000:80`, but `frontend/Dockerfile` serves on port 3000; check this before relying on compose for the frontend.

## Boundaries
- Always: add or update tests in `backend/tests/` with every backend behavior change and run `pytest`.
- Ask first: adding a dependency, changing the JSON data format, editing `terraform/` or `deploy.sh`.
- Never: commit secrets or read `.env` files.
- Never: run `terraform apply`, `deploy.sh` or the DeepEval suite without being asked; they use real cloud and API resources.
