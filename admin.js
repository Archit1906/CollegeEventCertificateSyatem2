document.addEventListener('DOMContentLoaded', () => {

    // --- Sidebar Logic ---
    const sidebar = document.getElementById('adminSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // Store preference
            localStorage.setItem('adminSidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        // Restore state
        if (localStorage.getItem('adminSidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
    }

    // --- Module Navigation ---
    const navLinks = document.querySelectorAll('.sidebar-item[data-target]');
    const sections = document.querySelectorAll('.module-section');

    function switchModule(targetId) {
        // Hide all
        sections.forEach(sec => sec.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        // Show target
        const targetSection = document.getElementById(targetId);
        const targetLink = document.querySelector(`.sidebar-item[data-target="${targetId}"]`);

        if (targetSection) targetSection.classList.add('active');
        if (targetLink) targetLink.classList.add('active');

        // Re-render charts if dashboard is active to ensure proper canvas sizing
        if (targetId === 'dashboardModule' && window.renderCharts) {
            window.renderCharts();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            switchModule(target);
        });
    });

    // --- Theme Toggle specific to Admin (reusing global logic but adapting icon) ---
    const adminThemeToggle = document.getElementById('adminThemeToggle');
    const body = document.body;
    if (adminThemeToggle) {
        adminThemeToggle.addEventListener('click', () => {
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                adminThemeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                adminThemeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
            // Re-render charts for theme colors
            if (window.renderCharts) window.renderCharts();
        });

        // Setup initial icon
        if (localStorage.getItem('theme') === 'dark') {
            body.setAttribute('data-theme', 'dark');
            adminThemeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    // --- Chart.js Rendering (Dashboard) ---
    window.renderCharts = function () {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // Bar Chart: Dept Participation
        const ctxBar = document.getElementById('deptChart');
        if (ctxBar) {
            if (window.deptChartInstance) window.deptChartInstance.destroy();
            window.deptChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
                    datasets: [{
                        label: 'Students Participated',
                        data: [420, 380, 290, 150, 120],
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { grid: { color: gridColor }, ticks: { color: textColor } },
                        x: { grid: { display: false }, ticks: { color: textColor } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Doughnut Chart: Attendance Rate
        const ctxDoughnut = document.getElementById('attendanceChart');
        if (ctxDoughnut) {
            if (window.attChartInstance) window.attChartInstance.destroy();
            window.attChartInstance = new Chart(ctxDoughnut, {
                type: 'doughnut',
                data: {
                    labels: ['Present', 'Absent'],
                    datasets: [{
                        data: [82, 18],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
                    cutout: '75%'
                }
            });
        }

        // Line Chart: Monthly Registrations
        const ctxLine = document.getElementById('regChart');
        if (ctxLine) {
            if (window.regChartInstance) window.regChartInstance.destroy();
            window.regChartInstance = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Registrations',
                        data: [120, 250, 380, 850, 620, 300],
                        borderColor: '#a855f7',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        pointBackgroundColor: '#a855f7'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { grid: { color: gridColor }, ticks: { color: textColor } },
                        x: { grid: { color: gridColor }, ticks: { color: textColor } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    };

    // Initial chart render
    if (typeof Chart !== 'undefined') {
        window.renderCharts();
    }

    // --- Animation Skeletons logic ---
    // Simulate loading data dynamically
    const skeletons = document.querySelectorAll('.load-simulate');
    setTimeout(() => {
        skeletons.forEach(el => {
            el.classList.remove('skeleton');
            if (el.dataset.value) el.innerHTML = el.dataset.value;
        });
    }, 1000);

    // ---// Sliding Drawer Logic
    window.openDrawer = function (title) {
        const drawer = document.getElementById('slideDrawer');
        const dTitle = document.getElementById('drawerTitle');
        const dBody = document.getElementById('drawerBody');
        const backdrop = document.getElementById('drawerBackdrop') || createBackdrop();

        dTitle.innerText = title;

        // If opening a student profile, inject the advanced layout
        if (title.includes('Student Profile')) {
            const name = title.replace('Student Profile: ', '');
            dBody.innerHTML = `
      <div class="profile-cover"></div>
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff" class="profile-avatar">
      
      <div style="margin-top: 1rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.8rem; margin-bottom: 0.2rem;">${name}</h2>
        <p class="text-secondary" style="font-size: 0.9rem;">2026CSE101 • Computer Science and Engineering</p>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <span class="badge badge-tech">Gold Tier</span>
          <span class="status-badge success">Active</span>
        </div>
      </div>

      <div class="glass" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);"><i class="fa-solid fa-gamepad"></i> Gamification Stats</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">Level 12 (Master)</span>
          <span>1,450 / 2,000 XP</span>
        </div>
        <div class="progress-bar-container"><div class="progress-bar-fill" style="width: 72%; background: var(--primary-color);"></div></div>
      </div>

      <div class="glass" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
        <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);"><i class="fa-solid fa-chart-pie"></i> Participation Snapshot</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="background: rgba(0,0,0,0.02); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--card-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">14</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Events Attended</div>
          </div>
          <div style="background: rgba(0,0,0,0.02); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--card-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-warning);">3</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Certs Issued</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-primary" style="flex: 1;" onclick="window.showToast('Certificate Generated!', 'success')"><i class="fa-solid fa-award"></i> Issue Cert</button>
        <button class="btn btn-outline" style="flex: 1;"><i class="fa-solid fa-envelope"></i> Email</button>
      </div>
    `;
        } else {
            // Default fallback
            dBody.innerHTML = `
      <div class='glass' style='padding: 2rem; text-align: center; border-radius: var(--radius-lg);'>
        <i class='fa-solid fa-gears text-secondary' style='font-size: 3rem; margin-bottom: 1rem;'></i>
        <h3 style='margin-bottom: 0.5rem;'>Editor Interface</h3>
        <p class='text-secondary'>Dynamically loading form modules for ${title}...</p>
      </div>
    `;
        }

        drawer.classList.add('open');
        backdrop.classList.add('show');
    };

    function createBackdrop() {
        const bd = document.createElement('div');
        bd.id = 'drawerBackdrop';
        bd.className = 'drawer-backdrop';
        document.body.appendChild(bd);
        bd.addEventListener('click', window.closeDrawer);
        return bd;
    }

    window.closeDrawer = function () {
        document.getElementById('slideDrawer').classList.remove('open');
        const bd = document.getElementById('drawerBackdrop');
        if (bd) bd.classList.remove('show');
    };

    // Expose special functions for Student Grid
    window.openStudentProfile = function (name) {
        window.openDrawer(`Student Profile: ${name}`);
    };

    window.toggleBulkActions = function (checked) {
        const bar = document.getElementById('bulkActionsBar');
        if (checked) {
            bar.style.display = 'flex';
        } else {
            // Only hide if absolutely NO checkboxes are checked
            const anyChecked = Array.from(document.querySelectorAll('.smart-table tbody input[type="checkbox"]')).some(cb => cb.checked);
            if (!anyChecked) bar.style.display = 'none';
        }
    };

    /* === STUDENT GRID DYNAMIC LOGIC === */
    const studentData = [
        { id: '2026CSE101', name: 'Alex Carter', dept: 'Comp. Science', deptShort: 'CSE', level: 12, xp: 1450, maxXp: 2000, tier: 'Gold', tierClass: 'badge-tech', status: 'active', avatarBg: '6366f1' },
        { id: '2026ROB205', name: 'Sarah Jen', dept: 'Robotics', deptShort: 'ROB', level: 8, xp: 850, maxXp: 1000, tier: 'Silver', tierClass: 'badge-workshop', status: 'active', avatarBg: 'ec4899' },
        { id: '2026MEC042', name: 'Rahul Kumar', dept: 'Mechanical', deptShort: 'MEC', level: 1, xp: 10, maxXp: 100, tier: 'Bronze', tierClass: '', status: 'inactive', avatarBg: '475569' },
        { id: '2026CSE150', name: 'Emily Chen', dept: 'Comp. Science', deptShort: 'CSE', level: 15, xp: 2100, maxXp: 2500, tier: 'Diamond', tierClass: 'badge-tech', status: 'active', avatarBg: '10b981' },
        { id: '2026IT088', name: 'Marcus Doe', dept: 'Info Tech', deptShort: 'IT', level: 5, xp: 450, maxXp: 600, tier: 'Bronze', tierClass: '', status: 'active', avatarBg: 'f59e0b' },
        { id: '2026CIV012', name: 'Jordan Lee', dept: 'Civil', deptShort: 'CIV', level: 3, xp: 250, maxXp: 400, tier: 'Bronze', tierClass: '', status: 'inactive', avatarBg: '64748b' }
    ];

    let gridState = {
        data: [...studentData],
        currentPage: 1,
        itemsPerPage: 3,
        search: '',
        filter: 'All Students',
        sortBy: '',
        sortDesc: false,
        selectedIds: new Set()
    };

    window.renderStudentGrid = function () {
        const tbody = document.getElementById('studentGridBody');
        const pagInfo = document.getElementById('studentPagInfo');
        const pagControls = document.getElementById('studentPagination');
        if (!tbody) return;

        // Apply Filters
        let filtered = studentData.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(gridState.search.toLowerCase()) ||
                s.id.toLowerCase().includes(gridState.search.toLowerCase()) ||
                s.dept.toLowerCase().includes(gridState.search.toLowerCase());

            let matchChip = true;
            if (gridState.filter === 'Active') matchChip = s.status === 'active';
            if (gridState.filter === 'High XP') matchChip = s.xp > 1000;
            if (gridState.filter === 'CSE Dept') matchChip = s.deptShort === 'CSE';

            return matchSearch && matchChip;
        });

        // Apply Sorting
        if (gridState.sortBy) {
            filtered.sort((a, b) => {
                let valA = a[gridState.sortBy];
                let valB = b[gridState.sortBy];

                // special sort
                if (gridState.sortBy === 'name') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (gridState.sortBy === 'xp') {
                    valA = a.xp;
                    valB = b.xp;
                } else if (gridState.sortBy === 'status') {
                    valA = a.status;
                    valB = b.status;
                }

                if (valA < valB) return gridState.sortDesc ? 1 : -1;
                if (valA > valB) return gridState.sortDesc ? -1 : 1;
                return 0;
            });
        }

        // Pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / gridState.itemsPerPage) || 1;
        if (gridState.currentPage > totalPages) gridState.currentPage = totalPages;
        if (gridState.currentPage < 1) gridState.currentPage = 1;

        const startIdx = (gridState.currentPage - 1) * gridState.itemsPerPage;
        const endIdx = Math.min(startIdx + gridState.itemsPerPage, totalItems);
        const paginated = filtered.slice(startIdx, endIdx);

        // Update DOM
        tbody.innerHTML = '';

        if (paginated.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No students found matching your criteria.</td></tr>`;
        } else {
            paginated.forEach(s => {
                const isChecked = gridState.selectedIds.has(s.id) ? 'checked' : '';
                const pct = Math.min(Math.round((s.xp / s.maxXp) * 100), 100);

                const statusHtml = s.status === 'active'
                    ? `<div class="status-toggle" onclick="toggleStatusObj('${s.id}')" data-status="active"><span class="status-badge success"><i class="fa-solid fa-circle-dot" style="font-size: 0.6rem; margin-right: 0.3rem;"></i> Active</span></div>`
                    : `<div class="status-toggle" onclick="toggleStatusObj('${s.id}')" data-status="inactive"><span class="status-badge warning"><i class="fa-solid fa-circle-pause" style="font-size: 0.6rem; margin-right: 0.3rem;"></i> Inactive</span></div>`;

                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.onclick = () => window.openStudentProfile(s.name);

                tr.innerHTML = `
          <td onclick="event.stopPropagation()"><input type="checkbox" class="row-checkbox" data-id="${s.id}" ${isChecked} onchange="handleRowCheck(this)"></td>
          <td>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=${s.avatarBg}&color=fff" style="width: 40px; height: 40px; border-radius: 50%;">
              <div>
                <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">${s.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.id} • ${s.dept}</div>
              </div>
            </div>
          </td>
          <td style="${s.status === 'inactive' ? 'opacity:0.5' : ''}">
            <div style="width: 180px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
                <span style="font-weight: 600; color: ${s.status === 'active' ? 'var(--primary-color)' : 'var(--text-secondary)'};">Level ${s.level} <span class="badge ${s.tierClass || ''}" style="${!s.tierClass ? 'background:rgba(0,0,0,0.05); color:var(--text-secondary);' : ''} padding: 0.1rem 0.4rem; font-size: 0.65rem; margin-left: 0.3rem;">${s.tier}</span></span>
                <span style="color: var(--text-secondary);">${s.xp} XP</span>
              </div>
              <div class="progress-bar-container" style="height: 6px; background: rgba(0,0,0,0.05);"><div class="progress-bar-fill" style="width: ${pct}%; background: ${s.status === 'inactive' ? 'var(--text-secondary)' : 'var(--primary-color)'};"></div></div>
            </div>
          </td>
          <td onclick="event.stopPropagation()">${statusHtml}</td>
          <td style="text-align: right; padding-right: 1.5rem;" onclick="event.stopPropagation()">
             <button class="action-btn edit" title="Edit Student"><i class="fa-solid fa-pen"></i></button>
          </td>
        `;
                tbody.appendChild(tr);
            });
        }

        // Update Pagination Info
        if (pagInfo) pagInfo.innerText = totalItems > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} entries` : 'Showing 0 entries';

        // Update Pagination Controls
        if (pagControls) {
            let pagHtml = `<button class="btn btn-outline btn-sm" ${gridState.currentPage === 1 ? 'disabled' : ''} onclick="window.goToPage(${gridState.currentPage - 1})">Prev</button>`;
            for (let i = 1; i <= totalPages; i++) {
                if (i === gridState.currentPage) {
                    pagHtml += `<button class="btn btn-primary btn-sm">${i}</button>`;
                } else {
                    pagHtml += `<button class="btn btn-outline btn-sm" onclick="window.goToPage(${i})">${i}</button>`;
                }
            }
            pagHtml += `<button class="btn btn-outline btn-sm" ${gridState.currentPage === totalPages ? 'disabled' : ''} onclick="window.goToPage(${gridState.currentPage + 1})">Next</button>`;
            pagControls.innerHTML = pagHtml;
        }

        // Check Select All box state
        const selectAll = document.getElementById('selectAllStudents');
        if (selectAll) {
            selectAll.checked = paginated.length > 0 && paginated.every(s => gridState.selectedIds.has(s.id));
        }

        window.updateBulkActionsBarArr();
    };

    window.goToPage = function (page) {
        gridState.currentPage = page;
        window.renderStudentGrid();
    };

    window.handleRowCheck = function (cb) {
        const id = cb.getAttribute('data-id');
        if (cb.checked) gridState.selectedIds.add(id);
        else gridState.selectedIds.delete(id);

        // Check if we need to check the "Select All"
        const tbody = document.getElementById('studentGridBody');
        const allCbs = Array.from(tbody.querySelectorAll('.row-checkbox'));
        const selectAll = document.getElementById('selectAllStudents');
        if (selectAll) {
            selectAll.checked = allCbs.every(c => c.checked) && allCbs.length > 0;
        }
        window.updateBulkActionsBarArr();
    };

    const selectAllHtml = document.getElementById('selectAllStudents');
    if (selectAllHtml) {
        selectAllHtml.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const allCbs = document.querySelectorAll('.row-checkbox');
            allCbs.forEach(cb => {
                cb.checked = isChecked;
                const id = cb.getAttribute('data-id');
                if (isChecked) gridState.selectedIds.add(id);
                else gridState.selectedIds.delete(id);
            });
            window.updateBulkActionsBarArr();
        });
    }

    window.updateBulkActionsBarArr = function () {
        const bar = document.getElementById('bulkActionsBar');
        if (!bar) return;
        if (gridState.selectedIds.size > 0) {
            bar.style.display = 'flex';
            bar.querySelector('span').innerText = `${gridState.selectedIds.size} Students Selected`;
        } else {
            bar.style.display = 'none';
        }
    }

    window.toggleStatusObj = function (id) {
        const student = studentData.find(s => s.id === id);
        if (!student) return;

        if (student.status === 'active') {
            student.status = 'inactive';
            window.showToast('Student Suspended.', 'warning');
        } else {
            student.status = 'active';
            window.showToast('Student Activated.', 'success');
        }
        window.renderStudentGrid();
    };

    // Search Input Listener
    const searchInput = document.getElementById('studentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            gridState.search = e.target.value;
            gridState.currentPage = 1;
            window.renderStudentGrid();
        });
    }

    // Filter Chips Listener
    const filterChips = document.querySelectorAll('#studentFilterChips .chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            if (chip.innerText.includes('Clear')) {
                gridState.filter = 'All Students';
                gridState.search = '';
                if (searchInput) searchInput.value = '';
                filterChips.forEach(c => c.classList.remove('active'));
                filterChips[0].classList.add('active'); // Set 'All Students' active
            } else {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                gridState.filter = chip.innerText;
            }
            gridState.currentPage = 1;
            window.renderStudentGrid();
        });
    });

    // Sorting Headers
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.getAttribute('data-sort');
            if (gridState.sortBy === sortKey) {
                gridState.sortDesc = !gridState.sortDesc;
            } else {
                gridState.sortBy = sortKey;
                gridState.sortDesc = false;
            }
            // Update icons
            document.querySelectorAll('.sortable i').forEach(i => i.className = 'fa-solid fa-sort');
            const icon = th.querySelector('i');
            if (icon) {
                icon.className = gridState.sortDesc ? 'fa-solid fa-sort-down' : 'fa-solid fa-sort-up';
                icon.style.color = 'var(--primary-color)';
            }
            window.renderStudentGrid();
        });
    });

    // Initialize Rendering
    if (document.getElementById('studentGridBody')) {
        window.renderStudentGrid();
    }

    // --- Toast Notification System ---
    window.showToast = function (message, type = "success") {
        const container = document.getElementById('toastWrap') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createToastContainer() {
        const div = document.createElement('div');
        div.id = 'toastWrap';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    }

});
