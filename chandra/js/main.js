(() => {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Hero banner slider
  const heroSlides = [...document.querySelectorAll("[data-hero-slide]")];
  const heroDots = [...document.querySelectorAll("[data-hero-dot]")];
  let heroIndex = 0;

  const showHero = (index) => {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === heroIndex));
    heroDots.forEach((dot, i) => dot.classList.toggle("is-active", i === heroIndex));
  };

  heroDots.forEach((dot, i) => {
    dot.addEventListener("click", () => showHero(i));
  });

  if (heroSlides.length > 1) {
    setInterval(() => showHero(heroIndex + 1), 5000);
  }

  // Collection sliders (mobile landing page)
  document.querySelectorAll("[data-slider-wrap]").forEach((wrap) => {
    const slider = wrap.querySelector("[data-collection-slider]");
    const sliderDots = [...wrap.querySelectorAll("[data-collection-dot]")];
    const label = wrap.querySelector("[data-m-label]");
    if (!slider || !sliderDots.length) return;
    const slides = [...slider.querySelectorAll(".m-slide, .collection-slide")];
    const syncDots = () => {
      const width = slides[0]?.offsetWidth || 1;
      if (!width) return;
      const styles = window.getComputedStyle(slider);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const index = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(slider.scrollLeft / (width + gap)))
      );
      sliderDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      if (label && slides[index]) label.textContent = slides[index].dataset.label || label.textContent;
    };
    syncDots();
    slider.addEventListener("scroll", () => window.requestAnimationFrame(syncDots), { passive: true });
    sliderDots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        slides[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });
  });

  const scrollTopButtons = [...document.querySelectorAll("[data-scroll-top]")];
  const header = document.querySelector(".site-header");
  const syncScrollTop = () => {
    const headerBottom = header ? header.getBoundingClientRect().bottom : 96;
    const show = window.scrollY > Math.max(80, headerBottom);
    scrollTopButtons.forEach((button) => button.classList.toggle("is-visible", show));
  };
  scrollTopButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  if (scrollTopButtons.length) {
    syncScrollTop();
    window.addEventListener("scroll", syncScrollTop, { passive: true });
  }

  // PLP filter drawer (mobile)
  const filterToggle = document.querySelector("[data-filter-toggle]");
  const filters = document.querySelector("[data-filters]");
  if (filterToggle && filters) {
    const setFiltersOpen = (open) => {
      filters.classList.toggle("is-open", open);
      document.body.classList.toggle("plp-filters-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        filters.scrollTop = 0;
        filters.scrollIntoView({ block: "start" });
      }
    };
    filterToggle.addEventListener("click", () => {
      setFiltersOpen(!filters.classList.contains("is-open"));
    });
    document.querySelectorAll("[data-filter-close]").forEach((button) => {
      button.addEventListener("click", () => setFiltersOpen(false));
    });
  }

  // PDP gallery thumbs
  const mainImg = document.querySelector("[data-gallery-main]");
  const thumbs = [...document.querySelectorAll("[data-gallery-thumb]")];
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const src = thumb.getAttribute("data-src");
      if (mainImg && src) mainImg.src = src;
      thumbs.forEach((t) => t.classList.toggle("is-active", t === thumb));
    });
  });

  document.querySelectorAll(".details-card").forEach((card) => {
    const items = [...card.querySelectorAll(".detail-acc")];
    items.forEach((item) => {
      const btn = item.querySelector(".detail-acc-btn");
      const panel = item.querySelector(".detail-acc-panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", () => {
        if (item.classList.contains("is-open")) return;
        items.forEach((other) => {
          other.classList.remove("is-open");
          const otherBtn = other.querySelector(".detail-acc-btn");
          const otherPanel = other.querySelector(".detail-acc-panel");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      });
    });
  });

  const relatedTrack = document.querySelector("[data-related-track]");
  const relatedDots = [...document.querySelectorAll("[data-related-dots] button")];
  if (relatedTrack && relatedDots.length) {
    const relatedCards = [...relatedTrack.querySelectorAll(".product-card")];
    const syncRelated = () => {
      const card = relatedCards[0];
      if (!card) return;
      const gap = parseFloat(getComputedStyle(relatedTrack).columnGap) || 0;
      const step = card.offsetWidth + gap;
      if (!step) return;
      const index = Math.min(relatedCards.length - 1, Math.max(0, Math.round(relatedTrack.scrollLeft / step)));
      relatedDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    relatedTrack.addEventListener("scroll", () => window.requestAnimationFrame(syncRelated), { passive: true });
    relatedDots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        const card = relatedCards[0];
        if (!card) return;
        const gap = parseFloat(getComputedStyle(relatedTrack).columnGap) || 0;
        relatedTrack.scrollTo({ left: i * (card.offsetWidth + gap), behavior: "smooth" });
      });
    });
  }

  // Callback form (demo)
  const form = document.querySelector("[data-callback-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you. Your callback request has been recorded (demo).");
      form.reset();
    });
  }
})();
