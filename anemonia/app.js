document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    initCustomCursor();
    initHeaderScroll();
    initHeroEntrance();
    initMobileNav();
    initScrollReveal();
    initPortfolioFilter();
    initLightbox();

    // Smooth scroll to hash on load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        setTimeout(() => {
            const targetSection = document.getElementById(hash);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                window.scrollTo({
                    top: hash === 'hero' ? 0 : offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
});

/* ==========================================================================
   CUSTOM CURSOR LOGIC
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    
    if (!cursor || !cursorDot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Follow mouse coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant position for the inner dot
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    // Smooth movement for outer circle (lagging effect)
    function animateCursor() {
        let dx = mouseX - cursorX;
        let dy = mouseY - cursorY;
        
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on links and buttons
    const hoverElements = document.querySelectorAll('a, button, .filter-btn, .gallery-item, .form-input');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

/* ==========================================================================
   STICKY NAVBAR SCROLL DETECT
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   HERO ENTRANCE ANIMATIONS
   ========================================================================== */
function initHeroEntrance() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Trigger animations after a small delay for page load rendering
    setTimeout(() => {
        hero.classList.add('active');
    }, 150);
}

/* ==========================================================================
   MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!mobileToggle || !mobileDrawer) return;

    // Toggle menu
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (!targetId) return; // Allow natural page navigation

            e.preventDefault();
            mobileToggle.classList.remove('active');
            mobileDrawer.classList.remove('active');
            document.body.classList.remove('no-scroll');

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                window.scrollTo({
                    top: offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            } else {
                const href = link.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });
}

/* ==========================================================================
   SCROLL REVEAL SYSTEM (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Observer Options
    const observerOptions = {
        root: null, // uses viewport
        rootMargin: '0px 0px -15% 0px', // trigger before fully entering
        threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            } else {
                // Remove class only if the section moves down (scrolling up)
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight) {
                    entry.target.classList.remove('reveal-active');
                }
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Observer to highlight active Nav links
    const sectionObserverOptions = {
        root: null,
        rootMargin: '-40% 0px -50% 0px', // check center of screen
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                navLinks.forEach(link => {
                    const dataTarget = link.getAttribute('data-target');
                    if (dataTarget) {
                        link.classList.remove('active');
                        if (dataTarget === sectionId) {
                            link.classList.add('active');
                        }
                    }
                });
            }
        });
    }, sectionObserverOptions);

    // Observe sections for active navigation menu highlights
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Handle standard nav links smooth scroll with header offset
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (!targetId) return; // Allow natural page navigation

            e.preventDefault();
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                window.scrollTo({
                    top: targetId === 'hero' ? 0 : offsetTop - 80,
                    behavior: 'smooth'
                });
            } else {
                const href = link.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });
}

/* ==========================================================================
   PORTFOLIO FILTER LOGIC
   ========================================================================== */
let filteredItems = []; // Keeps track of currently active gallery elements

function initPortfolioFilter() {
    const filterContainer = document.getElementById('galleryFilters');
    const galleryGrid = document.getElementById('galleryGrid');
    if (!filterContainer || !galleryGrid) return;

    const filterBtns = filterContainer.querySelectorAll('.filter-btn');
    const galleryItems = galleryGrid.querySelectorAll('.gallery-item');

    // Populate initial items list
    filteredItems = Array.from(galleryItems);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Reset list
            filteredItems = [];

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    // Show item
                    item.classList.remove('hidden');
                    filteredItems.push(item);
                } else {
                    // Hide item
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/* ==========================================================================
   LIGHTBOX MODAL LOGIC
   ========================================================================== */
function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const modalCat = document.getElementById('lightboxCat');
    const modalTitle = document.getElementById('lightboxTitle');
    const modalDesc = document.getElementById('lightboxDesc');
    
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!modal || !modalImg) return;

    let currentIndex = 0;

    // Attach click events to gallery items
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // Fallback if filteredItems is not initialized yet
    if (!filteredItems || filteredItems.length === 0) {
        filteredItems = Array.from(galleryGrid.querySelectorAll('.gallery-item:not(.hidden)'));
    }

    galleryGrid.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.gallery-view-btn') || e.target.closest('.gallery-item-inner');
        if (!viewBtn) return;

        const galleryItem = viewBtn.closest('.gallery-item');
        if (!galleryItem) return;

        // Find index of item in the current filtered list
        currentIndex = filteredItems.indexOf(galleryItem);
        if (currentIndex === -1) return;

        openLightbox(filteredItems[currentIndex]);
    });

    function openLightbox(item) {
        const imgPath = item.getAttribute('data-img');
        const title = item.getAttribute('data-title');
        const desc = item.getAttribute('data-desc');
        const category = item.getAttribute('data-category');

        modalImg.src = imgPath;
        modalImg.alt = title;
        modalCat.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Photography';
        modalTitle.textContent = title;
        modalDesc.textContent = desc;

        modal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        // Clear image to avoid flash of old content next time
        setTimeout(() => {
            modalImg.src = '';
        }, 300);
    }

    function navigateLightbox(direction) {
        if (filteredItems.length <= 1) return;

        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % filteredItems.length;
        } else {
            currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        }

        const nextItem = filteredItems[currentIndex];
        
        // Fade content out and back in
        modalImg.style.opacity = '0';
        setTimeout(() => {
            openLightbox(nextItem);
            modalImg.style.opacity = '1';
        }, 150);
    }

    // Event Listeners
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigateLightbox('prev'));
    nextBtn.addEventListener('click', () => navigateLightbox('next'));

    // Close on click outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            navigateLightbox('next');
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox('prev');
        }
    });
}
