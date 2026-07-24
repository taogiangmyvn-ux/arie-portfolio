# Source code — LLM-Powered Niche Discovery Engine

Backend logic behind the [interactive demo](https://taogiangmyvn-ux.github.io/arie-portfolio/ai-demo.html).

| File | What it is |
|---|---|
| [`llm_vetting_agent.py`](llm_vetting_agent.py) | The production vetting pipeline: URL list → Apify scrape (stubbed) → Claude analysis with schema-validated JSON output → routing decision. |

The web demo is a frontend simulation because GitHub Pages is static — exposing an LLM API key in browser code is not an option. This script is the part that would run server-side (queue worker, cron, or a small FastAPI service).

Run it:

```bash
pip install anthropic pydantic
export ANTHROPIC_API_KEY=sk-ant-...
python llm_vetting_agent.py urls.txt
```

Context: this pattern ran the creator vetting behind CoBa's Daughter's affiliate engine — a 5,000+ creator pipeline scored against brand positioning, 300–400 active affiliate nodes a month. [Read the case →](https://taogiangmyvn-ux.github.io/arie-portfolio/coba.html)
