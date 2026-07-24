"""
============================================================================
 LLM-POWERED NICHE DISCOVERY ENGINE — production backend
============================================================================

 This is the backend logic for the AI Vetting Engine demoed at:
 https://taogiangmyvn-ux.github.io/arie-portfolio/ai-demo.html

 The portfolio site is static (GitHub Pages), so the web demo simulates
 this pipeline in the browser — no API keys can live in frontend code.
 This script is the real thing: structurally ready for production
 deployment behind a queue worker, a cron job, or a small FastAPI service.

 What it does
 ------------
 1. Takes a list of TikTok / Shopee creator video URLs.
 2. Scrapes each creator's public profile (bio, captions, metrics)
    via an Apify actor — stubbed here so the file runs standalone.
 3. Sends the scraped profile to Claude with a strict vetting
    system prompt, forcing a structured JSON verdict via the
    Anthropic SDK's schema-validated output.
 4. Routes each creator: READY_FOR_OUTREACH / MANUAL_REVIEW / REJECTED.

 In production at CoBa's Daughter this pattern vetted a 5,000+ creator
 pipeline against a clean-beauty, low-maintenance-luxury positioning,
 feeding 300-400 active affiliate nodes a month, operated by a VA team.

 Usage
 -----
   export ANTHROPIC_API_KEY=sk-ant-...
   python llm_vetting_agent.py urls.txt          # one URL per line
   echo "https://tiktok.com/@handle/video/123" | python llm_vetting_agent.py

 Requires: pip install anthropic pydantic
============================================================================
"""

from __future__ import annotations

import json
import sys
import time
from enum import Enum
from typing import List, Optional

import anthropic
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Claude Sonnet is the right tier for high-volume vetting: strong judgment,
# a fraction of Opus cost. Effort is set low because each call is a scoped
# classification task, not open-ended reasoning.
MODEL = "claude-sonnet-5"
EFFORT = "low"

# Routing thresholds. Anything ambiguous goes to a human — the engine's job
# is to kill the obvious noise and fast-track the obvious fits, not to make
# borderline calls unsupervised.
APPROVE_AT = 7.5
REJECT_BELOW = 5.0

# The brand brief the vetting prompt scores against. Swap this block to
# reuse the engine for a different brand.
BRAND_POSITIONING = """\
Brand: premium clean body care ("low-maintenance luxury").
Ideal creator: lifestyle, clean beauty, self-care, or minimalist content
with an engaged, mostly-female 22-40 audience in the US.
Hard no: link spammers, coupon/deal accounts, engagement-pod behavior,
content farms, anything conflicting with a premium positioning."""


# ---------------------------------------------------------------------------
# Data models — the schema IS the contract with the LLM
# ---------------------------------------------------------------------------

class CreatorProfile(BaseModel):
    """Raw scraped data for one creator. This is what the scraper returns
    and exactly what the LLM gets to see — nothing more."""

    handle: str
    source_url: str
    bio: str
    recent_captions: List[str]
    follower_count: int
    avg_views: int
    engagement_rate_pct: float


class Verdict(str, Enum):
    READY_FOR_OUTREACH = "READY_FOR_OUTREACH"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    REJECTED = "REJECTED"


class SpamRisk(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VettingResult(BaseModel):
    """The structured verdict Claude must return. The SDK validates the
    response against this schema, so downstream code never parses prose."""

    handle: str
    niche: str = Field(description="Primary content niche, 2-4 words")
    niche_score: float = Field(description="Brand fit, 0.0-10.0")
    spam_risk: SpamRisk
    audience_match: str = Field(description="One sentence on audience overlap")
    red_flags: List[str] = Field(description="Empty list if none found")
    rationale: str = Field(description="Two sentences max, decision-focused")


# ---------------------------------------------------------------------------
# Step 1 — Scraping (placeholder)
# ---------------------------------------------------------------------------

def scrape_profile(url: str) -> CreatorProfile:
    """Fetch a creator's public profile data for one video URL.

    Production implementation: call an Apify actor (e.g. the TikTok
    profile scraper) via apify-client, then normalize the response:

        from apify_client import ApifyClient
        client = ApifyClient(os.environ["APIFY_TOKEN"])
        run = client.actor("clockworks/tiktok-scraper").call(
            run_input={"postURLs": [url], "resultsPerPage": 20}
        )
        items = client.dataset(run["defaultDatasetId"]).list_items().items
        # ...map items -> CreatorProfile

    Stubbed here so the script runs without credentials. The rest of the
    pipeline treats the return value identically either way.
    """
    handle = url.rstrip("/").split("@")[-1].split("/")[0] or "unknown"
    return CreatorProfile(
        handle=f"@{handle}",
        source_url=url,
        bio="Placeholder bio — replace with Apify output.",
        recent_captions=["Placeholder caption 1", "Placeholder caption 2"],
        follower_count=48_000,
        avg_views=22_500,
        engagement_rate_pct=4.1,
    )


# ---------------------------------------------------------------------------
# Step 2 — LLM vetting
# ---------------------------------------------------------------------------

# The system prompt is deliberately strict: fixed rubric, fixed scale,
# explicit failure modes. Vague prompts produce vague scores; a rubric
# keeps scores comparable across thousands of creators and across weeks.
SYSTEM_PROMPT = f"""\
You are a creator-vetting analyst for an e-commerce affiliate program.

{BRAND_POSITIONING}

Score every creator against this rubric:
- 9-10: perfect niche fit, authentic voice, clean posting history
- 7-8.9: strong fit, minor gaps (adjacent niche, uneven engagement)
- 5-6.9: partial fit, needs a human look before outreach
- 0-4.9: wrong niche, spam signals, or brand-safety risk

Rules:
1. Judge ONLY from the data provided. Never invent facts about the creator.
2. Repetitive affiliate links, coupon dumps, or copy-paste captions
   across posts mean spam_risk HIGH and a score below 4.
3. Follower count alone never raises a score. Engagement quality does.
4. Be decisive. The rationale is two sentences, written for an operator
   who has 10 seconds to act on it."""

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment


def vet_creator(profile: CreatorProfile) -> VettingResult:
    """One profile in, one schema-validated verdict out."""
    response = client.messages.parse(
        model=MODEL,
        max_tokens=1024,
        output_config={"effort": EFFORT},
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    "Vet this creator and return your verdict:\n\n"
                    + profile.model_dump_json(indent=2)
                ),
            }
        ],
        output_format=VettingResult,
    )
    return response.parsed_output


def route(result: VettingResult) -> Verdict:
    """Turn a score into an operational decision. Kept outside the LLM on
    purpose: thresholds are business policy and change without re-prompting."""
    if result.spam_risk is SpamRisk.HIGH or result.niche_score < REJECT_BELOW:
        return Verdict.REJECTED
    if result.niche_score >= APPROVE_AT:
        return Verdict.READY_FOR_OUTREACH
    return Verdict.MANUAL_REVIEW


# ---------------------------------------------------------------------------
# Step 3 — Pipeline
# ---------------------------------------------------------------------------

def run_pipeline(urls: List[str]) -> List[dict]:
    """Scrape → vet → route each URL. Returns JSON-ready dicts.

    Sequential on purpose for readability. At real volume, swap the loop
    for anthropic's Message Batches API (50% cheaper, fully async) and
    let the VA team pick results up from a sheet the next morning.
    """
    results: List[dict] = []

    for url in urls:
        profile = scrape_profile(url)

        try:
            verdict = vet_creator(profile)
        except anthropic.RateLimitError as err:
            wait = int(err.response.headers.get("retry-after", "30"))
            time.sleep(wait)
            verdict = vet_creator(profile)  # one retry, then let it raise
        except anthropic.APIStatusError as err:
            results.append({"url": url, "error": f"API {err.status_code}"})
            continue

        results.append(
            {
                "url": url,
                "decision": route(verdict).value,
                **verdict.model_dump(),
            }
        )

    return results


def _read_urls() -> List[str]:
    source = open(sys.argv[1]) if len(sys.argv) > 1 else sys.stdin
    with source:
        return [line.strip() for line in source if line.strip()]


if __name__ == "__main__":
    urls = _read_urls()
    if not urls:
        sys.exit("No URLs provided. Pass a file path or pipe URLs via stdin.")
    print(json.dumps(run_pipeline(urls), indent=2))
