/**
 * Antigravity.js - Physics-based UI behavior
 * Created for Kasi's Portfolio Overhaul
 */

class Antigravity {
    constructor() {
        this.nodes = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (this.isMobile) return;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        // Register elements that should have "antigravity" behavior
        const targets = document.querySelectorAll('.portfolio-item, .certificate-card, .timeline-content, .btn, .footer-site-social li');
        targets.forEach(el => {
            // Check if element is already registered to prevent duplicates
            if (el.dataset.registered) return;
            el.dataset.registered = "true";

            const rect = el.getBoundingClientRect();
            let repelStrength = 20;
            if (el.classList.contains('btn')) repelStrength = 10;
            if (el.matches('.footer-site-social li')) repelStrength = 5; // Very subtle for social links

            this.nodes.push({
                element: el,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                scale: 1,
                targetScale: 1,
                rect: rect,
                repelStrength: repelStrength,
                lerp: 0.12 // Inertia factor
            });
        });
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.active = true;
        });

        window.addEventListener('scroll', () => {
            this.mouse.active = true; // Refresh interactions on scroll
        });

        window.addEventListener('resize', () => {
            this.nodes.forEach(node => {
                node.rect = node.element.getBoundingClientRect();
            });
        });
    }

    animate() {
        const scrollY = window.scrollY;

        this.nodes.forEach(node => {
            const centerX = node.rect.left + node.rect.width / 2;
            const centerY = node.rect.top + node.rect.height / 2;

            const dx = this.mouse.x - centerX;
            const dy = (this.mouse.y) - (centerY - scrollY);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 400 && this.mouse.active) {
                // Gentle Repulsion + Proximity Depth
                const angle = Math.atan2(dy, dx);
                const force = (400 - distance) / 400;

                node.targetX = -Math.cos(angle) * force * node.repelStrength;
                node.targetY = -Math.sin(angle) * force * node.repelStrength;
                node.targetScale = 1 + (force * 0.03); // Subtle physics-based expansion

                // Active shadow depth
                if (node.element.classList.contains('portfolio-item') || node.element.classList.contains('certificate-card')) {
                    const shadowMove = force * 15;
                    node.element.style.boxShadow = `0 ${10 + shadowMove}px ${30 + shadowMove}px rgba(0,0,0,0.2)`;
                }
            } else {
                node.targetX = 0;
                node.targetY = 0;
                node.targetScale = 1;
            }

            // High Precision Lerp (Inertia)
            node.x += (node.targetX - node.x) * node.lerp;
            node.y += (node.targetY - node.y) * node.lerp;
            node.scale += (node.targetScale - node.scale) * 0.1;

            // Apply consistent 60fps transform
            node.element.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) scale(${node.scale})`;
        });

        // High-end Hero Parallax (Subtle Depth)
        const heroItems = document.querySelectorAll('.gsap-reveal-hero');
        heroItems.forEach(item => {
            const factor = item.tagName === 'H1' ? 0.015 : 0.01;
            const hx = (this.mouse.x - window.innerWidth / 2) * factor;
            const hy = (this.mouse.y - window.innerHeight / 2) * factor;
            item.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.AntigravityEngine = new Antigravity(); });
} else {
    window.AntigravityEngine = new Antigravity();
}
