# InfraSphere AI Intelligence Layer (Google Gemini)

## Core Philosophy: Deterministic Fact Grounding

1. **NO Machine Learning for Core Scoring**:
   - Official Health and Risk scores are strictly computed by the deterministic rule engine in the **Risk Service**.
   - Gemini never invents, guesses, or calculates official risk scores.
2. **Explainability & Contextual Synthesis**:
   - Gemini receives verified system facts (condition score, age ratio, defect findings, open work orders, and cascading dependency links).
   - Gemini articulates *why* the score was reached in plain English and models the business impact of an outage.
3. **Zero Hallucination Guarantee**:
   - If an asset ID or metric is not present in the system, the model is strictly prompted: *"I don't have enough data to answer that."*
4. **Seamless Offline Fallback**:
   - When running in an environment without `GEMINI_API_KEY`, a built-in deterministic intelligence engine answers queries with real structured asset telemetry, ensuring the platform works immediately out-of-the-box.
