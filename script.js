// ============================================================
// PORTFOLIO LOGIC & INTERACTION SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. LIGHT / DARK THEME TOGGLE
    // ============================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElem = document.documentElement;

    // Retrieve saved theme or system preference
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
        });
    }

    // ============================================================
    // 2. VISITS COUNTER (START AT 4683 & INCREMENT)
    // ============================================================
    const BASE_VISITS = 4683;
    const visitElem = document.getElementById('visit-count');

    try {
        let storedVisits = parseInt(localStorage.getItem('pratham_visits'), 10);
        if (isNaN(storedVisits) || storedVisits < BASE_VISITS) {
            storedVisits = BASE_VISITS;
        } else {
            storedVisits += 1;
        }
        localStorage.setItem('pratham_visits', storedVisits);
        
        if (visitElem) {
            // Format to 5 digits with leading zero (e.g. 04683)
            visitElem.textContent = String(storedVisits).padStart(5, '0');
        }
    } catch (e) {
        if (visitElem) visitElem.textContent = "04683";
    }

    // ============================================================
    // 3. LOAD TIME CALCULATION
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
    // 4. ONLINE PEOPLE COUNTER
    // ============================================================
    const onlineElem = document.getElementById('online-count');
    if (onlineElem) {
        onlineElem.textContent = '001 online';
    }

    // ============================================================
    // 5. AUDIO PLAYER ("amahuk by prythm")
    // ============================================================
    const musicBtn = document.getElementById('music-player-btn');
    const audioElem = document.getElementById('amahuk-audio');

    if (musicBtn && audioElem) {
        musicBtn.addEventListener('click', () => {
            if (audioElem.paused) {
                audioElem.play().then(() => {
                    musicBtn.classList.add('playing');
                }).catch(err => {
                    console.log('Audio playback prevented or error:', err);
                });
            } else {
                audioElem.pause();
                musicBtn.classList.remove('playing');
            }
        });

        audioElem.addEventListener('ended', () => {
            musicBtn.classList.remove('playing');
        });
    }

    // ============================================================
    // 6. PREVENT SELECTION & DRAG DRIVEN BY JS AS BACKUP
    // ============================================================
    document.addEventListener('selectstart', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());
});
