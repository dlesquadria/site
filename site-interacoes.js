const menuToggle = document.querySelector(".mobile-menu-toggle");
const navigation = document.getElementById("menu-principal");

function setNavigation(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
  if (!open) navigation.querySelector(".service-menu").open = false;
}

menuToggle.hidden = false;
menuToggle.addEventListener("click", () => {
  setNavigation(menuToggle.getAttribute("aria-expanded") !== "true");
});
navigation.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || event.defaultPrevented || !navigation.classList.contains("is-open") || !menuToggle.getClientRects().length) return;
  setNavigation(false);
  menuToggle.focus();
});
window.matchMedia("(max-width: 760px)").addEventListener("change", () => setNavigation(false));

const serviceMenu = document.querySelector(".service-menu");

document.addEventListener("click", (event) => {
  if (serviceMenu.open && !serviceMenu.contains(event.target)) serviceMenu.open = false;
});

serviceMenu.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !serviceMenu.open) return;
  event.preventDefault();
  serviceMenu.open = false;
  serviceMenu.querySelector("summary").focus();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
for (const carousel of document.querySelectorAll(".service-carousel")) {
  const track = carousel.querySelector(".carousel-track");
  const previous = carousel.querySelector('[data-scroll="-1"]');
  const next = carousel.querySelector('[data-scroll="1"]');
  if (!previous || !next) continue;

  const slides = track.querySelectorAll("figure");
  const activeSlide = () => Math.round(track.scrollLeft / track.clientWidth);
  function updateArrows() {
    previous.disabled = activeSlide() <= 0;
    next.disabled = activeSlide() >= slides.length - 1;
  }

  function goToSlide(step) {
    const target = Math.max(0, Math.min(activeSlide() + step, slides.length - 1));
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: reduceMotion.matches ? "instant" : "smooth",
    });
  }

  previous.addEventListener("click", () => goToSlide(-1));
  next.addEventListener("click", () => goToSlide(1));
  track.addEventListener("scroll", updateArrows, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goToSlide(event.key === "ArrowLeft" ? -1 : 1);
  });
  updateArrows();
}

const years = document.querySelector("[data-years]");
if (years && !reduceMotion.matches && "IntersectionObserver" in window) {
  years.textContent = "0";
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    let start;
    function count(now) {
      start ??= now;
      const progress = Math.min((now - start) / 950, 1);
      years.textContent = String(Math.floor(25 * (1 - (1 - progress) ** 3)));
      if (progress < 1) requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
  }, { threshold: 0.25 });
  observer.observe(years.closest(".experience"));
}
