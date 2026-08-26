/**
 * PORTFOLIO — Andrea Graffeo
 * Main JavaScript (GSAP + ScrollTrigger + Lenis)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Lenis Smooth Scroll Setup ────────────
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ── 2. Navbar & Mobile Menu ────────────────
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeMenu = () => {
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  };

  mobileClose?.addEventListener('click', closeMenu);
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // If GSAP is not available, stop animation setup here
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── 3. Background Floating Elements ────────
  const bgContainer = document.querySelector('.bg-elements');
  if (bgContainer && !prefersReducedMotion && window.innerWidth >= 1024) {
    const timecodes = ['00:12:34:05', '01:03:22:11', '00:45:12:20', '00:08:55:17', '02:15:44:08', '00:33:01:14'];
    const frames = ['FRAME 0247', 'FRAME 1082', 'FRAME 0033', 'FRAME 2841', 'FRM 0512', 'FRM 1947'];
    const markers = ['◆', '▸', '◇', '│', '┃', '╌'];
    const coords = ['X: 1920', 'Y: 1080', '4K UHD', '23.976fps', 'LOG C3', 'REC.709'];

    // Generate floating markers and timecodes
    const items = [
      ...timecodes.map((t) => ({ text: t, type: 'timecode' })),
      ...frames.map((f) => ({ text: f, type: 'frame' })),
      ...markers.map((m) => ({ text: m, type: 'marker' })),
      ...coords.map((c) => ({ text: c, type: 'coord' })),
    ];

    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = `bg-float ${item.type}`;
      el.textContent = item.text;
      el.style.left = `${(idx * 17) % 90 + 5}%`;
      el.style.top = `${(idx * 23) % 90 + 5}%`;
      el.style.opacity = item.type === 'marker' ? '0.08' : '0.04';
      if (item.type === 'marker') {
        el.style.color = 'var(--violet)';
      }
      bgContainer.appendChild(el);

      gsap.to(el, {
        y: -15 - Math.random() * 20,
        x: (Math.random() - 0.5) * 15,
        duration: 4 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: idx * 0.2,
      });
    });
  }

  // ── 4. Hero Section Animations ─────────────
  if (prefersReducedMotion) {
    gsap.set('.hero-name, .hero-role, .hero-tagline, .scroll-indicator', { opacity: 1 });
    gsap.set('.hud', { opacity: 0.4 });
  } else {
    const heroTl = gsap.timeline({ delay: 0.2 });

    heroTl
      .fromTo('.hero-name', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .fromTo('.hero-role', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.6')
      .fromTo('.hero-tagline', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.5')
      .fromTo('.hud', { opacity: 0 }, { opacity: 0.4, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, '-=0.4')
      .fromTo('.scroll-indicator', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
  }

  // ── 5. DaVinci Resolve Timeline Interactive Animation ──
  const resolvePlayhead = document.querySelector('.resolve-playhead');
  const resolvePlayheadBadge = document.querySelector('.resolve-playhead-badge');
  const masterTc = document.querySelector('.master-tc');
  const resolveTracks = document.querySelector('.resolve-tracks');
  const resolveClips = document.querySelectorAll('.r-clip');

  function updateTimelinePosition(percent) {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    if (resolvePlayhead) {
      resolvePlayhead.style.left = `${clampedPercent}%`;
    }

    // Calculate realistic 24fps timecode (base: 01:00:00:00)
    const totalFrames = Math.floor((clampedPercent / 100) * (3 * 60 * 24 + 42 * 24));
    const hours = 1;
    const minutes = Math.floor(totalFrames / (60 * 24)) % 60;
    const seconds = Math.floor((totalFrames % (60 * 24)) / 24);
    const frames = totalFrames % 24;

    const formattedTc = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;

    if (masterTc) masterTc.textContent = formattedTc;
    if (resolvePlayheadBadge) resolvePlayheadBadge.textContent = formattedTc;

    // Highlight clips under playhead
    if (resolveTracks && resolveClips.length > 0) {
      const tracksRect = resolveTracks.getBoundingClientRect();
      const playheadX = tracksRect.left + (tracksRect.width * clampedPercent) / 100;

      resolveClips.forEach((clip) => {
        const rect = clip.getBoundingClientRect();
        if (playheadX >= rect.left && playheadX <= rect.right) {
          clip.classList.add('active-clip');
        } else {
          clip.classList.remove('active-clip');
        }
      });
    }
  }

  // ScrollTrigger integration
  if (resolvePlayhead && !prefersReducedMotion) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        // Map page scroll progress (0-1) to timeline percent (5% - 95%)
        const targetPercent = 5 + self.progress * 90;
        updateTimelinePosition(targetPercent);
      },
    });

    // Interactive Mouse Scrubbing on Timeline
    if (resolveTracks) {
      let isScrubbing = false;

      const handleScrub = (e) => {
        const rect = resolveTracks.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = (offsetX / rect.width) * 100;
        updateTimelinePosition(percent);
      };

      resolveTracks.addEventListener('mousemove', (e) => {
        handleScrub(e);
      });

      resolveTracks.addEventListener('mouseleave', () => {
        // Return to scroll position on mouse leave
        const progress = ScrollTrigger.isInViewport(document.body) ? ScrollTrigger.getById?.('body')?.progress || 0.2 : 0.2;
        updateTimelinePosition(5 + progress * 90);
      });
    }

    // Initial state
    updateTimelinePosition(20);
  }

  // ── 6. Macro Categories, Filter Tabs & Video Gallery Modal ──
  const macroCards = document.querySelectorAll('.macro-card');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const videoItems = Array.from(document.querySelectorAll('.video-item'));

  // Modal elements
  const videoModal = document.getElementById('videoModal');
  const modalBackdrop = videoModal ? videoModal.querySelector('.video-modal-backdrop') : null;
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalVideo = document.getElementById('modalVideoElement');
  const modalImg = document.getElementById('modalImgElement');
  const modalTitle = document.getElementById('modalTitle');
  const modalBadge = document.getElementById('modalBadge');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalRole = document.getElementById('modalRole');
  const modalTimecode = document.getElementById('modalTimecode');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');

  let currentCategory = 'all';
  let activeVideoList = [...videoItems];
  let currentModalIndex = 0;
  let gifTimecodeTimer = null;

  // 6A. Filter Video Grid
  function setCategoryFilter(category, shouldScroll = false) {
    currentCategory = category;

    // Update active tab button
    filterTabs.forEach((tab) => {
      if (tab.dataset.filter === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update active video list for modal navigation
    if (category === 'all') {
      activeVideoList = [...videoItems];
    } else {
      activeVideoList = videoItems.filter((item) => item.dataset.category === category);
    }

    // Filter items with smooth GSAP transition
    videoItems.forEach((item) => {
      const match = category === 'all' || item.dataset.category === category;
      if (match) {
        item.classList.remove('is-hidden');
        if (!prefersReducedMotion && typeof gsap !== 'undefined') {
          gsap.fromTo(
            item,
            { opacity: 0, scale: 0.95, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' }
          );
        } else {
          item.style.opacity = '1';
        }
      } else {
        item.classList.add('is-hidden');
      }
    });

    // Scroll to video gallery if triggered by macro card click
    if (shouldScroll) {
      const target = document.getElementById('video-gallery');
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: -90 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    // Refresh ScrollTrigger calculations
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  // Filter tabs click listener
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter || 'all';
      setCategoryFilter(filter, false);
    });
  });

  // Macro cards click & video hover preview
  macroCards.forEach((card) => {
    const video = card.querySelector('video');

    card.addEventListener('mouseenter', () => {
      if (video) {
        video.play().catch(() => {});
      }
    });

    card.addEventListener('mouseleave', () => {
      if (video) {
        video.pause();
      }
    });

    card.addEventListener('click', () => {
      const macro = card.dataset.macro;
      if (macro) {
        setCategoryFilter(macro, true);
      }
    });
  });

  // 6B. Video Cards Hover & Touch Auto-preview
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  videoItems.forEach((item) => {
    const video = item.querySelector('.video-card-media video');

    if (video) {
      if (!isTouch) {
        item.addEventListener('mouseenter', () => {
          video.play().catch(() => {});
        });
        item.addEventListener('mouseleave', () => {
          video.pause();
        });
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            });
          },
          { threshold: 0.6 }
        );
        observer.observe(item);
      }
    }

    // Click to open in Cinematic Modal
    item.addEventListener('click', () => {
      const indexInActiveList = activeVideoList.indexOf(item);
      openVideoModal(indexInActiveList !== -1 ? indexInActiveList : 0);
    });

    // Scroll reveal animation for video items
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.fromTo(
        item,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  });

  // 6C. Cinematic Modal Video Player Logic
  function updateModalVideo(index) {
    if (!activeVideoList[index]) return;
    currentModalIndex = index;
    const item = activeVideoList[index];

    const src = item.dataset.src || '';
    const title = item.dataset.title !== undefined ? item.dataset.title : '';
    const catName = item.dataset.categoryName || 'VIDEO';
    const category = item.dataset.category || 'vfx';
    const format = item.dataset.format || '';
    const role = item.dataset.role || '';

    // Update Text & Badges
    if (modalTitle) {
      if (title) {
        modalTitle.textContent = title;
        modalTitle.style.display = 'block';
      } else {
        modalTitle.textContent = '';
        modalTitle.style.display = 'none';
      }
    }
    if (modalBadge) {
      modalBadge.textContent = catName;
      modalBadge.className = 'video-modal-badge';
      if (category === 'vfx') modalBadge.classList.add('badge-vfx');
      else if (category === 'idee-originali') modalBadge.classList.add('badge-original');
      else if (category === 'video-dinamici') modalBadge.classList.add('badge-dynamic');
      else if (category === 'testi') modalBadge.classList.add('badge-testi');
      else if (category === 'fotografie') modalBadge.classList.add('badge-photo');
    }
    if (modalSpecs) modalSpecs.innerHTML = `${format} &bull; Opera ${index + 1} di ${activeVideoList.length}`;
    if (modalRole) modalRole.textContent = `Ruolo: ${role}`;
    if (modalTimecode) modalTimecode.textContent = '00:00:00:00';

    // Clear any active GIF timecode timer
    if (gifTimecodeTimer) {
      clearInterval(gifTimecodeTimer);
      gifTimecodeTimer = null;
    }

    const isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(src);
    const isGif = src.toLowerCase().endsWith('.gif');

    const youtubeId = item.dataset.youtube || '';
    const modalIframe = document.getElementById('modalIframeElement');

    if (youtubeId) {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.style.display = 'none';
        modalVideo.src = '';
      }
      if (modalImg) {
        modalImg.style.display = 'none';
        modalImg.src = '';
      }
      if (modalIframe) {
        modalIframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        modalIframe.style.display = 'block';
      }
    } else {
      if (modalIframe) {
        modalIframe.src = '';
        modalIframe.style.display = 'none';
      }
      if (isImage) {
        if (modalVideo) {
          modalVideo.pause();
          modalVideo.style.display = 'none';
          modalVideo.src = '';
        }
        if (modalImg) {
          modalImg.src = src;
          modalImg.style.display = 'block';
        }

        if (isGif) {
          // Live simulated timecode for GIF animations (24fps loop)
          let frameCounter = 0;
          gifTimecodeTimer = setInterval(() => {
            frameCounter++;
            const hours = Math.floor(frameCounter / (3600 * 24));
            const minutes = Math.floor((frameCounter % (3600 * 24)) / (60 * 24));
            const seconds = Math.floor((frameCounter % (60 * 24)) / 24);
            const frames = frameCounter % 24;
            if (modalTimecode) {
              modalTimecode.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
            }
          }, 1000 / 24);
        } else {
          if (modalTimecode) modalTimecode.textContent = 'STILL CAPTURE';
        }
      } else {
        if (modalImg) {
          modalImg.style.display = 'none';
          modalImg.src = '';
        }
        if (modalVideo) {
          modalVideo.style.display = 'block';
          modalVideo.pause();
          modalVideo.src = src;
          modalVideo.load();
          modalVideo.play().catch(() => {});
        }
      }
    }
  }

  function openVideoModal(index) {
    if (!videoModal) return;
    updateModalVideo(index);
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    if (gifTimecodeTimer) {
      clearInterval(gifTimecodeTimer);
      gifTimecodeTimer = null;
    }
    const modalIframe = document.getElementById('modalIframeElement');
    if (modalIframe) {
      modalIframe.src = '';
      modalIframe.style.display = 'none';
    }
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
      modalVideo.style.display = 'block';
    }
    if (modalImg) {
      modalImg.src = '';
      modalImg.style.display = 'none';
    }
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  function nextModalVideo() {
    if (activeVideoList.length <= 1) return;
    const nextIdx = (currentModalIndex + 1) % activeVideoList.length;
    updateModalVideo(nextIdx);
  }

  function prevModalVideo() {
    if (activeVideoList.length <= 1) return;
    const prevIdx = (currentModalIndex - 1 + activeVideoList.length) % activeVideoList.length;
    updateModalVideo(prevIdx);
  }

  // Live timecode tracking in modal
  if (modalVideo && modalTimecode) {
    modalVideo.addEventListener('timeupdate', () => {
      const cur = modalVideo.currentTime || 0;
      const totalFrames = Math.floor(cur * 24);
      const hours = Math.floor(totalFrames / (3600 * 24));
      const minutes = Math.floor((totalFrames % (3600 * 24)) / (60 * 24));
      const seconds = Math.floor((totalFrames % (60 * 24)) / 24);
      const frames = totalFrames % 24;

      modalTimecode.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
    });
  }

  // Modal event listeners
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);
  if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalVideo);
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', prevModalVideo);

  // Keyboard controls for Modal
  window.addEventListener('keydown', (e) => {
    if (!videoModal || !videoModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeVideoModal();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextModalVideo();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevModalVideo();
    } else if (e.key === ' ') {
      if (modalVideo && e.target !== modalVideo) {
        e.preventDefault();
        if (modalVideo.paused) modalVideo.play().catch(() => {});
        else modalVideo.pause();
      }
    }
  });

  // ── 7. Node Graph / Process Animation ──────
  const nodeSection = document.querySelector('#process');
  const nodes = document.querySelectorAll('.node-graph .node');
  const connections = document.querySelectorAll('.node-connections path.connection-active');

  if (nodeSection && !prefersReducedMotion) {
    const nodeTl = gsap.timeline({
      scrollTrigger: {
        trigger: nodeSection,
        start: 'top 65%',
        end: 'bottom 75%',
        scrub: 1,
      },
    });

    nodes.forEach((node, i) => {
      // Reveal node
      nodeTl.to(node, { opacity: 1, y: 0, duration: 0.5 }, i * 1);

      // Light up node
      nodeTl.to(
        node,
        {
          borderColor: 'rgba(139, 92, 246, 0.5)',
          boxShadow: i === nodes.length - 1
            ? '0 0 25px rgba(139, 92, 246, 0.3), 0 0 50px rgba(139, 92, 246, 0.1)'
            : '0 0 15px rgba(139, 92, 246, 0.1)',
          duration: 0.3,
          onStart: () => node.classList.add('active'),
        },
        i * 1 + 0.3
      );

      // Draw connection line
      if (connections[i]) {
        nodeTl.to(connections[i], { strokeDashoffset: 0, duration: 0.7 }, i * 1 + 0.4);
      }
    });
  } else if (prefersReducedMotion) {
    nodes.forEach((n) => n.classList.add('active'));
    connections.forEach((c) => (c.style.strokeDashoffset = '0'));
  }

  // ── 8. About Section Animation ─────────────
  const aboutSection = document.querySelector('#about');
  if (aboutSection && !prefersReducedMotion) {
    const aboutTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSection,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });

    aboutTl
      .fromTo('.about-reveal', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' })
      .fromTo('.about-bio p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, '-=0.4')
      .fromTo('.about-image', { x: 40, opacity: 0, scale: 0.96 }, { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, '-=0.6')
      .fromTo('.about-skills', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.4');
  }

  // ── 9. Showreel Section Animation ──────────
  const showreelSection = document.querySelector('#showreel');
  const showreelVideo = document.querySelector('.showreel-video-container');
  const showreelPlayhead = document.querySelector('.showreel-playhead');

  if (showreelSection && !prefersReducedMotion && showreelVideo) {
    gsap.set(showreelVideo, { clipPath: 'inset(15% 15% 15% 15%)' });
    gsap.set(showreelPlayhead, { left: '0%' });

    const reelTl = gsap.timeline({
      scrollTrigger: {
        trigger: showreelSection,
        start: 'top 70%',
        end: 'top 20%',
        scrub: true,
      },
    });

    reelTl
      .to(showreelVideo, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut' })
      .to(showreelPlayhead, { left: '100%', ease: 'power1.inOut' }, '<');
  }

  // ── 10. Contact Section Animation ──────────
  const contactSection = document.querySelector('#contact');
  if (contactSection && !prefersReducedMotion) {
    gsap.fromTo(
      ['.contact-heading', '.contact-cta', '.contact-email'],
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }
});
