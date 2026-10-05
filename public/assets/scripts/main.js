// ===== FixCore landing — shared behaviour for index.html and index-en.html =====

const pageLang = document.documentElement.lang === 'en' ? 'en' : 'es';
const numberLocale = pageLang === 'en' ? 'en-US' : 'es-MX';

// ---- FixCore app links: Vercel in production, the local Next.js dev server when the landing runs locally ----
(function () {
  const FIXCORE_APP_URL = 'https://fixcore-app.vercel.app'; // replace with the real Vercel domain
  const local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const base = local ? 'http://localhost:3000' : FIXCORE_APP_URL;

  document.querySelectorAll('[data-app-link]').forEach(link => {
    link.href = base + '/' + link.getAttribute('data-app-link') + '?lang=' + pageLang;
  });
})();

// ---- Language Toggle Scroll Position ----
function saveScroll() {
  try {
    sessionStorage.setItem('langScroll', window.scrollY);
  } catch (e) { /* storage unavailable */ }
}

window.addEventListener('DOMContentLoaded', () => {
  let savedScroll = null;
  try {
    savedScroll = sessionStorage.getItem('langScroll');
    sessionStorage.removeItem('langScroll');
  } catch (e) { /* storage unavailable */ }

  if (savedScroll !== null) {
    window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
  }
});

// ---- Header Scroll Effect ----
const header = document.getElementById('header');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ---- Mobile Menu Toggle ----
const mobileToggle = document.getElementById('mobileToggle');
const mainNav = document.getElementById('mainNav');

function setMenuOpen(open) {
  mainNav.classList.toggle('active', open);
  mobileToggle.classList.toggle('active', open);
  mobileToggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
}

mobileToggle.addEventListener('click', () => {
  setMenuOpen(!mainNav.classList.contains('active'));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mainNav.classList.contains('active')) {
    setMenuOpen(false);
    mobileToggle.focus();
  }
});

// Close the mobile menu when returning to desktop width
window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
  if (e.matches) setMenuOpen(false);
});

// ---- Smooth Scroll for in-page links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // href="#" (logo) is not a valid selector: scroll to the top instead of throwing
    const target = href === '#' ? document.body : document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMenuOpen(false);
  });
});

// ---- FAQ Accordion ----
function toggleFaq(headerEl) {
  const faqItem = headerEl.parentElement;
  const isActive = faqItem.classList.contains('active');

  // Close all
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    item.querySelector('.faq-item__header').setAttribute('aria-expanded', 'false');
  });

  // Open clicked (if was closed)
  if (!isActive) {
    faqItem.classList.add('active');
    headerEl.setAttribute('aria-expanded', 'true');
  }
}

// Make FAQ headers keyboard accessible
document.querySelectorAll('.faq-item__header').forEach(headerEl => {
  headerEl.setAttribute('role', 'button');
  headerEl.setAttribute('tabindex', '0');
  headerEl.setAttribute('aria-expanded', String(headerEl.parentElement.classList.contains('active')));
  headerEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(headerEl);
    }
  });
});

// ---- Scroll Animations (Intersection Observer) ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// ---- Counter Animation ----
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-count]');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        const isFixed = counter.getAttribute('data-fixed') === 'true';
        if (isFixed) {
          counter.textContent = '0';
          return;
        }
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current).toLocaleString(numberLocale);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString(numberLocale);
          }
        };
        updateCounter();
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.getElementById('stats');
if (statsSection) {
  counterObserver.observe(statsSection);
}

// ---- Pricing Toggle (Monthly/Annual) ----
let isAnnual = false;

function togglePricingSwitch() {
  isAnnual = !isAnnual;
  updatePricingUI();
}

function togglePricing(mode) {
  isAnnual = mode === 'annual';
  updatePricingUI();
}

function updatePricingUI() {
  const switchEl = document.getElementById('pricingSwitch');
  const monthlyLabel = document.getElementById('toggleMonthly');
  const annualLabel = document.getElementById('toggleAnnual');

  switchEl.classList.toggle('active', isAnnual);
  switchEl.setAttribute('aria-checked', String(isAnnual));
  monthlyLabel.classList.toggle('active', !isAnnual);
  annualLabel.classList.toggle('active', isAnnual);

  // Update prices with animation
  document.querySelectorAll('.pricing-card__amount[data-monthly]').forEach(el => {
    const target = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');

    el.style.transition = 'opacity 0.2s, transform 0.2s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';

    setTimeout(() => {
      el.textContent = target;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200);
  });

  // Toggle notes
  document.querySelectorAll('.pricing-annual-note').forEach(el => {
    el.style.display = isAnnual ? 'inline' : 'none';
  });
  document.querySelectorAll('.pricing-monthly-note').forEach(el => {
    el.style.display = isAnnual ? 'none' : 'inline';
  });
}

// Pricing labels are clickable spans: give them keyboard support too
['toggleMonthly', 'toggleAnnual'].forEach(id => {
  const label = document.getElementById(id);
  if (!label) return;
  label.setAttribute('role', 'button');
  label.setAttribute('tabindex', '0');
  label.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePricing(id === 'toggleAnnual' ? 'annual' : 'monthly');
    }
  });
});
