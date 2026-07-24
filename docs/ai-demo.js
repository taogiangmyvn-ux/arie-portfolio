/* AI Vetting Demo — frontend simulation.
   Static site: the pipeline runs on a timer with mock data.
   The real backend lives in source-code/llm_vetting_agent.py */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var urlsEl = document.getElementById('urls');
  var runBtn = document.getElementById('run');
  var runLbl = document.getElementById('run-label');
  var sampleBtn = document.getElementById('sample');
  var hint = document.getElementById('hint');
  var termBody = document.getElementById('term-body');
  var results = document.getElementById('results');
  var steps = [].slice.call(document.querySelectorAll('.step'));

  var SAMPLE_URLS = [
    'https://www.tiktok.com/@glowwithmia/video/7301122334455667788',
    'https://www.tiktok.com/@dealz.link.daily/video/7299887766554433221',
    'https://shopee.vn/@theminimalhome/video/7302233445566778899'
  ];

  // Hardcoded mock verdicts — in production these come back as
  // schema-validated JSON from the Claude API (see the Python source).
  var MOCK = [
    {
      handle: '@glowwithmia',
      platform: 'TikTok · US',
      initials: 'GM',
      score: 9.2,
      niche: 'Clean Beauty',
      spam: 'LOW',
      engagement: '5.8% ER · 62K followers',
      audience: 'F 22–34 · skincare-first',
      quote: 'Consistent clean-beauty routines with an engaged comment section. Voice and audience map directly onto the brand positioning.',
      verdict: 'approved'
    },
    {
      handle: '@dealz.link.daily',
      platform: 'TikTok · US',
      initials: 'DD',
      score: 3.1,
      niche: 'Link Spammer',
      spam: 'HIGH',
      engagement: '0.4% ER · 210K followers',
      audience: 'Unclear · deal hunters',
      quote: 'Same affiliate link pasted across 40+ captions, near-zero organic engagement. Classic coupon-farm pattern — rejected on spam signals.',
      verdict: 'rejected'
    },
    {
      handle: '@theminimalhome',
      platform: 'Shopee · SEA',
      initials: 'TM',
      score: 8.5,
      niche: 'Minimalist Lifestyle',
      spam: 'LOW',
      engagement: '4.6% ER · 38K followers',
      audience: 'F 25–40 · slow living',
      quote: 'Adjacent niche with strong save-rates and authentic product storytelling. Good engagement quality for the follower size.',
      verdict: 'approved'
    }
  ];

  // Log script: [delay ms, css class, text]. Timing per production spec.
  var SCRIPT = [
    [500,  'info', 'Initializing Apify scraper...'],
    [900,  'dim',  '  actor: clockworks/tiktok-scraper · 3 URLs queued'],
    [1500, 'info', 'Extracting bio, captions, and metrics...'],
    [2100, 'dim',  '  3/3 profiles resolved · 118 captions · 21 data points each'],
    [3000, 'info', 'Running Claude Sonnet context analysis...'],
    [3600, 'dim',  '  scoring niche fit vs. brand positioning · strict JSON schema'],
    [4500, 'info', 'Generating Niche Scores...'],
    [5100, 'ok',   'Done. 2 approved · 1 rejected · avg score 6.9/10']
  ];

  var STEP_AT = [500, 1500, 3000, 4500]; // when each pipeline step lights up

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(ms) {
    var s = ms / 1000;
    return '[' + pad(Math.floor(s / 60)) + ':' + pad(Math.floor(s % 60)) + '.' + Math.floor((s % 1) * 10) + ']';
  }

  function logLine(cls, text, ms) {
    var caret = termBody.querySelector('.caret');
    if (caret) caret.remove();
    var ln = document.createElement('span');
    ln.className = 'ln';
    ln.innerHTML = '<span class="ts">' + stamp(ms) + '</span> <span class="' + cls + '">' + text + '</span>';
    termBody.appendChild(ln);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function addCaret() {
    var ln = document.createElement('span');
    ln.className = 'ln';
    ln.innerHTML = '<span class="caret"></span>';
    termBody.appendChild(ln);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function resetTerm() {
    termBody.innerHTML = '';
    logLine('dim', '$ python llm_vetting_agent.py urls.txt', 0);
    addCaret();
  }

  function setStep(i, state) {
    if (steps[i]) { steps[i].classList.remove('on', 'done'); if (state) steps[i].classList.add(state); }
  }

  function renderResults() {
    var grid = document.getElementById('rgrid');
    grid.innerHTML = MOCK.map(function (c) {
      var ok = c.verdict === 'approved';
      return (
        '<article class="rcard ' + c.verdict + '">' +
          '<div class="rc-top">' +
            '<div class="rc-av">' + c.initials + '</div>' +
            '<div class="rc-who"><div class="h">' + c.handle + '</div><div class="p">' + c.platform + '</div></div>' +
          '</div>' +
          '<div><div class="rc-score"><span class="num">' + c.score.toFixed(1) + '</span><span class="of">/ 10</span><span class="lbl">Niche score</span></div>' +
          '<div class="rc-bar"><i data-w="' + (c.score * 10) + '"></i></div></div>' +
          '<div class="rc-rows">' +
            '<div class="r"><span class="k">Niche</span><span class="v">' + c.niche + '</span></div>' +
            '<div class="r"><span class="k">Spam risk</span><span class="v"><span class="badge ' + (c.spam === 'LOW' ? 'ok' : c.spam === 'HIGH' ? 'bad' : 'warn') + '">' + c.spam + '</span></span></div>' +
            '<div class="r"><span class="k">Engagement</span><span class="v">' + c.engagement + '</span></div>' +
            '<div class="r"><span class="k">Audience</span><span class="v">' + c.audience + '</span></div>' +
          '</div>' +
          '<p class="rc-quote"><b>Model rationale:</b> ' + c.quote + '</p>' +
          '<div class="rc-tag ' + (ok ? 'go' : 'no') + '">' + (ok ? 'Ready for Outreach' : 'Rejected') + '</div>' +
        '</article>'
      );
    }).join('');

    results.classList.add('show');

    var cards = [].slice.call(grid.querySelectorAll('.rcard'));
    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add('in');
        var bar = card.querySelector('.rc-bar i');
        if (bar) bar.style.width = bar.getAttribute('data-w') + '%';
      }, reduce ? 0 : 120 + i * 160);
    });

    results.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  function run() {
    var value = urlsEl.value.trim();
    if (!value) {
      hint.classList.add('show');
      urlsEl.focus();
      return;
    }
    hint.classList.remove('show');

    runBtn.disabled = true;
    runBtn.classList.add('busy');
    runLbl.textContent = 'Vetting creators…';
    results.classList.remove('show');
    steps.forEach(function (s, i) { setStep(i, null); });
    resetTerm();

    var speed = reduce ? 0.4 : 1; // shorten the wait if motion is reduced

    SCRIPT.forEach(function (entry) {
      setTimeout(function () {
        logLine(entry[1], entry[2], entry[0]);
        if (entry !== SCRIPT[SCRIPT.length - 1]) addCaret();
      }, entry[0] * speed);
    });

    STEP_AT.forEach(function (t, i) {
      setTimeout(function () {
        if (i > 0) setStep(i - 1, 'done');
        setStep(i, 'on');
      }, t * speed);
    });

    setTimeout(function () {
      setStep(STEP_AT.length - 1, 'done');
      renderResults();
      runBtn.disabled = false;
      runBtn.classList.remove('busy');
      runLbl.textContent = 'Run again';
    }, 5300 * speed);
  }

  sampleBtn.addEventListener('click', function () {
    urlsEl.value = SAMPLE_URLS.join('\n');
    hint.classList.remove('show');
  });
  runBtn.addEventListener('click', run);

  resetTerm();
})();
