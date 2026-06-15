/* ============================================
   MediScanAI - Enhanced Three.js Background
   Advanced Particle System with Interactive Effects
   ============================================ */

// Three.js Enhanced Animated Background
let scene, camera, renderer, particles, heartShape, connections;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

function initThreeJS() {
    const container = document.getElementById('threejs-bg');
    if (!container) return;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create Enhanced Particle System
    createParticleSystem();
    
    // Create Heart Shape (optional - for homepage)
    if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
        createHeartShape();
    }

    // Mouse interaction
    document.addEventListener('mousemove', onMouseMove);

    // Animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createParticleSystem() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Positions - create a more distributed pattern
        const radius = Math.random() * 15 + 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        // Velocities for floating effect
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;

        // Colors - medical theme with gradients
        const colorChoice = Math.random();
        if (colorChoice > 0.7) {
            // Purple/Blue
            colors[i] = 0.4 + Math.random() * 0.2;
            colors[i + 1] = 0.5 + Math.random() * 0.2;
            colors[i + 2] = 0.9 + Math.random() * 0.1;
        } else if (colorChoice > 0.4) {
            // Pink/Purple
            colors[i] = 0.7 + Math.random() * 0.2;
            colors[i + 1] = 0.3 + Math.random() * 0.2;
            colors[i + 2] = 0.8 + Math.random() * 0.2;
        } else {
            // Light Blue
            colors[i] = 0.3 + Math.random() * 0.2;
            colors[i + 1] = 0.6 + Math.random() * 0.2;
            colors[i + 2] = 1.0;
        }

        // Sizes
        sizes[i / 3] = Math.random() * 0.03 + 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // Custom shader material for better visuals
    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createHeartShape() {
    const heartGeometry = new THREE.BufferGeometry();
    const heartPoints = [];
    
    // Create heart shape points
    for (let i = 0; i < 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heartPoints.push(new THREE.Vector3(x * 0.1, y * 0.1, 0));
    }

    heartGeometry.setFromPoints(heartPoints);
    
    const heartMaterial = new THREE.LineBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.3,
        linewidth: 2
    });

    heartShape = new THREE.Line(heartGeometry, heartMaterial);
    heartShape.position.z = -5;
    scene.add(heartShape);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Smooth camera movement based on mouse
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Animate particles
    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions with velocity
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Boundary check and bounce
            if (Math.abs(positions[i]) > 20) velocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 20) velocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 20) velocities[i + 2] *= -1;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate particle system
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
    }

    // Animate heart shape
    if (heartShape) {
        heartShape.rotation.z += 0.005;
        heartShape.scale.x = 1 + Math.sin(Date.now() * 0.001) * 0.1;
        heartShape.scale.y = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    }

    renderer.render(scene, camera);
}

// Initialize Three.js when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        initThreeJS();
        console.log('%c✨ MediScanAI Three.js Background Initialized', 'color: #667eea; font-weight: bold;');
    }
});

/* ============================================
   Form Validation & Enhancement
   ============================================ */

function validatePredictionForm() {
    const form = document.getElementById('prediction-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], select[required]');
            let isValid = true;
            let firstInvalid = null;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    input.style.borderColor = '#ef4444';
                    isValid = false;
                    if (!firstInvalid) firstInvalid = input;
                } else {
                    input.classList.remove('is-invalid');
                    input.style.borderColor = '';
                }
            });

            if (!isValid) {
                e.preventDefault();
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalid.focus();
                }
                
                if (window.toast) {
                    window.toast.show('Please fill in all required fields', 'error');
                } else {
                    alert('Please fill in all required fields.');
                }
            } else {
                // Show loading animation
                if (window.loadingAnimation) {
                    window.loadingAnimation.show('Analyzing patient data...');
                }
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('is-invalid');
                    this.style.borderColor = '#ef4444';
                } else {
                    this.classList.remove('is-invalid');
                    this.style.borderColor = '#10b981';
                    setTimeout(() => {
                        this.style.borderColor = '';
                    }, 1000);
                }
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid') && this.value.trim()) {
                    this.classList.remove('is-invalid');
                    this.style.borderColor = '';
                }
            });
        });
    }
}

/* ============================================
   Prediction History Management
   ============================================ */

function loadPredictionHistory() {
    fetch('/get_predictions')
        .then(response => response.json())
        .then(data => {
            const historyContainer = document.getElementById('prediction-history');
            if (!historyContainer) return;

            if (data.length === 0) {
                historyContainer.innerHTML = `
                    <div class="text-center p-3">
                        <i class="fas fa-inbox fa-3x text-muted mb-2"></i>
                        <p class="text-muted">No predictions yet</p>
                    </div>
                `;
                return;
            }

            historyContainer.innerHTML = '';
            data.forEach((prediction, index) => {
                const card = document.createElement('div');
                card.className = 'card mb-2 fade-in-up';
                card.style.animationDelay = `${index * 0.1}s`;
                
                const date = new Date(prediction.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                card.innerHTML = `
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-user-circle me-1"></i>
                                ${prediction.features.age}yo ${prediction.features.sex === 1 ? 'Male' : 'Female'}
                            </h6>
                            <span class="badge ${prediction.prediction === 1 ? 'badge-danger' : 'badge-success'}">
                                ${prediction.prediction === 1 ? 'Positive' : 'Negative'}
                            </span>
                        </div>
                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar ${prediction.prediction === 1 ? 'bg-danger' : 'bg-success'}" 
                                 style="width: ${prediction.probability * 100}%"></div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-percentage me-1"></i>
                                ${(prediction.probability * 100).toFixed(1)}%
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                ${formattedDate}
                            </small>
                        </div>
                    </div>
                `;
                
                // Add click event for details
                card.addEventListener('click', () => {
                    showPredictionDetails(prediction);
                });
                
                historyContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading prediction history:', error);
            const historyContainer = document.getElementById('prediction-history');
            if (historyContainer) {
                historyContainer.innerHTML = `
                    <div class="text-center p-3">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-2"></i>
                        <p class="text-muted">Error loading history</p>
                    </div>
                `;
            }
        });
}

function showPredictionDetails(prediction) {
    // Create modal or detailed view
    if (window.toast) {
        window.toast.show(`Patient: ${prediction.features.age}yo, Risk: ${(prediction.probability * 100).toFixed(1)}%`, 'info');
    }
}

/* ============================================
   Download History Functions
   ============================================ */

function downloadHistory(format) {
    if (window.loadingAnimation) {
        window.loadingAnimation.show(`Preparing ${format.toUpperCase()} download...`);
    }
    
    const url = `/download_history/${format}`;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `prediction_history.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        if (window.loadingAnimation) {
            window.loadingAnimation.hide();
        }
        if (window.toast) {
            window.toast.show(`Download started successfully!`, 'success');
        }
    }, 1000);
}

/* ============================================
   Sidebar Toggle & Mobile Menu
   ============================================ */

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('show');
            
            const icon = sidebarToggle.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-arrow-right me-1';
            } else {
                icon.className = 'fas fa-bars me-1';
            }
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
}

/* ============================================
   Initialize All Functions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functions
    validatePredictionForm();
    loadPredictionHistory();
    initSidebarToggle();
    
    // Refresh prediction history every 30 seconds
    setInterval(loadPredictionHistory, 30000);
    
    // Hide loading animation if page loaded
    if (window.loadingAnimation) {
        setTimeout(() => {
            window.loadingAnimation.hide();
        }, 500);
    }
    
    // Show welcome toast on homepage
    if ((window.location.pathname === '/' || window.location.pathname.includes('index')) && window.toast) {
        setTimeout(() => {
            window.toast.show('Welcome to MediScanAI! 🏥', 'info', 4000);
        }, 1000);
    }
    
    console.log('%c🚀 MediScanAI Fully Loaded!', 'color: #10b981; font-size: 16px; font-weight: bold;');
});

/* ============================================
   Export Functions for Global Access
   ============================================ */

window.MediScanAI = window.MediScanAI || {};
Object.assign(window.MediScanAI, {
    loadPredictionHistory,
    downloadHistory,
    validatePredictionForm,
    initSidebarToggle
});
