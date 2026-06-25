/* ==========================================================================
   Sanjeev Kumar Singh - Personal Branding Page JavaScript Actions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Set Current Year in Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinksItems = document.querySelectorAll('.nav-links a');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinksItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
      });
    });
  }

  // 3. Navbar Scroll Behavior (Sticky Header styling)
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  // Back to top click handler
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 4. Active Navigation Item Highlight on Scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  function makeNavActive() {
    let scrollPos = window.scrollY + 150; // offset for triggers

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', makeNavActive);
  makeNavActive(); // run on load

  // 5. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, no need to track again
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px' // triggers slightly before entering viewport
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }

  // 6. Contact Form Handler
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');

  // Sanitize user input to prevent XSS
  function sanitize(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate email format
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // Get and sanitize values
      const name = sanitize(document.getElementById('name').value.trim());
      const email = sanitize(document.getElementById('email').value.trim());
      const subject = sanitize(document.getElementById('subject').value.trim());
      const message = sanitize(document.getElementById('message').value.trim());

      // Validation
      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please fill in all the required fields.';
        formStatus.className = 'form-status error';
        return;
      }

      if (!isValidEmail(email)) {
        formStatus.textContent = 'Please enter a valid email address.';
        formStatus.className = 'form-status error';
        return;
      }

      if (name.length > 100 || subject.length > 200 || message.length > 5000) {
        formStatus.textContent = 'Input exceeds maximum length. Please shorten your message.';
        formStatus.className = 'form-status error';
        return;
      }

      // Visual state update: loading
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        Sending Message...
        <svg class="animate-spin" style="animation: spin 1s linear infinite; margin-left: 0.5rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
          <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;

      // Send via Web3Forms (configure WEB3FORMS_KEY in the constant below)
      // 1. Sign up free at https://web3forms.com
      // 2. Get your access key
      // 3. Replace the key below
      const WEB3FORMS_KEY = 'YOUR_ACCESS_KEY_HERE';

      if (WEB3FORMS_KEY !== 'YOUR_ACCESS_KEY_HERE') {
        const formData = new FormData();
        formData.append('access_key', WEB3FORMS_KEY);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showFormSuccess(name);
          } else {
            showFormError('Message delivery failed. Please try again or email directly.');
          }
        })
        .catch(() => {
          showFormError('Network error. Please check your connection and try again.');
        })
        .finally(() => {
          restoreFormButton(submitBtn, originalBtnText);
        });
      } else {
        // Fallback: log message (no backend configured yet)
        console.log('Form submission captured:', { name, email, subject, message });
        setTimeout(() => {
          showFormSuccess(name);
          restoreFormButton(submitBtn, originalBtnText);
        }, 800);
      }
    });
  }

  function showFormSuccess(name) {
    formStatus.textContent = `Thank you, ${sanitize(name)}! Your message has been sent successfully. Sanjeev will get back to you shortly.`;
    formStatus.className = 'form-status success';
    contactForm.reset();
    setTimeout(() => {
      formStatus.style.display = 'none';
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      formStatus.style.display = '';
    }, 7000);
  }

  function showFormError(message) {
    formStatus.textContent = message;
    formStatus.className = 'form-status error';
  }

  function restoreFormButton(btn, originalText) {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }

  // 7. Theme Toggle (Dark / Light Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // SVG Paths for Moon and Sun
  const moonPath = 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z';
  const sunPath = 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z';

  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      if (themeIcon) {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${sunPath}" />`;
      }
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      if (themeIcon) {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${moonPath}" />`;
      }
      localStorage.setItem('theme', 'dark');
    }
  }

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setTheme(isLight ? 'dark' : 'light');
    });
  }
});

// Add spin keyframes style dynamically for loading indicator spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    display: inline-block;
  }
`;
document.head.appendChild(style);
