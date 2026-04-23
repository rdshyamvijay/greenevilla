// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// 1. Hero Parallax: Trees move outwards (scale up hugely), Image pans in (scales up slightly)
const tlHero = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true
    }
});

// The trees frame scales incredibly large so the "hole" expands past the screen edges
tlHero.to(".trees-frame", { scale: 25, ease: "power2.in" }, 0)
      // Fade out the trees frame at the very end so it disappears when we pass through it
      .to(".trees-frame", { opacity: 0, duration: 0.1 }, 0.9)
      // The white gradient overlay fades out smoothly to reveal the full-color resort image
      .to(".hero-bg-overlay", { opacity: 0, ease: "none" }, 0)
      // The background A-frame picture pans in slightly
      .to(".hero-bg", { scale: 1.15, filter: "brightness(1)", ease: "none" }, 0)
      // The text content scales slightly and fades
      .to(".hero-content", { scale: 1.1, y: -50, opacity: 0, ease: "none" }, 0)
      .to(".scroll-indicator", { opacity: 0, ease: "none" }, 0);

// 2. Story Line Growth
gsap.to(".story-line", {
    height: "100%",
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true
    }
});

// 3. Text & Element Reveal on Scroll
const revealElements = document.querySelectorAll(".reveal-text");
revealElements.forEach((el) => {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// 4. Gallery Grid Reveal
const galleryItems = document.querySelectorAll(".gallery-item:not(.hidden-item)");
galleryItems.forEach((item, index) => {
    gsap.to(item, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: item,
            start: "top 80%",
        }
    });
});

// 5. 3D Leaves Canvas Animation (Detailed SVG Leaves Flowing with Scroll)
const canvas = document.getElementById('leavesCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Create a highly detailed leaf image using an SVG data URI
const leafSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path fill="#2e5c3a" d="M32 2C16 12 8 28 12 44c4 16 16 18 20 18s16-2 20-18c4-16-4-32-20-42z"/>
    <path fill="#1e3f26" stroke="#1e3f26" stroke-width="1.5" stroke-linecap="round" d="M32 4v56M22 32l10-8M42 32l-10-8M24 46l8-10M40 46l-8-10M27 20l5-4M37 20l-5-4"/>
</svg>`;
const leafImg = new Image();
leafImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(leafSVG);

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

class DetailedLeaf {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height * 2 - height : -50;
        this.size = Math.random() * 12 + 8; // Size of the leaf
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.6 + 0.3; // slightly transparent
    }

    update(scrollSpeed) {
        // Fall slowly, accelerate when user scrolls
        this.y += this.speedY + (scrollSpeed * 0.5);
        this.x += this.speedX + (Math.sin(this.y * 0.01) * 0.5);
        this.rotation += this.rotationSpeed;

        if (this.y > height + 50) {
            this.reset();
        }
    }

    draw() {
        if (!leafImg.complete) return; // wait till image is loaded
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        
        // Draw the detailed SVG leaf
        ctx.drawImage(leafImg, -this.size, -this.size, this.size * 2, this.size * 2);
        
        ctx.restore();
    }
}

const leaves = [];
const numLeaves = window.innerWidth < 768 ? 20 : 40; // Reduced count because they are more detailed
for (let i = 0; i < numLeaves; i++) {
    leaves.push(new DetailedLeaf());
}

let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Friction to gradually slow down after scroll stops
    scrollVelocity *= 0.9;
    
    leaves.forEach(leaf => {
        leaf.update(Math.max(0, scrollVelocity)); 
        leaf.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();
