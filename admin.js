/* ===== CREDENTIALS (change password via Settings tab) ===== */
const ADMIN_USER = 'admin';
const DEFAULT_PASS = 'admin123';

/* ===== AUTH ===== */
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

function getStoredPass() {
    return localStorage.getItem('admin_password') || DEFAULT_PASS;
}

function checkAuth() {
    if (sessionStorage.getItem('admin_session') === 'true') {
        showDashboard();
    }
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'flex';
    loadAllData();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value;

    if (user === ADMIN_USER && pass === getStoredPass()) {
        sessionStorage.setItem('admin_session', 'true');
        loginError.classList.remove('show');
        showDashboard();
    } else {
        loginError.classList.add('show');
        document.getElementById('admin-pass').value = '';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_session');
    dashboardPage.style.display = 'none';
    loginPage.style.display = 'flex';
    document.getElementById('admin-user').value = '';
    document.getElementById('admin-pass').value = '';
});

checkAuth();

/* ===== TABS ===== */
const tabBtns = document.querySelectorAll('.sidebar__nav-link[data-tab]');
const tabPanels = document.querySelectorAll('.tab-panel');
const topbarTitle = document.getElementById('topbar-title');
const topbarBreadcrumb = document.getElementById('topbar-breadcrumb');

const tabMeta = {
    dashboard: { title: 'Dashboard', breadcrumb: 'Admin → Dashboard' },
    messages:  { title: 'Messages',  breadcrumb: 'Admin → Messages' },
    skills:    { title: 'Skills',    breadcrumb: 'Admin → Skills' },
    settings:  { title: 'Settings',  breadcrumb: 'Admin → Settings' },
};

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabPanels.forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        topbarTitle.textContent = tabMeta[tab].title;
        topbarBreadcrumb.textContent = tabMeta[tab].breadcrumb;
        // close sidebar on mobile
        document.getElementById('admin-sidebar').classList.remove('show');
    });
});

/* ===== MOBILE SIDEBAR ===== */
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('show');
});

/* ===== LOAD DATA ===== */
function loadAllData() {
    loadMessages();
    updateStats();
    loadSkills();
}

/* ===== MESSAGES ===== */
function getMessages() {
    return JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
}

function saveMessages(msgs) {
    localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function loadMessages() {
    const msgs = getMessages();
    renderDashboardMessages(msgs.slice(0, 5));
    renderAllMessages(msgs);
    updateUnreadBadge(msgs);
}

function renderDashboardMessages(msgs) {
    const tbody = document.getElementById('dashboard-messages-body');
    const countEl = document.getElementById('dashboard-msg-count');

    if (!msgs.length) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="bx bx-envelope"></i><p>No messages yet.</p></div></td></tr>';
        if (countEl) countEl.textContent = '';
        return;
    }

    if (countEl) countEl.textContent = 'Showing ' + msgs.length + ' recent';

    tbody.innerHTML = msgs.map(m => `
        <tr>
            <td><strong>${escHtml(m.name)}</strong></td>
            <td>${escHtml(m.subject)}</td>
            <td>${formatDate(m.date)}</td>
            <td><span class="badge badge--${m.read ? 'read' : 'unread'}">${m.read ? 'Read' : 'New'}</span></td>
            <td>
                <button class="btn-sm btn-sm--primary" onclick="openMessage(${m.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function renderAllMessages(msgs) {
    const tbody = document.getElementById('messages-body');

    if (!msgs.length) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="bx bx-envelope"></i><p>No messages yet.</p></div></td></tr>';
        return;
    }

    tbody.innerHTML = msgs.map(m => `
        <tr id="row-${m.id}">
            <td><strong>${escHtml(m.name)}</strong></td>
            <td>${escHtml(m.email)}</td>
            <td>${escHtml(m.subject)}</td>
            <td>${formatDate(m.date)}</td>
            <td><span class="badge badge--${m.read ? 'read' : 'unread'}" id="badge-${m.id}">${m.read ? 'Read' : 'New'}</span></td>
            <td>
                <button class="btn-sm btn-sm--primary" onclick="openMessage(${m.id})" style="margin-right:0.4rem">View</button>
                <button class="btn-sm btn-sm--danger" onclick="deleteMessage(${m.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const msgs = getMessages();
    const unread = msgs.filter(m => !m.read).length;
    document.getElementById('stat-total').textContent = msgs.length;
    document.getElementById('stat-unread').textContent = unread;
}

function updateUnreadBadge(msgs) {
    const unread = msgs.filter(m => !m.read).length;
    const badge = document.getElementById('unread-badge');
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
}

function openMessage(id) {
    const msgs = getMessages();
    const m = msgs.find(msg => msg.id === id);
    if (!m) return;

    // Mark as read
    m.read = true;
    saveMessages(msgs);
    const badge = document.getElementById('badge-' + id);
    if (badge) { badge.textContent = 'Read'; badge.className = 'badge badge--read'; }
    updateUnreadBadge(msgs);
    updateStats();

    // Populate modal
    document.getElementById('modal-subject').textContent = m.subject;
    document.getElementById('modal-name').textContent = m.name;
    document.getElementById('modal-email').textContent = m.email;
    document.getElementById('modal-date').textContent = formatDate(m.date);
    document.getElementById('modal-message').textContent = m.message;
    document.getElementById('msg-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('msg-modal').classList.remove('show');
}

document.getElementById('msg-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    const msgs = getMessages().filter(m => m.id !== id);
    saveMessages(msgs);
    loadMessages();
    updateStats();
}

// Search
document.getElementById('msg-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const msgs = getMessages().filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
    renderAllMessages(msgs);
});

/* ===== SKILLS ===== */
function updateSkillVal(input) {
    input.nextElementSibling.textContent = input.value + '%';
}

function loadSkills() {
    const saved = JSON.parse(localStorage.getItem('portfolio_skills') || '{}');
    document.querySelectorAll('.skill-row input[type="range"]').forEach(input => {
        const key = input.getAttribute('data-skill');
        if (saved[key] !== undefined) {
            input.value = saved[key];
            input.nextElementSibling.textContent = saved[key] + '%';
        }
    });
}

function saveSkills() {
    const skills = {};
    document.querySelectorAll('.skill-row input[type="range"]').forEach(input => {
        skills[input.getAttribute('data-skill')] = parseInt(input.value);
    });
    localStorage.setItem('portfolio_skills', JSON.stringify(skills));
    showSaveStatus('skills-status');
}

/* ===== SETTINGS ===== */
function saveSettings() {
    const profile = {
        name: document.getElementById('set-name').value,
        title: document.getElementById('set-title').value,
        email: document.getElementById('set-email').value,
        github: document.getElementById('set-github').value,
        linkedin: document.getElementById('set-linkedin').value,
    };
    localStorage.setItem('portfolio_profile', JSON.stringify(profile));
    showSaveStatus('settings-status');
}

function changePassword() {
    const current = document.getElementById('set-current-pass').value;
    const newPass = document.getElementById('set-new-pass').value;
    const confirm = document.getElementById('set-confirm-pass').value;
    const statusEl = document.getElementById('pass-status');

    if (current !== getStoredPass()) {
        statusEl.textContent = '✗ Current password is incorrect.';
        statusEl.style.color = '#EF4444';
        statusEl.classList.add('show');
        return;
    }
    if (newPass.length < 6) {
        statusEl.textContent = '✗ Password must be at least 6 characters.';
        statusEl.style.color = '#EF4444';
        statusEl.classList.add('show');
        return;
    }
    if (newPass !== confirm) {
        statusEl.textContent = '✗ Passwords do not match.';
        statusEl.style.color = '#EF4444';
        statusEl.classList.add('show');
        return;
    }

    localStorage.setItem('admin_password', newPass);
    document.getElementById('set-current-pass').value = '';
    document.getElementById('set-new-pass').value = '';
    document.getElementById('set-confirm-pass').value = '';

    statusEl.textContent = '✓ Password updated successfully!';
    statusEl.style.color = '#10B981';
    statusEl.classList.add('show');
    setTimeout(() => statusEl.classList.remove('show'), 3000);
}

function showSaveStatus(id) {
    const el = document.getElementById(id);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

/* ===== UTILS ===== */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
