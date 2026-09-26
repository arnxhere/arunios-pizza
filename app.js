// ========================================================
// ARUNIOS PIZZA — UP-TO-DOWN SCROLL ANIMATION & PAGE ENGINE
// ========================================================

(function() {
  'use strict';

  // DOM Elements - Animation
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  const animationSection = document.getElementById('animation-section');
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderCount = document.getElementById('loader-count');
  const hudFrameLabel = document.getElementById('hud-frame-label');
  const scrollPrompt = document.getElementById('scroll-prompt');
  const heroBanner = document.getElementById('hero-banner');

  // Animation State
  let frameFiles = [];
  const images = [];
  let totalFrames = 210;
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  const lerpFactor = 0.22; // Snappy, fluid linear interpolation

  // Fallback filename list (ezgif-frame-001.png ... ezgif-frame-210.png)
  function generateFallbackList() {
    const list = [];
    for (let i = 1; i <= 210; i++) {
      const num = String(i).padStart(3, '0');
      list.push(`ezgif-frame-${num}.png`);
    }
    return list;
  }

  // Initialize
  async function init() {
    try {
      const res = await fetch('/api/frames');
      if (res.ok) {
        frameFiles = await res.json();
      }
    } catch (e) {
      console.warn('API error, using default names', e);
    }

    if (!frameFiles || frameFiles.length === 0) {
      frameFiles = generateFallbackList();
    }

    totalFrames = frameFiles.length;
    if (loaderCount) loaderCount.textContent = `0 / ${totalFrames}`;

    preloadAllFrames();
    setupPageInteractions();
  }

  // Preload all frames into memory
  function preloadAllFrames() {
    let hasRenderedFirst = false;

    frameFiles.forEach((file, index) => {
      const img = new Image();
      img.src = `/frames/${file}`;

      img.onload = () => {
        images[index] = img;
        loadedCount++;

        const percent = Math.min(100, Math.round((loadedCount / totalFrames) * 100));
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (loaderPercent) loaderPercent.textContent = `${percent}%`;
        if (loaderCount) loaderCount.textContent = `${loadedCount} / ${totalFrames}`;

        // Render first frame as soon as frame 0 loads
        if (index === 0 && !hasRenderedFirst) {
          hasRenderedFirst = true;
          resizeCanvas();
          renderFrame(0);
        }

        // Hide preloader when all frames are ready
        if (loadedCount >= totalFrames) {
          setTimeout(() => {
            if (loader) loader.classList.add('hidden');
            resizeCanvas();
            renderFrame(0);
          }, 200);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load: ${file}`);
        loadedCount++;
        if (loadedCount >= totalFrames && loader) {
          loader.classList.add('hidden');
        }
      };
    });
  }

  // Responsive Canvas Setup
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrame(currentFrame);
  }

  // Render Frame on Canvas
  function renderFrame(frameIdx) {
    const safeIdx = Math.max(0, Math.min(totalFrames - 1, Math.round(frameIdx)));
    let img = images[safeIdx];

    // Fallback to nearest loaded frame
    if (!img || !img.complete) {
      for (let offset = 1; offset < 20; offset++) {
        if (safeIdx - offset >= 0 && images[safeIdx - offset]?.complete) {
          img = images[safeIdx - offset];
          break;
        }
        if (safeIdx + offset < totalFrames && images[safeIdx + offset]?.complete) {
          img = images[safeIdx + offset];
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const canvasW = window.innerWidth;
    const canvasH = window.innerHeight;

    ctx.clearRect(0, 0, canvasW, canvasH);

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    // Scale to fit screen uncropped (contain mode)
    const scale = Math.min(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  // Smooth Render Loop
  function loop() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * lerpFactor;
      if (Math.abs(targetFrame - currentFrame) < 0.005) {
        currentFrame = targetFrame;
      }
      renderFrame(currentFrame);
      updateHUD();
    }
    requestAnimationFrame(loop);
  }

  // Up-to-Down Scroll Handler
  function onScroll() {
    if (!animationSection) return;
    const rect = animationSection.getBoundingClientRect();
    const scrollDistance = animationSection.offsetHeight - window.innerHeight;
    if (scrollDistance <= 0) return;

    // Progress within the animation section (0 at top, 1 at bottom of animation)
    const currentScroll = Math.max(0, Math.min(scrollDistance, -rect.top));
    const progress = currentScroll / scrollDistance;

    targetFrame = progress * (totalFrames - 1);

    // Fade out hero title and subtitle at 45% of scroll animation section
    if (heroBanner) {
      const fadeLimit = 0.45;
      if (progress <= 0) {
        heroBanner.style.opacity = '1';
        heroBanner.style.transform = 'translate(-50%, 0) scale(1)';
        heroBanner.style.pointerEvents = 'auto';
      } else if (progress < fadeLimit) {
        const fadeFraction = progress / fadeLimit;
        const opacity = Math.max(0, 1 - fadeFraction);
        const translateY = -fadeFraction * 35;
        const scale = 1 - fadeFraction * 0.04;
        heroBanner.style.opacity = opacity.toFixed(3);
        heroBanner.style.transform = `translate(-50%, ${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        heroBanner.style.pointerEvents = 'auto';
      } else {
        heroBanner.style.opacity = '0';
        heroBanner.style.transform = 'translate(-50%, -35px) scale(0.96)';
        heroBanner.style.pointerEvents = 'none';
      }
    }

    // Fade out scroll prompt once scrolling commences
    if (progress > 0.02) {
      scrollPrompt?.classList.add('fade');
    } else {
      scrollPrompt?.classList.remove('fade');
    }
  }

  // Update Top Floating Pill
  function updateHUD() {
    if (!hudFrameLabel) return;
    const frameIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame)));
    const frameStr = String(frameIndex + 1).padStart(3, '0');
    hudFrameLabel.textContent = `FRAME ${frameStr} / ${totalFrames}`;
  }

  // Interactive Website Scripts (Crust selector & category chips)
  function setupPageInteractions() {
    // Crust selector toggle
    const crustButtons = document.querySelectorAll('#crustSelector button');
    const priceDisplay = document.getElementById('customPrice');
    const basePrice = 16.00;

    crustButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        crustButtons.forEach(b => {
          b.classList.remove('ring-2', 'ring-primary-container');
        });
        btn.classList.add('ring-2', 'ring-primary-container');

        let addedCost = (index === 1) ? 2.50 : (index === 3) ? 3.00 : 0.00;
        if (priceDisplay) {
          priceDisplay.textContent = '$' + (basePrice + addedCost).toFixed(2);
        }
      });
    });

    // Category rail filter buttons
    const categoryButtons = document.querySelectorAll('#categoryChips button');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => {
          b.className = 'bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-4 py-2 rounded-full whitespace-nowrap transition-colors';
        });
        btn.className = 'bg-inverse-surface text-inverse-on-surface font-label-md text-label-md px-4 py-2 rounded-full whitespace-nowrap shadow-sm';
      });
    });

    // Mobile Navigation Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
        });
      });
    }
  }

  // Event Listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resizeCanvas);

  // Start initialization & render loop
  init();
  requestAnimationFrame(loop);

})();
