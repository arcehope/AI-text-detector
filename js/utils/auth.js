/**
 * Auth UI Controller
 * Manages Auth Modal, login/register forms, user header status, and notifications.
 */
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth-btn');
    const closeAuthBtn = document.getElementById('close-auth-modal');
    const authTabTriggers = document.querySelectorAll('.auth-tab-trigger');
    const authForms = document.querySelectorAll('.auth-form');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authError = document.getElementById('auth-error-msg');
    const authSuccess = document.getElementById('auth-success-msg');

    const userProfileBadge = document.getElementById('user-profile-badge');
    const userAvatar = document.getElementById('user-avatar');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');

    // Initialize User State
    function updateUIForSession() {
        const user = window.SentinelDB.getCurrentUser();
        const openHistBtn = document.getElementById('open-history-drawer-btn');
        if (user) {
            if (userProfileBadge) userProfileBadge.style.display = 'flex';
            if (openAuthBtn) openAuthBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (openHistBtn) openHistBtn.style.display = 'inline-flex';
            if (usernameDisplay) {
                usernameDisplay.style.display = 'inline';
                usernameDisplay.textContent = user.username;
            }
            if (userAvatar) {
                userAvatar.style.display = 'flex';
                userAvatar.textContent = user.username.charAt(0).toUpperCase();
            }
        } else {
            if (userProfileBadge) userProfileBadge.style.display = 'flex';
            if (openAuthBtn) openAuthBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (openHistBtn) openHistBtn.style.display = 'none';
            if (usernameDisplay) usernameDisplay.style.display = 'none';
            if (userAvatar) userAvatar.style.display = 'none';
        }
        if (window.updateQuotaUI) window.updateQuotaUI();
    }

    function switchTab(formId) {
        const targetTrigger = document.querySelector(`.auth-tab-trigger[data-form="${formId}"]`);
        if (targetTrigger) {
            authTabTriggers.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            targetTrigger.classList.add('active');
            const formEl = document.getElementById(formId);
            if (formEl) formEl.classList.add('active');
        }
    }

    // Modal Display Logic
    function showModal(show = true, message = '', defaultForm = 'login-form') {
        if (!authModal) return;
        if (show) {
            authModal.classList.add('active');
            clearMessages();
            if (defaultForm) {
                switchTab(defaultForm);
            }
            if (message) {
                showError(message);
            }
        } else {
            authModal.classList.remove('active');
        }
    }

    window.showAuthModal = (message = '', defaultForm = 'login-form') => {
        showModal(true, message, defaultForm);
    };

    function clearMessages() {
        if (authError) { authError.textContent = ''; authError.style.display = 'none'; }
        if (authSuccess) { authSuccess.textContent = ''; authSuccess.style.display = 'none'; }
    }

    function showError(msg) {
        if (authError) {
            authError.textContent = msg;
            authError.style.display = 'block';
        }
    }

    function showSuccess(msg) {
        if (authSuccess) {
            authSuccess.textContent = msg;
            authSuccess.style.display = 'block';
        }
    }

    // Tab Switch (Login / Sign Up)
    authTabTriggers.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.getAttribute('data-form');
            switchTab(targetForm);
            clearMessages();
        });
    });

    if (openAuthBtn) openAuthBtn.addEventListener('click', () => showModal(true));
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => showModal(false));
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) showModal(false);
        });
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const user = await window.SentinelDB.loginUser(username, password);
                showSuccess(`Welcome back, ${user.username}!`);
                updateUIForSession();
                setTimeout(() => {
                    showModal(false);
                    if (window.refreshHistoryList) window.refreshHistoryList();
                }, 700);
            } catch (err) {
                showError(err.message);
            }
        });
    }

    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;

            if (!username || !email || !password) {
                showError("Username, email address, and password are required.");
                return;
            }

            try {
                const user = await window.SentinelDB.registerUser(username, email, password);
                showSuccess(`Account created! Welcome, ${user.username}!`);
                updateUIForSession();
                setTimeout(() => {
                    showModal(false);
                    if (window.refreshHistoryList) window.refreshHistoryList();
                }, 700);
            } catch (err) {
                showError(err.message);
            }
        });
    }

    // Logout Modal Handlers
    const logoutModal = document.getElementById('logout-modal');
    const closeLogoutBtn = document.getElementById('close-logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    function showLogoutModal(show = true) {
        if (!logoutModal) return;
        if (show) {
            logoutModal.classList.add('active');
        } else {
            logoutModal.classList.remove('active');
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showLogoutModal(true);
        });
    }

    if (closeLogoutBtn) closeLogoutBtn.addEventListener('click', () => showLogoutModal(false));
    if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', () => showLogoutModal(false));
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) showLogoutModal(false);
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            window.SentinelDB.logoutUser();
            updateUIForSession();
            showLogoutModal(false);
            if (window.refreshHistoryList) window.refreshHistoryList();
        });
    }

    // Initial check
    updateUIForSession();
});
