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

        // 1. Process Event Data for Dashboard
        let activeEventsCount = 0;
        let totalRegistrations = 0;
        let completedEventsCount = 0;

        const events = (typeof EventManager !== 'undefined') ? EventManager.events : [];

        // Count active events and registrations
        events.forEach(evt => {
            if (evt.status !== 'Completed') {
                activeEventsCount++;
            } else {
                completedEventsCount++;
            }
            totalRegistrations += (evt.registered || 0);
        });

        // Update Top Cards dynamically
        const cards = document.querySelectorAll('#dashboardModule .stat-val');
        if (cards.length >= 3) {
            // Keep Students static for now since we don't have a user DB yet
            cards[1].innerHTML = activeEventsCount;
            cards[1].classList.remove('skeleton');

            cards[2].innerHTML = totalRegistrations.toLocaleString();
            cards[2].classList.remove('skeleton');

            // Just simulating certs issued as some fraction of completions
            const certsIssued = Math.floor(totalRegistrations * 0.85);
            cards[3].innerHTML = certsIssued.toLocaleString();
            cards[3].classList.remove('skeleton');
        }


        // Bar Chart: Dept Participation (Simulated distribution based on total registrations)
        const ctxBar = document.getElementById('deptChart');
        if (ctxBar) {
            if (window.deptChartInstance) window.deptChartInstance.destroy();
            const baseReg = totalRegistrations > 0 ? totalRegistrations : 1000;
            window.deptChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
                    datasets: [{
                        label: 'Students Participated',
                        data: [
                            Math.floor(baseReg * 0.4),
                            Math.floor(baseReg * 0.25),
                            Math.floor(baseReg * 0.15),
                            Math.floor(baseReg * 0.1),
                            Math.floor(baseReg * 0.1)
                        ],
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
                        data: [82, 18], // Keeping attendance simulated for now
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

            // Map event dates to months
            const monthlyData = [0, 0, 0, 0, 0, 0];
            const currentMonth = new Date().getMonth();
            const labels = [];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            for (let i = 5; i >= 0; i--) {
                const m = (currentMonth - i + 12) % 12;
                labels.push(monthNames[m]);
            }

            events.forEach(evt => {
                if (evt.date) {
                    const evtMonth = new Date(evt.date).getMonth();
                    // Basic check if it falls in the last 6 months
                    // For simplicity, just randomly distributing them if they exist or plotting exact month match.
                    const labelIndex = labels.indexOf(monthNames[evtMonth]);
                    if (labelIndex !== -1) {
                        monthlyData[labelIndex] += (evt.registered || Math.floor(Math.random() * 50));
                    }
                }
            });

            // If no data, provide a simulated curve
            if (monthlyData.every(x => x === 0)) {
                monthlyData.splice(0, 6, 120, 250, 380, 850, 620, 300);
            }

            window.regChartInstance = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Registrations',
                        data: monthlyData,
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
        setTimeout(window.renderCharts, 100); // slight delay to let EventManager load
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

        // Update top stats
        const studentStats = document.querySelectorAll('#studentsModule .stat-val');
        if (studentStats.length >= 5) {
            const total = studentData.length;
            const active = studentData.filter(s => s.status === 'active').length;
            const inactive = total - active;
            const avgXp = total > 0 ? Math.round(studentData.reduce((acc, s) => acc + s.xp, 0) / total) : 0;
            const certEligible = studentData.filter(s => s.xp >= 1000).length;

            studentStats[0].innerHTML = total;
            studentStats[0].classList.remove('skeleton');

            studentStats[1].innerHTML = active;
            studentStats[1].classList.remove('skeleton');

            studentStats[2].innerHTML = inactive;
            studentStats[2].classList.remove('skeleton');

            studentStats[3].innerHTML = avgXp + ' XP';
            studentStats[3].classList.remove('skeleton');

            studentStats[4].innerHTML = certEligible;
            studentStats[4].classList.remove('skeleton');
        }

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

    // --- Export & Reporting Functionality ---
    window.exportDashboardReport = function () {
        if (window.showToast) window.showToast("Generating Complete Dashboard Report...", "info");
        setTimeout(() => {
            if (window.showToast) window.showToast("Dashboard Report Downloaded.", "success");
        }, 1500);
    };

    window.exportStudentsCSV = function () {
        if (typeof studentData === 'undefined') {
            if (window.showToast) window.showToast("No student data available to export.", "error");
            return;
        }

        const headers = ['ID', 'Name', 'Department', 'Level', 'XP', 'Status'];
        const rows = studentData.map(s => [s.id, `"${s.name}"`, `"${s.dept}"`, s.level, s.xp, s.status]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_directory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.showToast) window.showToast("CSV Export Complete.", "success");
    };

    window.exportStudentsExcel = function () {
        if (window.showToast) window.showToast("Exporting to Excel Format...", "info");
        setTimeout(() => {
            window.exportStudentsCSV(); // Fallback to CSV format for demo purposes
        }, 1000);
    };

    window.printStudentsData = function () {
        if (window.showToast) window.showToast("Preparing document for printing...", "info");
        setTimeout(() => {
            window.print();
        }, 500);
    };

    window.exportStudentsReport = function () {
        if (window.showToast) window.showToast("Compiling Comprehensive Analytics Report...", "info");
        setTimeout(() => {
            if (window.showToast) window.showToast("Analytics Report Sent to Email.", "success");
        }, 2000);
    };

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

// =========================================================================
// EVENT MANAGEMENT SYSTEM ADMIN LOGIC
// =========================================================================

const EventAdmin = {
    state: {
        currentPage: 1,
        itemsPerPage: 5,
        search: '',
        filter: 'All Events',
        sortBy: 'date',
        sortDesc: true,
        selectedIds: new Set()
    },

    init() {
        this.setupForm();
        this.setupGridListeners();
        this.renderGrid();
    },

    setupForm() {
        const form = document.getElementById('createEventForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Gather Data
            const newEvent = {
                id: 'evt_' + Date.now(),
                title: document.getElementById('evTitle').value,
                desc: document.getElementById('evDesc').value,
                category: document.getElementById('evCat').value,
                xp: parseInt(document.getElementById('evXP').value),
                date: document.getElementById('evDate').value.split('T')[0],
                time: document.getElementById('evDate').value.split('T')[1] || '00:00',
                seats: parseInt(document.getElementById('evSeats').value),
                venue: document.getElementById('evVenue').value,
                featured: document.getElementById('evFeatured').checked,
                visibility: 'Public', // Default for now
                registered: 0,
                status: 'Upcoming',
                createdAt: new Date().toISOString()
            };

            // Assuming EventManager is provided globally by app.js
            if (typeof EventManager !== 'undefined') {
                EventManager.addEvent(newEvent);
                if (window.showToast) window.showToast('Event Successfully Published', 'success');
                form.reset();
                this.renderGrid();
                if (window.renderCharts) window.renderCharts();
                if (window.renderModuleGrids) window.renderModuleGrids();
            } else {
                if (window.showToast) window.showToast('Error: EventManager not found.', 'error');
            }
        });
    },

    setupGridListeners() {
        // Search Input
        const searchInput = document.getElementById('eventSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.search = e.target.value.toLowerCase();
                this.state.currentPage = 1;
                this.renderGrid();
            });
        }

        // Filter Chips
        const filterChips = document.querySelectorAll('#eventsModule .filter-chips .chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.filter = chip.innerText;
                this.state.currentPage = 1;
                this.renderGrid();
            });
        });

        // Sorting Headers
        document.querySelectorAll('#adminEventsTable .sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortKey = th.getAttribute('data-sort');
                if (this.state.sortBy === sortKey) {
                    this.state.sortDesc = !this.state.sortDesc;
                } else {
                    this.state.sortBy = sortKey;
                    this.state.sortDesc = false;
                }

                document.querySelectorAll('#adminEventsTable .sortable i').forEach(i => i.className = 'fa-solid fa-sort');
                const icon = th.querySelector('i');
                if (icon) {
                    icon.className = this.state.sortDesc ? 'fa-solid fa-sort-down' : 'fa-solid fa-sort-up';
                    icon.style.color = 'var(--primary-color)';
                }
                this.renderGrid();
            });
        });

        // Select All Events check
        const selectAllHTML = document.getElementById('selectAllEvents');
        if (selectAllHTML) {
            selectAllHTML.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const cbs = document.querySelectorAll('#adminEventsTbody .row-checkbox');
                cbs.forEach(cb => {
                    cb.checked = isChecked;
                    const id = cb.getAttribute('data-id');
                    if (isChecked) this.state.selectedIds.add(id);
                    else this.state.selectedIds.delete(id);
                });
                this.updateBulkActionsBar();
            });
        }
    },

    handleRowCheck(cb) {
        const id = cb.getAttribute('data-id');
        if (cb.checked) this.state.selectedIds.add(id);
        else this.state.selectedIds.delete(id);

        this.updateBulkActionsBar();
    },

    updateBulkActionsBar() {
        const bar = document.getElementById('eventBulkActionsBar');
        const countSpan = document.getElementById('eventBulkCount');
        if (!bar) return;

        if (this.state.selectedIds.size > 0) {
            bar.style.display = 'flex';
            countSpan.innerText = `${this.state.selectedIds.size} Events Selected`;
        } else {
            bar.style.display = 'none';
        }

        // Update Select All Checkbox logic
        const tbody = document.getElementById('adminEventsTbody');
        if (!tbody) return;
        const allCbs = Array.from(tbody.querySelectorAll('.row-checkbox'));
        const selectAll = document.getElementById('selectAllEvents');
        if (selectAll && allCbs.length > 0) {
            selectAll.checked = allCbs.every(c => c.checked);
        }
    },

    renderGrid() {
        if (typeof EventManager === 'undefined') return;

        const tbody = document.getElementById('adminEventsTbody');
        const pagInfo = document.getElementById('eventPagInfo');
        const pagControls = document.getElementById('eventPagination');
        if (!tbody) return;

        let filtered = EventManager.events.filter(e => {
            const matchSearch = e.title.toLowerCase().includes(this.state.search) ||
                e.category.toLowerCase().includes(this.state.search);

            let matchChip = true;
            if (this.state.filter === 'Upcoming') matchChip = e.status.toLowerCase() === 'upcoming';
            if (this.state.filter === 'Completed') matchChip = e.status.toLowerCase() === 'completed';

            return matchSearch && matchChip;
        });

        // Sort
        if (this.state.sortBy) {
            filtered.sort((a, b) => {
                let valA = a[this.state.sortBy];
                let valB = b[this.state.sortBy];

                if (this.state.sortBy === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
                if (valA < valB) return this.state.sortDesc ? 1 : -1;
                if (valA > valB) return this.state.sortDesc ? -1 : 1;
                return 0;
            });
        }

        // Paginator
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / this.state.itemsPerPage) || 1;
        if (this.state.currentPage > totalPages) this.state.currentPage = totalPages;
        if (this.state.currentPage < 1) this.state.currentPage = 1;

        const startIdx = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIdx = Math.min(startIdx + this.state.itemsPerPage, totalItems);
        const paginated = filtered.slice(startIdx, endIdx);

        tbody.innerHTML = '';

        if (paginated.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No events found matching your criteria.</td></tr>`;
        } else {
            paginated.forEach(evt => {
                const isChecked = this.state.selectedIds.has(evt.id) ? 'checked' : '';
                const dateObj = new Date(evt.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const fillPerc = Math.min((evt.registered / evt.seats) * 100, 100);

                let catBadgeClass = 'badge-tech'; let catIcon = 'fa-microchip';
                if (evt.category === 'Workshop') { catBadgeClass = 'badge-workshop'; catIcon = 'fa-laptop-code'; }
                if (evt.category === 'Cultural') { catBadgeClass = 'badge-culture'; catIcon = 'fa-masks-theater'; }
                if (evt.category === 'Hackathon') { catBadgeClass = 'badge-urgent'; catIcon = 'fa-shield-halved'; }

                let statusClass = 'info';
                if (evt.status.toLowerCase() === 'completed') statusClass = 'success';
                if (evt.status.toLowerCase() === 'ongoing') statusClass = 'warning';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td onclick="event.stopPropagation()"><input type="checkbox" class="row-checkbox" data-id="${evt.id}" ${isChecked} onchange="EventAdmin.handleRowCheck(this)"></td>
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
                        <div style="font-size: 0.85rem; margin-bottom: 0.4rem;"><i class="fa-regular fa-calendar"></i> ${formattedDate} ${evt.time}</div>
                        <div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 60px; height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; width: ${fillPerc}%; background: ${fillPerc > 90 ? 'var(--color-danger)' : 'var(--primary-color)'};"></div>
                            </div>
                            <span>${evt.registered}/${evt.seats}</span>
                        </div>
                    </td>
                    <td>
                        <div class="status-toggle" onclick="EventAdmin.toggleStatus('${evt.id}')">
                            <span class="status-badge ${statusClass}" style="text-transform: capitalize;"><i class="fa-solid fa-circle-dot" style="font-size: 0.6rem; margin-right: 0.3rem;"></i> ${evt.status}</span>
                        </div>
                    </td>
                    <td style="text-align: right;">
                        <button class="action-btn edit" title="Edit" onclick="EventAdmin.editEvent('${evt.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete" title="Delete" onclick="EventAdmin.deleteEvent('${evt.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        if (pagInfo) pagInfo.innerText = totalItems > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} events` : 'Showing 0 events';

        if (pagControls) {
            let pagHtml = `<button class="btn btn-outline btn-sm" ${this.state.currentPage === 1 ? 'disabled' : ''} onclick="EventAdmin.goToPage(${this.state.currentPage - 1})">Prev</button>`;
            for (let i = 1; i <= totalPages; i++) {
                if (i === this.state.currentPage) {
                    pagHtml += `<button class="btn btn-primary btn-sm">${i}</button>`;
                } else {
                    pagHtml += `<button class="btn btn-outline btn-sm" onclick="EventAdmin.goToPage(${i})">${i}</button>`;
                }
            }
            pagHtml += `<button class="btn btn-outline btn-sm" ${this.state.currentPage === totalPages ? 'disabled' : ''} onclick="EventAdmin.goToPage(${this.state.currentPage + 1})">Next</button>`;
            pagControls.innerHTML = pagHtml;
        }

        const selectAllHTML = document.getElementById('selectAllEvents');
        if (selectAllHTML) {
            selectAllHTML.checked = paginated.length > 0 && paginated.every(e => this.state.selectedIds.has(e.id));
        }

        this.updateBulkActionsBar();
    },

    goToPage(pageNum) {
        this.state.currentPage = pageNum;
        this.renderGrid();
    },

    deleteEvent(id) {
        if (confirm("permanently delete this event?")) {
            EventManager.deleteEvent(id);
            this.renderGrid();
            if (window.renderCharts) window.renderCharts();
            if (window.renderModuleGrids) window.renderModuleGrids();
            if (window.showToast) window.showToast("Event Deleted.", "success");
        }
    },

    bulkDelete() {
        if (confirm(`Are you sure you want to delete ${this.state.selectedIds.size} events?`)) {
            this.state.selectedIds.forEach(id => {
                EventManager.deleteEvent(id);
            });
            this.state.selectedIds.clear();
            if (window.showToast) window.showToast("Bulk Deletion Complete.", "success");
            this.renderGrid();
            if (window.renderCharts) window.renderCharts();
            if (window.renderModuleGrids) window.renderModuleGrids();
        }
    },

    bulkMarkStatus(status) {
        this.state.selectedIds.forEach(id => {
            EventManager.updateEvent(id, { status: status });
        });
        this.state.selectedIds.clear();
        if (window.showToast) window.showToast(`Selected Events marked as ${status}.`, "success");
        this.renderGrid();
    },

    toggleStatus(id) {
        const evt = EventManager.getEventById(id);
        if (!evt) return;

        let newStatus = 'Upcoming';
        if (evt.status.toLowerCase() === 'upcoming') newStatus = 'Ongoing';
        else if (evt.status.toLowerCase() === 'ongoing') newStatus = 'Completed';

        EventManager.updateEvent(id, { status: newStatus });
        this.renderGrid();
    },

    editEvent(id) {
        window.openDrawer(`Edit Event ID: ${id}`);
        // In a real app we would populate form visually here.
    }
};

// Initialize after DOM if in admin
if (window.location.pathname.includes('admin.html')) {
    // Wait slightly to ensure EventManager from app.js is ready
    setTimeout(() => {
        if (typeof EventManager !== 'undefined') {
            EventAdmin.init();
        }
        if (window.renderModuleGrids) {
            window.renderModuleGrids();
        }
    }, 100);
}

/* === REGISTRATIONS AND CERTIFICATES RENDERER === */
window.renderModuleGrids = function () {
    if (typeof EventManager === 'undefined') return;
    const events = EventManager.events;

    // 1. Attedance Module Select binding
    const attendanceSelect = document.querySelector('#registrationsModule select');
    const attendanceTbody = document.querySelector('#registrationsModule tbody');

    if (attendanceSelect && attendanceTbody) {
        // Keep current value if selected
        const currentVal = attendanceSelect.value;
        attendanceSelect.innerHTML = '';

        events.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.innerText = e.title;
            if (e.id === currentVal) opt.selected = true;
            attendanceSelect.appendChild(opt);
        });

        // Map random students to the selected event to simulate attendance list
        attendanceTbody.innerHTML = '';
        if (events.length > 0) {
            // Get 3 random students for demonstration
            const randomStus = studentData.slice(0, 3);
            randomStus.forEach((stu, i) => {
                const isPresent = i === 1; // Arbitrarily make student 2 present
                const isAbsent = i === 2;

                let statusSpan = `<span class="status-badge warning" id="attGrp${i}">Registered</span>`;
                let btnHtml = `<button class="btn btn-outline" style="padding: 0.4rem 1rem; border-color: var(--color-success); color: var(--color-success);" onclick="document.getElementById('attGrp${i}').className='status-badge success'; document.getElementById('attGrp${i}').innerText='Present'; window.showToast('Marked Present', 'success'); this.disabled=true; this.innerText='Logged';">Mark Present</button>`;

                if (isPresent) {
                    statusSpan = `<span class="status-badge success">Present</span>`;
                    btnHtml = `<button class="btn btn-outline" style="padding: 0.4rem 1rem;" disabled>Logged</button>`;
                }
                if (isAbsent) {
                    statusSpan = `<span class="status-badge danger">Absent</span>`;
                    btnHtml = `<button class="btn btn-outline" style="padding: 0.4rem 1rem;" disabled>Logged</button>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${stu.name}</td>
                    <td>${stu.id}</td>
                    <td>Sep 12, 2026</td>
                    <td>${statusSpan}</td>
                    <td style="text-align: right;">${btnHtml}</td>
                 `;
                attendanceTbody.appendChild(tr);
            });
        } else {
            attendanceTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No events available.</td></tr>`;
        }
    }

    // 2. Certificates Module binding
    const certsTbody = document.querySelector('#certificatesModule tbody');
    if (certsTbody) {
        certsTbody.innerHTML = '';
        let certCount = 1;

        // Loop events that are completed and spawn a couple records
        events.filter(e => e.status === 'Completed').forEach(evt => {
            const stu = studentData[certCount % studentData.length];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: monospace; color: var(--text-secondary);">CERT-9${0 + certCount}4A-X</td>
                <td>${stu.name}</td>
                <td>${evt.title}</td>
                <td><span class="status-badge success">Issued</span></td>
                <td style="text-align: right;">
                    <a href="certificate.html" target="_blank" class="action-btn edit" title="Preview"><i class="fa-solid fa-eye"></i></a>
                    <button class="action-btn" style="color: var(--color-info);" title="Email"><i class="fa-solid fa-envelope"></i></button>
                    <button class="action-btn delete" title="Revoke" onclick="window.showToast('Certificate Revoked.', 'error'); this.closest('tr').style.opacity='0.5';"><i class="fa-solid fa-ban"></i></button>
                </td>
             `;
            certsTbody.appendChild(tr);
            certCount++;
        });

        if (certsTbody.innerHTML === '') {
            certsTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No completed events to issue certificates from.</td></tr>`;
        }
    }
};

// =========================================================================
// SYSTEM SETTINGS MODULE LOGIC
// =========================================================================

// Settings Tab Switching Logic
function initSettingsTabs() {
    const tabLinks = document.querySelectorAll('.settings-tab-link');
    const tabPanes = document.querySelectorAll('.settings-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active classes
            tabLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active to clicked and target
            link.classList.add('active');
            const targetId = link.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

// Track Form Changes to show Sticky Save Bar
function initSettingsFormTracking() {
    const settingsForms = document.querySelectorAll('.settings-pane input, .settings-pane textarea, .settings-pane select');
    const saveBar = document.getElementById('settingsSaveBar');

    settingsForms.forEach(input => {
        input.addEventListener('change', () => {
            if (saveBar && !saveBar.classList.contains('active')) {
                saveBar.classList.add('active');
            }
        });
        input.addEventListener('input', () => {
            if (saveBar && !saveBar.classList.contains('active')) {
                saveBar.classList.add('active');
            }
        });
    });
}

// Theme Selector functionality
function initThemeSelectors() {
    const themeCards = document.querySelectorAll('.theme-select-card');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            document.getElementById('settingsSaveBar').classList.add('active');
        });
    });
}

function hydrateSettingsForms() {
    if (typeof SettingsManager === 'undefined' || !SettingsManager.settings) return;
    const s = SettingsManager.settings;

    // Profile
    const fname = document.getElementById('st-fullname'); if (fname) fname.value = s.profile.fullName;
    const dname = document.getElementById('st-display'); if (dname) dname.value = s.profile.displayName;
    const email = document.getElementById('st-email'); if (email) email.value = s.profile.email;
    const phone = document.getElementById('st-phone'); if (phone) phone.value = s.profile.phone;
    const bio = document.querySelector('#form-profile textarea'); if (bio) bio.value = s.profile.bio;

    // Security
    const tfa = document.getElementById('sec-2fa'); if (tfa) tfa.checked = s.security.twoFactor;

    // Notifications
    const nIE = document.getElementById('notif-inapp-events'); if (nIE) nIE.checked = s.notifications.inAppEvents;
    const nEE = document.getElementById('notif-email-events'); if (nEE) nEE.checked = false; // Mock
    const nIS = document.getElementById('notif-inapp-security'); if (nIS) nIS.checked = s.notifications.inAppSecurity;
    const nES = document.getElementById('notif-email-security'); if (nES) nES.checked = true; // Mock

    // Preferences
    document.querySelectorAll('.theme-select-card').forEach(c => c.classList.remove('active'));
    const activeTheme = document.querySelector(`.theme-select-card[data-theme-val="${s.preferences.theme}"]`);
    if (activeTheme) activeTheme.classList.add('active');

    document.querySelectorAll('.color-swatch').forEach(c => c.classList.remove('active'));
    const activeColor = document.querySelector(`.color-swatch[data-color-val="${s.preferences.accentColor}"]`);
    if (activeColor) activeColor.classList.add('active');

    const pAnim = document.getElementById('pref-animations'); if (pAnim) pAnim.checked = s.preferences.animations;
    const pComp = document.getElementById('pref-compact'); if (pComp) pComp.checked = s.preferences.compactView;

    // Config
    const cXp = document.getElementById('cfg-xp-multiplier'); if (cXp) cXp.value = s.configuration.globalXpMultiplier;
}

document.addEventListener('DOMContentLoaded', () => {
    initSettingsTabs();
    initSettingsFormTracking();
    initThemeSelectors();

    // Hydrate form slightly later to ensure app.js loaded SettingsManager
    setTimeout(() => {
        hydrateSettingsForms();
    }, 100);
});

// Settings Action Functions Setup
window.saveSettings = function () {
    const btn = document.getElementById('btnSaveSettings');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...`;
    btn.disabled = true;

    // Gather data from DOM
    const profileData = {
        fullName: document.getElementById('st-fullname')?.value || '',
        displayName: document.getElementById('st-display')?.value || '',
        email: document.getElementById('st-email')?.value || '',
        phone: document.getElementById('st-phone')?.value || '',
        bio: document.querySelector('#form-profile textarea')?.value || ''
    };

    const securityData = {
        twoFactor: document.getElementById('sec-2fa')?.checked || false
    };

    const notifData = {
        inAppEvents: document.getElementById('notif-inapp-events')?.checked || false,
        inAppSecurity: document.getElementById('notif-inapp-security')?.checked || false
    };

    const activeThemeCard = document.querySelector('.theme-select-card.active');
    const activeColorSwatch = document.querySelector('.color-swatch.active');

    const prefData = {
        theme: activeThemeCard ? activeThemeCard.getAttribute('data-theme-val') : 'dark',
        accentColor: activeColorSwatch ? activeColorSwatch.getAttribute('data-color-val') : 'indigo',
        animations: document.getElementById('pref-animations')?.checked ?? true,
        compactView: document.getElementById('pref-compact')?.checked || false
    };

    const configData = {
        globalXpMultiplier: parseFloat(document.getElementById('cfg-xp-multiplier')?.value || 1.0)
    };

    // Simulate API Call & Save to LocalStorage
    setTimeout(() => {
        if (typeof SettingsManager !== 'undefined') {
            SettingsManager.updateSettings('profile', profileData);
            SettingsManager.updateSettings('security', securityData);
            SettingsManager.updateSettings('notifications', notifData);
            SettingsManager.updateSettings('preferences', prefData);
            SettingsManager.updateSettings('configuration', configData);
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
        const saveBar = document.getElementById('settingsSaveBar');
        if (saveBar) saveBar.classList.remove('active');
        if (window.showToast) window.showToast('System Settings successfully updated & synced globally.', 'success');
    }, 800);
};

window.discardSettings = function () {
    hydrateSettingsForms(); // Reset to local storage State
    const saveBar = document.getElementById('settingsSaveBar');
    if (saveBar) saveBar.classList.remove('active');
    if (window.showToast) window.showToast('Changes discarded. Restored to previous state.', 'info');
};

// Custom Admin Confirm Modal Logic
window.triggerConfirmModal = function (title, description, onConfirmCallback) {
    const overlay = document.getElementById('adminModalOverlay');
    if (!overlay) return;

    document.getElementById('adminModalTitle').innerText = title;
    document.getElementById('adminModalDesc').innerText = description;

    const confirmBtn = document.getElementById('adminModalConfirmBtn');

    // Remove old listeners by cloning
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
        if (onConfirmCallback) onConfirmCallback();
        window.closeAdminModal();
    });

    overlay.classList.add('active');
};

window.closeAdminModal = function () {
    const overlay = document.getElementById('adminModalOverlay');
    if (overlay) overlay.classList.remove('active');
};

// =========================================================================
// ATTENDANCE TERMINAL MANAGEMENT
// =========================================================================

const AttendanceManager = {
    init() {
        if (!document.getElementById('attendanceEventSelect')) return;
        this.populateDropdown();
        this.setupListeners();
        this.renderTable();
    },

    populateDropdown() {
        const select = document.getElementById('attendanceEventSelect');
        select.innerHTML = '';

        if (typeof EventManager === 'undefined') {
            select.innerHTML = '<option>EventManager not loaded</option>';
            return;
        }

        const events = EventManager.getAllEvents();
        if (events.length === 0) {
            select.innerHTML = '<option>No events available</option>';
            return;
        }

        events.forEach(evt => {
            const opt = document.createElement('option');
            opt.value = evt.id;
            opt.textContent = evt.title;
            select.appendChild(opt);
        });
    },

    setupListeners() {
        const select = document.getElementById('attendanceEventSelect');
        select.addEventListener('change', () => this.renderTable());

        const autoIssueBtn = document.getElementById('btnAutoIssueCerts');
        if (autoIssueBtn) {
            autoIssueBtn.addEventListener('click', () => {
                if (window.showToast) window.showToast('Checking attendance logs for auto-issue...', 'info');
                setTimeout(() => {
                    if (window.showToast) window.showToast('Certificates Auto-Issued to present students.', 'success');
                }, 1000);
            });
        }
    },

    renderTable() {
        const select = document.getElementById('attendanceEventSelect');
        const tbody = document.getElementById('attendanceGridBody');

        if (!select || !tbody) return;

        const eventId = select.value;
        tbody.innerHTML = '';

        if (typeof RegistrationManager === 'undefined') {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">RegistrationManager not loaded.</td></tr>';
            return;
        }

        const registrants = RegistrationManager.getRegistrantsForEvent(eventId);

        if (registrants.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No registrations for this event yet.</td></tr>`;
            return;
        }

        registrants.forEach((reg, index) => {
            const tr = document.createElement('tr');

            // Format nice date
            const dateObj = new Date(reg.dateRegistered);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

            const isPresent = reg.status === 'Attended';
            const badgeClass = isPresent ? 'success' : 'warning';
            const badgeText = isPresent ? 'Present' : 'Registered';
            const uuid = `attBtn_${index}`;

            tr.innerHTML = `
                <td>${reg.studentName}</td>
                <td>${reg.studentId}</td>
                <td>${formattedDate}</td>
                <td><span class="status-badge ${badgeClass}" id="badge_${uuid}">${badgeText}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-outline" id="btn_${uuid}"
                        style="padding: 0.4rem 1rem; border-color: ${isPresent ? 'var(--text-secondary)' : 'var(--color-success)'}; color: ${isPresent ? 'var(--text-secondary)' : 'var(--color-success)'};"
                        ${isPresent ? 'disabled' : ''}>
                        ${isPresent ? 'Logged' : 'Mark Present'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);

            // Bind Mark Present Logic
            if (!isPresent) {
                const btn = document.getElementById(`btn_${uuid}`);
                btn.addEventListener('click', () => {
                    // Update visual state instantly
                    document.getElementById(`badge_${uuid}`).className = 'status-badge success';
                    document.getElementById(`badge_${uuid}`).innerText = 'Present';
                    btn.innerText = 'Logged';
                    btn.style.borderColor = 'var(--text-secondary)';
                    btn.style.color = 'var(--text-secondary)';
                    btn.disabled = true;

                    // Update data state
                    reg.status = 'Attended';
                    RegistrationManager.saveRegistrations();
                    if (window.showToast) window.showToast('Marked Present', 'success');
                });
            }
        });
    }
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => AttendanceManager.init(), 200); // Give dependencies time
});
