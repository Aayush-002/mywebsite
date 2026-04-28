/* ===== COPYRIGHT YEAR ===== */
const yearEl = document.getElementById('copy-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== LOADER ===== */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 600);
    }
});

/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcon(next);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
}

/* ===== MOBILE NAVIGATION ===== */
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');

function openNav() {
    navMenu.classList.add('show');
    navOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeNav() {
    navMenu.classList.remove('show');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

if (navToggle) navToggle.addEventListener('click', openNav);
if (navClose) navClose.addEventListener('click', closeNav);
if (navOverlay) navOverlay.addEventListener('click', closeNav);

document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeNav);
});

/* ===== STICKY HEADER ===== */
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== ACTIVE NAV LINK ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        const sectionHeight = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector('.nav__menu a[href*=' + id + ']');
        if (link) {
            link.classList.toggle('active', scrollY >= sectionTop && scrollY < sectionTop + sectionHeight);
        }
    });
}
window.addEventListener('scroll', scrollActive);

/* ===== BACK TO TOP ===== */
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== TYPEWRITER EFFECT ===== */
const phrases = [
    'Computer Engineer',
    'AI Developer',
    'Web Developer',
    'ML Engineer',
    'NLP Specialist',
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeEl = document.getElementById('typewriter-text');

function typeWriter() {
    if (!typeEl) return;
    const current = phrases[phraseIndex];

    if (isDeleting) {
        typeEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typeEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 60 : 110;

    if (!isDeleting && charIndex === current.length) {
        speed = 1800;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
    }

    setTimeout(typeWriter, speed);
}
setTimeout(typeWriter, 800);


/* ===== WORK FILTER ===== */
const filterBtns = document.querySelectorAll('.work__filter');
const workCards = document.querySelectorAll('.work__card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        workCards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.4s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = contactForm.querySelector('[name="name"]').value.trim();
        const email = contactForm.querySelector('[name="email"]').value.trim();
        const subject = contactForm.querySelector('[name="subject"]').value.trim();
        const message = contactForm.querySelector('[name="message"]').value.trim();

        if (!name || !email || !message) {
            showStatus('Please fill in all required fields.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Save to localStorage for admin panel
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        messages.unshift({
            id: Date.now(),
            name, email, subject: subject || '(No subject)',
            message,
            date: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('portfolio_messages', JSON.stringify(messages));

        showStatus('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
        contactForm.reset();
    });
}

function showStatus(msg, type) {
    formStatus.textContent = msg;
    formStatus.className = 'contact__form-status ' + type;
    setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'contact__form-status';
    }, 5000);
}

/* ===== SCROLL REVEAL (simple intersection observer) ===== */
const revealEls = document.querySelectorAll(
    '.home__data, .home__img, .home__social, .about__img, .about__data, ' +
    '.skills__content, .work__card, .contact__card, .contact__form'
);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
});
