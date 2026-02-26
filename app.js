document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
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

  // Dark Mode Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;
  const icon = themeToggle?.querySelector('i');

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (icon) icon.classList.replace('fa-moon', 'fa-sun');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (icon) icon.classList.replace('fa-sun', 'fa-moon');
      } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
      }
    });
  }

  // Scroll Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-element').forEach(el => {
    observer.observe(el);
  });
  
  // Set Active Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
});

// Utility to show modals
window.showModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
};
