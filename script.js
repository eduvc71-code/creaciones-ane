// ===== MENU MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ===== INTERSECTION OBSERVER PARA ANIMACIONES AL SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// ===== CARRUSEL =====
let currentSlideIndex = 0;

function changeSlide(n) {
    showSlide(currentSlideIndex += n);
}

function currentSlide(n) {
    showSlide(currentSlideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (n >= slides.length) currentSlideIndex = 0;
    if (n < 0) currentSlideIndex = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

// Auto-rotate carousel
setInterval(() => {
    changeSlide(1);
}, 5000);

// ===== VALIDACIÓN DE FORMULARIO =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const asunto = contactForm.querySelectorAll('input[type="text"]')[1].value.trim();
        const mensaje = contactForm.querySelector('textarea').value.trim();

        if (!nombre) {
            mostrarNotificacion('Por favor ingresa tu nombre', 'error');
            return;
        }

        if (!email || !validarEmail(email)) {
            mostrarNotificacion('Por favor ingresa un email válido', 'error');
            return;
        }

        if (!mensaje) {
            mostrarNotificacion('Por favor escribe un mensaje', 'error');
            return;
        }

        mostrarNotificacion('¡Mensaje enviado exitosamente! Nos contactaremos pronto.', 'success');
        contactForm.reset();
    });
}

// ===== VALIDAR EMAIL =====
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===== MOSTRAR NOTIFICACIONES =====
function mostrarNotificacion(texto, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    notif.textContent = texto;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== CONTACTAR PRODUCTO =====
function contactarProducto(nombreProducto) {
    const mensajeWA = `Hola, me interesa consultar sobre: ${nombreProducto}`;
    const numeroWA = '56912345678';
    const urlWA = `https://wa.me/${numeroWA}?text=${encodeURIComponent(mensajeWA)}`;
    window.open(urlWA, '_blank');
}

// ===== EFECTO SCROLL EN NAVBAR =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    }
});

// ===== OCULTAR BOTONES FLOTANTES EN CONTACTO =====
window.addEventListener('scroll', () => {
    const floatingButtons = document.getElementById('floatingButtons');
    const contacto = document.getElementById('contacto');
    
    if (!contacto) return;
    
    const rect = contacto.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        floatingButtons.style.opacity = '0.3';
    } else {
        floatingButtons.style.opacity = '1';
    }
});

// ===== ANIMACIONES AL CARGAR =====
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });

    // Mostrar notificación de bienvenida
    setTimeout(() => {
        mostrarNotificacion('¡Bienvenido a Creaciones Ane! 🎨', 'info');
    }, 1000);
});

// ===== DETECCIÓN DE DISPOSITIVO MÓVIL =====
function esMobil() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (esMobil()) {
    document.body.classList.add('mobile');
}

console.log('✨ Creaciones Ane - Sitio web cargado exitosamente');
