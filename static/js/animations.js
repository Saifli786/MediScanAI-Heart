/* ============================================
   MediScanAI - Advanced Animations & Interactions
   Professional JavaScript for Enhanced UX
   ============================================ */

// ========== Intersection Observer for Scroll Animations ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = 'all 0.8s ease-out';
        animateOnScroll.observe(card);
    });

    // Animate sections
    document.querySelectorAll('.glass-container').forEach(container => {
        container.style.opacity = '0';
        container.style.transform = 'translateY(40px)';
        container.style.transition = 'all 0.8s ease-out';
        animateOnScroll.observe(container);
    });
});

// ========== Navbar Scroll Effect ==========
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ========== Smooth Scroll for Anchor Links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== Card Tilt Effect ==========
class CardTilt {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    handleMouseLeave() {
        this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

// Apply tilt effect to cards (disabled to prevent floating on cursor move)
document.addEventListener('DOMContentLoaded', () => {
    // document.querySelectorAll('.card').forEach(card => {
    //     new CardTilt(card);
    // });
});

// ========== Animated Counter ==========
class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.startValue = 0;
        this.startTime = null;
    }

    animate(currentTime) {
        if (!this.startTime) this.startTime = currentTime;
        const progress = Math.min((currentTime - this.startTime) / this.duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(this.startValue + (this.target - this.startValue) * easeOutQuart);
        
        this.element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame((time) => this.animate(time));
        } else {
            this.element.textContent = this.target.toLocaleString();
        }
    }

    start() {
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize counters
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-counter]').forEach(element => {
        const target = parseInt(element.getAttribute('data-counter'));
        const counter = new AnimatedCounter(element, target);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counter.start();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    });
});

// ========== Particle Cursor Effect ==========
class ParticleCursor {
    constructor() {
        this.particles = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.addParticle(e.clientX, e.clientY));
        
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addParticle(x, y) {
        const particle = {
            x,
            y,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            life: 1
        };
        this.particles.push(particle);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 0.02;
            
            if (particle.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(102, 126, 234, ${particle.life})`;
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle cursor (optional - can be disabled for performance)
// new ParticleCursor();

// ========== Form Input Animations ==========
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.form-control, .form-select');
    
    inputs.forEach(input => {
        // Add focus animation
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
        
        // Add ripple effect on click
        input.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// ========== Button Ripple Effect ==========
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple styles
const style = document.createElement('style');
style.textContent = `
    .btn-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .input-focused {
        transform: scale(1.02);
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);

// ========== Loading Animation ==========
class LoadingAnimation {
    constructor() {
        this.overlay = null;
    }

    show(message = 'Loading...') {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">${message}</p>
            </div>
        `;
        document.body.appendChild(this.overlay);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-content {
                text-align: center;
            }
            .loading-text {
                margin-top: 1rem;
                font-size: 1.2rem;
                font-weight: 600;
                color: #667eea;
            }
        `;
        document.head.appendChild(style);
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300);
        }
    }
}

// Export loading animation
window.loadingAnimation = new LoadingAnimation();

// ========== Toast Notification System ==========
class ToastNotification {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-left: 4px solid ${this.getColor(type)};
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}" style="color: ${this.getColor(type)}; font-size: 1.5rem;"></i>
            <span style="flex: 1; font-weight: 600;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #999;">×</button>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    getColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#667eea'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyle);

// Export toast notification
window.toast = new ToastNotification();

// ========== Parallax Effect ==========
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-parallax') || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ========== Page Transition Effect ==========
document.addEventListener('DOMContentLoaded', () => {
    // Fade in page on load
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ========== Console Welcome Message ==========
console.log('%c🏥 MediScanAI - Heart Disease Prediction System', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cPowered by Advanced Machine Learning', 'color: #764ba2; font-size: 14px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');

// ========== Export Functions ==========
window.MediScanAI = {
    loading: window.loadingAnimation,
    toast: window.toast,
    animateCounter: AnimatedCounter,
    cardTilt: CardTilt
};
