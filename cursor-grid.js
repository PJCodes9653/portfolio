/**
 * CursorGrid - Interactive Canvas Background Component (Dots Variant)
 * Adapted from React Bits <CursorGrid /> for Vanilla JS + HTML5 Canvas
 */

const FALLOFF_CURVES = {
    linear: t => t,
    smooth: t => t * t * (3 - 2 * t),
    sharp: t => t * t * t
};

const hexToRgb = hex => {
    if (!hex) return [217, 70, 239];
    if (hex.startsWith('rgb')) {
        const match = hex.match(/\d+/g);
        if (match && match.length >= 3) return match.slice(0, 3).map(Number);
    }
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = parseInt(v.slice(0, 6), 16);
    if (isNaN(num)) return [217, 70, 239];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

class CursorGrid {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;

        this.canvas = this.container.querySelector('canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.container.appendChild(this.canvas);
        }
        this.canvas.className = 'cursor-grid__canvas';

        this.options = {
            cellSize: options.cellSize ?? 28,
            color: options.color ?? 'auto',
            radius: options.radius ?? 100,
            falloff: options.falloff ?? 'smooth',
            holdTime: options.holdTime ?? 0,
            fadeDuration: options.fadeDuration ?? 800,
            lineWidth: options.lineWidth ?? 0.8,
            maxOpacity: options.maxOpacity ?? 0.6,
            fillOpacity: options.fillOpacity ?? 0,
            gridOpacity: options.gridOpacity ?? 0.15,
            clickPulse: options.clickPulse ?? true,
            pulseSpeed: options.pulseSpeed ?? 300,
            dotRadius: options.dotRadius ?? 1.3,
            className: options.className ?? ''
        };

        if (this.options.className) {
            this.container.classList.add(...this.options.className.split(' ').filter(Boolean));
        }

        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.cols = 0;
        this.rows = 0;
        this.offX = 0;
        this.offY = 0;
        this.alphas = new Float32Array(0);
        this.touched = new Float64Array(0);
        this.w = 0;
        this.h = 0;
        this.pulses = [];
        this.raf = 0;
        this.running = false;
        this.lastFrame = 0;

        this.drawBound = this.draw.bind(this);
        this.init();
    }

    getColorRgb() {
        if (this.options.color && this.options.color !== 'auto') {
            return hexToRgb(this.options.color);
        }
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? [235, 235, 235] : [40, 40, 40];
    }

    rebuild() {
        const p = this.options;
        this.w = this.container.offsetWidth || window.innerWidth;
        this.h = this.container.offsetHeight || window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.max(1, Math.round(this.w * this.dpr));
        this.canvas.height = Math.max(1, Math.round(this.h * this.dpr));
        this.canvas.style.width = `${this.w}px`;
        this.canvas.style.height = `${this.h}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.cols = Math.ceil(this.w / p.cellSize) + 1;
        this.rows = Math.ceil(this.h / p.cellSize) + 1;
        this.offX = (this.w - this.cols * p.cellSize) / 2;
        this.offY = (this.h - this.rows * p.cellSize) / 2;

        const total = this.cols * this.rows;
        this.alphas = new Float32Array(total);
        this.touched = new Float64Array(total);
    }

    cellCenter(i) {
        const p = this.options;
        const cx = this.offX + (i % this.cols) * p.cellSize + p.cellSize / 2;
        const cy = this.offY + Math.floor(i / this.cols) * p.cellSize + p.cellSize / 2;
        return [cx, cy];
    }

    energize(x, y, boost) {
        const p = this.options;
        const r = Math.max(p.radius, 1);
        const ease = FALLOFF_CURVES[p.falloff] ?? FALLOFF_CURVES.linear;
        const now = performance.now();
        const minCol = Math.max(0, Math.floor((x - r - this.offX) / p.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor((x + r - this.offX) / p.cellSize));
        const minRow = Math.max(0, Math.floor((y - r - this.offY) / p.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor((y + r - this.offY) / p.cellSize));

        for (let cRow = minRow; cRow <= maxRow; cRow++) {
            for (let cCol = minCol; cCol <= maxCol; cCol++) {
                const i = cRow * this.cols + cCol;
                const [cx, cy] = this.cellCenter(i);
                const dist = Math.hypot(cx - x, cy - y);
                if (dist > r) continue;
                const level = ease(1 - dist / r) * p.maxOpacity * (boost ?? 1);
                if (level > this.alphas[i]) {
                    this.alphas[i] = level;
                    this.touched[i] = now;
                } else if (level > 0) {
                    this.touched[i] = now;
                }
            }
        }
    }

    draw(now = performance.now()) {
        const p = this.options;
        const dt = Math.min(now - this.lastFrame, 50);
        this.lastFrame = now;
        this.ctx.clearRect(0, 0, this.w, this.h);
        const [cr, cg, cb] = this.getColorRgb();

        // Handle expanding click pulse waves
        for (let pi = this.pulses.length - 1; pi >= 0; pi--) {
            const pulse = this.pulses[pi];
            const age = (now - pulse.t0) / 1000;
            const ringR = age * p.pulseSpeed;
            if (ringR > Math.hypot(this.w, this.h)) {
                this.pulses.splice(pi, 1);
                continue;
            }
            const band = p.cellSize * 1.2;
            const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - this.offX) / p.cellSize));
            const maxCol = Math.min(this.cols - 1, Math.floor((pulse.x + ringR + band - this.offX) / p.cellSize));
            const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - this.offY) / p.cellSize));
            const maxRow = Math.min(this.rows - 1, Math.floor((pulse.y + ringR + band - this.offY) / p.cellSize));

            for (let cRow = minRow; cRow <= maxRow; cRow++) {
                for (let cCol = minCol; cCol <= maxCol; cCol++) {
                    const i = cRow * this.cols + cCol;
                    const [cx, cy] = this.cellCenter(i);
                    const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
                    if (Math.abs(dist - ringR) < band / 2 && p.maxOpacity > this.alphas[i]) {
                        this.alphas[i] = p.maxOpacity;
                        this.touched[i] = now;
                    }
                }
            }
        }

        let anyVisible = this.pulses.length > 0;
        const fadeStep = dt / Math.max(p.fadeDuration, 16);
        const total = this.alphas.length;

        // Draw static grid dots if gridOpacity > 0
        if (p.gridOpacity > 0) {
            this.ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`;
            const baseDotR = p.dotRadius;
            for (let i = 0; i < total; i++) {
                if (this.alphas[i] > 0.001) continue;
                const [cx, cy] = this.cellCenter(i);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, baseDotR, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw energized/illuminated dots
        for (let i = 0; i < total; i++) {
            let a = this.alphas[i];
            if (a <= 0) continue;
            if (now - this.touched[i] > p.holdTime) {
                a = Math.max(0, a - fadeStep);
                this.alphas[i] = a;
                if (a <= 0) continue;
            }
            anyVisible = true;

                        const [cx, cy] = this.cellCenter(i);
            const activeRadius = p.dotRadius + a * 0.8;

            // Soft radial halo glow for lit dots (softened for premium look)
            if (a > 0.04) {
                const glowRadius = Math.max(activeRadius * 2.2, 5);
                const glow = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
                glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a * 0.20})`);
                glow.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${a * 0.05})`);
                glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = glow;
                this.ctx.fill();
            }

            // Core bright dot
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, activeRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${Math.min(1, p.gridOpacity + a * (1 - p.gridOpacity))})`;
            this.ctx.fill();
        }

        if (anyVisible) {
            this.raf = requestAnimationFrame(this.drawBound);
        } else {
            this.running = false;
        }
    }

    wake() {
        if (this.running) return;
        this.running = true;
        this.lastFrame = performance.now();
        this.raf = requestAnimationFrame(this.drawBound);
    }

    init() {
        this.rebuild();
        this.draw();

        const toLocal = e => {
            const rect = this.canvas.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        };

        const isNearText = (clientX, clientY) => {
            const selectors = 'p, h1, h2, h3, a, button, span, li, header, footer, img, svg, path, .thing-row, .item-entry, .link-item, .project-modal, .top-bar';
            const offsets = [
                [0, 0],
                [-35, 0], [35, 0],
                [0, -35], [0, 35]
            ];
            for (const [ox, oy] of offsets) {
                const el = document.elementFromPoint(clientX + ox, clientY + oy);
                if (el && el.closest(selectors)) {
                    return true;
                }
            }
            return false;
        };

        this.onPointerMove = e => {
            const [x, y] = toLocal(e);
            if (isNearText(e.clientX, e.clientY)) {
                return;
            }
            this.energize(x, y);
            this.wake();
        };

        this.onPointerDown = e => {
            if (!this.options.clickPulse) return;
            const [x, y] = toLocal(e);
            this.pulses.push({ x, y, t0: performance.now() });
            this.wake();
        };

        this.ro = new ResizeObserver(() => {
            this.rebuild();
            this.draw();
            this.wake();
        });
        this.ro.observe(this.container);

        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
        window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    }

    destroy() {
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.ro) this.ro.disconnect();
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerdown', this.onPointerDown);
    }
}
