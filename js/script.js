// ========= THEME & LOGO MANAGEMENT =========

// Update logo based on theme
function updateLogo() {
  const logo = document.querySelector(".header-img");
  if (!logo) return;

  const theme = document.body.getAttribute("data-theme");
  const isDark = theme === "dark";

  logo.src = isDark
    ? "./images/RockShopLogoDark.png"
    : "./images/RockShopLogoLight.png";
}

// Toggle theme function
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  updateLogo();
}

// Initialize logo on page load
updateLogo();

// ========= CHECKBOX THEME TOGGLE =========

const checkbox = document.getElementById("checkbox");
if (checkbox) {
  checkbox.addEventListener("change", toggleTheme);
}

// ========= MOBILE MENU TOGGLE =========

const mobileMenuBtn = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const menuBackdrop = document.getElementById("menu-backdrop");

function toggleMobileMenu(forceClose = false) {
  if (!mobileMenuBtn || !mobileMenu) return;

  const isOpen = forceClose ? false : !mobileMenu.classList.contains("open");

  mobileMenu.classList.toggle("open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  mobileMenuBtn.setAttribute("aria-expanded", isOpen);

  if (menuBackdrop) {
    menuBackdrop.classList.toggle("open", isOpen);
  }

  // Prevent background scroll (Material / app-like feel)
  document.body.style.overflow = isOpen ? "hidden" : "";
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => toggleMobileMenu());
}

if (menuBackdrop) {
  menuBackdrop.addEventListener("click", () => toggleMobileMenu(true));
}

// ========= SMOOTH SCROLLING =========

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");

    if (targetId === "#" || !targetId) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    toggleMobileMenu(true);
  });
});

// ========= NAVIGATION SCROLL EFFECT =========

const nav = document.getElementById("main-nav");

window.addEventListener("scroll", () => {
  if (!nav) return;

  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
    nav.classList.remove("shadow-lg");
  } else {
    nav.classList.remove("scrolled");
    nav.classList.add("shadow-lg");
  }
});

// ========= PAGE LOAD ANIMATION =========

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loading");
  setTimeout(() => {
    document.body.classList.remove("loading");
  }, 100);
});

// ========= SPARK ANIMATIONS =========

// Randomize spark positions and animations
function randomizeSparkPositions(sparkElement) {
  const knobRadius = 50;
  const sparkChildren = sparkElement.querySelectorAll("i");

  // Randomize each spark child
  sparkChildren.forEach((spark) => {
    const angle = Math.random() * 360;
    const angleRad = (angle * Math.PI) / 180;

    const startX = Math.cos(angleRad) * knobRadius;
    const startY = Math.sin(angleRad) * knobRadius;

    const travelDistance = 30 + Math.random() * 40;
    const tx = Math.cos(angleRad) * travelDistance;
    const ty = Math.sin(angleRad) * travelDistance;

    const rotation = angle + (Math.random() * 40 - 20);
    const height = 20 + Math.random() * 20;
    const delay = Math.random() * 0.15;

    spark.style.setProperty("--start-x", `${startX}px`);
    spark.style.setProperty("--start-y", `${startY}px`);
    spark.style.setProperty("--tx", `${tx}px`);
    spark.style.setProperty("--ty", `${ty}px`);
    spark.style.setProperty("--rotation", `${rotation}deg`);
    spark.style.height = `${height}px`;
    spark.style.animationDelay = `${delay}s`;
  });
}

// ========= KNOB NAVIGATION WITH SPARKS =========

document.addEventListener("DOMContentLoaded", () => {
  const knobLinks = document.querySelectorAll("#controls li");

  knobLinks.forEach((knob) => {
    const sparkElement = knob.querySelector(".spark");

    // Click handler for navigation
    knob.addEventListener("click", (event) => {
      const targetId = knob.getAttribute("data-target");
      if (targetId) {
        const targetElement = document.querySelector(targetId);

        // Perform smooth scroll
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }

        event.preventDefault();
      }
    });

    // Spark effect on hover completion (when knob reaches "11")
    knob.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;

      const style = window.getComputedStyle(knob);
      const matrix = new DOMMatrix(style.transform);

      let angle = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));

      if (angle < 0) angle += 360;

      const isAtEleven = angle >= 8 && angle <= 12;

      if (isAtEleven) {
        randomizeSparkPositions(sparkElement);

        knob.classList.add("spark-active");
        setTimeout(() => {
          knob.classList.remove("spark-active");
        }, 700);
      }
    });
  });
});
