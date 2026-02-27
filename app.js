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
// EVENT MANAGEMENT SYSTEM (LOCAL STORAGE)
// =========================================================================

const EventManager = {
  events: [],

  init() {
    this.loadEvents();
    this.setupAdminForm();
    if (window.location.pathname.includes('admin.html')) {
      this.renderAdminTable();
    }
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
          date: '2026-10-15T09:00',
          seats: 500,
          registered: 420,
          venue: 'Main Auditorium',
          featured: true,
          status: 'upcoming'
        },
        {
          id: 'evt_' + (Date.now() + 1),
          title: 'AI & Machine Learning Deep Dive',
          desc: 'Intensive hands-on workshop focused on building neural networks.',
          category: 'Workshop',
          xp: 200,
          date: '2026-10-20T10:00',
          seats: 150,
          registered: 145,
          venue: 'Lab 4, Block IT',
          featured: false,
          status: 'upcoming'
        }
      ];
      this.saveEvents();
    }
  },

  saveEvents() {
    localStorage.setItem('eventSys_events', JSON.stringify(this.events));
  },

  setupAdminForm() {
    const form = document.getElementById('createEventForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newEvent = {
        id: 'evt_' + Date.now(),
        title: document.getElementById('evTitle').value,
        desc: document.getElementById('evDesc').value,
        category: document.getElementById('evCat').value,
        xp: parseInt(document.getElementById('evXP').value),
        date: document.getElementById('evDate').value,
        seats: parseInt(document.getElementById('evSeats').value),
        registered: 0, // Starts at 0
        venue: document.getElementById('evVenue').value,
        featured: document.getElementById('evFeatured').checked,
        status: 'upcoming',
        created: new Date().toISOString()
      };

      this.events.unshift(newEvent); // Add to beginning
      this.saveEvents();

      // UI Feedback
      if (window.showToast) window.showToast('Event Published Successfully 🎉', 'success');
      form.reset();
      this.renderAdminTable();
    });
  },

  renderAdminTable() {
    const tbody = document.getElementById('adminEventsTbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-secondary);">No events found. Create one above!</td></tr>`;
      return;
    }

    this.events.forEach(evt => {

      const dateObj = new Date(evt.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const fillPerc = Math.min((evt.registered / evt.seats) * 100, 100);

      let catBadgeClass = 'badge-tech';
      let catIcon = 'fa-microchip';
      if (evt.category === 'Workshop') { catBadgeClass = 'badge-workshop'; catIcon = 'fa-laptop-code'; }
      if (evt.category === 'Cultural') { catBadgeClass = 'badge-culture'; catIcon = 'fa-masks-theater'; }
      if (evt.category === 'Hackathon') { catBadgeClass = 'badge-urgent'; catIcon = 'fa-shield-halved'; }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.3rem;">${evt.title}
                ${evt.featured ? '<i class="fa-solid fa-star text-warning" style="font-size: 0.7rem; margin-left: 0.5rem;" title="Featured"></i>' : ''}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-solid fa-location-dot"></i> ${evt.venue}</div>
        </td>
        <td>
            <div class="badge ${catBadgeClass}" style="margin-bottom: 0.4rem; font-size: 0.7rem;"><i class="fa-solid ${catIcon}"></i> ${evt.category}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--primary-color);">+${evt.xp} XP</div>
        </td>
        <td>
            <div style="font-size: 0.85rem; margin-bottom: 0.4rem;"><i class="fa-regular fa-calendar"></i> ${formattedDate}</div>
            <div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 60px; height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; overflow: hidden;">
                    <div style="height: 100%; width: ${fillPerc}%; background: ${fillPerc > 90 ? 'var(--color-danger)' : 'var(--primary-color)'};"></div>
                </div>
                <span>${evt.registered}/${evt.seats}</span>
            </div>
        </td>
        <td>
            <div class="status-toggle" data-status="${evt.status}">
                 <span class="status-badge ${evt.status === 'upcoming' ? 'info' : 'success'}"><i class="fa-solid fa-circle-dot" style="font-size: 0.6rem; margin-right: 0.3rem;"></i> ${evt.status}</span>
            </div>
        </td>
        <td style="text-align: right;">
            <button class="action-btn edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" title="Delete" onclick="EventManager.deleteEvent('${evt.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event? This action will remove it globally.")) {
      this.events = this.events.filter(e => e.id !== id);
      this.saveEvents();
      this.renderAdminTable();
      if (window.showToast) window.showToast('Event Deleted.', 'info');
    }
  }
};

// Start the Event Manager
EventManager.init();
