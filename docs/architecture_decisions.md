# Architecture Decision Records (ADR)

## ADR 001: Integrated Monorepo with Standalone Modular Services
- **Status**: Accepted
- **Context**: The project demonstrates an entire distributed ecosystem (Consumer, Provider, Gating, Observer, Dashboard). Maintaining disconnected repositories creates setup friction for academic evaluation.
- **Decision**: Structure as a unified monorepo with cleanly isolated internal boundaries (`backend/`, `frontend/`, `services/`). Provide single-command launch capabilities while keeping microservice network interfaces strictly decoupled.

---

## ADR 002: Deterministic Rule & Pattern NLP Engine
- **Status**: Accepted
- **Context**: Statistical LLM/NLP APIs introduce non-deterministic latency, token quota dependencies, and hallucination risks during real-time automated gate evaluations.
- **Decision**: Implement a high-precision deterministic regex & rule-based parser in Python covering 15 canonical contract manipulation intents with exact entity extraction, fuzzy string matching, and explicit confidence scoring.

---

## ADR 003: SQLite Local Default with Production PostgreSQL Compatibility
- **Status**: Accepted
- **Context**: Evaluators must be able to run and test the complete system immediately on any workstation without requiring a pre-installed and running PostgreSQL daemon.
- **Decision**: Leverage SQLAlchemy 2.0 ORM with dialect-agnostic models. Use zero-configuration SQLite for immediate local execution and provide complete PostgreSQL connection strings and Docker Compose definitions for production deployment.

---

## ADR 004: Pure WebSocket Live Event Broadcasting
- **Status**: Accepted
- **Context**: Traditional HTTP polling introduces artificial latency and UI jitter.
- **Decision**: Implement Starlette WebSocket broadcasting (`/ws/events`). Any contract mutation, PCAE evaluation, or gate transition publishes structured JSON events that React frontend hooks consume to trigger instant state updates.

---

## ADR 005: Cryptographic Content-Addressing for Genotypes
- **Status**: Accepted
- **Context**: Biological genotypes in distributed systems must guarantee tamper-evidence and traceability.
- **Decision**: Every committed genotype computes a canonical SHA-256 hash across sorted gene definitions and includes a pointer to `parent_genotype_id`. Genotype records are strictly immutable in the database.
