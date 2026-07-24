/* CreatorOS — portfolio demo.
   Profile lookup + keyword sourcing call the free tikwm API live from the
   browser (it sends CORS headers). Scoring runs client-side with the same
   heuristic as the full tool. Outreach is SIMULATED — nothing is sent.
   Full tool: https://github.com/arietao-stack/creator-outreach */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'creatoros_demo_v1';

  var DEFAULT_CFG = {
    brand: "CoBa's Daughter",
    keywords: ['clean beauty', 'body care', 'skincare', 'self care',
      'minimalist', 'wellness', 'ritual', 'slow living'],
    negative: ['coupon', 'promo code', 'discount code', 'flash deal', 'cashback'],
    fmin: 5000, fmax: 300000, er: 3.0, approve: 7.5, reject: 5.0
  };

  var state = { cfg: JSON.parse(JSON.stringify(DEFAULT_CFG)), creators: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && saved.creators) state = saved;
  } catch (e) {}

  var selected = new Set();
  var sort = { key: 'score', dir: -1 };
  var busy = false;
  var previews = [], pIdx = 0;

  function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }

  function toast(msg, err) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.toggle('err', !!err);
    t.hidden = false;
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.hidden = true; }, 4200);
  }

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K';
    return String(n);
  }

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ---------------------------------------------------------- tikwm (live)

  function tikwm(path, params) {
    var qs = Object.keys(params).map(function (k) {
      return k + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    return fetch('https://www.tikwm.com/api/' + path + '?' + qs, { signal: ctrl.signal })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.code !== 0) throw new Error(j.msg || 'tikwm error');
        return j.data || {};
      })
      .finally(function () { clearTimeout(timer); });
  }

  // ---------------------------------------------------------- scoring
  // Same rubric as the full tool: niche keywords + audience-size fit +
  // engagement + reachability, minus spam signals.

  function score(c) {
    var cfg = state.cfg;
    var text = ((c.bio || '') + ' ' + (c.captions || []).join(' ')).toLowerCase();
    c.matched = cfg.keywords.filter(function (k) { return text.indexOf(k.toLowerCase()) >= 0; });
    c.flags = cfg.negative.filter(function (k) { return text.indexOf(k.toLowerCase()) >= 0; });

    var s = Math.min(c.matched.length * 1.6, 4.8);
    var f = c.followers || 0;
    if (f >= cfg.fmin && f <= cfg.fmax) s += 2;
    else if (f >= cfg.fmin / 2 && f <= cfg.fmax * 2) s += 1;
    var er = c.er || 0;
    if (er >= cfg.er) s += 2; else if (er >= cfg.er / 2) s += 1;
    if (c.email) s += 1;
    s -= c.flags.length * 2;
    if ((text.match(/http/g) || []).length >= 3) s -= 1;
    c.score = Math.max(0, Math.min(10, Math.round(s * 10) / 10));
    c.verdict = (c.flags.length >= 2 || c.score < cfg.reject) ? 'Rejected'
      : (c.score >= cfg.approve ? 'Ready' : 'Review');
    return c;
  }

  function rescoreAll() {
    Object.keys(state.creators).forEach(function (h) { score(state.creators[h]); });
    persist();
  }

  // ---------------------------------------------------------- progress ui

  function prog(show, pct, note) {
    $('progress').hidden = !show;
    if (show) {
      $('pbar-fill').style.width = (pct || 0) + '%';
      $('pnote').textContent = note || '';
    }
  }

  function setBusy(b) {
    busy = b;
    ['btn-lookup', 'btn-source', 'btn-sample'].forEach(function (id) { $(id).disabled = b; });
  }

  // ---------------------------------------------------------- content themes

  var STOP_TAGS = { fyp: 1, fypage: 1, foryou: 1, foryoupage: 1, viral: 1, tiktok: 1, trending: 1, fy: 1, stitch: 1, duet: 1, capcut: 1, ad: 1, asmr: 1, xuhuong: 1, parati: 1, pourtoi: 1, video: 1, explore: 1 };
  var WORD_STOP = { the: 1, and: 1, for: 1, with: 1, you: 1, your: 1, this: 1, that: 1, have: 1, from: 1, when: 1, what: 1, our: 1, are: 1, was: 1, how: 1, not: 1, just: 1, its: 1, all: 1, out: 1, get: 1, can: 1, will: 1, one: 1, like: 1, love: 1, new: 1, who: 1, she: 1, him: 1, her: 1, his: 1, had: 1, has: 1, been: 1, were: 1, them: 1, they: 1, their: 1, about: 1, into: 1, more: 1, some: 1, than: 1, then: 1, there: 1 };

  function themesFrom(captions) {
    var text = (captions || []).join(' ').toLowerCase();
    var tags = {}, m;
    var tagRe = /#([a-z0-9]{3,30})/g;
    while ((m = tagRe.exec(text))) { if (!STOP_TAGS[m[1]]) tags[m[1]] = (tags[m[1]] || 0) + 1; }
    var themes = Object.keys(tags).filter(function (t) { return tags[t] >= 2; })
      .sort(function (a, b) { return tags[b] - tags[a]; }).slice(0, 4);
    if (themes.length < 3) {
      var words = {}, w;
      var wordRe = /[a-z]{4,15}/g;
      var plain = text.replace(/#\w+/g, ' ');
      while ((w = wordRe.exec(plain))) { if (!WORD_STOP[w[0]]) words[w[0]] = (words[w[0]] || 0) + 1; }
      Object.keys(words).filter(function (k) { return words[k] >= 2 && themes.indexOf(k) < 0; })
        .sort(function (a, b) { return words[b] - words[a]; })
        .slice(0, 5 - themes.length)
        .forEach(function (k) { themes.push(k); });
    }
    return themes.slice(0, 5);
  }

  // ---------------------------------------------------------- lookup (real)

  var EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  var HANDLE_RE = /@([A-Za-z0-9_.\-]{2,24})/;

  function parseHandles(raw) {
    var out = [], seen = {};
    raw.split('\n').forEach(function (line) {
      var s = line.trim();
      if (!s) return;
      var m = HANDLE_RE.exec(s);
      var h = m ? m[1].replace(/\.+$/, '') : (/^[A-Za-z0-9_.\-]{2,24}$/.test(s) ? s : '');
      if (h && !seen[h.toLowerCase()]) { seen[h.toLowerCase()] = 1; out.push(h); }
    });
    return out;
  }

  function upsertFromInfo(data, sourceTag) {
    var user = data.user || {}, stats = data.stats || {};
    if (!user.uniqueId) return null;
    var bio = user.signature || '';
    var bl = user.bioLink;
    var biolink = (bl && typeof bl === 'object') ? (bl.link || '') : (bl || '');
    var followers = stats.followerCount || 0;
    var hearts = stats.heartCount || 0, vids = stats.videoCount || 0;
    var er = (followers && vids) ? Math.round(hearts / vids / followers * 10000) / 100 : 0;
    var em = EMAIL_RE.exec(bio + ' ' + biolink);
    var old = state.creators[user.uniqueId] || {};
    var c = {
      handle: user.uniqueId,
      name: user.nickname || user.uniqueId,
      avatar: user.avatarThumb || '',
      url: 'https://www.tiktok.com/@' + user.uniqueId,
      followers: followers, er: er, bio: bio,
      captions: old.captions || [bio],
      email: (em ? em[0] : '') || old.email || '',
      instagram: user.ins_id || '',
      youtube: user.youtube_channel_title || '',
      biolink: biolink,
      source: old.source || sourceTag,
      status: old.status || 'New',
      added: Date.now()
    };
    score(c);
    state.creators[c.handle] = c;
    return c;
  }

  $('btn-lookup').onclick = async function () {
    if (busy) return;
    var handles = parseHandles($('lk-links').value).slice(0, 5);
    if (!handles.length) return toast('Paste at least one profile link or @handle', true);
    setBusy(true);
    var got = 0;
    for (var i = 0; i < handles.length; i++) {
      prog(true, i / handles.length * 100, 'Extracting @' + handles[i] + '…');
      try {
        var data = await tikwm('user/info', { unique_id: handles[i] });
        var c = upsertFromInfo(data, 'profile');
        if (c) {
          got++;
          // second pass: search their handle to find their own videos →
          // real avg views, real ER, and what they usually post about
          prog(true, (i + 0.5) / handles.length * 100, 'Reading @' + c.handle + '’s recent videos…');
          await sleep(1300);
          try {
            var sd = await tikwm('feed/search', { keywords: c.handle, count: 20, cursor: 0 });
            var mine = (sd.videos || []).filter(function (v) {
              return ((v.author || {}).unique_id || '').toLowerCase() === c.handle.toLowerCase();
            });
            if (mine.length) {
              var plays = 0, diggs = 0;
              c.captions = mine.map(function (v) { plays += v.play_count || 0; diggs += v.digg_count || 0; return v.title || ''; });
              c.avg_views = Math.round(plays / mine.length);
              if (plays) c.er = Math.round(diggs / plays * 10000) / 100;
              c.themes = themesFrom(c.captions);
              score(c);
            }
          } catch (e2) { /* profile info still stands without video data */ }
        }
      } catch (e) {
        toast('@' + handles[i] + ': ' + (e.name === 'AbortError' ? 'timed out' : e.message), true);
      }
      if (i < handles.length - 1) await sleep(1300);
    }
    prog(true, 100, 'Done — ' + got + '/' + handles.length + ' profiles extracted');
    persist();
    sort = { key: 'added', dir: -1 };
    render();
    setBusy(false);
    if (got) toast(got + ' profile' + (got > 1 ? 's' : '') + ' extracted — newest on top');
  };

  // ---------------------------------------------------------- sourcing (real)

  $('btn-source').onclick = async function () {
    if (busy) return;
    var kw = $('src-kw').value.trim();
    if (!kw) return toast('Type a search keyword first', true);
    setBusy(true);
    prog(true, 5, 'Searching “' + kw + '”…');
    try {
      var data = await tikwm('feed/search', { keywords: kw, count: 30, cursor: 0 });
      var pool = {};
      (data.videos || []).forEach(function (v) {
        var a = v.author || {};
        if (!a.unique_id) return;
        var r = pool[a.unique_id] = pool[a.unique_id] ||
          { plays: 0, diggs: 0, captions: [], name: a.nickname, avatar: a.avatar };
        r.plays += v.play_count || 0;
        r.diggs += v.digg_count || 0;
        r.captions.push(v.title || '');
      });
      var handles = Object.keys(pool)
        .filter(function (h) { return !state.creators[h]; })
        .sort(function (a, b) { return pool[b].plays - pool[a].plays; })
        .slice(0, 6); // demo cap — the full tool goes hundreds deep
      var got = 0;
      for (var i = 0; i < handles.length; i++) {
        var h = handles[i];
        prog(true, 10 + i / handles.length * 90, 'Profile ' + (i + 1) + '/' + handles.length + ' — @' + h);
        await sleep(1300);
        try {
          var info = await tikwm('user/info', { unique_id: h });
          var c = upsertFromInfo(info, kw);
          if (c) {
            c.captions = pool[h].captions;
            c.er = pool[h].plays ? Math.round(pool[h].diggs / pool[h].plays * 10000) / 100 : c.er;
            c.avg_views = Math.round(pool[h].plays / Math.max(pool[h].captions.length, 1));
            c.themes = themesFrom(c.captions);
            score(c);
            got++;
          }
        } catch (e) { /* skip creators that error */ }
      }
      prog(true, 100, 'Done — ' + got + ' creators added from “' + kw + '”');
      persist();
      sort = { key: 'added', dir: -1 };
      render();
      toast(got + ' creators sourced — the full tool fetches 100–300 per run');
    } catch (e) {
      prog(false);
      toast('tikwm not reachable right now — try “Load sample data”', true);
    }
    setBusy(false);
  };

  // ---------------------------------------------------------- sample data

  var SAMPLES = [
    ['glowwithmia', 'Mia Tran', 62000, 5.8, 'Clean beauty routines that actually work ✨ collabs: glowwithmia@example.com', 'glowwithmia@example.com'],
    ['theminimalhome', 'Kim & Tiff', 38000, 4.6, 'Slow living, minimalist rituals, honest reviews ☆ hello@theminimalhome.example.com', 'hello@theminimalhome.example.com'],
    ['dealz.link.daily', 'Daily Dealz', 210000, 0.4, '🔥 coupon + promo code drops every day!! link in bio 🔗🔗', ''],
    ['ritualofrae', 'Rae Nguyen', 24000, 6.2, 'body care rituals & self care sundays 🌿 reach me: rae.creates@example.com', 'rae.creates@example.com'],
    ['busymomskin', 'Hana P.', 8900, 3.1, 'skincare for moms with 5 minutes ⏱ no fluff', ''],
    ['wellnesswithlan', 'Lan Vo', 15600, 7.4, 'wellness, clean beauty & mindful living 🍃 lan.collab@example.com', 'lan.collab@example.com']
  ];

  $('btn-sample').onclick = function () {
    SAMPLES.forEach(function (s) {
      var c = {
        handle: s[0], name: s[1], avatar: '',
        url: 'https://www.tiktok.com/@' + s[0],
        followers: s[2], er: s[3], bio: s[4], captions: [s[4]],
        email: s[5], instagram: '', youtube: '', biolink: '',
        source: 'sample', status: 'New', added: Date.now(), demo: true
      };
      score(c);
      state.creators[c.handle] = c;
    });
    persist();
    render();
    toast('Sample creators loaded — try real extraction with any TikTok profile link');
  };

  $('btn-reset').onclick = function () {
    if (!confirm('Clear all creators and reset the demo?')) return;
    state = { cfg: JSON.parse(JSON.stringify(DEFAULT_CFG)), creators: {} };
    selected.clear();
    persist();
    fillCfg();
    render();
  };

  // ---------------------------------------------------------- brand config

  function fillCfg() {
    var c = state.cfg;
    $('cfg-brand').value = c.brand;
    $('cfg-keywords').value = c.keywords.join(', ');
    $('cfg-negative').value = c.negative.join(', ');
    $('cfg-fmin').value = c.fmin;
    $('cfg-fmax').value = c.fmax;
    $('cfg-er').value = c.er;
    $('cfg-approve').value = c.approve;
  }

  $('btn-rescore').onclick = function () {
    var split = function (v) {
      return v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    };
    state.cfg.brand = $('cfg-brand').value.trim() || 'Your brand';
    state.cfg.keywords = split($('cfg-keywords').value);
    state.cfg.negative = split($('cfg-negative').value);
    state.cfg.fmin = parseInt($('cfg-fmin').value, 10) || 0;
    state.cfg.fmax = parseInt($('cfg-fmax').value, 10) || 1e9;
    state.cfg.er = parseFloat($('cfg-er').value) || 3;
    state.cfg.approve = parseFloat($('cfg-approve').value) || 7.5;
    rescoreAll();
    render();
    toast('Profile saved — every creator re-scored live');
  };

  // ---------------------------------------------------------- table

  function visible() {
    var q = $('f-search').value.toLowerCase();
    var verdict = $('f-verdict').value;
    var needEmail = $('f-email').checked;
    var rows = Object.keys(state.creators).map(function (h) { return state.creators[h]; })
      .filter(function (c) {
        if (verdict && c.verdict !== verdict) return false;
        if (needEmail && !c.email) return false;
        if (q && (c.handle + ' ' + c.name + ' ' + c.bio).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    rows.sort(function (a, b) {
      var x = a[sort.key], y = b[sort.key];
      if (typeof x === 'string') return sort.dir * String(x).localeCompare(String(y));
      return sort.dir * ((x || 0) - (y || 0));
    });
    return rows;
  }

  function render() {
    var rows = visible();
    var all = Object.keys(state.creators).length;
    selected.forEach(function (h) { if (!state.creators[h]) selected.delete(h); });

    $('tbody').innerHTML = rows.map(function (c) {
      var init = (c.name || c.handle).slice(0, 2).toUpperCase();
      var av = c.avatar
        ? '<img src="' + c.avatar + '" alt="" loading="lazy" onerror="this.outerHTML=\'<span class=ph>' + init + '</span>\'">'
        : '<span class="ph">' + init + '</span>';
      var matchedSet = {};
      (c.matched || []).forEach(function (k) { matchedSet[k.toLowerCase()] = 1; });
      var chips = (c.matched || []).map(function (k) { return '<span>' + k + '</span>'; })
        .concat((c.flags || []).map(function (k) { return '<span class="flag">⚠ ' + k + '</span>'; }))
        .concat((c.themes || []).filter(function (t) { return !matchedSet[t.toLowerCase()]; })
          .map(function (t) { return '<span class="theme">#' + t + '</span>'; }))
        .join('') || '<span style="background:none;color:var(--grey)">—</span>';
      var contact = [];
      if (c.email) contact.push('<span class="email">' + c.email + '</span>');
      if (c.instagram) contact.push('<span class="soc">IG @' + c.instagram + '</span>');
      if (c.youtube) contact.push('<span class="soc">YT ' + c.youtube + '</span>');
      if (c.biolink) contact.push('<a class="soc" href="' + c.biolink + '" target="_blank" rel="noopener">bio link ↗</a>');
      return '<tr data-h="' + c.handle + '" class="' + (selected.has(c.handle) ? 'sel' : '') + '">' +
        '<td><input type="checkbox" class="rowchk"' + (selected.has(c.handle) ? ' checked' : '') + '></td>' +
        '<td><div class="who">' + av + '<div><a href="' + c.url + '" target="_blank" rel="noopener">@' + c.handle + '</a>' +
        '<small>' + (c.demo ? 'sample · ' : '') + (c.name || '') + '</small></div></div></td>' +
        '<td class="num">' + fmt(c.followers || 0) + '</td>' +
        '<td class="num">' + (c.avg_views ? fmt(c.avg_views) : '—') + '</td>' +
        '<td class="num">' + (c.er || 0).toFixed(1) + '</td>' +
        '<td class="num scorecell"><b>' + c.score.toFixed(1) + '</b>' +
        '<div class="sbar"><i class="' + (c.score < 5 ? 'low' : '') + '" style="width:' + (c.score * 10) + '%"></i></div></td>' +
        '<td><div class="kwchips">' + chips + '</div></td>' +
        '<td>' + (contact.join('<br>') || '<span class="email none">—</span>') + '</td>' +
        '<td>' + (c.status === 'Contacted'
          ? '<span class="pill Contacted">Contacted ✓</span>'
          : '<span class="pill ' + c.verdict + '">' + (c.verdict === 'Ready' ? 'Ready for outreach' : c.verdict) + '</span>') + '</td>' +
        '</tr>';
    }).join('');

    $('empty').style.display = all ? 'none' : 'block';
    var ready = 0, emails = 0, contacted = 0;
    Object.keys(state.creators).forEach(function (h) {
      var c = state.creators[h];
      if (c.verdict === 'Ready') ready++;
      if (c.email) emails++;
      if (c.status === 'Contacted') contacted++;
    });
    $('stats').innerHTML =
      '<span><b>' + all + '</b> creators</span>' +
      '<span><b>' + ready + '</b> ready</span>' +
      '<span><b>' + emails + '</b> emails found</span>' +
      '<span><b>' + contacted + '</b> contacted</span>';

    $('btn-compose').textContent = '✉ Compose (' + selected.size + ')';
    $('btn-compose').disabled = !selected.size;
  }

  $('tbody').addEventListener('change', function (e) {
    var tr = e.target.closest('tr');
    if (!tr || !e.target.classList.contains('rowchk')) return;
    e.target.checked ? selected.add(tr.dataset.h) : selected.delete(tr.dataset.h);
    render();
  });
  $('chk-all').onchange = function () {
    var rows = visible(), on = this.checked;
    rows.forEach(function (c) { on ? selected.add(c.handle) : selected.delete(c.handle); });
    render();
  };
  ['f-search', 'f-verdict', 'f-email'].forEach(function (id) {
    $(id).addEventListener('input', render);
  });
  document.querySelectorAll('th[data-sort]').forEach(function (th) {
    th.style.cursor = 'pointer';
    th.onclick = function () {
      var k = th.dataset.sort;
      if (sort.key === k) sort.dir *= -1; else { sort.key = k; sort.dir = -1; }
      render();
    };
  });

  // ---------------------------------------------------------- export csv

  $('btn-export').onclick = function () {
    var rows = ['handle,name,url,followers,avg_views,er,score,verdict,email,instagram,youtube,biolink,content_themes,status'];
    Object.keys(state.creators).forEach(function (h) {
      var c = state.creators[h];
      rows.push([c.handle, '"' + (c.name || '').replace(/"/g, "'") + '"', c.url,
        c.followers, c.avg_views || 0, c.er, c.score, c.verdict, c.email || '', c.instagram || '',
        '"' + (c.youtube || '').replace(/"/g, "'") + '"', c.biolink || '',
        '"' + (c.themes || []).join(' | ') + '"', c.status].join(','));
    });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
    a.download = 'creators.csv';
    a.click();
  };

  // ---------------------------------------------------------- outreach (simulated)

  var DEF_SUBJECT = 'Collab with {{brand}} — loved your {{niche}} content';
  var DEF_TEMPLATE = 'Hi {{name}},\n\nI run creator partnerships at {{brand}}. Your {{niche}} content stood out — the way you talk to your audience fits how we think about ours.\n\nWe\'d love to send you our bestseller to try, plus a paid affiliate setup if it feels right.\n\nOpen to a quick look? I can share details in one short email.\n\nBest,';

  function renderMail(c) {
    var tags = {
      name: c.name || c.handle, handle: '@' + c.handle,
      niche: (c.matched && c.matched[0]) || 'your niche',
      followers: fmt(c.followers || 0), brand: state.cfg.brand
    };
    var sub = $('o-subject').value, body = $('o-template').value;
    Object.keys(tags).forEach(function (k) {
      sub = sub.split('{{' + k + '}}').join(tags[k]);
      body = body.split('{{' + k + '}}').join(tags[k]);
    });
    return { to: c.email, subject: sub, body: body };
  }

  function updatePreview() {
    var p = previews[pIdx];
    if (!p) {
      $('o-who').textContent = 'no selected creators have an email';
      $('o-to').textContent = 'To: —';
      $('o-sub').textContent = 'Subject: —';
      $('o-body').textContent = '';
      $('o-send').disabled = true;
      return;
    }
    $('o-who').textContent = '@' + p.c.handle + ' (' + (pIdx + 1) + '/' + previews.length + ')';
    $('o-to').textContent = 'To: ' + p.m.to;
    $('o-sub').textContent = 'Subject: ' + p.m.subject;
    $('o-body').textContent = p.m.body;
    $('o-send').disabled = false;
    $('o-send').textContent = 'Simulate send — ' + previews.length + ' emails';
  }

  function loadPreviews() {
    previews = Array.from(selected)
      .map(function (h) { return state.creators[h]; })
      .filter(function (c) { return c && c.email; })
      .map(function (c) { return { c: c, m: renderMail(c) }; });
    pIdx = 0;
    updatePreview();
  }

  $('btn-compose').onclick = function () {
    if (!$('o-subject').value) $('o-subject').value = DEF_SUBJECT;
    if (!$('o-template').value) $('o-template').value = DEF_TEMPLATE;
    $('m-outreach').hidden = false;
    loadPreviews();
  };
  $('o-prev').onclick = function () { if (pIdx > 0) { pIdx--; updatePreview(); } };
  $('o-next').onclick = function () { if (pIdx < previews.length - 1) { pIdx++; updatePreview(); } };
  $('o-subject').addEventListener('change', loadPreviews);
  $('o-template').addEventListener('change', loadPreviews);

  $('o-send').onclick = async function () {
    $('o-send').disabled = true;
    $('o-progress').hidden = false;
    for (var i = 0; i < previews.length; i++) {
      $('o-pbar').style.width = ((i + 1) / previews.length * 100) + '%';
      $('o-pnote').textContent = 'Simulating ' + (i + 1) + '/' + previews.length + ' — ' + previews[i].m.to;
      await sleep(420);
      state.creators[previews[i].c.handle].status = 'Contacted';
    }
    persist();
    $('o-pnote').textContent = 'Demo done — ' + previews.length + ' emails rendered, nothing was sent.';
    $('o-send').disabled = false;
    render();
  };

  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.onclick = function () { b.closest('.cos-overlay').hidden = true; };
  });
  document.querySelectorAll('.cos-overlay').forEach(function (o) {
    o.addEventListener('click', function (e) { if (e.target === o) o.hidden = true; });
  });

  fillCfg();
  render();
})();
