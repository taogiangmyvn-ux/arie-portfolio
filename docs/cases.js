/* ============================================================
   PORTFOLIO CASE LIBRARY — single source of truth
   Landing pages (growth-home / brand-commerce / partnerships-
   client-solutions) render from this. Case pages stay untouched.
   Roles: growth | brand | partners  (fallback: base)
   ============================================================ */
window.PORTFOLIO = {

  cases: [

    { id:'halio', href:'halio-growth-case.html',
      title:"Halio: From a niche audience to a scalable U.S. growth engine",
      thumb:'<div class="wthumb"><span class="wtag"><i style="--c:#E77868"></i>Beauty Tech · U.S.</span><img src="assets/photoshoot-halio.jpg" alt="Halio Sonic campaign key visual" loading="lazy"></div>',
      base:{ desc:"A high-touch conversion engine: ~30 paid creator partnerships a month, U.S.-native creative testing and lifecycle flows — built to lift CTR and cut CAC.",
        metrics:["2× YoY","3–4× ROAS","~30 paid creators/mo"] },
      growth:{ ctx:"A saturated diaspora creator pool capped reach — growth needed new audiences and a measurable funnel.",
        myrole:"Creator growth (~30 paid partnerships/mo), creative testing, offer architecture and lifecycle flows.",
        metrics:["2× YoY · Nov–Dec","3–4× ROAS","~30 creators/mo"] },
      brand:{ desc:"A clinical skincare device translated into a U.S.-native brand story that converts — creative testing, bundles and lifecycle.",
        ctx:"Translate a clinical beauty device into a U.S.-native brand story that converts.",
        myrole:"Creative-testing direction (studio vs lifestyle), offer & bundle strategy (the $499 Lift & Light Duo), lifecycle communication.",
        metrics:["2× YoY · Nov–Dec","3–4× peak ROAS","Duo bundle $499"] },
      partners:{ desc:"High-touch creator partnerships (~30/mo) plus a TYB brand-community partnership — sourcing, negotiation, briefing, activation.",
        ctx:"High-touch paid partnerships as a conversion channel — depth over volume, every partner accountable to ROAS.",
        myrole:"Sourced, negotiated, briefed and managed ~30 paid creator partners a month; ran the TYB community partnership — one of the largest brand-community platforms in the U.S.",
        metrics:["~30 partners/mo","TYB partnership","3–4× ROAS"] } },

    { id:'coba', href:'coba.html',
      title:"CoBa’s Daughter: A heritage brand, built for a global shelf",
      thumb:'<div class="wthumb"><span class="wtag"><i style="--c:#4B6043"></i>Luxury Body Care</span><img src="assets/coba-thumb-hero.jpg" alt="CoBa’s Daughter equestrian editorial" loading="lazy"></div>',
      base:{ desc:"A scalable acquisition engine: 5,000+ creator pipeline, LLM-assisted vetting and SOPs run by a 10+ VA team — 300–400 active affiliate nodes a month, Top #5 on Amazon US.",
        metrics:["Top #5 Amazon","5,000+ pipeline","300–400 nodes/mo"] },
      growth:{ ctx:"A copycat category where paid spend can't differentiate — growth had to come from an acquisition system, not a budget.",
        myrole:"Built the acquisition engine: 5,000+ LLM-vetted creator pipeline, SOPs for a 10+ VA team, refill-led retention.",
        metrics:["Top #5 Amazon US","5,000+ pipeline","300–400 nodes/mo"] },
      brand:{ desc:"Built a creator-commerce and refill growth engine across Amazon, TikTok Shop and DTC.",
        ctx:"Vietnamese-inspired luxury body care with a story lookalikes can't copy.",
        myrole:"Brand world & positioning, creator commerce across Amazon · TikTok Shop · DTC, and the “Twice the Ritual” refill GTM.",
        metrics:["Top #5 Amazon US","3 channels","Refill GTM"] },
      partners:{ desc:"Scaled a creator and affiliate ecosystem through partner sourcing, onboarding, briefing, activation and a VA-supported operating model.",
        ctx:"300–400 partners publishing every month doesn't happen manually — it needs an operating model.",
        myrole:"Partner sourcing & vetting (5,000+ pipeline), onboarding & briefing SOPs, a 10+ VA operation, co-brand events (Ponies & Pilates, LA).",
        metrics:["300–400 active/mo","10+ VA operation","5,000+ pipeline"] } },

    { id:'amamy', href:'amamy.html',
      title:"Amamy: Growing a cross-border brand where its customers live",
      thumb:'<div class="wthumb fit" style="background:linear-gradient(135deg,#E9F3FB,#D5E8F7)"><span class="wtag"><i style="--c:#2F6BE0"></i>Cross-Border · Freelance</span><img src="assets/amamy-thumb-full.jpg" alt="Amamy brand key visual" loading="lazy"></div>',
      base:{ desc:"×1.5 revenue in a year at near-$0 CAC — a double-sided referral loop, market-native content and embassy-backed community instead of paid acquisition.",
        metrics:["×1.5 revenue","$0-CAC referral loop","60K fanpage"] },
      growth:{ ctx:"A commodity service with zero ad budget — growth had to compound on its own.",
        myrole:"Designed the double-sided referral loop, the market-native content system and lifecycle email — solo.",
        metrics:["×1.5 revenue","~$0-CAC loop","60K fanpage"] },
      brand:{ desc:"One brand voice, four market-native looks (JP · AU · DE · US) — 200+ localized copies, a rebuilt website, ×1.5 revenue.",
        ctx:"One brand voice that had to feel local in Japan, Australia, Germany and the US at once.",
        myrole:"All-in-one marketer: brand & website (researched, revamped 2–3×), 200+ localized copies, email marketing.",
        metrics:["×1.5 revenue","200+ localized copies","60K fanpage"] },
      partners:{ desc:"Embassy-backed community partnerships in Germany & Japan plus B2B customer acquisition — distribution through trust, not ads.",
        ctx:"In a trust category, distribution runs through communities — not ads.",
        myrole:"Led embassy-backed community partnerships (Germany & Japan), B2B customer acquisition and the referral program design.",
        metrics:["Embassy partners DE·JP","B2B acquisition","×1.5 revenue"] } },

    { id:'guardian', href:'guardian.html',
      title:"Guardian: One message, from deck to shelf",
      thumb:'<div class="wthumb"><span class="wtag"><i style="--c:#B3372B"></i>H&amp;B Retail · Vietnam</span><img src="assets/guardian-store.png" alt="Guardian store floor inside LOTTE Mart" loading="lazy"></div>',
      base:{ desc:"Retail marketing at one of Vietnam's largest H&B chains — a new-store opening and co-brand campaigns across the L'Oréal ecosystem.",
        metrics:["10+ campaigns","8+ brand partners","Store opening"] },
      growth:{ ctx:"A retail funnel from footfall to basket — execution decides conversion.",
        myrole:"10+ campaigns and a full store opening; promo mechanics verified in-store before going live online.",
        metrics:["10+ campaigns","8+ partners","Opening 12.24"] },
      brand:{ desc:"Campaigns at one of Vietnam's largest H&B chains — POSM, mechanics, digital and store comms that survive to the shelf.",
        ctx:"A campaign only counts when the banner, the shelf strip and the cashier say the same thing.",
        myrole:"POSM, promo mechanics, digital assets and store communication — to L'Oréal-ecosystem standards.",
        metrics:["10+ campaigns","8+ brand partners","LOTTE opening 12.24"] },
      partners:{ desc:"8+ global brand partners (L'Oréal Paris, Maybelline, LRP…) — campaign participation, asset readiness, execution follow-up.",
        ctx:"8+ global brand partners whose teams audit execution — “almost right” fails the check.",
        myrole:"Campaign participation, asset readiness and execution follow-up across the L'Oréal ecosystem.",
        metrics:["8+ partners","10+ campaigns","Global standard"] } },

    { id:'momo', href:'momo.html', badge:'Independent analysis',
      title:"MoMo: Growth after the QR wars",
      thumb:'<div class="wthumb momoviz"><span class="wtag"><i style="--c:#B4126B"></i>Independent Research · Fintech</span><span class="logochip"><img src="assets/mm-icon.png" alt="MoMo logo"></span><svg viewBox="0 0 240 96" aria-hidden="true"><line x1="12" y1="48" x2="228" y2="48" stroke="rgba(255,255,255,.22)" stroke-dasharray="3 4"/><polyline points="12,48 120,56 228,70" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12,48 120,28 228,8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="228" cy="8" r="5" fill="#fff"/><circle cx="228" cy="70" r="5" fill="rgba(255,255,255,.5)"/><text x="12" y="88" font-family="Manrope,sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,.55)">payments up · wallets down</text></svg><span class="mt">Retention &gt; Acquisition</span></div>',
      base:{ desc:"A research-backed retention & ARPU deep dive on Vietnam's largest fintech: market forensics with SBV/NAPAS data, an outside-in lifecycle model, and a fully specified flagship experiment.",
        metrics:["Market forensics","Retention & ARPU","Experiment design"] },
      growth:{ ctx:"When wallet penetration saturates, growth shifts from acquisition to retention and ARPU depth.",
        myrole:"Independent teardown on public data (SBV, NAPAS, Decision Lab): outside-in lifecycle model plus a fully specified flagship experiment. Roots in my UEH UTAUT2 e-wallet adoption research.",
        metrics:["Market forensics","Retention & ARPU","Experiment design"] } },

    { id:'zalopay', href:'zalopay.html', badge:'Independent analysis',
      title:"ZaloPay: Won the trip, lost the user",
      thumb:'<div class="wthumb zpviz"><span class="wtag"><i style="--c:#01CF6A"></i>Independent Research · Fintech</span><span class="logochip"><img src="assets/zp-logo.svg" alt="ZaloPay logo"></span><svg viewBox="0 0 240 110" aria-hidden="true"><circle cx="30" cy="82" r="7" fill="#fff"/><path d="M30 82 C 80 82, 90 22, 140 22" fill="none" stroke="#01CF6A" stroke-width="3.5" stroke-linecap="round"/><path d="M140 22 C 175 22, 185 46, 212 46" fill="none" stroke="#6BE8A8" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 6"/><circle cx="140" cy="22" r="6" fill="#01CF6A"/><circle cx="212" cy="46" r="6" fill="#6BE8A8"/><text x="30" y="104" text-anchor="middle" font-family="Manrope,sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,.6)">VN</text><text x="140" y="12" text-anchor="middle" font-family="Manrope,sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,.75)">abroad</text></svg><span class="zt">Won the trip · Lost the user</span></div>',
      base:{ desc:"I paid across China with ZaloPay, then came home and deleted it. A quantified retention case: competitive teardown, break-even model, media & growth plan.",
        metrics:["Competitive teardown","Break-even model","Growth plan"] },
      growth:{ ctx:"A viral acquisition campaign that didn't retain — so what is a “trip” actually worth?",
        myrole:"Quantified retention post-mortem from my own user journey: competitive teardown vs MoMo, break-even model, media & growth plan.",
        metrics:["Competitive teardown","Break-even model","Media & growth plan"] } },

    { id:'ahamove', href:'ahamove.html', badge:'Independent study · SBC',
      title:"AhaMove: From first booking to repeat habit",
      thumb:'<div class="wthumb"><span class="wtag"><i style="--c:#E8560E"></i>SBC · Product-Led Growth</span><img src="assets/ahamove-hero.jpg" alt="AhaMove delivery truck and driver" loading="lazy"></div>',
      base:{ desc:"A product-led growth diagnosis for AhaMove: friction mapping across the first booking, cohort drop-off prevention and hypothesis-driven UX fixes — activation to retention.",
        metrics:["Friction mapping","Activation → Retention"] },
      growth:{ ctx:"First bookings stall and the second booking isn't easier — a leaky activation funnel.",
        myrole:"Friction mapping, confidence-curve diagnosis, five hypothesis-driven UX bets, prioritized by impact × effort.",
        metrics:["Friction mapping","5 UX bets","Activation → Retention"] } },

    { id:'melius', href:'melius.html', badge:'SBC Montréal',
      title:"Melius: From nutrition anxiety to guided action",
      thumb:'<div class="wthumb"><span class="wtag"><i style="--c:#5E9B3E"></i>SBC · Product Innovation</span><img src="assets/melius-photos.png" alt="Melius healthy-lifestyle workshop" loading="lazy"></div>',
      base:{ desc:"An AI/AR product concept built on adoption research — one clear action at the food-decision moment, designed for activation and week-4 retention.",
        metrics:["Top 10 Global","3,000+ teams"] },
      growth:{ ctx:"An adoption problem: overwhelming nutrition info → one clear action, built for week-4 retention.",
        myrole:"Product Innovation Lead on the founding team — research → UX, the activation loop, paid-workshop validation.",
        metrics:["Top 10 Global","3,000+ teams","100% paid workshops"] } },

    { id:'base', href:'base.html', badge:'1st Prize · Tomorrow Marketers',
      title:"Base.vn: Scaling brand penetration with one hero product",
      thumb:'<div class="wthumb fit" style="background:#0A1228"><span class="wtag"><i style="--c:#3B82F6"></i>Brand Strategy · 1st Prize</span><img src="assets/base-thumb.jpg" alt="Base.vn Brand Penetration deck cover" loading="lazy"></div>',
      base:{ desc:"A go-to-market strategy for Base.vn: market sizing, BCG portfolio, competitive 4P and a three-pillar campaign framework.",
        metrics:["1st Prize · TM","1.2 → 2.5%","Strategy & GTM"] },
      brand:{ desc:"A 1st-prize GTM strategy: one hero product chosen by BCG portfolio logic, positioned against the price fight, executed as a three-pillar campaign system.",
        ctx:"Lift brand penetration 1.2% → 2.5% with one hero product — not a bigger budget.",
        myrole:"Market sizing, BCG portfolio, competitive 4P and the campaign framework — highest-scoring team of the course.",
        metrics:["1st Prize · TM","1.2 → 2.5% target","11-slide deck"] } },

    { id:'creatoros', href:'creatoros.html', badge:'AI project · Live demo',
      title:"CreatorOS: An AI sourcing & outreach engine",
      thumb:'<div class="wthumb tile-os"><span class="wtag"><i style="--c:#10B981"></i>AI Project · Live Demo</span><div class="ost"><span class="k">CreatorOS</span><span class="s">source → vet → outreach</span></div></div>',
      base:{ desc:"The operating layer behind a 5,000+ creator pipeline: LLM sourcing, niche-fit scoring and bulk outreach with caps and dry-runs. Live interactive demo.",
        metrics:["Live demo","LLM vetting","Outreach ops"] },
      partners:{ desc:"The tool that makes a 5,000+ partner pipeline manageable — AI-assisted sourcing, vetting and outreach, built to be run by a lean team.",
        ctx:"Partner pipelines break on manual sourcing and outreach — so I built the engine.",
        myrole:"Built with LLM workflows: creator sourcing, brand-fit scoring and bulk outreach with caps & dry-runs — the ops layer behind the CoBa pipeline.",
        metrics:["Live demo","LLM vetting","Scalable ops"] } },
  ],

  landings: {
    growth: {
      label:"Growth & Platform",
      featured:['momo','zalopay','halio','ahamove','coba','melius'],
      h2:"Selected work across funnels, retention and growth systems."
    },
    brand: {
      label:"Brand & Commerce",
      featured:['halio','coba','guardian','amamy','base'],
      h2:"Selected work across brand building, commerce and consumer growth."
    },
    partners: {
      label:"Partnerships & Client Solutions",
      featured:['halio','coba','amamy','guardian','creatoros'],
      h2:"Selected work across partner ecosystems, onboarding and activation."
    }
  },

  researchHTML: '<div class="wgroup reveal"><span class="wg-k">Research Roots</span><span class="rule"></span><span class="wg-note">Where the hypothesis habit started — UEH · Margroup R&amp;D</span></div>'+
  '<div class="research reveal"><div><div class="ra-head"><div><b>UEH Young Researcher — 2nd Prize, three years in a row</b><span>Project lead on all three studies · University of Economics Ho Chi Minh City</span></div></div>'+
  '<ul class="ra-list"><li><b>MoMo mobile payments</b> — UTAUT2 applied to purchase decisions on e-wallets.</li><li><b>Storytelling advertising</b> — narrative transportation → brand experience, love &amp; loyalty among Gen Z, HCMC.</li><li><b>AI-generated art</b> — how HCMC youth adopt AI artworks.</li></ul>'+
  '<p class="ra-note">Consumer adoption, brand love, new-tech behavior — the same questions growth and product teams ask. I learned to answer them with method first.</p></div>'+
  '<div><div class="rm-covers"><img src="assets/martrend-cover-1.jpg" alt="Martrend 05/2023 English edition cover" loading="lazy"><img src="assets/martrend-cover-2.jpg" alt="Martrend 06/2023 English edition cover" loading="lazy"></div>'+
  '<div class="rm-cap"><b>Martrend — 4 published issues</b><span>Marketing-trend reports researched, edited and shipped with Margroup’s R&amp;D team (UEH) — in Vietnamese and English.</span></div></div></div>'
};
