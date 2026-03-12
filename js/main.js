// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize theme: stored preference > system preference > light
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(stored || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// Scroll fade-in animations
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach((el) => fadeObserver.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            navLinks.forEach((link) => {
                link.classList.toggle('active',
                    link.getAttribute('href') === '#' + entry.target.id
                );
            });
        }
    });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

sections.forEach((section) => navObserver.observe(section));

// Copy email button
const copyBtn = document.querySelector('.copy-email');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const email = copyBtn.getAttribute('data-email');
        navigator.clipboard.writeText(email).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('i').className = 'fas fa-check';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('i').className = 'fas fa-copy';
            }, 2000);
        });
    });
}
