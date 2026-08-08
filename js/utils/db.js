/**
 * SentinelDB - Database Utility Layer
 * Supports IndexedDB browser database with automatic SQLite Backend API sync capability.
 */
(function() {
    const DB_NAME = 'SentinelAIDB';
    const DB_VERSION = 1;
    let dbInstance = null;
    let backendAvailable = false;
    const API_BASE = 'http://localhost:5000/api';

    class SentinelDB {
        constructor() {
            this.initialized = false;
        }

        async init() {
            if (this.initialized) return;
            
            // Check backend availability
            try {
                const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
                if (res.ok) {
                    backendAvailable = true;
                    console.log("[SentinelDB] SQLite Backend Connected");
                }
            } catch (e) {
                backendAvailable = false;
                console.log("[SentinelDB] SQLite Backend offline. Operating on IndexedDB storage.");
            }

            // Initialize IndexedDB
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // Users store
                    if (!db.objectStoreNames.contains('users')) {
                        const userStore = db.createObjectStore('users', { keyPath: 'username' });
                        userStore.createIndex('email', 'email', { unique: false });
                    }

                    // History store
                    if (!db.objectStoreNames.contains('history')) {
                        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
                        historyStore.createIndex('username', 'username', { unique: false });
                        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };

                request.onsuccess = (event) => {
                    dbInstance = event.target.result;
                    this.initialized = true;
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error("[SentinelDB] IndexedDB error:", event.target.error);
                    reject(event.target.error);
                };
            });
        }

        // ================= SESSION & AUTH =================
        getCurrentUser() {
            const session = localStorage.getItem('sentinel_session');
            if (session) {
                try {
                    return JSON.parse(session);
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        setCurrentUser(user) {
            if (user) {
                localStorage.setItem('sentinel_session', JSON.stringify({
                    username: user.username,
                    email: user.email || '',
                    name: user.name || user.username,
                    loggedInAt: new Date().toISOString()
                }));
            } else {
                localStorage.removeItem('sentinel_session');
            }
        }

        logoutUser() {
            localStorage.removeItem('sentinel_session');
        }

        // ================= ANALYSIS QUOTA ENFORCEMENT =================
        getTodayDateString() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        getGuestAnalysisCount() {
            const dateStr = this.getTodayDateString();
            const key = `sentinel_guest_usage_${dateStr}`;
            return parseInt(localStorage.getItem(key) || '0', 10);
        }

        incrementGuestAnalysisCount() {
            const dateStr = this.getTodayDateString();
            const key = `sentinel_guest_usage_${dateStr}`;
            const count = this.getGuestAnalysisCount();
            localStorage.setItem(key, (count + 1).toString());
        }

        getUserAnalysisCount() {
            const user = this.getCurrentUser();
            if (!user) return 0;
            const sessionKey = user.loggedInAt ? user.loggedInAt.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
            const key = `sentinel_user_usage_${user.username}_${sessionKey}`;
            return parseInt(localStorage.getItem(key) || '0', 10);
        }

        incrementUserAnalysisCount() {
            const user = this.getCurrentUser();
            if (!user) return;
            const sessionKey = user.loggedInAt ? user.loggedInAt.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
            const key = `sentinel_user_usage_${user.username}_${sessionKey}`;
            const count = this.getUserAnalysisCount();
            localStorage.setItem(key, (count + 1).toString());
        }

        checkAnalysisAllowed() {
            const user = this.getCurrentUser();
            if (!user) {
                const count = this.getGuestAnalysisCount();
                if (count >= 1) {
                    return {
                        allowed: false,
                        userType: 'guest',
                        count: count,
                        limit: 1,
                        message: "Daily limit reached! Unregistered guests are allowed only 1 text analysis per day. Please register or log in to analyze unlimited text."
                    };
                }
                return {
                    allowed: true,
                    userType: 'guest',
                    count: count,
                    limit: 1
                };
            } else {
                return {
                    allowed: true,
                    userType: 'user',
                    limit: 'unlimited'
                };
            }
        }

        recordAnalysisUsage() {
            const user = this.getCurrentUser();
            if (!user) {
                this.incrementGuestAnalysisCount();
            } else {
                this.incrementUserAnalysisCount();
            }
        }

        async registerUser(username, email, password) {
            await this.init();
            const cleanUser = username.trim().toLowerCase();
            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanUser || !cleanEmail || !password) throw new Error("Username, email address, and password are required.");

            // If backend available, send to server
            if (backendAvailable) {
                try {
                    const res = await fetch(`${API_BASE}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: cleanUser, email: cleanEmail, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || "Registration failed on server");
                } catch (e) {
                    console.warn("Backend register error, falling back to client DB:", e.message);
                }
            }

            // Save in IndexedDB
            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['users'], 'readwrite');
                const store = tx.objectStore('users');
                const checkReq = store.get(cleanUser);

                checkReq.onsuccess = () => {
                    if (checkReq.result) {
                        reject(new Error("Username already exists. Please pick another or log in."));
                        return;
                    }

                    const newUser = {
                        username: cleanUser,
                        email: cleanEmail,
                        passwordHash: btoa(password), // simple client hashing for demo
                        createdAt: new Date().toISOString()
                    };

                    const addReq = store.add(newUser);
                    addReq.onsuccess = () => {
                        this.setCurrentUser({ username: cleanUser, email: cleanEmail });
                        resolve(newUser);
                    };
                    addReq.onerror = () => reject(new Error("Error writing user to local database."));
                };

                checkReq.onerror = () => reject(new Error("Error accessing user database."));
            });
        }

        async loginUser(loginInput, password) {
            await this.init();
            const cleanInput = loginInput.trim().toLowerCase();
            if (!cleanInput || !password) throw new Error("Please enter username or email and password.");

            if (backendAvailable) {
                try {
                    const res = await fetch(`${API_BASE}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: cleanInput, password })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        this.setCurrentUser({ username: data.user.username, email: data.user.email });
                        return data.user;
                    }
                } catch (e) {
                    console.warn("Backend login offline/failed, trying local IndexedDB...", e.message);
                }
            }

            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['users'], 'readonly');
                const store = tx.objectStore('users');
                const req = store.get(cleanInput);

                req.onsuccess = () => {
                    let user = req.result;
                    if (user) {
                        if (user.passwordHash !== btoa(password)) {
                            reject(new Error("Incorrect password. Please try again."));
                            return;
                        }
                        this.setCurrentUser({ username: user.username, email: user.email });
                        resolve(user);
                        return;
                    }
                    
                    // Fallback to check by email index
                    try {
                        const emailIndex = store.index('email');
                        const emailReq = emailIndex.get(cleanInput);
                        emailReq.onsuccess = () => {
                            const emailUser = emailReq.result;
                            if (!emailUser) {
                                reject(new Error("User not found. Please check username/email or sign up."));
                                return;
                            }
                            if (emailUser.passwordHash !== btoa(password)) {
                                reject(new Error("Incorrect password. Please try again."));
                                return;
                            }
                            this.setCurrentUser({ username: emailUser.username, email: emailUser.email });
                            resolve(emailUser);
                        };
                        emailReq.onerror = () => reject(new Error("User not found with that username or email."));
                    } catch (err) {
                        reject(new Error("User not found with that username or email."));
                    }
                };

                req.onerror = () => reject(new Error("Failed to read user database."));
            });
        }

        // ================= ANALYSIS HISTORY =================
        async saveAnalysis(analysisRecord) {
            await this.init();
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                // Guest users do not have access to save or view history
                return null;
            }
            const username = currentUser.username;

            const record = {
                id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                username: username,
                timestamp: new Date().toISOString(),
                title: analysisRecord.title || analysisRecord.text.slice(0, 50).trim() + '...',
                text: analysisRecord.text,
                aiScore: parseFloat(analysisRecord.aiScore || 0),
                verdict: analysisRecord.verdict || 'Awaiting Analysis',
                verdictClass: analysisRecord.verdictClass || '',
                wordCount: parseInt(analysisRecord.wordCount || 0),
                sentenceCount: parseInt(analysisRecord.sentenceCount || 0),
                burstiness: parseFloat(analysisRecord.burstiness || 0),
                ttr: parseFloat(analysisRecord.ttr || 0),
                grammarScore: parseFloat(analysisRecord.grammarScore || 100),
                lrScore: parseFloat(analysisRecord.lrScore || 0),
                knnScore: parseFloat(analysisRecord.knnScore || 0),
                trigramScore: parseFloat(analysisRecord.trigramScore || 0),
                posScore: parseFloat(analysisRecord.posScore || 0),
                similarityScore: parseFloat(analysisRecord.similarityScore || 0),
                perplexityScore: parseFloat(analysisRecord.perplexityScore || 0)
            };

            // Post to backend if online
            if (backendAvailable) {
                try {
                    fetch(`${API_BASE}/history/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(record)
                    }).catch(err => console.warn("Backend history save warning:", err));
                } catch (e) {}
            }

            // Save in IndexedDB
            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['history'], 'readwrite');
                const store = tx.objectStore('history');
                const req = store.add(record);

                req.onsuccess = () => resolve(record);
                req.onerror = () => reject(new Error("Failed to save analysis record locally."));
            });
        }

        async getHistory(usernameFilter = null) {
            await this.init();
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                // Guests do not have access to history
                return [];
            }
            const targetUsername = usernameFilter || currentUser.username;

            // Try backend first
            if (backendAvailable && targetUsername) {
                try {
                    const res = await fetch(`${API_BASE}/history?username=${encodeURIComponent(targetUsername)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data.records) && data.records.length > 0) {
                            return data.records;
                        }
                    }
                } catch (e) {
                    console.warn("Backend history fetch failed, falling back to IndexedDB.");
                }
            }

            // Fallback to IndexedDB
            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['history'], 'readonly');
                const store = tx.objectStore('history');
                const req = store.getAll();

                req.onsuccess = () => {
                    let results = req.result || [];
                    if (targetUsername && targetUsername !== 'all') {
                        results = results.filter(r => r.username === targetUsername);
                    }
                    // Sort descending by timestamp
                    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    resolve(results);
                };

                req.onerror = () => reject(new Error("Failed to retrieve analysis history."));
            });
        }

        async deleteHistoryItem(id) {
            await this.init();
            if (backendAvailable) {
                try {
                    fetch(`${API_BASE}/history/delete`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    }).catch(e => {});
                } catch (e) {}
            }

            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['history'], 'readwrite');
                const store = tx.objectStore('history');
                const req = store.delete(id);

                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(new Error("Failed to delete record."));
            });
        }

        async clearAllHistory() {
            await this.init();
            const currentUser = this.getCurrentUser();
            const username = currentUser ? currentUser.username : 'guest';

            return new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['history'], 'readwrite');
                const store = tx.objectStore('history');
                const index = store.index('username');
                const req = index.openCursor(IDBKeyRange.only(username));

                req.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    } else {
                        resolve(true);
                    }
                };

                req.onerror = () => reject(new Error("Failed to clear history."));
            });
        }
    }

    window.SentinelDB = new SentinelDB();
})();
