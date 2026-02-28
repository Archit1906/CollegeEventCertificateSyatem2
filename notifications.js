// =========================================================================
// NOTIFICATION SYSTEM
// =========================================================================

const NotificationSystem = {
    notifications: [],
    container: null,
    btn: null,
    badge: null,
    panel: null,
    body: null,

    init() {
        this.loadMockData();
        this.injectUI();
        this.attachEvents();
        this.startAutoSim();
    },

    loadMockData() {
        this.notifications = [
            { id: Date.now() + 1, type: 'system', icon: 'fa-rocket', title: 'New event created: Hackathon 2026', desc: 'A new flagship event has been added.', time: 'Just now', read: false },
            { id: Date.now() + 2, type: 'user', icon: 'fa-user-plus', title: 'New Registration', desc: 'Student Rahul registered for Tech Talk', time: '5m ago', read: false },
            { id: Date.now() + 3, type: 'cert', icon: 'fa-award', title: 'Certificate Issued', desc: 'Certificate issued to Neha Sharma', time: '1h ago', read: false },
            { id: Date.now() + 4, type: 'event', icon: 'fa-clock', title: 'Event Reminder', desc: 'Event deadline approaching for Symposia', time: '2h ago', read: true }
        ];
    },

    injectUI() {
        const navActions = document.querySelector('.nav-actions') || document.querySelector('.topbar-actions');
        if (!navActions) return;

        // Create wrapper
        this.container = document.createElement('div');
        this.container.className = 'notification-wrapper';

        // Notification Button
        this.btn = document.createElement('button');
        this.btn.className = 'notification-btn topbar-icon'; // topbar-icon ensures admin styling works too
        this.btn.innerHTML = `<i class="fa-regular fa-bell"></i>`;

        // Notification Badge
        this.badge = document.createElement('span');
        this.badge.className = 'notification-badge hidden';

        this.btn.appendChild(this.badge);
        this.container.appendChild(this.btn);

        // Notification Panel
        this.panel = document.createElement('div');
        this.panel.className = 'notification-panel glass';

        // Panel Header
        const header = document.createElement('div');
        header.className = 'notification-header';
        header.innerHTML = `
      <h3><i class="fa-solid fa-bell"></i> Notifications</h3>
      <button class="notification-clear" id="clearAllNotifications">Clear All</button>
    `;

        // Panel Body
        this.body = document.createElement('div');
        this.body.className = 'notification-body';

        // Panel Footer
        const footer = document.createElement('div');
        footer.className = 'notification-footer';
        footer.innerHTML = `<a href="#">View All Notifications</a>`;

        this.panel.appendChild(header);
        this.panel.appendChild(this.body);
        this.panel.appendChild(footer);

        this.container.appendChild(this.panel);

        // Insert logic
        const profile = document.querySelector('.admin-profile');
        if (profile) {
            navActions.insertBefore(this.container, profile);
        } else {
            navActions.insertBefore(this.container, navActions.firstChild);
        }

        this.render();
    },

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    },

    updateBadge() {
        const count = this.getUnreadCount();
        if (count > 0) {
            this.badge.textContent = count > 9 ? '9+' : count;
            this.badge.classList.remove('hidden');
            // Trigger animation by cloning
            const newBadge = this.badge.cloneNode(true);
            this.btn.replaceChild(newBadge, this.badge);
            this.badge = newBadge;
        } else {
            this.badge.classList.add('hidden');
        }
    },

    render() {
        this.body.innerHTML = '';

        if (this.notifications.length === 0) {
            this.body.innerHTML = `
        <div class="notification-empty">
          <i class="fa-regular fa-bell-slash"></i>
          <p>No notifications</p>
        </div>
      `;
            this.updateBadge();
            return;
        }

        // Sort to put newest first
        const sorted = [...this.notifications].sort((a, b) => b.id - a.id).slice(0, 10);

        sorted.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-item ${!notif.read ? 'unread' : ''}`;
            item.onclick = (e) => this.markAsRead(notif.id, e);

            item.innerHTML = `
        <div class="notification-icon icon-${notif.type}">
          <i class="fa-solid ${notif.icon}"></i>
        </div>
        <div class="notification-content">
          <h4 class="notification-title">${notif.title}</h4>
          <p class="notification-desc">${notif.desc}</p>
          <span class="notification-time">${notif.time}</span>
        </div>
        <div class="unread-dot"></div>
      `;
            this.body.appendChild(item);
        });

        this.updateBadge();
    },

    attachEvents() {
        this.btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.panel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        const clearBtn = this.panel.querySelector('#clearAllNotifications');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearAll();
            });
        }
    },

    markAsRead(id, e) {
        if (e) e.stopPropagation();
        const notif = this.notifications.find(n => n.id === id);
        if (notif && !notif.read) {
            notif.read = true;
            this.render();
        }
    },

    clearAll() {
        this.notifications.forEach(n => n.read = true);
        this.render();
    },

    addNotification(notif) {
        this.notifications.push({
            id: Date.now(),
            type: notif.type || 'system',
            icon: notif.icon || 'fa-bell',
            title: notif.title,
            desc: notif.desc,
            time: 'Just now',
            read: false
        });

        // Sort and limit to 10
        this.notifications.sort((a, b) => b.id - a.id);
        if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10);
        }

        this.render();
    },

    startAutoSim() {
        const mockEvents = [
            { type: 'user', icon: 'fa-user-check', title: 'New Sign In', desc: 'Secure login detected from new IP' },
            { type: 'event', icon: 'fa-calendar-check', title: 'Event Updated', desc: 'Cyber Security Workshop schedule changed' },
            { type: 'cert', icon: 'fa-award', title: 'Milestone Reached', desc: 'Department reached 500 certificates issued!' },
            { type: 'system', icon: 'fa-server', title: 'System Status', desc: 'Database backup completed successfully' }
        ];

        setInterval(() => {
            const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
            this.addNotification(randomEvent);
        }, 15000); // Add a new notification every 15 seconds
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
});
