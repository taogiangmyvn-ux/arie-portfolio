(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // scroll progress
  var bar = document.getElementById('progress');
  if(bar) addEventListener('scroll', function(){
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h>0 ? scrollY/h*100 : 0) + '%';
  }, {passive:true});

  // active nav
  var links = [].slice.call(document.querySelectorAll('.nav-right a[href^="#"]'));
  var map = links.map(function(a){ return {a:a, el:document.querySelector(a.getAttribute('href'))}; }).filter(function(m){ return m.el; });
  if(map.length){
    var nio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ map.forEach(function(m){ m.a.classList.toggle('active', m.el===e.target); }); } });
    },{rootMargin:'-45% 0px -50% 0px'});
    map.forEach(function(m){ nio.observe(m.el); });
  }

  // lazy video autoplay
  var vio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){ if(!v.src && v.dataset.src) v.src = v.dataset.src; v.play && v.play().catch(function(){}); }
      else if(v.src){ v.pause && v.pause(); }
    });
  },{rootMargin:'300px 0px'});
  document.querySelectorAll('video[data-src]').forEach(function(v){ vio.observe(v); });

  // metric count-up
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix')||'', suf = el.getAttribute('data-suffix')||'';
    if(reduce || isNaN(target)){ return; }
    var start=null;
    function tick(t){
      if(!start) start=t;
      var p = Math.min((t-start)/800,1);
      var shown = (p<1) ? Math.round(target*p*10)/10 : target;
      el.textContent = pre + (Number.isInteger(target)?Math.round(shown):shown) + suf;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var mio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); mio.unobserve(e.target); } });
  },{threshold:.6});
  document.querySelectorAll('.num[data-count]').forEach(function(el){ mio.observe(el); });

  // journey stage toggle (accessible)
  document.querySelectorAll('.jstage').forEach(function(st,i){
    var body = st.querySelector('.jbody'), btn = st.querySelector('.toggle');
    if(!body) return;
    var open = (i===0);
    function render(){ body.style.display = open?'block':'none'; if(btn) btn.textContent = open?'–':'+'; st.setAttribute('aria-expanded', open); }
    render();
    st.setAttribute('role','button'); st.setAttribute('tabindex','0');
    st.addEventListener('click', function(){ open=!open; render(); });
    st.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); open=!open; render(); } });
  });
})();
