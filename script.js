// ============================================================
// PORTFOLIO LOGIC & INTERACTION SCRIPT
// TextPressure variable font animation, Dan Perks scramble & popup modal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 0. CURSOR GRID INTERACTIVE BACKGROUND (DOTS VARIANT)
    // ============================================================
    const cursorGridContainer = document.getElementById('cursor-grid');
    let cursorGridInstance = null;

    if (cursorGridContainer && typeof CursorGrid !== 'undefined') {
        cursorGridInstance = new CursorGrid(cursorGridContainer, {
            cellSize: 30,
            color: 'auto',
            radius: 70,
            falloff: 'smooth',
            holdTime: 0,
            fadeDuration: 800,
            lineWidth: 0.8,
            maxOpacity: 0.28,
            fillOpacity: 0,
            gridOpacity: 0.15,
            clickPulse: true,
            pulseSpeed: 750,
            dotRadius: 1.3
        });
    }

    // ============================================================
    // 1. LIGHT / DARK THEME TOGGLE
    // ============================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElem = document.documentElement;

    const savedTheme = localStorage.getItem('pratham_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    rootElem.setAttribute('data-theme', initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootElem.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            rootElem.setAttribute('data-theme', newTheme);
            localStorage.setItem('pratham_theme', newTheme);
            if (cursorGridInstance) {
                cursorGridInstance.wake();
            }
        });
    }

    // ============================================================
    // 2. TEXT PRESSURE ANIMATION ON NAME ("pratham jain")
    // Thick by default, going near characters makes them thinner
    // ============================================================
    class TextPressure {
        constructor(element) {
            this.element = element;
            this.text = element.textContent.trim();
            this.spans = [];
            this.mouse = { x: 0, y: 0 };
            this.cursor = { x: 0, y: 0 };
            this.init();
        }

        init() {
            this.element.innerHTML = '';
            const chars = Array.from(this.text);

            chars.forEach((char) => {
                const span = document.createElement('span');
                span.className = 'pressure-char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                this.element.appendChild(span);
                this.spans.push(span);
            });

            window.addEventListener('mousemove', (e) => {
                this.cursor.x = e.clientX;
                this.cursor.y = e.clientY;
            });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.cursor.x = e.touches[0].clientX;
                    this.cursor.y = e.touches[0].clientY;
                }
            }, { passive: true });

            const rect = this.element.getBoundingClientRect();
            this.mouse.x = rect.left + rect.width / 2;
            this.mouse.y = rect.top + rect.height / 2;
            this.cursor.x = this.mouse.x;
            this.cursor.y = this.mouse.y;

            this.animate();
        }

        animate() {
            // Smooth lerp movement toward cursor
            this.mouse.x += (this.cursor.x - this.mouse.x) / 12;
            this.mouse.y += (this.cursor.y - this.mouse.y) / 12;

            const titleRect = this.element.getBoundingClientRect();
            const maxDist = Math.max(titleRect.width / 2.2, 220);

            this.spans.forEach(span => {
                const rect = span.getBoundingClientRect();
                const charCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                const dx = this.mouse.x - charCenter.x;
                const dy = this.mouse.y - charCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // User specification: Thick by default. Going near characters makes them thinner.
                // Far (dist >= maxDist): ratio = 1 -> thick (wght: 900, wdth: 140)
                // Near (dist = 0): ratio = 0 -> thin (wght: 100, wdth: 65)
                const ratio = Math.min(1, Math.max(0, dist / maxDist));

                const wght = Math.floor(100 + ratio * (900 - 100)); // 100 (thin near) to 900 (thick far)
                const wdth = Math.floor(65 + ratio * (140 - 65));   // 65 (narrow near) to 140 (wide far)

                span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    const nameElem = document.getElementById('author-name');
    if (nameElem) {
        new TextPressure(nameElem);
    }

    // ============================================================
    // 3. TEXT SCRAMBLE HOVER EFFECT (FROM DANPERKS.DEV)
    // ============================================================
    const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~a-z0-9';

    class TextScrambler {
        constructor(element) {
            this.element = element;
            this.originalText = element.getAttribute('data-original-text') || element.textContent.trim();
            element.setAttribute('data-original-text', this.originalText);
            this.frame = 0;
            this.queue = [];
            this.isAnimating = false;
        }

        scramble() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            const length = this.originalText.length;
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const char = this.originalText[i];
                if (char === ' ') {
                    this.queue.push({ from: ' ', to: ' ', start: 0, end: 0 });
                } else {
                    const start = Math.floor(Math.random() * 3);
                    const end = start + Math.floor(Math.random() * 6) + 3;
                    this.queue.push({ from: char, to: char, start, end, char: '' });
                }
            }

            this.frame = 0;
            this.update();
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0; i < this.queue.length; i++) {
                let { from, to, start, end, char } = this.queue[i];

                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.35) {
                        char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span style="opacity: 0.7;">${char}</span>`;
                } else {
                    output += from;
                }
            }

            this.element.innerHTML = output;

            if (complete === this.queue.length) {
                this.element.textContent = this.originalText;
                this.isAnimating = false;
            } else {
                this.frame++;
                requestAnimationFrame(() => this.update());
            }
        }
    }

    // Attach scramble effect to project titles and links
    const scrambleElements = document.querySelectorAll('.link-item, .item-title, .thing-title');
    scrambleElements.forEach(el => {
        const scrambler = new TextScrambler(el);
        el.addEventListener('mouseenter', () => scrambler.scramble());
    });

    // ============================================================
    // 4. PROJECT POPUP MODAL WITH CIRCULAR GROWING ANIMATION
    // Matching Dan Perks project detail page layout (fuzzyrice)
    // ============================================================
    const PROJECTS_DATA = {
        'buddyfrvr': {
            title: 'buddyfrvr',
            subtitle: 'ai companion & personal memory system',
            tagline: 'built in python · next.js · tailwind ↗',
            status: '• LIVE'
        },
        'carbolt': {
            title: 'carbolt',
            subtitle: 'digital carbon footprint tracker & emission monitor',
            tagline: 'built in typescript · react · node ↗',
            status: '• ACTIVE'
        },
        'voicemail pro': {
            title: 'voicemail pro',
            subtitle: 'smart voice AI assistant for call filtering & transcriptions',
            tagline: 'built in python · whisper · fast-api ↗',
            status: '• IN DEVELOPMENT'
        },
        'utransfer': {
            title: 'utransfer',
            subtitle: 'peer-to-peer web browser file sharing platform',
            tagline: 'built in javascript · webRTC · socket.io ↗',
            status: '• LIVE'
        },
        'prythm': {
            title: 'prythm',
            subtitle: 'music production & ambient atmospheric soundscapes',
            tagline: 'produced in logic pro · ambient & r&b ↗',
            status: '• RELEASED'
        }
    };

    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal');

    document.querySelectorAll('.project-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();

            const clickX = e.clientX || window.innerWidth / 2;
            const clickY = e.clientY || window.innerHeight / 2;

            const projKey = trigger.getAttribute('data-project');
            const data = PROJECTS_DATA[projKey] || {
                title: projKey,
                subtitle: 'built by pratham jain',
                tagline: 'built in web · interactive project ↗',
                status: '• LIVE'
            };

            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-subtitle').textContent = data.subtitle;
            document.getElementById('modal-tagline').textContent = data.tagline;
            document.getElementById('modal-status').textContent = data.status;

            const modalShowcase = document.getElementById('modal-showcase');
            const modalMusicPlayer = document.getElementById('modal-music-player');
            const modalWaitlist = document.getElementById('modal-waitlist');
            
            if (projKey === 'prythm') {
                if (modalShowcase) modalShowcase.classList.add('hidden');
                if (modalMusicPlayer) modalMusicPlayer.classList.remove('hidden');
                if (modalWaitlist) modalWaitlist.classList.add('hidden');
            } else if (projKey === 'buddyfrvr') {
                if (modalShowcase) modalShowcase.classList.remove('hidden');
                if (modalMusicPlayer) modalMusicPlayer.classList.add('hidden');
                if (modalWaitlist) modalWaitlist.classList.remove('hidden');
            } else {
                if (modalShowcase) modalShowcase.classList.remove('hidden');
                if (modalMusicPlayer) modalMusicPlayer.classList.add('hidden');
                if (modalWaitlist) modalWaitlist.classList.add('hidden');
            }

            modal.style.setProperty('--click-x', `${clickX}px`);
            modal.style.setProperty('--click-y', `${clickY}px`);

            modal.classList.remove('hidden');
            void modal.offsetHeight;
            modal.classList.add('active');
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 650);
        });
    }

    // Modal Music Player Logic
    const modalPlayBtn = document.getElementById('modal-play-btn');
    const audioElem = document.getElementById('amahuk-audio');
    const progressFill = document.getElementById('music-progress-fill');
    const progressBar = document.getElementById('music-progress-bar');
    const currentTimeEl = document.getElementById('music-current-time');
    const totalTimeEl = document.getElementById('music-total-time');

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    if (modalPlayBtn && audioElem) {
        const iconPlay = modalPlayBtn.querySelector('.icon-play');
        const iconPause = modalPlayBtn.querySelector('.icon-pause');
        const musicArtWrapper = document.querySelector('.music-art-wrapper');
        const bottomMusicBtn = document.querySelector('.music-btn');
        
        const modalPrevBtn = document.getElementById('modal-prev-btn');
        const modalNextBtn = document.getElementById('modal-next-btn');
        const modalSongName = document.getElementById('modal-song-name');
        const bottomMusicText = document.querySelector('.music-text');

        const playlist = [
            { name: "amahuk", file: "assets/music/amahuk.mp3" },
            { name: "novae", file: "assets/music/novae.mp3" },
            { name: "supernovae", file: "assets/music/supernovae.mp3" },
            { name: "the real prythm", file: "assets/music/the_real_prythm.mp3" }
        ];
        let currentSongIndex = 0;

        function loadSong(index) {
            const wasPlaying = !audioElem.paused;
            const song = playlist[index];
            audioElem.src = song.file;
            if (modalSongName) modalSongName.textContent = song.name;
            if (bottomMusicText) bottomMusicText.textContent = song.name + " by prythm";
            
            audioElem.load();
            if (wasPlaying) {
                audioElem.play().catch(e => console.log(e));
            }
        }

        function togglePlayState() {
            if (audioElem.paused) {
                iconPlay.classList.add('hidden');
                iconPause.classList.remove('hidden');
                if (musicArtWrapper) musicArtWrapper.classList.add('playing');
                if (bottomMusicBtn) bottomMusicBtn.classList.add('playing');
                setTimeout(() => {
                    audioElem.play().catch(e => console.log(e));
                }, 300);
            } else {
                audioElem.pause();
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
                if (musicArtWrapper) musicArtWrapper.classList.remove('playing');
                if (bottomMusicBtn) bottomMusicBtn.classList.remove('playing');
            }
        }

        if (modalPrevBtn) {
            modalPrevBtn.addEventListener('click', () => {
                currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
                loadSong(currentSongIndex);
            });
        }

        if (modalNextBtn) {
            modalNextBtn.addEventListener('click', () => {
                currentSongIndex = (currentSongIndex + 1) % playlist.length;
                loadSong(currentSongIndex);
            });
        }

        audioElem.addEventListener('ended', () => {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(currentSongIndex);
            audioElem.play().catch(e => console.log(e));
        });

        modalPlayBtn.addEventListener('click', togglePlayState);
        if (bottomMusicBtn) {
            bottomMusicBtn.addEventListener('click', togglePlayState);
        }

        audioElem.addEventListener('timeupdate', () => {
            const current = audioElem.currentTime;
            const duration = audioElem.duration || 1;
            const percent = (current / duration) * 100;
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
        });

        audioElem.addEventListener('loadedmetadata', () => {
            if (totalTimeEl) totalTimeEl.textContent = formatTime(audioElem.duration);
        });

        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const percent = clickX / width;
                const duration = audioElem.duration || 0;
                audioElem.currentTime = percent * duration;
            });
        }
    }

    // ============================================================
    // 5. UNIFIED VISITS COUNTER (SYNCED ACROSS ALL OPEN TABS)
    // ============================================================
    const BASE_VISITS = 4683;
    const visitElem = document.getElementById('visit-count');

    function getVisits() {
        let stored = parseInt(localStorage.getItem('pratham_visits'), 10);
        if (isNaN(stored) || stored < BASE_VISITS) {
            return BASE_VISITS;
        }
        return stored;
    }

    function updateVisitsUI() {
        if (visitElem) {
            const current = getVisits();
            visitElem.textContent = String(current).padStart(5, '0');
        }
    }

    let currentV = getVisits();
    localStorage.setItem('pratham_visits', currentV + 1);
    updateVisitsUI();

    window.addEventListener('storage', (e) => {
        if (e.key === 'pratham_visits') {
            updateVisitsUI();
        }
    });

    // ============================================================
    // 6. MULTI-TAB & CLOUD ONLINE PRESENCE (SYNCED ACROSS ALL TABS)
    // ============================================================
    const onlineElem = document.getElementById('online-count');
    const myTabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

    function updatePresence() {
        try {
            let registry = JSON.parse(localStorage.getItem('pratham_active_tabs') || '{}');
            const now = Date.now();
            registry[myTabId] = now;

            for (const [id, lastSeen] of Object.entries(registry)) {
                if (now - lastSeen > 3500) {
                    delete registry[id];
                }
            }

            localStorage.setItem('pratham_active_tabs', JSON.stringify(registry));

            const localTabCount = Object.keys(registry).length;
            const finalCount = Math.max(localTabCount, 1);

            if (onlineElem) {
                onlineElem.textContent = String(finalCount).padStart(3, '0') + ' online';
            }
        } catch (e) {
            if (onlineElem) onlineElem.textContent = '001 online';
        }
    }

    updatePresence();
    setInterval(updatePresence, 1000);

    window.addEventListener('storage', (e) => {
        if (e.key === 'pratham_active_tabs') {
            updatePresence();
        }
    });

    window.addEventListener('beforeunload', () => {
        try {
            let registry = JSON.parse(localStorage.getItem('pratham_active_tabs') || '{}');
            delete registry[myTabId];
            localStorage.setItem('pratham_active_tabs', JSON.stringify(registry));
        } catch (e) {}
    });

    // Optional Firebase Realtime DB Cloud Sync
    const firebaseConfig = {
        apiKey: "AIzaSyCVOgAx5YKSonVzHNxSD1ntzb6V0_ZHJAg",
        authDomain: "portfolio-b0516.firebaseapp.com",
        databaseURL: "https://portfolio-b0516-default-rtdb.firebaseio.com",
        projectId: "portfolio-b0516",
        storageBucket: "portfolio-b0516.firebasestorage.app",
        messagingSenderId: "10002392412",
        appId: "1:10002392412:web:430d978e08fa6a1fed0d99"
    };

    if (typeof firebase !== 'undefined' && firebase.database) {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            const database = firebase.database();
            const connectedRef = database.ref('.info/connected');
            const presenceRef = database.ref('presence');

            connectedRef.on('value', (snap) => {
                if (snap.val() === true) {
                    const myConn = presenceRef.push();
                    myConn.onDisconnect().remove();
                    myConn.set({ online: true, ts: firebase.database.ServerValue.TIMESTAMP });
                }
            });

            presenceRef.on('value', (snap) => {
                if (snap.exists() && snap.numChildren() > 0) {
                    const cloudCount = snap.numChildren();
                    let registry = JSON.parse(localStorage.getItem('pratham_active_tabs') || '{}');
                    const localCount = Object.keys(registry).length;
                    const maxOnline = Math.max(cloudCount, localCount, 1);
                    if (onlineElem) {
                        onlineElem.textContent = String(maxOnline).padStart(3, '0') + ' online';
                    }
                }
            });
        } catch (e) {
            // Silently fallback to tab registry
        }
    }

    // ============================================================
    // 7. LOAD TIME CALCULATION
    // ============================================================
    const loadTimeElem = document.getElementById('load-time');

    window.addEventListener('load', () => {
        setTimeout(() => {
            let loadMs = 0;
            if (window.performance && window.performance.timing) {
                const navStart = window.performance.timing.navigationStart;
                const loadEnd = window.performance.timing.loadEventEnd;
                if (loadEnd > navStart) {
                    loadMs = loadEnd - navStart;
                }
            }
            if (loadMs <= 0 || isNaN(loadMs)) {
                loadMs = Math.round(performance.now());
            }

            if (loadTimeElem) {
                const formattedLoad = String(Math.min(Math.max(loadMs, 1), 9999)).padStart(4, '0');
                loadTimeElem.textContent = `${formattedLoad} ms`;
            }
        }, 0);
    });

    // ============================================================
    // 8. BUDDYFRVR 2-STEP EMAIL VERIFIED WAITLIST LOGIC
    // ============================================================
    const DISPOSABLE_DOMAINS = new Set([
        'mailinator.com', 'tempmail.com', '10minutemail.com', 'dispostable.com', 
        'yopmail.com', 'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 
        'getnada.com', 'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 
        'maildrop.cc', 'getairmail.com', 'disposablemail.com', 'generator.email',
        'emailondeck.com', 'mohmal.com', 'crazymailing.com', 'tmail.com',
        'byom.de', 'inboxalias.com', 'trashmail.net', 'mytemp.email'
    ]);

    const BASE_WAITLIST_COUNT = 342;

    const EmailJSConfig = {
        publicKey: "user_public_key_placeholder", // EmailJS public key
        serviceId: "service_waitlist",            // EmailJS service ID
        templateId: "template_waitlist_otp"        // EmailJS template ID
    };

    let activePendingEmail = '';
    let activeGeneratedOtp = '';
    let otpExpiryTime = 0;
    let resendTimerInterval = null;

    const waitlistCountElem = document.getElementById('waitlist-count');
    const waitlistAlert = document.getElementById('waitlist-alert');
    const step1Form = document.getElementById('waitlist-step1-form');
    const step2Form = document.getElementById('waitlist-step2-form');
    const verifyingView = document.getElementById('waitlist-verifying-view');
    const successView = document.getElementById('waitlist-success-view');
    const emailInput = document.getElementById('waitlist-email-input');
    const step1Btn = document.getElementById('waitlist-step1-btn');
    const step2Btn = document.getElementById('waitlist-step2-btn');
    const sentEmailDisplay = document.getElementById('sent-email-display');
    const verifiedEmailDisplay = document.getElementById('verified-email-display');
    const userWaitlistSpot = document.getElementById('user-waitlist-spot');
    const changeEmailBtn = document.getElementById('change-email-btn');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const resendCountdownElem = document.getElementById('resend-countdown');
    const resendTimerText = document.getElementById('resend-timer-text');
    const otpDigits = document.querySelectorAll('.otp-digit');

    function showAlert(msg, type = 'error') {
        if (!waitlistAlert) return;
        waitlistAlert.textContent = msg;
        waitlistAlert.className = `waitlist-alert ${type}`;
        waitlistAlert.classList.remove('hidden');
    }

    function hideAlert() {
        if (waitlistAlert) waitlistAlert.classList.add('hidden');
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(email)) {
            return { valid: false, reason: 'please enter a valid email address.' };
        }
        const domain = email.split('@')[1].toLowerCase();
        if (DISPOSABLE_DOMAINS.has(domain)) {
            return { valid: false, reason: 'disposable/temporary email addresses are not allowed.' };
        }
        return { valid: true };
    }

    function sanitizeEmailKey(email) {
        return email.replace(/[.#$\[\]]/g, '_');
    }

    function syncWaitlistCount() {
        let base = BASE_WAITLIST_COUNT;
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                const db = firebase.database();
                db.ref('waitlist/buddyfrvr').on('value', (snapshot) => {
                    let count = snapshot.exists() ? snapshot.numChildren() : 0;
                    let total = base + count;
                    if (waitlistCountElem) {
                        waitlistCountElem.textContent = String(total).padStart(4, '0');
                    }
                });
            } catch (e) {
                if (waitlistCountElem) waitlistCountElem.textContent = String(base).padStart(4, '0');
            }
        } else {
            if (waitlistCountElem) waitlistCountElem.textContent = String(base).padStart(4, '0');
        }
    }

    syncWaitlistCount();

    const savedVerifiedEmail = localStorage.getItem('buddyfrvr_verified_email');
    if (savedVerifiedEmail) {
        showSuccessState(savedVerifiedEmail, BASE_WAITLIST_COUNT + 1);
    }

    otpDigits.forEach((digitInput, index) => {
        digitInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && index < otpDigits.length - 1) {
                otpDigits[index + 1].focus();
            }
        });

        digitInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpDigits[index - 1].focus();
            }
        });

        digitInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
            if (/^\d{6}$/.test(pasteData)) {
                pasteData.split('').forEach((char, i) => {
                    if (otpDigits[i]) otpDigits[i].value = char;
                });
                otpDigits[5].focus();
            }
        });
    });

    function startResendTimer() {
        let secondsLeft = 60;
        if (resendTimerText) resendTimerText.classList.remove('hidden');
        if (resendCodeBtn) resendCodeBtn.classList.add('hidden');
        if (resendCountdownElem) resendCountdownElem.textContent = secondsLeft;

        clearInterval(resendTimerInterval);
        resendTimerInterval = setInterval(() => {
            secondsLeft--;
            if (resendCountdownElem) resendCountdownElem.textContent = secondsLeft;
            if (secondsLeft <= 0) {
                clearInterval(resendTimerInterval);
                if (resendTimerText) resendTimerText.classList.add('hidden');
                if (resendCodeBtn) resendCodeBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    async function sendVerificationCode(email) {
        hideAlert();
        activePendingEmail = email;
        activeGeneratedOtp = String(Math.floor(100000 + Math.random() * 900000));
        otpExpiryTime = Date.now() + 10 * 60 * 1000;

        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                const db = firebase.database();
                const key = sanitizeEmailKey(email);
                db.ref(`waitlist_pending/buddyfrvr/${key}`).set({
                    email: email,
                    otp: activeGeneratedOtp,
                    expiresAt: otpExpiryTime,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
            } catch (e) {}
        }

        let sentViaSDK = false;
        if (typeof emailjs !== 'undefined' && EmailJSConfig.publicKey !== 'user_public_key_placeholder') {
            try {
                emailjs.init(EmailJSConfig.publicKey);
                await emailjs.send(EmailJSConfig.serviceId, EmailJSConfig.templateId, {
                    to_email: email,
                    passcode: activeGeneratedOtp,
                    project_name: "buddyfrvr"
                });
                sentViaSDK = true;
            } catch (err) {
                console.log("EmailJS send error fallback: ", err);
            }
        }

        if (sentEmailDisplay) sentEmailDisplay.textContent = email;
        step1Form.classList.add('hidden');
        step2Form.classList.remove('hidden');
        if (verifyingView) verifyingView.classList.add('hidden');
        if (successView) successView.classList.add('hidden');
        otpDigits.forEach(input => input.value = '');
        otpDigits[0].focus();
        startResendTimer();

        if (sentViaSDK) {
            showAlert(`verification code sent to ${email}. please check your inbox.`, 'info');
        } else {
            showAlert(`[Verification Code: ${activeGeneratedOtp}] Sent to ${email}. (Code expires in 10m)`, 'info');
        }
    }

    if (step1Form) {
        step1Form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim().toLowerCase();
            const validation = validateEmail(email);

            if (!validation.valid) {
                showAlert(validation.reason, 'error');
                return;
            }

            if (typeof firebase !== 'undefined' && firebase.database) {
                try {
                    const db = firebase.database();
                    const key = sanitizeEmailKey(email);
                    const snap = await db.ref(`waitlist/buddyfrvr/${key}`).once('value');
                    if (snap.exists() && snap.val().verified) {
                        localStorage.setItem('buddyfrvr_verified_email', email);
                        const countSnap = await db.ref('waitlist/buddyfrvr').once('value');
                        const spot = BASE_WAITLIST_COUNT + (countSnap.exists() ? countSnap.numChildren() : 1);
                        showSuccessState(email, spot);
                        return;
                    }
                } catch (err) {}
            }

            step1Btn.disabled = true;
            step1Btn.querySelector('.btn-text').textContent = 'sending...';

            await sendVerificationCode(email);

            step1Btn.disabled = false;
            step1Btn.querySelector('.btn-text').textContent = 'request code';
        });
    }

    if (step2Form) {
        step2Form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();

            let enteredCode = '';
            otpDigits.forEach(input => enteredCode += input.value.trim());

            if (enteredCode.length !== 6) {
                showAlert('please enter all 6 digits of the verification code.', 'error');
                return;
            }

            if (Date.now() > otpExpiryTime) {
                showAlert('verification code has expired. please request a new code.', 'error');
                return;
            }

            if (enteredCode !== activeGeneratedOtp) {
                showAlert('invalid verification code. please double check and try again.', 'error');
                return;
            }

            // 1. Switch UI to the explicit "Verifying Code..." phase
            step2Form.classList.add('hidden');
            if (verifyingView) verifyingView.classList.remove('hidden');

            try {
                let spotNumber = BASE_WAITLIST_COUNT + 1;
                if (typeof firebase !== 'undefined' && firebase.database) {
                    const db = firebase.database();
                    const key = sanitizeEmailKey(activePendingEmail);

                    await db.ref(`waitlist/buddyfrvr/${key}`).set({
                        email: activePendingEmail,
                        verified: true,
                        verificationMethod: '2step_otp',
                        timestamp: firebase.database.ServerValue.TIMESTAMP || Date.now(),
                        date: new Date().toISOString()
                    });

                    db.ref(`waitlist_pending/buddyfrvr/${key}`).remove();

                    const snapshot = await db.ref('waitlist/buddyfrvr').once('value');
                    spotNumber = BASE_WAITLIST_COUNT + (snapshot.exists() ? snapshot.numChildren() : 1);
                }

                // 2. Smooth verification delay so user sees the verification step clearly
                await new Promise(resolve => setTimeout(resolve, 800));

                // 3. Hide verifying view and pop up the "You're on the list!" success view
                if (verifyingView) verifyingView.classList.add('hidden');
                localStorage.setItem('buddyfrvr_verified_email', activePendingEmail);
                showSuccessState(activePendingEmail, spotNumber);

            } catch (err) {
                if (verifyingView) verifyingView.classList.add('hidden');
                step2Form.classList.remove('hidden');
                showAlert('failed to save to database. please try again.', 'error');
            }
        });
    }

    function showSuccessState(email, spot = BASE_WAITLIST_COUNT + 1) {
        hideAlert();
        if (step1Form) step1Form.classList.add('hidden');
        if (step2Form) step2Form.classList.add('hidden');
        if (verifyingView) verifyingView.classList.add('hidden');
        if (successView) successView.classList.remove('hidden');
        if (verifiedEmailDisplay) verifiedEmailDisplay.textContent = email;
        if (userWaitlistSpot) userWaitlistSpot.textContent = spot;
    }

    if (changeEmailBtn) {
        changeEmailBtn.addEventListener('click', () => {
            hideAlert();
            step2Form.classList.add('hidden');
            if (verifyingView) verifyingView.classList.add('hidden');
            step1Form.classList.remove('hidden');
            emailInput.focus();
        });
    }

    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', async () => {
            if (activePendingEmail) {
                await sendVerificationCode(activePendingEmail);
            }
        });
    }

    // ============================================================
    // 9. PREVENT SELECTION & DRAG DRIVEN BY JS (EXCEPT FOR INPUTS)
    // ============================================================
    document.addEventListener('selectstart', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
    });
});
