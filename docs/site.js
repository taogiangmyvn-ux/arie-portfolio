/* Arie portfolio · shared behaviour: reveal on scroll, lazy videos (autoplay when visible), click-to-play videos. */
(function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  var vio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        if (v.classList.contains("auto")) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (v.classList.contains("auto")) v.pause();
    });
  }, { rootMargin: "200px 0px" });
  document.querySelectorAll("video[data-src]").forEach(function (v) { vio.observe(v); });
  document.querySelectorAll("video.click").forEach(function (v) {
    v.addEventListener("click", function () { if (!v.src) v.src = v.dataset.src; v.controls = true; v.play(); });
  });
})();
