(function () {
  var doc = document, body = doc.body;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Formato español: punto de millar y coma decimal (también con 4 cifras) */
  function fmt(n, int) {
    var parts = (int ? String(Math.round(n)) : n.toFixed(2)).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  }

  /* Hora y fecha actuales */
  var now = new Date(), hh = ("0" + now.getHours()).slice(-2), mm = ("0" + now.getMinutes()).slice(-2);
  doc.querySelectorAll("[data-time]").forEach(function (el) { el.textContent = "Hoy, " + hh + ":" + mm + "h"; });
  var hoy = doc.getElementById("hoy");
  if (hoy) hoy.textContent = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  /* Las cifras suben desde cero al aparecer la tarjeta */
  function countUp(el) {
    var end = parseFloat(el.dataset.count), int = el.hasAttribute("data-int"), suffix = int ? "" : " $";
    if (reduce) return;
    var t0 = null, dur = 1300;
    (function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * e, int) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  doc.querySelectorAll(".card").forEach(function (c) { io.observe(c); });

  /* Menú: resalta la sección visible */
  var links = Array.prototype.slice.call(doc.querySelectorAll(".menu a"));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("is-active"); });
      if (map[e.target.id]) map[e.target.id].classList.add("is-active");
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  ["resumen", "movimientos", "analisis"].forEach(function (id) { var s = doc.getElementById(id); if (s) spy.observe(s); });

  /* Ocultar saldos (privacidad); se recuerda en este navegador */
  var eye = doc.getElementById("eye"), icon = eye.querySelector("i");
  function setMask(on) {
    body.classList.toggle("is-masked", on);
    eye.setAttribute("aria-pressed", on);
    eye.setAttribute("aria-label", on ? "Mostrar saldos" : "Ocultar saldos");
    eye.title = on ? "Mostrar saldos" : "Ocultar saldos";
    icon.className = "ph-bold " + (on ? "ph-eye-slash" : "ph-eye");
    try { localStorage.setItem("cth-mask", on ? "1" : "0"); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("cth-mask"); } catch (e) {}
  if (saved === "1") setMask(true);
  eye.addEventListener("click", function () { setMask(!body.classList.contains("is-masked")); });
})();
