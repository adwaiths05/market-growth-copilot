# Marketplace Growth Copilot

An agentic AI system that analyzes marketplace product listings, researches competitors, evaluates pricing and sentiment, and generates actionable optimization recommendations.

## Tech Stack
- FastAPI backend
- PostgreSQL (Neon)
- SQLAlchemy ORM
- LangGraph agent orchestration
- Mistral LLM + embeddings
- MCP-based tool integrations

## Features (in progress)
- Job-based asynchronous analysis pipeline
- Multi-agent research and optimization workflow
- Competitor and pricing intelligence
- Automated recommendation generation

## Run locally
Create virtual environment:
```bash
python -m venv env
source env/bin/activate   # or env\Scripts\activate on Windows
```
Install dependencies:
```bash
pip install -r requirements.txt
```
Run server:
```bash
uvicorn app.main:app --reload
```
