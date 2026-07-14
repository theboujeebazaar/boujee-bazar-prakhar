
// Sticky Header Blur effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        navbar.style.background = 'rgba(255, 253, 249, 0.98)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'rgba(255, 253, 249, 0.95)';
    }
});

// Simple Wishlist toggle functionality
const wishlistBtns = document.querySelectorAll('.wishlist-btn');
wishlistBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-regular')) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#F5A24A';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            icon.style.color = '';
        }
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

// Hero Slider Logic
const slidesContainer = document.getElementById('heroSlides');
const dots = document.querySelectorAll('.slider-dot');
let currentSlide = 0;
const slideCount = dots.length;

function goToSlide(index) {
    if (!slidesContainer) return;
    
    // Update container transform
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
    
    // Update active slide class for potential animations
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    let nextIndex = (currentSlide + 1) % slideCount;
    goToSlide(nextIndex);
}

// Add click events to dots
dots.forEach(dot => {
    dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        goToSlide(index);
        
        // Reset interval when user manually clicks
        clearInterval(sliderInterval);
        sliderInterval = setInterval(nextSlide, 5000);
    });
});

// Auto slide every 5 seconds
let sliderInterval = setInterval(nextSlide, 5000);

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-question');
faqItems.forEach(item => {
    item.addEventListener('click', function() {
        // Toggle the active class on the button
        this.classList.toggle('active');
        
        // Toggle the answer visibility
        const answer = this.nextElementSibling;
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            this.querySelector('i').style.transform = 'rotate(0deg)';
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
            this.querySelector('i').style.transform = 'rotate(180deg)';
            this.querySelector('i').style.transition = 'transform 0.3s ease';
        }
    });
});

// Reviews Slider Logic removed in favor of CSS infinite marquee



