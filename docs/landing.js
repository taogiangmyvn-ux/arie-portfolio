/* Renders role-specific landing sections from window.PORTFOLIO.
   Requires: body[data-role], containers #featured, #explore, #research-roots.
   Load order: cases.js → landing.js → case.js (case.js picks up injected .reveal). */
(function(){
  var P = window.PORTFOLIO; if(!P) return;
  var role = document.body.dataset.role || 'growth';
  var L = P.landings[role]; if(!L) return;

  function v(c){ return Object.assign({}, c.base, c[role]||{}); }
  function chips(list){ return (list||[]).map(function(m){ return '<span>'+m+'</span>'; }).join(''); }

  function bigCard(c){
    var d = v(c);
    var badge = c.badge ? '<span class="fbadge">'+c.badge+'</span>' : '';
    return '<a class="fcard reveal" href="'+c.href+'">'+
      '<div class="fthumb">'+c.thumb+badge+'</div>'+
      '<div class="fbody">'+
        '<h3>'+c.title+'</h3>'+
        (d.ctx ? '<p class="fctx">'+d.ctx+'</p>' : '')+
        (d.myrole ? '<p class="frole"><b>My part</b>'+d.myrole+'</p>' : '<p class="fctx">'+ (d.desc||'') +'</p>')+
        '<div class="wmetrics">'+chips(d.metrics)+'</div>'+
        '<span class="wgo">Read the full case →</span>'+
      '</div></a>';
  }

  function smallCard(c){
    var d = v(c);
    var badge = c.badge ? '<span class="fbadge sm">'+c.badge+'</span>' : '';
    return '<a class="wcard reveal" href="'+c.href+'">'+
      '<div class="sthumb">'+c.thumb+badge+'</div>'+
      '<div class="wbody"><h3>'+c.title+'</h3><p>'+(d.desc||d.ctx||'')+'</p>'+
      '<span class="wgo">Read →</span></div></a>';
  }

  var featEl = document.getElementById('featured');
  var moreEl = document.getElementById('explore');
  var resEl  = document.getElementById('research-roots');

  var featured = L.featured.map(function(id){
    return P.cases.find(function(c){ return c.id===id; });
  }).filter(Boolean);

  if(featEl) featEl.innerHTML = featured.map(bigCard).join('');
  if(moreEl){
    var rest = P.cases.filter(function(c){ return L.featured.indexOf(c.id)===-1; });
    moreEl.innerHTML = rest.map(smallCard).join('');
  }
  if(resEl) resEl.innerHTML = P.researchHTML;


  /* Role switcher: close on outside click */
  document.addEventListener('click', function(e){
    document.querySelectorAll('details.roleswitch[open]').forEach(function(d){
      if(!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();
