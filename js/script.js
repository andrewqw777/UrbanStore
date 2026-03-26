// Swiper (dacă există pe pagină)
if (typeof Swiper !== "undefined" && document.querySelector(".mySwiper")) {
  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

// ===== HAMBURGER MENU (mobil/tabletă) – COPYPaste în script.js =====
(function () {
  const openBtn = document.querySelector(".navOpen-btn");
  const closeBtn = document.querySelector(".navClose-btn");
  const menu = document.getElementById("navMenu");
  const overlay = document.getElementById("navOverlay");

  if (!openBtn || !closeBtn || !menu || !overlay) return;

  const openMenu = () => document.body.classList.add("menu-open");
  const closeMenu = () => document.body.classList.remove("menu-open");

  openBtn.addEventListener("click", openMenu);
  overlay.addEventListener("click", closeMenu);
  closeBtn.addEventListener("click", closeMenu);

  // close la click pe link
  menu.querySelectorAll("a.nav-link").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  // close la ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // suport Enter/Space pe iconițe (că sunt <i>)
  [openBtn, closeBtn].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el === openBtn ? openMenu() : closeMenu();
      }
    });
  });
})();


// SCROLL
window.addEventListener("scroll", () => {
  const scrollY = window.pageYOffset;

  // header active
  const header = document.querySelector("header");
  if (header) {
    if (scrollY > 5) header.classList.add("header-active");
    else header.classList.remove("header-active");
  }

  const scrollUpBtn = document.querySelector(".scrollUp-btn");
  if (scrollUpBtn) {
    if (scrollY > 250) scrollUpBtn.classList.add("scrollUpBtn-active");
    else scrollUpBtn.classList.remove("scrollUpBtn-active");
  }

  if (!navMenu) return;

  const sections = document.querySelectorAll("section[id]");
  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;

    const navId = document.querySelector(`.menu-content a[href='#${section.id}']`);
    if (!navId) return; if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) { navId.classList.add("active-navlink"); } else { navId.classList.remove("active-navlink"); } });});



const sr = ScrollReveal({
  origin: 'top',
  distance: '60px',
  duration: 2500,
  delay: 400,
})

sr.reveal(`.section-title, .section-subtitle, .section-description, .brand-image, .tesitmonial, .newsletter 
.logo-content, .newsletter-inputBox, .newsletter-mediaIcon, .footer-content, .footer-links`, { interval: 100, })


let slideIndex = 0;

function showSlide(index) {
  const slides = document.querySelectorAll('.slides img');
  if (index >= slides.length) {
    slideIndex = 0;
  } else if (index < 0) {
    slideIndex = slides.length - 1;
  }

  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === slideIndex) {
      slide.classList.add('active');
    }
  });
}

function changeSlide(n) {
  slideIndex += n;
  showSlide(slideIndex);
}

showSlide(slideIndex);



window.initialValues = window.initialValues || {};

function saveInitialValues() {
  const elements = document.querySelectorAll(".filter input, .filter select");

  if (!elements.length) {
    console.warn("saveInitialValues: nu găsesc .filter input/select");
    return;
  }

  elements.forEach((element) => {
    if (!element.id) return;

    if (window.initialValues[element.id] === undefined) {
      window.initialValues[element.id] = element.value;
    }

    if (!element.dataset.boundFilter) {
      const eventName = element.tagName === "SELECT" ? "change" : "input";
      element.addEventListener(eventName, applyFilters);
      element.dataset.boundFilter = "1";
    }
  });

  updateSpans();
  console.log("Saved initialValues:", window.initialValues);
}

function updateSpans() {
  const mappings = [
    { inputId: "pret-min", spanId: "valoare-pret-min" },
    { inputId: "pret-max", spanId: "valoare-pret-max" },
  ];

  mappings.forEach(({ inputId, spanId }) => {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    if (input && span) span.textContent = input.value;
  });
}

function applyFilters() {
  const search = (document.getElementById("search")?.value || "").toLowerCase().trim();
  const size = (document.getElementById("size")?.value || "").toLowerCase().trim();
  const brand = (document.getElementById("brand")?.value || "").toLowerCase().trim();

  const type = (document.getElementById("type")?.value || "").toLowerCase().trim();
  const gender = (document.getElementById("gender")?.value || "").toLowerCase().trim();

  const pretMin = parseInt(document.getElementById("pret-min")?.value, 10) || 0;
  const pretMax = parseInt(document.getElementById("pret-max")?.value, 10) || 99000;

  updateSpans();

  const cards = document.querySelectorAll(".card-item");
  let visible = 0;

  cards.forEach((card) => {
    const ds = card.dataset;

    const brandCard = (ds.brand || "").toLowerCase().trim();

    const typeCard = (ds.type || "").toLowerCase().trim();
    const genderCard = (ds.gender || "").toLowerCase().trim();

    const sizeCardRaw = (ds.size || "").toLowerCase().trim();
    const price = parseInt(ds.price || "0", 10);

    const sizes = sizeCardRaw.includes(",")
      ? sizeCardRaw.split(",").map((s) => s.trim())
      : [sizeCardRaw];

    const searchAttr = (ds.search || "").toLowerCase();
    const titleText = (card.querySelector("h1, h2, h3")?.textContent || "").toLowerCase();
    const haystack = (searchAttr + " " + titleText).toLowerCase();

    const ok =
      (search === "" || haystack.includes(search)) &&
      (size === "" || sizes.includes(size)) &&
      (brand === "" || brandCard === brand) &&
      (type === "" || typeCard === type) &&
      (gender === "" || genderCard === gender) &&
      price >= pretMin &&
      price <= pretMax;

    if (ok) {
      card.style.display = "";
      visible++;
    } else {
      card.style.display = "none";
    }
  });

  const noRes = document.getElementById("no-results");
  if (noRes) noRes.style.display = visible === 0 ? "block" : "none";

  if (typeof checkSingleCard === "function") checkSingleCard();
}

function resetFilters() {
  if (!Object.keys(window.initialValues).length) {
    saveInitialValues();
  }

  Object.keys(window.initialValues).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = window.initialValues[id];
  });

  updateSpans();
  applyFilters();
}

window.applyFilters = applyFilters;
window.resetFilters = resetFilters;

document.addEventListener("DOMContentLoaded", () => {
  saveInitialValues();
  applyFilters();
});

window.onProductsRendered = function () {
  saveInitialValues();
  applyFilters();
};