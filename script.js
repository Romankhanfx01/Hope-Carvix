/* ===================================================================
   HOPE CARVIX — Main Script
   Rebuilt production build: nav, reveal, videos, before/after,
   estimator, service & brochure modals, forms, print.
   =================================================================== */

(function () {
  "use strict";

  /* ---------------- Utilities ---------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileNav = () => window.matchMedia("(max-width: 1024px)").matches;

  const WHATSAPP_NUMBER = "971501234567";
  const WA_BASE = "https://wa.me/" + WHATSAPP_NUMBER;

  let scrollLocked = 0;
  function lockScroll() {
    scrollLocked++;
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    scrollLocked = Math.max(0, scrollLocked - 1);
    if (scrollLocked === 0) document.body.style.overflow = "";
  }

  /* ---------------- Smooth Scroll + Hash Navigation ---------------- */
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const header = $("#navbar");
    const offset = (header ? header.offsetHeight : 80) + 18;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }
  window.scrollToSection = scrollToSection;

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    // Anchors with inline handlers (e.g. openServiceModal) only manage the
    // modal — they should not scroll the page behind it.
    if (!a.hasAttribute("onclick")) scrollToSection(href.slice(1));
  });

  /* ---------------- Navbar: scrolled state, progress, scroll-spy ---------------- */
  const navbar = $("#navbar");
  const navProgress = $("#navScrollProgress");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.pageYOffset;
      if (navbar) navbar.classList.toggle("scrolled", y > 40);

      if (navProgress) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (y / max) * 100 : 0;
        navProgress.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + "%";
      }

      updateScrollSpy();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Includes the Services dropdown trigger so the highlighted item tracks
  // the #services section instead of leaving the previous link active.
  const spyLinks = $$('#navMenu a.nav-item[href^="#"]');
  const spySections = spyLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);

  function updateScrollSpy() {
    const probe = window.pageYOffset + (navbar ? navbar.offsetHeight : 90) + 40;
    // Nav order ≠ page order (Services link precedes Workshop Tour in the
    // nav but comes after it in the page) — pick the furthest section passed.
    let currentId = null;
    let bestTop = -1;
    for (const sec of spySections) {
      if (sec.offsetTop <= probe && sec.offsetTop > bestTop) {
        bestTop = sec.offsetTop;
        currentId = sec.id;
      }
    }
    spyLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------------- Mobile Drawer ---------------- */
  const mobileMenuBtn = $("#mobileMenuBtn");
  const navMenu = $("#navMenu");

  function closeMobileDrawer() {
    if (!navMenu || !mobileMenuBtn) return;
    navMenu.classList.remove("active");
    mobileMenuBtn.classList.remove("active");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    const dd = $("#servicesDropdown");
    if (dd) dd.classList.remove("mobile-open");
  }

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenuBtn.addEventListener("click", () => {
      const open = navMenu.classList.toggle("active");
      mobileMenuBtn.classList.toggle("active", open);
      mobileMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        const dd = $("#servicesDropdown");
        if (dd) dd.classList.remove("mobile-open");
      }
    });
  }

  // Close drawer when tapping a plain nav link (mobile)
  if (navMenu) {
    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest("a.nav-item");
      if (!link) return;
      if (link.classList.contains("has-dropdown")) return;
      closeMobileDrawer();
    });
  }

  // Close drawer when tapping outside the header
  document.addEventListener("click", (e) => {
    if (!navMenu || !navMenu.classList.contains("active")) return;
    if (e.target.closest(".site-header")) return;
    closeMobileDrawer();
  });

  /* ---------------- Services Dropdown (mobile accordion) ---------------- */
  const servicesDropdown = $("#servicesDropdown");
  const servicesTrigger = servicesDropdown
    ? $("a.has-dropdown", servicesDropdown)
    : null;

  if (servicesTrigger && servicesDropdown) {
    servicesTrigger.addEventListener("click", (e) => {
      if (!isMobileNav()) return; // desktop: CSS hover + default hash scroll
      e.preventDefault();
      e.stopPropagation();
      servicesDropdown.classList.toggle("mobile-open");
    });
  }

  // Selecting a service from the mega menu: close menu + drawer
  $$(".mega-service-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (servicesDropdown) servicesDropdown.classList.remove("mobile-open");
      closeMobileDrawer();
    });
  });

  // Reset mobile nav states when resizing to desktop
  window.addEventListener("resize", () => {
    if (!isMobileNav()) {
      closeMobileDrawer();
      if (servicesDropdown) servicesDropdown.classList.remove("mobile-open");
    }
  });

  /* ---------------- Scroll Reveal ---------------- */
  const REVEAL_TARGETS = [
    [".section-header", "reveal-up"],
    [".service-card", "reveal-up"],
    [".metric-card", "reveal-up"],
    [".video-container-card", "reveal-fade"],
    [".v-feat", "reveal-up"],
    [".ba-slider-container", "reveal-fade"],
    [".estimator-card", "reveal-up"],
    [".mv-card", "reveal-up"],
    [".val-box", "reveal-up"],
    [".insta-profile-bar", "reveal-up"],
    [".insta-item", "reveal-scale"],
    [".contact-info-card", "reveal-up"],
    [".contact-form-card", "reveal-up"],
    [".footer-col", "reveal-up"],
    // NOTE: .flyer-card is intentionally excluded (breaks print layout).
  ];

  function initScrollReveal() {
    const tagged = [];
    REVEAL_TARGETS.forEach(([sel, cls]) => {
      $$(sel).forEach((el) => {
        // Never tag elements inside print-only / modal areas.
        if (el.closest("#brochureModal, #printableFlyerArea")) return;
        el.classList.add(cls);
        tagged.push(el);
      });
    });

    // Soft stagger for grouped items
    const staggerGroups = [
      ".service-card",
      ".metric-card",
      ".v-feat",
      ".val-box",
      ".insta-item",
      ".footer-col",
    ];
    staggerGroups.forEach((sel) => {
      $$(sel)
        .filter((el) => tagged.includes(el))
        .forEach((el, i) => {
          el.style.transitionDelay = (i % 6) * 70 + "ms";
        });
    });

    if (!("IntersectionObserver" in window) || reduceMotion) {
      tagged.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    tagged.forEach((el) => io.observe(el));
  }

  /* ---------------- Hero Background Video Controls ---------------- */
  const heroVideo = $("#heroBgVideo");
  const btnHeroAudio = $("#btnHeroAudio");
  const btnHeroPlayPause = $("#btnHeroPlayPause");
  const btnHeroExpand = $("#btnHeroExpand");

  function updateBtn(btn, iconClass, label, title) {
    if (!btn) return;
    const icon = $("i", btn);
    if (icon) icon.className = iconClass;
    const span = $("span:not(.pulse-live-dot)", btn);
    if (span && label) span.textContent = label;
    if (title) btn.title = title;
  }

  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
      updateBtn(btnHeroPlayPause, "fa-solid fa-play", "Paused", "Play Video");
    }

    if (btnHeroAudio) {
      btnHeroAudio.addEventListener("click", () => {
        heroVideo.muted = !heroVideo.muted;
        updateBtn(
          btnHeroAudio,
          heroVideo.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high",
          heroVideo.muted ? "Sound Off" : "Sound On",
          heroVideo.muted ? "Unmute Studio Audio" : "Mute Studio Audio"
        );
      });
    }

    if (btnHeroPlayPause) {
      btnHeroPlayPause.addEventListener("click", () => {
        if (heroVideo.paused) {
          heroVideo.play().catch(() => {});
          updateBtn(btnHeroPlayPause, "fa-solid fa-pause", "Playing", "Pause Video");
        } else {
          heroVideo.pause();
          updateBtn(btnHeroPlayPause, "fa-solid fa-play", "Paused", "Play Video");
        }
      });
    }

    if (btnHeroExpand) {
      btnHeroExpand.addEventListener("click", () => {
        const target = heroVideo;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
        if (fsEl) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else if (target.requestFullscreen) {
          target.requestFullscreen().catch(() => {});
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen();
        }
      });
      document.addEventListener("fullscreenchange", () => {
        const icon = $("i", btnHeroExpand);
        if (icon)
          icon.className = document.fullscreenElement
            ? "fa-solid fa-compress"
            : "fa-solid fa-expand";
      });
    }
  }

  /* ---------------- Studio Showcase Video Controls ---------------- */
  const studioVideo = $("#studioVideo");
  const videoPlayPauseBtn = $("#videoPlayPauseBtn");
  const videoMuteBtn = $("#videoMuteBtn");
  const videoFullscreenBtn = $("#videoFullscreenBtn");

  if (studioVideo) {
    if (reduceMotion) {
      studioVideo.removeAttribute("autoplay");
      studioVideo.pause();
      if (videoPlayPauseBtn) {
        const i = $("i", videoPlayPauseBtn);
        if (i) i.className = "fa-solid fa-play";
        videoPlayPauseBtn.title = "Play Video";
      }
    }

    if (videoPlayPauseBtn) {
      videoPlayPauseBtn.addEventListener("click", () => {
        if (studioVideo.paused) {
          studioVideo.play().catch(() => {});
          $("i", videoPlayPauseBtn).className = "fa-solid fa-pause";
          videoPlayPauseBtn.title = "Pause Video";
        } else {
          studioVideo.pause();
          $("i", videoPlayPauseBtn).className = "fa-solid fa-play";
          videoPlayPauseBtn.title = "Play Video";
        }
      });
    }

    if (videoMuteBtn) {
      videoMuteBtn.addEventListener("click", () => {
        studioVideo.muted = !studioVideo.muted;
        $("i", videoMuteBtn).className = studioVideo.muted
          ? "fa-solid fa-volume-xmark"
          : "fa-solid fa-volume-high";
        videoMuteBtn.title = studioVideo.muted ? "Unmute Audio" : "Mute Audio";
      });
    }

    if (videoFullscreenBtn) {
      videoFullscreenBtn.addEventListener("click", () => {
        const wrap = studioVideo.closest(".video-wrapper") || studioVideo;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
        if (fsEl) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else if (wrap.requestFullscreen) {
          wrap.requestFullscreen().catch(() => {});
        } else if (wrap.webkitRequestFullscreen) {
          wrap.webkitRequestFullscreen();
        }
      });
    }
  }

  /* ---------------- Before / After Slider ---------------- */
  const baWrapper = $("#baWrapper");
  if (baWrapper) {
    let dragging = false;

    const setPos = (clientX) => {
      const rect = baWrapper.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      baWrapper.style.setProperty("--ba-pos", pct + "%");
    };

    baWrapper.addEventListener("pointerdown", (e) => {
      dragging = true;
      baWrapper.setPointerCapture(e.pointerId);
      setPos(e.clientX);
    });
    baWrapper.addEventListener("pointermove", (e) => {
      if (dragging) setPos(e.clientX);
    });
    ["pointerup", "pointercancel"].forEach((evt) =>
      baWrapper.addEventListener(evt, () => {
        dragging = false;
      })
    );

    // Keyboard accessibility: left/right arrows when focused
    baWrapper.setAttribute("tabindex", "0");
    baWrapper.setAttribute("role", "slider");
    baWrapper.setAttribute("aria-label", "Before and after comparison slider");
    baWrapper.setAttribute("aria-valuemin", "0");
    baWrapper.setAttribute("aria-valuemax", "100");
    baWrapper.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const current = parseFloat(
        getComputedStyle(baWrapper).getPropertyValue("--ba-pos")
      ) || 50;
      const next = Math.max(
        0,
        Math.min(100, current + (e.key === "ArrowRight" ? 5 : -5))
      );
      baWrapper.style.setProperty("--ba-pos", next + "%");
      baWrapper.setAttribute("aria-valuenow", Math.round(next));
    });
  }

  /* ---------------- Live Price Estimator ---------------- */
  const vehButtons = $$(".veh-btn");
  const serviceChecks = $$('.service-checkboxes input[type="checkbox"]');
  const tierRadios = $$('input[name="filmTier"]');

  const SUMMARY = {
    veh: $("#summaryVeh"),
    tier: $("#summaryTier"),
    breakdown: $("#receiptBreakdown"),
    time: $("#summaryTime"),
    total: $("#summaryTotal"),
  };

  const SHORT_NAMES = {
    chkPPF: "Full Body PPF",
    chkColorPPF: "Color PPF Armor",
    chkWrap: "Vinyl Full Wrap",
    chkTint: "Ceramic Tinting",
    chkPolish: "Stage 2 Correction",
    chkDetail: "Concierge Detailing",
  };

  function getEstimatorState() {
    const vehBtn = $(".veh-btn.active") || vehButtons[0];
    const vehMult = vehBtn ? parseFloat(vehBtn.dataset.mult || "1") : 1;
    const vehName = vehBtn ? $("span", vehBtn).textContent.trim() : "Coupe / Hatch";

    const tierRadio = tierRadios.find((r) => r.checked) || tierRadios[0];
    const tierMult = tierRadio ? parseFloat(tierRadio.value) : 1;
    const tierLabel = tierRadio
      ? tierRadio.parentElement.querySelector("span").textContent
          .replace(/\s*\(.*\)$/, "")
          .trim()
      : "Prime Ultra Gloss";

    const services = serviceChecks
      .filter((c) => c.checked)
      .map((c) => ({
        id: c.id,
        name: SHORT_NAMES[c.id] || c.id,
        base: parseFloat(c.value) || 0,
        time: parseInt(c.dataset.time || "0", 10),
      }));

    return { vehBtn, vehMult, vehName, tierMult, tierLabel, services };
  }

  function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function calcEstimate() {
    const s = getEstimatorState();

    if (SUMMARY.veh)
      SUMMARY.veh.textContent = `${s.vehName} (${
        Number.isInteger(s.vehMult) ? s.vehMult.toFixed(1) : s.vehMult
      }x)`;
    if (SUMMARY.tier) SUMMARY.tier.textContent = s.tierLabel;

    let subtotal = 0;
    let maxTime = 0;

    if (SUMMARY.breakdown) {
      SUMMARY.breakdown.innerHTML = "";
      s.services.forEach((svc) => {
        const amount = svc.base * s.vehMult * s.tierMult;
        subtotal += amount;
        maxTime = Math.max(maxTime, svc.time);
        const row = document.createElement("div");
        row.className = "breakdown-item";
        const name = document.createElement("span");
        name.textContent = svc.name;
        const price = document.createElement("strong");
        price.textContent = formatMoney(amount);
        row.append(name, price);
        SUMMARY.breakdown.appendChild(row);
      });

      if (s.services.length === 0) {
        const empty = document.createElement("div");
        empty.className = "breakdown-item";
        empty.innerHTML =
          '<span style="opacity:.7">No services selected yet</span>';
        SUMMARY.breakdown.appendChild(empty);
      }
    }

    if (SUMMARY.time)
      SUMMARY.time.textContent =
        s.services.length === 0
          ? "Select at least one service"
          : `${maxTime + 1} - ${maxTime + 2} Business Days`;

    if (SUMMARY.total) SUMMARY.total.textContent = formatMoney(subtotal);
  }

  vehButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      vehButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      calcEstimate();
    });
  });
  serviceChecks.forEach((c) => c.addEventListener("change", calcEstimate));
  tierRadios.forEach((r) => r.addEventListener("change", calcEstimate));

  const btnSendQuoteWhatsapp = $("#btnSendQuoteWhatsapp");
  if (btnSendQuoteWhatsapp) {
    btnSendQuoteWhatsapp.addEventListener("click", () => {
      const s = getEstimatorState();
      let subtotal = 0;
      let maxTime = 0;
      s.services.forEach((svc) => {
        subtotal += svc.base * s.vehMult * s.tierMult;
        maxTime = Math.max(maxTime, svc.time);
      });
      const lines = [
        "Hello Hope Carvix! I built an estimate on your website:",
        "",
        "Vehicle: " + s.vehName,
        "Film Tier: " + s.tierLabel,
        "Services: " +
          (s.services.length
            ? s.services.map((x) => x.name).join(", ")
            : "Not selected yet"),
        "Estimated Total: " + formatMoney(subtotal),
      ];
      if (s.services.length)
        lines.push(
          "Turnaround: " + (maxTime + 1) + " - " + (maxTime + 2) + " Business Days"
        );
      lines.push("", "Please confirm my booking. Voucher: HOPE-CARVIX15");
      window.open(
        WA_BASE + "?text=" + encodeURIComponent(lines.join("\n")),
        "_blank",
        "noopener"
      );
    });
  }

  /* ---------------- Service Details Modal ---------------- */
  const SERVICES = {
    ppf: {
      tag: "FLAGSHIP PROTECTION",
      title: "Paint Protection Film (PPF)",
      price: "From $1,499",
      img: "assets/service_ppf.webp",
      time: "3 - 5 Business Days",
      desc: "8mil to 10mil thick self-healing aliphatic thermoplastic polyurethane (TPU). Absorbs rock chips, road gravel and bug splatters, and self-heals swirl marks under sunlight or warm water.",
      bullets: [
        "Instant Self-Healing Technology",
        "10-Year Factory Anti-Yellowing Warranty",
        "Gloss or Stealth Matte Finish",
        "Hydrophobic Top Coat & Zero Yellowing",
      ],
    },
    "color-ppf": {
      tag: "HYBRID INNOVATION",
      title: "Color PPF",
      price: "From $3,499",
      img: "assets/service_color_ppf.webp",
      time: "5 - 7 Business Days",
      desc: "The revolutionary synergy of exotic color customization and genuine 8mil paint protection. Unlike standard thin vinyl, Color PPF features zero orange peel, mirror depth, and self-healing resilience.",
      bullets: [
        "Paint-Like Depth & High Gloss",
        "Rock Chip Defense on Top of Color",
        "Nardo Grey, Acid Green, Miami Blue & More",
        "Self-Healing + 10-Year Warranty",
      ],
    },
    wrapping: {
      tag: "BESPOKE STYLING",
      title: "Wrapped (Vehicle Vinyl Wraps)",
      price: "From $2,199",
      img: "assets/service_wrap.webp",
      time: "4 - 6 Business Days",
      desc: "Transform your car's aesthetic with 300+ premium vinyl options from 3M, Avery Dennison, and Inozetek. Full wraps, satin/matte transformations, chrome deletes, roof wraps, and custom racing liveries.",
      bullets: [
        "100% Reversible without Paint Damage",
        "Seamless Disassembly & Edge Tucking",
        "Chrome Delete & Accent Packages",
        "Carbon Fiber Aerokit Integration Available",
      ],
    },
    tinting: {
      tag: "THERMAL DEFENSE",
      title: "Ceramic Window Tinting",
      price: "From $349",
      img: "assets/service_tinting.webp",
      time: "1 - 2 Business Days",
      desc: "Nano-ceramic infrared blocking window films. Eliminates up to 96% of solar heat and 99.9% of harmful ultraviolet radiation, protecting your luxury leather interior while enhancing privacy and nighttime visibility.",
      bullets: [
        "96% IR Infrared Heat Rejection",
        "Zero Signal Interference (5G/GPS/Radio)",
        "Legal 5%, 20%, 35%, 50%, 70% Shades",
        "99.9% UV Block for Interior Preservation",
      ],
    },
    polishing: {
      tag: "MIRROR CLARITY",
      title: "Polishing & Paint Correction",
      price: "From $599",
      img: "assets/service_polishing.webp",
      time: "2 - 3 Business Days",
      desc: "Surgical rotary and dual-action machine polishing. We permanently remove swirl marks, spider-web scratches, oxidation, hard water etchings, and sanding haze to reveal pure diamond reflection.",
      bullets: [
        "85% to 98% Scratch Elimination",
        "Digital Paint Depth Gauge Verified",
        "Followed by Ceramic/Graphene Sealant",
        "Before & After Inspection Photo Log",
      ],
    },
    detailing: {
      tag: "INTERIOR & EXTERIOR",
      title: "Concierge Auto Detailing",
      price: "From $450",
      img: "assets/hero_car.webp",
      time: "1 - 2 Business Days",
      desc: "Exhaustive 60-point rejuvenation. Steam decontamination, leather nourishment & ceramic shield, alcantara revitalization, chassis underbody flush, wheel-off barrel coating, and dressed engine bay.",
      bullets: [
        "Leather Antimicrobial Ceramic Coating",
        "Wheels-Off Brake Caliper Ceramic Coat",
        "Delicate Engine Bay Steam Cleanse",
        "60-Point Interior & Exterior Checklist",
      ],
    },
  };

  const serviceModal = $("#serviceModal");
  const serviceModalBody = $("#serviceModalBody");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openServiceModal(key) {
    const svc = SERVICES[key];
    if (!svc || !serviceModal || !serviceModalBody) return;

    const waText = encodeURIComponent(
      `Hello Hope Carvix, I would like to book "${svc.title}" for my vehicle. Please share details.`
    );

    serviceModalBody.innerHTML = `
      <span class="section-tag">${escapeHtml(svc.tag)}</span>
      <h3 class="service-title" style="margin-top:14px;">${escapeHtml(svc.title)}</h3>
      <div class="svc-modal-media">
        <img src="${svc.img}" alt="${escapeHtml(svc.title)}" loading="lazy">
      </div>
      <p class="service-desc">${escapeHtml(svc.desc)}</p>
      <ul class="service-bullets">
        ${svc.bullets
          .map((b) => `<li><i class="fa-solid fa-check"></i> ${escapeHtml(b)}</li>`)
          .join("")}
      </ul>
      <div class="service-card-footer" style="margin-top:18px;">
        <span class="service-price">${escapeHtml(svc.price)}</span>
        <span class="svc-modal-time"><i class="fa-solid fa-clock"></i> ${escapeHtml(
          svc.time
        )}</span>
      </div>
      <div class="svc-cta-row">
        <a href="${WA_BASE}?text=${waText}" target="_blank" rel="noopener" class="btn btn-whatsapp">
          <i class="fa-brands fa-whatsapp"></i> Book This Service
        </a>
        <button type="button" class="btn btn-outline" data-goto-estimator>
          <i class="fa-solid fa-calculator"></i> Estimate My Price
        </button>
      </div>
    `;

    serviceModal.style.display = "flex";
    lockScroll();
    const closeBtn = $(".modal-close-btn", serviceModal);
    if (closeBtn) closeBtn.focus();
  }
  window.openServiceModal = openServiceModal;

  function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.style.display = "none";
    unlockScroll();
  }
  window.closeServiceModal = closeServiceModal;

  if (serviceModal) {
    serviceModal.addEventListener("click", (e) => {
      if (e.target === serviceModal) closeServiceModal();
      const goto = e.target.closest("[data-goto-estimator]");
      if (goto) {
        closeServiceModal();
        scrollToSection("estimator");
      }
    });
  }

  // Service cards act as modal launchers (except inner buttons/links)
  $$(".service-card[data-service]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      openServiceModal(card.dataset.service);
    });
  });

  /* ---------------- Brochure Modal + Print ---------------- */
  const brochureModal = $("#brochureModal");
  const brochureModalContent = $("#brochureModalContent");
  const printableArea = $("#printableFlyerArea");

  function openBrochureModal() {
    if (!brochureModal || !brochureModalContent || !printableArea) return;
    brochureModalContent.innerHTML = printableArea.innerHTML;
    brochureModal.style.display = "flex";
    lockScroll();
    const closeBtn = $(".modal-close-btn", brochureModal);
    if (closeBtn) closeBtn.focus();
  }
  window.openBrochureModal = openBrochureModal;

  function closeBrochureModal() {
    if (!brochureModal) return;
    brochureModal.style.display = "none";
    unlockScroll();
  }
  window.closeBrochureModal = closeBrochureModal;

  if (brochureModal) {
    brochureModal.addEventListener("click", (e) => {
      if (e.target === brochureModal) closeBrochureModal();
    });
  }

  function printBrochure() {
    window.print();
  }
  window.printBrochure = printBrochure;

  const btnDownloadFlyer = $("#btnDownloadFlyer");
  if (btnDownloadFlyer) {
    btnDownloadFlyer.addEventListener("click", () => {
      // Printing to PDF via the browser's "Save as PDF" destination.
      window.print();
    });
  }

  /* ---------------- Global: Escape closes modals / drawer ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (serviceModal && serviceModal.style.display === "flex") {
      closeServiceModal();
      return;
    }
    if (brochureModal && brochureModal.style.display === "flex") {
      closeBrochureModal();
      return;
    }
    closeMobileDrawer();
  });

  /* ---------------- Contact / Inquiry Form ---------------- */
  const inquiryForm = $("#inquiryForm");
  const formAlertBox = $("#formAlertBox");
  const btnSubmitForm = $("#btnSubmitForm");

  window.handleInquirySubmit = function (event) {
    event.preventDefault();
    if (!inquiryForm || !btnSubmitForm) return;

    if (!inquiryForm.checkValidity()) {
      inquiryForm.reportValidity();
      return;
    }

    const name = $("#clientName").value.trim();
    const phone = $("#clientPhone").value.trim();
    const car = $("#carModel").value.trim();

    // Loading state
    const originalHtml = btnSubmitForm.innerHTML;
    btnSubmitForm.disabled = true;
    btnSubmitForm.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Request...';

    window.setTimeout(() => {
      // Success feedback
      if (formAlertBox) {
        formAlertBox.className = "form-alert success";
        formAlertBox.style.display = "block";
        formAlertBox.innerHTML =
          `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${escapeHtml(
            name
          )}</strong>! Your booking request for <strong>${escapeHtml(
            car
          )}</strong> has been received. Our consultant will contact you within 2 hours on <strong>${escapeHtml(
            phone
          )}</strong>.`;
      }
      inquiryForm.reset();
      btnSubmitForm.disabled = false;
      btnSubmitForm.innerHTML = originalHtml;
      if (formAlertBox)
        formAlertBox.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
    }, 700);
  };

  /* ---------------- Init ---------------- */
  initScrollReveal();
  calcEstimate();
  updateScrollSpy();
  onScroll();
})();
