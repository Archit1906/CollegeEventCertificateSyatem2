document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.replace('fa-bars', 'fa-times');
        } else {
          icon.classList.replace('fa-times', 'fa-bars');
        }
      }
    });
  }

  // Sticky Navbar Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Dark Mode Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  } else {
    updateThemeIcon('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
      } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
      }
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;
    if (theme === 'dark') {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  // Set Active Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }

  // Animated Numbers Counter
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = parseInt(target.getAttribute('data-target'));
          animateCounter(target, endValue, 2000);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  function animateCounter(el, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      el.innerText = Math.floor(easeProgress * end) + (el.getAttribute('data-suffix') || '');
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.innerText = end + (el.getAttribute('data-suffix') || '');
      }
    };
    window.requestAnimationFrame(step);
  }

  // Typing Effect
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const words = JSON.parse(typingElement.getAttribute('data-words'));
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];
      const speed = isDeleting ? 50 : 100;

      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 1500); // Pause at end of word
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500); // Pause before new word
      } else {
        setTimeout(type, speed);
      }
    }
    setTimeout(type, 1000); // Initial delay
  }

  // Countdown Timers
  const countdowns = document.querySelectorAll('.countdown');
  countdowns.forEach(cd => {
    const targetDate = new Date(cd.getAttribute('data-date')).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        cd.innerHTML = "Event Started";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      cd.innerHTML = `<i class="fa-regular fa-clock"></i> Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  });

  // Hero Progress Bar Animation
  setTimeout(() => {
    const heroBar = document.getElementById('heroXpBar');
    if (heroBar) {
      // Set to 72.5% as per UI design (1450/2000)
      heroBar.style.width = '72.5%';
    }

    // Animate generic progress bars if they exist
    const progressBars = document.querySelectorAll('.progress-bar-fill:not(#heroXpBar)');
    progressBars.forEach(bar => {
      const target = bar.getAttribute('data-progress');
      if (target) {
        bar.style.width = target + '%';
      }
    });
  }, 500);

  // Initialize tsParticles with v2 Engine logic
  if (document.getElementById('tsparticles') && typeof tsParticles !== 'undefined') {
    const loadParticles = async () => {
      await tsParticles.load({
        id: "tsparticles",
        options: {
          fullScreen: { enable: false },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              onClick: { enable: true, mode: "push" }
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
              push: { quantity: 4 }
            }
          },
          particles: {
            color: { value: ["#6366f1", "#a855f7", "#ec4899"] },
            links: { enable: true, color: "#94a3b8", distance: 150, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, outModes: "out" },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.4, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } }
          }
        }
      });
    };
    loadParticles();
  }

  // Initialize Chart.js Radar
  const radarCanvas = document.getElementById('studentRadarChart');
  if (radarCanvas && typeof Chart !== 'undefined') {
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Poppins', sans-serif";

    new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels: ['Participation', 'Leadership', 'Technical Skill', 'Consistency', 'Community'],
        datasets: [{
          label: 'Student Skill Profile',
          data: [85, 65, 90, 75, 50],
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#ec4899',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }, {
          label: 'Dept Average',
          data: [65, 50, 70, 60, 55],
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
          pointBackgroundColor: 'rgba(99, 102, 241, 0.4)',
          pointBorderColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            pointLabels: {
              font: { size: 11, family: "'Poppins', sans-serif" },
              color: '#94a3b8'
            },
            ticks: {
              display: false,
              stepSize: 20,
              max: 100,
              min: 0
            }
          }
        }
      }
    });
  }
});

// Utility to show modals
window.showModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
};

// Fire Confetti
window.fireConfetti = function () {
  if (typeof confetti !== 'undefined') {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
};

// =========================================================================
// SYSTEM SETTINGS MANAGER (LOCAL STORAGE)
// =========================================================================

const defaultSettings = {
  profile: {
    avatar: '',
    fullName: 'Admin Root',
    displayName: 'Root',
    email: 'root@college.edu',
    phone: '+1 (555) 123-4567',
    bio: 'Leading the digital transformation of college events.'
  },
  security: {
    twoFactor: true
  },
  notifications: {
    inAppEvents: true,
    inAppSecurity: true,
    emailSummary: false,
    emailMarketing: false
  },
  preferences: {
    theme: 'dark', // 'dark', 'light', 'system'
    accentColor: 'indigo', // 'indigo', 'purple', 'emerald', 'rose'
    compactView: false,
    animations: true
  },
  configuration: {
    globalXpMultiplier: 1.0,
    defaultEventCapacity: 100,
    maxRegistrationsPerUser: 5,
    autoApproveRegistrations: true
  }
};

const SettingsManager = {
  settings: null,

  init() {
    this.loadSettings();
  },

  loadSettings() {
    const stored = localStorage.getItem('eventSys_settings');
    if (stored) {
      // Deep merge to ensure new default keys are added automatically
      this.settings = this.mergeDeep(JSON.parse(JSON.stringify(defaultSettings)), JSON.parse(stored));
    } else {
      this.settings = JSON.parse(JSON.stringify(defaultSettings));
      this.saveSettings();
    }
  },

  saveSettings() {
    localStorage.setItem('eventSys_settings', JSON.stringify(this.settings));
    this.applyGlobalPreferences();

    // Dispatch custom event so UI can react globally
    const event = new CustomEvent('settingsUpdated', { detail: this.settings });
    window.dispatchEvent(event);
  },

  updateSettings(category, data) {
    if (this.settings[category]) {
      this.settings[category] = { ...this.settings[category], ...data };
      this.saveSettings();
    }
  },

  getSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  },

  mergeDeep(target, source) {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return target;

    const output = { ...target };
    Object.keys(source).forEach(key => {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.mergeDeep(output[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
    return output;
  },

  applyGlobalPreferences() {
    // Safe check
    if (!this.settings || !this.settings.preferences) return;

    const pref = this.settings.preferences;

    // --- 1. THEME APPLICATION ---
    const body = document.body;
    if (pref.theme === 'light') {
      body.removeAttribute('data-theme');
    } else if (pref.theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
    } else {
      // 'system'
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.setAttribute('data-theme', 'dark');
      } else {
        body.removeAttribute('data-theme');
      }
    }

    // Sync the app.js dark mode toggle local storage logic legacy fallback
    localStorage.setItem('theme', body.hasAttribute('data-theme') ? 'dark' : 'light');
    const themeToggleIcon = document.querySelector('.theme-toggle i');
    if (themeToggleIcon) {
      if (body.hasAttribute('data-theme')) {
        themeToggleIcon.classList.remove('fa-moon');
        themeToggleIcon.classList.add('fa-sun');
      } else {
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
      }
    }

    // --- 2. ACCENT COLOR INJECTION ---
    let colorStyleTag = document.getElementById('dynamicAccentColors');
    if (!colorStyleTag) {
      colorStyleTag = document.createElement('style');
      colorStyleTag.id = 'dynamicAccentColors';
      document.head.appendChild(colorStyleTag);
    }

    if (pref.accentColor === 'purple') {
      colorStyleTag.innerHTML = `:root { --primary-color: #a855f7 !important; --primary-hover: #9333ea !important; --accent-color: #d946ef !important; }`;
    } else if (pref.accentColor === 'emerald') {
      colorStyleTag.innerHTML = `:root { --primary-color: #10b981 !important; --primary-hover: #059669 !important; --accent-color: #3b82f6 !important; }`;
    } else if (pref.accentColor === 'rose') {
      colorStyleTag.innerHTML = `:root { --primary-color: #e11d48 !important; --primary-hover: #be123c !important; --accent-color: #f43f5e !important; }`;
    } else {
      colorStyleTag.innerHTML = '';
    }

    // --- 3. ANIMATIONS TOGGLE ---
    let animationStyleTag = document.getElementById('dynamicAnimations');
    if (!animationStyleTag) {
      animationStyleTag = document.createElement('style');
      animationStyleTag.id = 'dynamicAnimations';
      document.head.appendChild(animationStyleTag);
    }
    if (pref.animations === false) {
      animationStyleTag.innerHTML = `* { transition: none !important; animation: none !important; scroll-behavior: auto !important; } .interactive-card:hover, .btn:hover { transform: none !important; }`;
    } else {
      animationStyleTag.innerHTML = '';
    }
  }
};

// Initialize Settings Manager
SettingsManager.init();

// =========================================================================
// EVENT MANAGEMENT SYSTEM (LOCAL STORAGE)
// =========================================================================

const EventManager = {
  events: [],

  init() {
    this.loadEvents();
    // We remove setupAdminForm and renderAdminTable from app.js 
    // because they should be scoped strictly to admin.js to avoid issues on client pages.
    // Ensure events are always available globally
  },

  loadEvents() {
    const stored = localStorage.getItem('eventSys_events');
    if (stored) {
      this.events = JSON.parse(stored);
    } else {
      // Seed with some mock data if empty
      this.events = [
        {
          id: 'evt_' + Date.now(),
          title: 'National Tech Symposium',
          desc: 'A premier national level technical symposium featuring expert talks.',
          category: 'Technical',
          xp: 150,
          date: '2026-10-15',
          time: '09:00',
          seats: 500,
          registered: 420,
          venue: 'Main Auditorium',
          organizer: 'Tech Club',
          bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
          featured: true,
          visibility: 'Public',
          departmentRestriction: 'None',
          tags: ['AI', 'Tech', 'Networking'],
          status: 'Upcoming',
          registrationDeadline: '2026-10-10',
          createdAt: new Date().toISOString()
        },
        {
          id: 'evt_' + (Date.now() + 1),
          title: 'AI & Machine Learning Deep Dive',
          desc: 'Intensive hands-on workshop focused on building neural networks.',
          category: 'Workshop',
          xp: 200,
          date: '2026-10-20',
          time: '10:00',
          seats: 150,
          registered: 145,
          venue: 'Lab 4, Block IT',
          organizer: 'AI Dept',
          bannerImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800',
          featured: false,
          visibility: 'Public',
          departmentRestriction: 'None',
          tags: ['Workshop', 'Machine Learning'],
          status: 'Upcoming',
          registrationDeadline: '2026-10-18',
          createdAt: new Date().toISOString()
        }
      ];
      this.saveEvents();
    }
  },

  saveEvents() {
    localStorage.setItem('eventSys_events', JSON.stringify(this.events));
  },

  addEvent(evt) {
    this.events.unshift(evt);
    this.saveEvents();
  },

  updateEvent(id, updatedData) {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updatedData };
      this.saveEvents();
    }
  },

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.saveEvents();
  },

  getEventById(id) {
    return this.events.find(e => e.id === id);
  },

  getPublicEvents() {
    return this.events.filter(e => e.visibility === 'Public');
  }
};

// Start the Event Manager
EventManager.init();

// =========================================================================
// EXPLORE PAGE DYNAMIC RENDERING (events.html)
// =========================================================================

const EventExplore = {
  init() {
    if (!document.getElementById('dynamicExploreGrid')) return;
    this.renderGrid();
    this.setupFilters();
  },

  setupFilters() {
    const searchInput = document.querySelector('.main-content input[type="text"]');
    const categorySelect = document.getElementById('exploreCategoryFilter');
    const filterBtn = document.querySelector('.main-content .btn-primary');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderGrid());
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.renderGrid());
    }

    if (filterBtn && window.innerWidth > 768) {
      // Optional: if filter button is meant to trigger a modal, bind it here.
      // Currently, 'input' and 'change' handle real-time rendering.
    }
  },

  renderGrid() {
    const grid = document.getElementById('dynamicExploreGrid');
    const emptyState = document.getElementById('exploreEmptyState');
    const searchInput = document.querySelector('.main-content input[type="text"]');
    const categorySelect = document.getElementById('exploreCategoryFilter');

    if (!grid) return;

    grid.innerHTML = '';

    let events = EventManager.getPublicEvents();

    // Filter
    if (searchInput && searchInput.value) {
      const term = searchInput.value.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(term) || e.desc.toLowerCase().includes(term));
    }

    if (categorySelect && categorySelect.value) {
      const term = categorySelect.value.toLowerCase();
      events = events.filter(e => e.category.toLowerCase() === term);
    }

    if (events.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      grid.style.display = 'grid'; // Reverts to CSS grid
      if (emptyState) emptyState.style.display = 'none';
    }

    events.forEach((evt, index) => {
      const delay = (index % 3) * 100 + 100;
      const dateObj = new Date(evt.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      let catBadgeClass = 'badge-tech'; let catIcon = 'fa-microchip';
      if (evt.category === 'Workshop') { catBadgeClass = 'badge-workshop'; catIcon = 'fa-laptop-code'; }
      if (evt.category === 'Cultural') { catBadgeClass = 'badge-culture'; catIcon = 'fa-masks-theater'; }
      if (evt.category === 'Hackathon') { catBadgeClass = 'badge-urgent'; catIcon = 'fa-shield-halved'; }

      const isFull = evt.registered >= evt.seats;
      const seatsLeft = evt.seats - evt.registered;
      let statusBadge = '';

      if (evt.status === 'Completed') {
        statusBadge = `<div class="badge" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-check-double"></i> Event Completed</div>`;
      } else if (isFull) {
        statusBadge = `<div class="badge badge-urgent"><i class="fa-solid fa-ban"></i> Waitlist Only</div>`;
      } else if (seatsLeft <= 20) {
        statusBadge = `<div class="badge badge-urgent"><i class="fa-solid fa-fire"></i> Only ${seatsLeft} Seats Left!</div>`;
      } else {
        statusBadge = `<div class="badge" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-check"></i> Seats Available</div>`;
      }

      // Create Countdown string (e.g., 2026-10-15T09:00:00)
      const targetDateStr = `${evt.date}T${evt.time}:00`;

      const card = document.createElement('div');
      card.className = 'interactive-card glass';
      card.setAttribute('data-aos', 'zoom-in');
      card.setAttribute('data-aos-delay', delay);

      card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                    <div class="badge ${catBadgeClass}"><i class="fa-solid ${catIcon}"></i> ${evt.category}</div>
                    ${statusBadge}
                </div>

                <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem; line-height: 1.3;">${evt.title}</h3>

                ${evt.status !== 'Completed' ?
          `<div class="countdown mt-2 mb-4 text-primary" data-date="${targetDateStr}"
                    style="font-weight: 600; font-size: 0.95rem; background: rgba(99,102,241,0.1); padding: 0.5rem 1rem; border-radius: var(--radius-sm); display: inline-block;">
                    <i class="fa-regular fa-clock"></i> Loading timer...
                </div>` :
          `<div class="mt-2 mb-4 text-secondary" style="font-weight: 600; font-size: 0.95rem; display: inline-block;">
                    <i class="fa-solid fa-calendar-check"></i> Ended on ${formattedDate}
                </div>`
        }

                <div style="margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--text-secondary); display: grid; gap: 0.5rem;">
                    <div><i class="fa-solid fa-calendar-day" style="width: 24px; color: var(--primary-color);"></i>
                        ${formattedDate} | ${evt.time}</div>
                    <div><i class="fa-solid fa-building-user"
                            style="width: 24px; color: var(--secondary-color);"></i> Org: ${evt.organizer || 'EventSys'}</div>
                    <div><i class="fa-solid fa-location-dot" style="width: 24px; color: var(--accent-color);"></i>
                        ${evt.venue}</div>
                </div>

                <p style="font-size: 0.95rem; margin-bottom: 2rem; flex-grow: 1;">
                    ${evt.desc.substring(0, 150)}${evt.desc.length > 150 ? '...' : ''}
                </p>

                ${evt.status === 'Completed' ?
          `<button class="btn btn-outline" style="width: 100%; justify-content: center; opacity: 0.5; cursor: not-allowed;" disabled>Event Concluded</button>` :
          `<a href="participate.html?event=${evt.id}" class="btn btn-outline" style="width: 100%; justify-content: space-between;">
                        Select to Participate <i class="fa-solid fa-arrow-right"></i>
                    </a>`
        }
            `;
      grid.appendChild(card);
    });

    // Re-initialize countdowns for the newly injected DOM elements
    this.initCountdowns();
  },

  initCountdowns() {
    const countdowns = document.querySelectorAll('#dynamicExploreGrid .countdown');
    countdowns.forEach(cd => {
      const targetDate = new Date(cd.getAttribute('data-date')).getTime();

      // Clear existing interval if any to prevent memory leaks
      if (cd.dataset.intervalId) clearInterval(parseInt(cd.dataset.intervalId));

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
          clearInterval(interval);
          cd.innerHTML = "Event Started";
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        cd.innerHTML = `<i class="fa-regular fa-clock"></i> Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
      }, 1000);

      cd.dataset.intervalId = interval;
    });
  }
};

// =========================================================================
// PARTICIPATE PAGE DYNAMIC RENDERING (participate.html)
// =========================================================================

const EventParticipate = {
  init() {
    if (!document.getElementById('dynamicParticipateGrid')) return;
    this.renderGrid();
  },

  renderGrid() {
    const grid = document.getElementById('dynamicParticipateGrid');
    const emptyState = document.getElementById('participateEmptyState');
    if (!grid) return;

    grid.innerHTML = '';
    let events = EventManager.getPublicEvents();

    if (events.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      grid.style.display = 'grid'; // Reverts to CSS grid defined by .grid-cards
      if (emptyState) emptyState.style.display = 'none';
    }

    events.forEach((evt, index) => {
      const delay = (index % 3) * 100;
      const dateObj = new Date(evt.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      let catBadgeClass = 'badge-tech'; let catIcon = 'fa-microchip';
      if (evt.category === 'Workshop') { catBadgeClass = 'badge-workshop'; catIcon = 'fa-laptop-code'; }
      if (evt.category === 'Cultural') { catBadgeClass = 'badge-culture'; catIcon = 'fa-masks-theater'; }
      if (evt.category === 'Hackathon') { catBadgeClass = 'badge-urgent'; catIcon = 'fa-shield-halved'; }

      const isCompleted = evt.status === 'Completed';
      const isFull = evt.registered >= evt.seats;

      let xpToRender = parseInt(evt.xp) || 0;
      if (typeof SettingsManager !== 'undefined' && SettingsManager.settings) {
        const multiplier = SettingsManager.settings.configuration.globalXpMultiplier || 1.0;
        xpToRender = Math.round(xpToRender * multiplier);
      }

      const card = document.createElement('label');
      card.className = `interactive-card glass selectable-card event-tile ${isCompleted ? 'disabled-card' : ''}`;
      if (isCompleted) {
        card.style.opacity = '0.6';
        card.style.cursor = 'not-allowed';
      }
      card.setAttribute('data-aos', 'zoom-in');
      card.setAttribute('data-aos-delay', delay);
      card.setAttribute('data-xp', xpToRender); // Store multiplied XP
      card.setAttribute('data-category', evt.category);

      card.innerHTML = `
                <input type="checkbox" value="${evt.title}" data-date="${formattedDate}" data-venue="${evt.venue}" ${isCompleted ? 'disabled' : ''}>
                <div class="checkmark-circle"><i class="fa-solid fa-check"></i></div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div class="badge ${catBadgeClass}"><i class="fa-solid ${catIcon}"></i> ${evt.category}</div>
                    <div class="xp-badge ${xpToRender >= 300 ? 'glow' : ''}">+${xpToRender} XP</div>
                </div>

                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; line-height: 1.3; max-width: 85%;">${evt.title}</h3>

                <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    <span><i class="fa-solid fa-user-group ${isFull ? 'text-danger' : 'text-warning'}"></i> ${evt.registered}/${evt.seats} Registered</span>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary-color);">
                    <p class="text-secondary" style="font-size: 0.9rem; margin: 0; display: flex; flex-direction: column; gap: 0.3rem;">
                        <span><i class="fa-solid fa-calendar-day" style="width: 20px;"></i> ${formattedDate} | ${evt.time}</span>
                        <span><i class="fa-solid fa-location-dot" style="width: 20px;"></i> ${evt.venue}</span>
                        ${isCompleted
          ? '<span class="text-success" style="font-weight: 500; margin-top: 0.5rem;"><i class="fa-solid fa-check-double"></i> Completed (No selection)</span>'
          : '<span class="text-warning" style="font-weight: 500; margin-top: 0.5rem;"><i class="fa-solid fa-clock"></i> ' + evt.status + '</span>'
        }
                    </p>
                </div>
            `;
      grid.appendChild(card);
    });
  }
};

// Start Explore & Participate Page renderers
document.addEventListener('DOMContentLoaded', () => {
  if (typeof EventExplore !== 'undefined') EventExplore.init();
  if (typeof EventParticipate !== 'undefined') EventParticipate.init();
});

// =========================================================================
// ROLE-BASED AUTHENTICATION SYSTEM (MOCK JWT)
// =========================================================================

const AuthManager = {
  users: [],

  init() {
    this.loadUsers();
    this.updateNavbar();
  },

  loadUsers() {
    const stored = localStorage.getItem('eventSys_users');
    if (stored) {
      this.users = JSON.parse(stored);
    } else {
      // Seed default users
      this.users = [
        {
          id: 'admin',
          name: 'Root Admin',
          email: 'admin@eventsys.edu',
          password: 'admin', // in real app, these would be hashed
          role: 'admin',
          department: 'System'
        },
        {
          id: '2026cse101',
          name: 'Alex Carter',
          email: 'alex.c@student.edu',
          password: 'password',
          role: 'student',
          department: 'CSE'
        }
      ];
      this.saveUsers();
    }
  },

  saveUsers() {
    localStorage.setItem('eventSys_users', JSON.stringify(this.users));
  },

  register(userData) {
    // Check if ID already exists
    const exists = this.users.find(u => u.id === userData.id.toLowerCase());
    if (exists) return { success: false, message: 'Register Number already exists.' };

    userData.id = userData.id.toLowerCase();
    userData.role = 'student'; // Force student role on registration
    this.users.push(userData);
    this.saveUsers();

    return { success: true, message: 'Profile created successfully.' };
  },

  login(id, password) {
    const user = this.users.find(u => u.id === id.toLowerCase() && u.password === password);
    if (!user) return { success: false, message: 'Invalid credentials.' };

    // Generate mock JWT token
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));

    // Expires in 24 hours
    const exp = new Date().getTime() + (24 * 60 * 60 * 1000);
    const payload = btoa(JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name,
      exp: exp
    }));

    const signature = btoa('mock_signature'); // Fake signature

    const token = `${header}.${payload}.${signature}`;
    sessionStorage.setItem('eventSys_token', token);

    this.updateNavbar();
    return { success: true, role: user.role, id: user.id };
  },

  logout() {
    sessionStorage.removeItem('eventSys_token');
    this.updateNavbar();
    window.location.href = 'index.html';
  },

  verifyToken() {
    const token = sessionStorage.getItem('eventSys_token');
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (new Date().getTime() > payload.exp) {
        sessionStorage.removeItem('eventSys_token');
        return null; // Expired
      }
      return payload;
    } catch (e) {
      return null; // Invalid token format
    }
  },

  guard(allowedRoles = [], requireIdMatch = false) {
    const payload = this.verifyToken();

    if (!payload) {
      // Not logged in or expired
      window.location.href = 'login.html';
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      // Role not authorized - redirect to home
      window.location.href = 'index.html';
      return;
    }

    if (requireIdMatch) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id');

      if (!urlId || urlId.toLowerCase() !== payload.id.toLowerCase()) {
        // ID mismatch - trying to access someone else's dashboard
        // Redirect them to their own dashboard
        window.location.href = `student-dashboard.html?id=${payload.id}`;
        return;
      }
    }

    // If we reach here, they are authorized!
  },

  updateNavbar() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.updateNavbarDOM());
    } else {
      this.updateNavbarDOM();
    }
  },

  updateNavbarDOM() {
    const payload = this.verifyToken();
    const authBtnContainer = document.querySelector('.nav-actions');

    if (!authBtnContainer) return;

    // Look for existing primary button to replace
    const existingBtn = authBtnContainer.querySelector('.btn-primary');
    if (existingBtn) {
      if (payload) {
        const dashboardLink = payload.role === 'admin' ? 'admin.html' : `student-dashboard.html?id=${payload.id}`;
        existingBtn.outerHTML = `
                <div class="user-dropdown" style="position: relative; display: inline-block;">
                    <button class="btn btn-primary" style="padding: 0.6rem 1.5rem; display: flex; align-items: center; gap: 0.5rem;" onclick="this.nextElementSibling.classList.toggle('show')">
                        <i class="fa-solid fa-user-circle"></i> ${payload.name.split(' ')[0]}
                    </button>
                    <div class="dropdown-menu glass" style="display: none; position: absolute; top: 110%; right: 0; min-width: 150px; z-index: 100; border-radius: var(--radius-md); padding: 0.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <a href="${dashboardLink}" style="display: block; padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; border-radius: var(--radius-sm); margin-bottom: 0.25rem;"><i class="fa-solid fa-gauge-high" style="margin-right: 0.5rem;"></i> Dashboard</a>
                        <a href="#" onclick="AuthManager.logout()" style="display: block; padding: 0.5rem 1rem; color: var(--text-danger); text-decoration: none; border-radius: var(--radius-sm);"><i class="fa-solid fa-sign-out-alt" style="margin-right: 0.5rem;"></i> Logout</a>
                    </div>
                </div>
              `;

        // Add a bit of CSS for dropdown to exist cleanly
        let dropdownStyle = document.getElementById('dropdown-styles');
        if (!dropdownStyle) {
          dropdownStyle = document.createElement('style');
          dropdownStyle.id = 'dropdown-styles';
          dropdownStyle.innerHTML = `
                    .dropdown-menu.show { display: block !important; }
                    .dropdown-menu a:hover { background: rgba(255,255,255,0.05); }
                  `;
          document.head.appendChild(dropdownStyle);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
          if (!e.target.closest('.user-dropdown')) {
            const dropdowns = document.querySelectorAll('.dropdown-menu.show');
            dropdowns.forEach(d => d.classList.remove('show'));
          }
        });
      } else {
        // Not logged in, ensure "Access Portal" is shown
        if (!existingBtn.href || !existingBtn.href.includes('login.html')) {
          existingBtn.outerHTML = `<a href="login.html" class="btn btn-primary" style="padding: 0.6rem 1.5rem;">Access Portal</a>`;
        }
      }
    } else {
      // If there's no btn-primary and user is NOT logged in, we might need to recreate it. 
      // This handles cases where we previously generated the dropdown and they logged out.
      const userDropdown = authBtnContainer.querySelector('.user-dropdown');
      if (userDropdown && !payload) {
        userDropdown.outerHTML = `<a href="login.html" class="btn btn-primary" style="padding: 0.6rem 1.5rem;">Access Portal</a>`;
      }
    }
  }
};

AuthManager.init();
