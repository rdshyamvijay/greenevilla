// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   1. HERO SCROLL ANIMATION — DO NOT MODIFY
   (User requested this animation be preserved as-is)
   ========================================================= */
const tlHero = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
    }
});

tlHero.to(".trees-frame", { scale: 25, ease: "power2.in" }, 0)
    .to(".trees-frame", { opacity: 0, duration: 0.1 }, 0.9)
    .to(".hero-bg-overlay", { opacity: 0, ease: "none" }, 0)
    .to(".hero-bg", { scale: 1.15, filter: "brightness(1)", ease: "none" }, 0)
    .to(".hero-content", { scale: 1.1, y: -50, opacity: 0, ease: "none" }, 0)
    .to(".scroll-indicator", { opacity: 0, ease: "none" }, 0);

/* =========================================================
   2. STORY LINE GROWTH
   ========================================================= */
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

/* =========================================================
   3. REVEAL ON SCROLL (transform/opacity only)
   ========================================================= */
const revealElements = document.querySelectorAll(".reveal-text");
revealElements.forEach((el) => {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse"
        }
    });
});

/* =========================================================
   4. NAVBAR — compact-on-scroll
   ========================================================= */
const navbar = document.querySelector(".navbar");
if (navbar) {
    ScrollTrigger.create({
        start: "top -40",
        onUpdate: (self) => {
            navbar.classList.toggle("is-scrolled", self.scroll() > 40);
        }
    });
}

/* =========================================================
   5. PHOTO DROPDOWNS — accordion behavior
   ========================================================= */
const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".dropdown__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
        const isOpen = dropdown.classList.contains("is-open");

        // Close other open dropdowns for a clean focused experience
        dropdowns.forEach((other) => {
            if (other !== dropdown && other.classList.contains("is-open")) {
                other.classList.remove("is-open");
                const otherTrigger = other.querySelector(".dropdown__trigger");
                if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
            }
        });

        dropdown.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));

        // After opening, ensure ScrollTrigger recalculates layout
        if (!isOpen) {
            setTimeout(() => {
                if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 500);

            // Smoothly scroll the trigger into the upper viewport on mobile
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    const rect = trigger.getBoundingClientRect();
                    if (rect.top < 80 || rect.top > window.innerHeight * 0.4) {
                        window.scrollTo({
                            top: window.scrollY + rect.top - 100,
                            behavior: "smooth"
                        });
                    }
                }, 60);
            }
        }
    });
});

/* =========================================================
   6. 3D LEAVES CANVAS (ambient particle layer)
   ========================================================= */
const canvas = document.getElementById("leavesCanvas");
const ctx = canvas.getContext("2d");

const dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = window.innerWidth;
let height = window.innerHeight;

function sizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeCanvas();

const leafSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path fill="#4f6e44" d="M32 2C16 12 8 28 12 44c4 16 16 18 20 18s16-2 20-18c4-16-4-32-20-42z"/>
    <path fill="#2e4a25" stroke="#2e4a25" stroke-width="1.5" stroke-linecap="round" d="M32 4v56M22 32l10-8M42 32l-10-8M24 46l8-10M40 46l-8-10M27 20l5-4M37 20l-5-4"/>
</svg>`;
const leafImg = new Image();
leafImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(leafSVG);

window.addEventListener("resize", sizeCanvas);

class DetailedLeaf {
    constructor() { this.reset(true); }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height * 2 - height : -50;
        this.size = Math.random() * 10 + 6;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.speedX = Math.random() * 1.4 - 0.7;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.6 - 0.8;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update(scrollSpeed) {
        this.y += this.speedY + (scrollSpeed * 0.4);
        this.x += this.speedX + (Math.sin(this.y * 0.01) * 0.4);
        this.rotation += this.rotationSpeed;
        if (this.y > height + 50) this.reset();
    }

    draw() {
        if (!leafImg.complete) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(leafImg, -this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();
    }
}

const leaves = [];
const numLeaves = window.innerWidth < 768 ? 14 : 32;
for (let i = 0; i < numLeaves; i++) leaves.push(new DetailedLeaf());

let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
}, { passive: true });

function animate() {
    ctx.clearRect(0, 0, width, height);
    scrollVelocity *= 0.9;
    leaves.forEach((leaf) => {
        leaf.update(Math.max(0, scrollVelocity));
        leaf.draw();
    });
    requestAnimationFrame(animate);
}
animate();
