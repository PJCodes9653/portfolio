// ============================================
// PREMIUM PORTFOLIO - JavaScript
// World-class interactions & animations
// ============================================

// ============================================
// SCROLL TO TOP ON LOAD
// ============================================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ============================================
// CUSTOM CURSOR - Interactive Lens Effect
// ============================================
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorDot = document.querySelector('.cursor-dot');
        this.cursorPos = { x: 0, y: 0 };
        this.cursorDotPos = { x: 0, y: 0 };
        this.isHovering = false;
        this.isLensMode = false;
    }

    init() {
        if (!this.cursor || !this.cursorDot) return;
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.cursorPos.x = e.clientX;
            this.cursorPos.y = e.clientY;
        });

        // Add hover effects for interactive elements
        const hoverElements = document.querySelectorAll('a, button, .project-card, .expertise-tag, .magnetic, .control-btn, .stack-node');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                if (el.classList.contains('project-card')) {
                    this.cursor.classList.add('hover-text');
                }
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover', 'hover-text');
            });
        });

        // Lens mode for text elements (headlines, thesis)
        const textElements = document.querySelectorAll('.headline, .thesis, h3');
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('lens-mode');
                this.isLensMode = true;
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('lens-mode');
                this.isLensMode = false;
            });
        });

        // Animate cursor
        this.animate();
    }

    animate() {
        // Smooth cursor following
        this.cursorDotPos.x += (this.cursorPos.x - this.cursorDotPos.x) * 0.15;
        this.cursorDotPos.y += (this.cursorPos.y - this.cursorDotPos.y) * 0.15;

        if (this.cursor) {
            this.cursor.style.left = `${this.cursorDotPos.x}px`;
            this.cursor.style.top = `${this.cursorDotPos.y}px`;
        }

        if (this.cursorDot) {
            this.cursorDot.style.left = `${this.cursorPos.x}px`;
            this.cursorDot.style.top = `${this.cursorPos.y}px`;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// MAGNETIC HOVER EFFECT
// ============================================
class MagneticEffect {
    constructor() {
        this.elements = document.querySelectorAll('.magnetic');
        this.strength = 0.3;
    }

    init() {
        this.elements.forEach(el => {
            el.addEventListener('mousemove', (e) => this.handleMove(e, el));
            el.addEventListener('mouseleave', (e) => this.handleLeave(e, el));
        });
    }

    handleMove(e, el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * this.strength;
        const deltaY = (e.clientY - centerY) * this.strength;
        
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    handleLeave(e, el) {
        el.style.transform = 'translate(0, 0)';
    }
}

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="text-zinc-500">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

function initTextScramble() {
    const elements = document.querySelectorAll('.scramble-text');
    elements.forEach(el => {
        const fx = new TextScramble(el);
        const originalText = el.textContent;
        
        // Initial scramble
        setTimeout(() => {
            fx.setText(originalText);
        }, 500);
    });
}

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ============================================
// LETTER HOVER SCRAMBLE EFFECT
// ============================================
function initLetterHover() {
    const letters = document.querySelectorAll('.headline .letter');
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`±§∞•√∑∏∫≈≠≤≥';
    
    letters.forEach(letter => {
        const originalChar = letter.textContent;
        let timeout;
        
        letter.addEventListener('mouseenter', () => {
            // Clear any existing timeout
            if (timeout) clearTimeout(timeout);
            
            // Get random symbol
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            letter.textContent = randomSymbol;
            letter.classList.add('scrambled');
            
            // Revert after 3 seconds
            timeout = setTimeout(() => {
                letter.textContent = originalChar;
                letter.classList.remove('scrambled');
            }, 3000);
        });
    });
}

// ============================================
// EMAIL COPY FUNCTIONALITY
// ============================================
function initEmailCopy() {
    const copyBtn = document.getElementById('copy-email');
    const toast = document.querySelector('.copy-toast');
    
    if (copyBtn && toast) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText('prathamjain2011@gmail.com');
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = 'prathamjain2011@gmail.com';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            }
        });
    }
}

// ============================================
// SMOOTH SCROLL (Lenis-style)
// ============================================
class SmoothScroll {
    constructor() {
        this.currentY = 0;
        this.targetY = 0;
        this.ease = 0.075;
        this.scrolling = false;
    }

    init() {
        // Simple smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// ============================================
// COMMAND PALETTE
// ============================================
class CommandPalette {
    constructor() {
        this.palette = document.querySelector('.command-palette');
        this.input = document.querySelector('.command-palette-input');
        this.results = document.querySelector('.command-palette-results');
        this.isOpen = false;
        this.selectedIndex = 0;
        
        this.commands = [
            { title: 'Go to Projects', desc: 'View current projects', action: () => this.scrollTo('.bento-grid'), icon: '→' },
            { title: 'Go to Education', desc: 'View education details', action: () => this.scrollTo('#education'), icon: '📚' },
            { title: 'Go to Expertise', desc: 'View skills & expertise', action: () => this.scrollTo('#expertise'), icon: '⚡' },
            { title: 'Go to Archive', desc: 'View past projects', action: () => this.scrollTo('#archive'), icon: '📁' },
            { title: 'Contact via Email', desc: 'suryauthkarsha@gmail.com', action: () => window.location.href = 'mailto:suryauthkarsha@gmail.com', icon: '✉' },
            { title: 'Open Twitter', desc: '@realPrathamJain', action: () => window.open('https://x.com/realPrathamJain', '_blank'), icon: '𝕏' },
            { title: 'Open GitHub', desc: 'pratham-jain33', action: () => window.open('https://github.com/pratham-jain33', '_blank'), icon: '⌘' },
            { title: 'Copy Email', desc: 'Copy email to clipboard', action: () => this.copyEmail(), icon: '📋' },
        ];
    }

    init() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            
            if (this.isOpen) {
                if (e.key === 'Escape') {
                    this.close();
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectNext();
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectPrev();
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelected();
                }
            }
        });

        // Close on backdrop click
        if (this.palette) {
            this.palette.addEventListener('click', (e) => {
                if (e.target === this.palette) {
                    this.close();
                }
            });
        }

        // Filter on input
        if (this.input) {
            this.input.addEventListener('input', () => this.filter());
        }

        // Initial render
        this.render(this.commands);
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        if (this.palette) {
            this.palette.classList.add('active');
            this.input.focus();
            this.input.value = '';
            this.render(this.commands);
        }
    }

    close() {
        this.isOpen = false;
        if (this.palette) {
            this.palette.classList.remove('active');
        }
    }

    filter() {
        const query = this.input.value.toLowerCase();
        const filtered = this.commands.filter(cmd => 
            cmd.title.toLowerCase().includes(query) || 
            cmd.desc.toLowerCase().includes(query)
        );
        this.selectedIndex = 0;
        this.render(filtered);
    }

    render(commands) {
        if (!this.results) return;
        
        this.results.innerHTML = commands.map((cmd, i) => `
            <div class="command-palette-item ${i === this.selectedIndex ? 'selected' : ''}" data-index="${i}">
                <div class="command-palette-item-icon">${cmd.icon}</div>
                <div class="command-palette-item-text">
                    <div class="command-palette-item-title">${cmd.title}</div>
                    <div class="command-palette-item-desc">${cmd.desc}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.results.querySelectorAll('.command-palette-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                this.selectedIndex = i;
                this.executeSelected();
            });
        });
    }

    selectNext() {
        const items = this.results.querySelectorAll('.command-palette-item');
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.updateSelection();
    }

    selectPrev() {
        const items = this.results.querySelectorAll('.command-palette-item');
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.updateSelection();
    }

    updateSelection() {
        const items = this.results.querySelectorAll('.command-palette-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this.selectedIndex);
        });
    }

    executeSelected() {
        const query = this.input.value.toLowerCase();
        const filtered = this.commands.filter(cmd => 
            cmd.title.toLowerCase().includes(query) || 
            cmd.desc.toLowerCase().includes(query)
        );
        
        if (filtered[this.selectedIndex]) {
            filtered[this.selectedIndex].action();
            this.close();
        }
    }

    scrollTo(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    copyEmail() {
        navigator.clipboard.writeText('suryauthkarsha@gmail.com');
        // Could add a toast notification here
    }
}

// ============================================
// PROJECT CARD GLOW & 3D TILT EFFECT
// ============================================
function initCardGlow() {
    const cards = document.querySelectorAll('.project-card, .glass-card');
    
    cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        if (!glow) return;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        });
    });
}

// ============================================
// 3D TILT EFFECT FOR CARDS
// ============================================
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('.tilt-card');
        this.maxTilt = 10; // degrees
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', (e) => this.handleLeave(e, card));
            card.addEventListener('mouseenter', (e) => this.handleEnter(e, card));
        });
    }

    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / (rect.height / 2)) * -this.maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * this.maxTilt;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Move internal glow to follow mouse
        const glow = card.querySelector('.card-glow');
        if (glow) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        }
    }

    handleLeave(e, card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease';
    }

    handleEnter(e, card) {
        card.style.transition = 'transform 0.1s ease';
    }
}

// ============================================
// STAGGERED ENTRY ANIMATION
// ============================================
function initStaggeredEntry() {
    const header = document.querySelector('header');
    if (!header) return;

    const elements = header.children;
    Array.from(elements).forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 300 + (i * 150));
    });
}

// ============================================
// SECTION BACKGROUND MORPH
// ============================================
function initSectionMorph() {
    const blobs = document.querySelectorAll('.gradient-blob');
    
    const sections = document.querySelectorAll('section');
    const colors = [
        { blob1: 'rgba(59, 130, 246, 0.08)', blob2: 'rgba(139, 92, 246, 0.06)' },
        { blob1: 'rgba(20, 184, 166, 0.08)', blob2: 'rgba(59, 130, 246, 0.06)' },
        { blob1: 'rgba(139, 92, 246, 0.08)', blob2: 'rgba(236, 72, 153, 0.06)' },
        { blob1: 'rgba(234, 179, 8, 0.06)', blob2: 'rgba(249, 115, 22, 0.05)' },
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                const colorSet = colors[index % colors.length];
                
                if (blobs[0]) blobs[0].style.background = colorSet.blob1;
                if (blobs[1]) blobs[1].style.background = colorSet.blob2;
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// ============================================
// SOUND EFFECTS (Subtle)
// ============================================
class SoundEffects {
    constructor() {
        this.enabled = false; // Disabled by default
        this.audioContext = null;
    }

    init() {
        // Only enable if user opts in
        const soundToggle = document.querySelector('.sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.enabled = !this.enabled;
                soundToggle.classList.toggle('active', this.enabled);
            });
        }
    }

    playClick() {
        if (!this.enabled) return;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
}

// ============================================
// LIVING ELEMENTS (Time, Weather, Availability)
// ============================================
class LivingElements {
    constructor() {
        this.timeElements = document.querySelectorAll('.live-time, .footer-time');
        this.weatherElement = document.querySelector('.weather-temp');
    }

    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Fetch weather for Bengaluru (using a free weather API)
        this.updateWeather();
        setInterval(() => this.updateWeather(), 600000); // Update every 10 minutes
    }

    updateTime() {
        const options = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        const time = new Date().toLocaleTimeString('en-US', options);
        
        this.timeElements.forEach(el => {
            if (el) el.textContent = time;
        });
    }

    async updateWeather() {
        try {
            // Using wttr.in for simple weather (no API key needed)
            const response = await fetch('https://wttr.in/Bengaluru?format=%t');
            if (response.ok) {
                const temp = await response.text();
                if (this.weatherElement) {
                    // Extract just the number from "+24°C" format
                    const tempNum = temp.replace(/[^0-9-]/g, '');
                    this.weatherElement.textContent = tempNum;
                }
            }
        } catch (error) {
            // Silently fail - weather is a nice-to-have
            console.log('Weather fetch failed:', error);
        }
    }
}

// ============================================
// HUSH/FOCUS MODE
// ============================================
class HushMode {
    constructor() {
        this.toggle = document.querySelector('.hush-toggle');
        this.isActive = false;
    }

    init() {
        if (!this.toggle) return;
        
        this.toggle.addEventListener('click', () => {
            this.isActive = !this.isActive;
            document.body.classList.toggle('hush-mode', this.isActive);
            this.toggle.classList.toggle('active', this.isActive);
        });
    }
}

// ============================================
// PRYTHM MUSIC PLAYER
// ============================================
class PrythmPlayer {
    constructor() {
        this.toggle = document.getElementById('prythm-toggle');
        this.icon = document.getElementById('prythm-icon');
        this.audio = document.getElementById('prythm-audio');
        this.miniPlayer = document.getElementById('prythm-mini-player');
        this.playBtn = document.getElementById('mini-player-play');
        this.prevBtn = document.getElementById('mini-player-prev');
        this.nextBtn = document.getElementById('mini-player-next');
        this.trackTitle = document.getElementById('mini-player-track');
        this.progressBar = document.getElementById('mini-player-progress');
        this.currentTimeEl = document.getElementById('mini-player-current');
        this.durationEl = document.getElementById('mini-player-duration');
        
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.rotationSpeed = 3; // seconds per rotation
        this.tracks = [
            { name: 'The Real Prythm', src: 'assets/music/the_real_prythm.mp3' },
            { name: 'Novae', src: 'assets/music/novae.mp3' },
            { name: 'Supernovae', src: 'assets/music/supernovae.mp3' },
            { name: 'Amahuk', src: 'assets/music/amahuk.mp3' }
        ];
    }

    init() {
        if (!this.toggle || !this.audio) return;
        
        // Set volume
        this.audio.volume = 0.5;
        
        // Randomly select initial track
        const randomIndex = Math.floor(Math.random() * this.tracks.length);
        this.loadTrack(randomIndex);
        
        // Autoplay on first user interaction (required by browsers)
        this.setupAutoplay();
        
        // Toggle play/pause from main icon
        this.toggle.addEventListener('click', () => this.togglePlay());
        
        // Mini player controls
        if (this.playBtn) {
            this.playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prevTrack();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.nextTrack();
            });
        }
        
        // Progress bar seek
        if (this.progressBar) {
            this.progressBar.addEventListener('input', (e) => {
                const seekTime = (e.target.value / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            });
        }
        
        // Update time display
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        
        // Auto play next track when current ends
        this.audio.addEventListener('ended', () => this.nextTrack());
        
        // Listen for play/pause events (for OS media controls)
        this.audio.addEventListener('play', () => this.syncPlayState(true));
        this.audio.addEventListener('pause', () => this.syncPlayState(false));
        
        // Setup Media Session API for OS controls
        this.setupMediaSession();
        
        // Continuously check play state
        this.startPlayStateMonitor();
    }

    setupAutoplay() {
        // Browsers require user interaction before playing audio
        // We'll try to autoplay and if it fails, play on first interaction
        const attemptAutoplay = () => {
            this.audio.play().then(() => {
                // Autoplay succeeded
                this.isPlaying = true;
                this.toggle.classList.add('playing');
                if (this.playBtn) this.playBtn.classList.add('playing');
                this.updateMediaSessionMetadata();
            }).catch(() => {
                // Autoplay was prevented, wait for user interaction
                const playOnInteraction = () => {
                    this.play();
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('keydown', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
        };
        
        // Small delay to ensure everything is loaded
        setTimeout(attemptAutoplay, 500);
    }

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            // Set metadata
            this.updateMediaSessionMetadata();
            
            // Handle OS media controls
            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        }
    }

    updateMediaSessionMetadata() {
        if ('mediaSession' in navigator) {
            const track = this.tracks[this.currentTrackIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.name,
                artist: 'Prythm',
                album: 'Portfolio Vibes'
            });
        }
    }

    syncPlayState(playing) {
        this.isPlaying = playing;
        if (playing) {
            // Remove stopping state and start spinning
            this.toggle.classList.remove('stopping');
            if (this.icon) {
                this.icon.style.animation = '';
                this.icon.style.transform = '';
            }
            this.toggle.classList.add('playing');
            if (this.playBtn) this.playBtn.classList.add('playing');
        } else {
            // Get current rotation angle and animate to complete rotation (360deg)
            this.smoothStopRotation();
        }
    }

    smoothStopRotation() {
        if (!this.icon) return;
        
        // Get current computed rotation
        const computedStyle = window.getComputedStyle(this.icon);
        const matrix = computedStyle.transform;
        let currentAngle = 0;
        
        if (matrix !== 'none') {
            const values = matrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            currentAngle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            if (currentAngle < 0) currentAngle += 360;
        }
        
        // Calculate remaining degrees to complete full rotation (back to 0/360)
        const remainingDegrees = 360 - currentAngle;
        
        // Calculate duration based on remaining rotation (slower as it approaches 0)
        const baseDuration = 1.2; // base duration for full rotation
        const duration = Math.max(0.3, (remainingDegrees / 360) * baseDuration + 0.2);
        
        // Stop current animation and set current position
        this.icon.style.animation = 'none';
        this.icon.style.transform = `rotate(${currentAngle}deg)`;
        
        // Force reflow
        this.icon.offsetHeight;
        
        // Create and apply deceleration animation
        const keyframes = `
            @keyframes vinylSpinToZero {
                0% { transform: rotate(${currentAngle}deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        // Add keyframes to document if not exists
        let styleSheet = document.getElementById('prythm-dynamic-styles');
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'prythm-dynamic-styles';
            document.head.appendChild(styleSheet);
        }
        styleSheet.textContent = keyframes;
        
        // Apply the animation
        this.icon.style.animation = `vinylSpinToZero ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
        
        this.toggle.classList.remove('playing');
        this.toggle.classList.add('stopping');
        
        // Clean up after animation
        setTimeout(() => {
            this.toggle.classList.remove('stopping');
            this.icon.style.animation = '';
            this.icon.style.transform = 'rotate(0deg)';
            if (this.playBtn) this.playBtn.classList.remove('playing');
        }, duration * 1000);
    }

    startPlayStateMonitor() {
        // Check every 100ms if audio is actually playing
        setInterval(() => {
            const actuallyPlaying = !this.audio.paused && !this.audio.ended;
            if (actuallyPlaying !== this.isPlaying) {
                this.syncPlayState(actuallyPlaying);
            }
        }, 100);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            if (this.progressBar) this.progressBar.value = progress;
            if (this.currentTimeEl) this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        if (this.durationEl) this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    loadTrack(index) {
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        this.audio.src = track.src;
        if (this.trackTitle) {
            this.trackTitle.textContent = track.name;
        }
        // Reset progress
        if (this.progressBar) this.progressBar.value = 0;
        if (this.currentTimeEl) this.currentTimeEl.textContent = '0:00';
        // Update media session metadata
        this.updateMediaSessionMetadata();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play().catch(e => {
            console.log('Audio autoplay prevented:', e);
        });
        this.isPlaying = true;
        this.toggle.classList.add('playing');
        if (this.playBtn) this.playBtn.classList.add('playing');
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.toggle.classList.remove('playing');
        if (this.playBtn) this.playBtn.classList.remove('playing');
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        // Always play when switching tracks
        this.play();
    }

    prevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        // Always play when switching tracks
        this.play();
    }
}

// ============================================
// STACK CONSTELLATION
// ============================================
class StackConstellation {
    constructor() {
        this.container = document.querySelector('.stack-constellation');
        this.svg = document.querySelector('.constellation-lines');
        this.nodes = document.querySelectorAll('.stack-node');
    }

    init() {
        if (!this.svg || this.nodes.length === 0) return;
        
        // Draw connecting lines between related nodes
        this.drawLines();
        
        // Redraw on resize
        window.addEventListener('resize', () => this.drawLines());
    }

    drawLines() {
        if (!this.container) return;
        
        const rect = this.container.getBoundingClientRect();
        this.svg.innerHTML = '';
        
        // Define connections (pairs of node indices)
        const connections = [
            [0, 1],   // Figma - Photoshop
            [2, 3],   // Python - JavaScript
            [3, 4],   // JavaScript - HTML/CSS
            [3, 5],   // JavaScript - Tailwind
            [5, 6],   // Tailwind - VS Code
            [6, 7],   // VS Code - Git
            [8, 9],   // FL Studio - Ableton
            [2, 10],  // Python - GPT-4
            [3, 10],  // JavaScript - GPT-4
            [0, 11],  // Figma - Notion
            // Extended connections for new nodes
            [7, 12],  // Git - GitHub
            [12, 3],  // GitHub - JavaScript
            [13, 2],  // FastAPI - Python
            [14, 3],  // Vercel - JavaScript
            [15, 2],  // NumPy - Python
            [16, 1],  // Framer Motion - React
            [17, 6],  // Docker - VS Code
            [18, 17], // AWS - Docker
            [19, 10], // Cursor AI - GPT-4
            [11, 14], // Notion - Vercel
            [0, 16],  // Figma - Framer Motion
            [5, 1],   // Tailwind - React
            [4, 0],   // Next.js - Figma
        ];

        connections.forEach(([i, j]) => {
            if (this.nodes[i] && this.nodes[j]) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                
                const x1 = parseFloat(node1.style.getPropertyValue('--x')) / 100 * rect.width;
                const y1 = parseFloat(node1.style.getPropertyValue('--y')) / 100 * rect.height;
                const x2 = parseFloat(node2.style.getPropertyValue('--x')) / 100 * rect.width;
                const y2 = parseFloat(node2.style.getPropertyValue('--y')) / 100 * rect.height;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                this.svg.appendChild(line);
            }
        });
    }
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Simple fade in - add loaded class after a brief moment
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Initialize scroll reveal and letter hover immediately
    initScrollReveal();
    initLetterHover();

    // Initialize cursor
    const cursor = new CustomCursor();
    cursor.init();

    // Initialize magnetic effect
    const magnetic = new MagneticEffect();
    magnetic.init();

    // Initialize smooth scroll
    const smoothScroll = new SmoothScroll();
    smoothScroll.init();

    // Initialize command palette
    const commandPalette = new CommandPalette();
    commandPalette.init();

    // Initialize card glow
    initCardGlow();

    // Initialize 3D tilt effect
    const tilt = new TiltEffect();
    tilt.init();

    // Initialize staggered entry
    setTimeout(initStaggeredEntry, 100);

    // Initialize section morph
    initSectionMorph();

    // Initialize sound effects
    const sounds = new SoundEffects();
    sounds.init();

    // Initialize living elements (time, weather)
    const living = new LivingElements();
    living.init();

    // Initialize Prythm music player
    const prythm = new PrythmPlayer();
    prythm.init();

    // Initialize stack constellation
    const constellation = new StackConstellation();
    constellation.init();

    // Initialize email copy
    initEmailCopy();

    // Add click sounds to interactive elements
    document.querySelectorAll('a, button, .project-card').forEach(el => {
        el.addEventListener('click', () => sounds.playClick());
    });
});

// ============================================
// HAPTIC FEEDBACK (Mobile)
// ============================================
function hapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

// Add to clickable elements on mobile
if ('ontouchstart' in window) {
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('touchstart', hapticFeedback);
    });
}
