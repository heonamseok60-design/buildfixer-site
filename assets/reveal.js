document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(
    ".section-head, .service-card, .pain-item, .contact-card, .process-step"
  );
  if (targets.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const cls = el.classList[0];
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children).filter((c) => c.classList.contains(cls))
          : [el];
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
        el.classList.add("in-view");
        io.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
});
