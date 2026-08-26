// ==========================================================================
// 1. ローディング演出
// ==========================================================================
document.body.style.overflow = 'hidden';

window.addEventListener('load', function() {
    const loading = document.getElementById('loading');
    
    setTimeout(function() {
        loading.classList.add('loaded');
        document.body.style.overflow = 'auto';
        document.body.classList.add('is-loaded');
    }, 3500);
});

// ==========================================================================
// 2. ギャラリースライダーの要素自動複製処理
// ==========================================================================
const slideTrack = document.getElementById('slide-track');
if (slideTrack) {
    const slides = slideTrack.innerHTML;
    slideTrack.innerHTML = slides + slides;
}

// ==========================================================================
// 3. スクロール時のフェードイン演出（IntersectionObserver）
// ==========================================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.2
});

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// ==========================================================================
// 4. ヘッダーのスクロール連動表示/非表示機能
// ==========================================================================
let lastScrollY = window.scrollY;
const header = document.querySelector('header');
let isNavScrolling = false;

window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
        header.classList.remove('header-hidden');
        return;
    }

    if (isNavScrolling) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
        header.classList.remove('header-hidden');
        lastScrollY = currentScrollY;
        return;
    }

    if (Math.abs(currentScrollY - lastScrollY) < 10) {
        return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
        header.classList.add('header-hidden');
    } else if (currentScrollY < lastScrollY) {
        header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
});

// ==========================================================================
// 5. スマホ用ハンバーガーメニューの開閉制御
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('#nav-menu a');

hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');

        isNavScrolling = true;
        header.classList.remove('header-hidden');

        setTimeout(() => {
            isNavScrolling = false;
            lastScrollY = window.scrollY;
        }, 1000);
    });
});

// ==========================================================================
// 6. トレーラーセクションの自動スクロール（トラックパッド手動スクロール検知強化版）
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("trailer-slider");
  const dots = document.querySelectorAll(".trailer-dot");
  const slides = document.querySelectorAll(".trailer-slide");

  if (!slider || dots.length === 0 || slides.length === 0) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  let resumeTimer = null;
  let isVideoPlaying = false;
  let isProgrammaticScroll = false; // 自動スクロール中かどうかを識別するフラグ
  let scrollEndTimer = null;

  const AUTO_SCROLL_INTERVAL = 6500;
  const VIDEO_RESUME_DELAY = 5000;
  const USER_RESUME_DELAY = 8000;

  const scrollToSlide = (index) => {
    const targetSlide = slides[index];
    if (targetSlide) {
      isProgrammaticScroll = true; // 自動スクロール開始
      slider.scrollTo({
        left: targetSlide.offsetLeft - slider.offsetLeft,
        behavior: "smooth"
      });

      // アニメーション完了後にフラグを解除（smoothスクロールの完了待ち）
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        isProgrammaticScroll = false;
      }, 600);
    }
  };

  const isSliderInViewport = () => {
    const rect = slider.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const startAutoScroll = () => {
    if (autoScrollTimer) clearInterval(autoScrollTimer);

    autoScrollTimer = setInterval(() => {
      if (!isVideoPlaying && isSliderInViewport()) {
        currentIndex = (currentIndex + 1) % slides.length;
        scrollToSlide(currentIndex);
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };

  const scheduleResume = (delayMs) => {
    stopAutoScroll();
    if (!isVideoPlaying) {
      resumeTimer = setTimeout(() => {
        startAutoScroll();
      }, delayMs);
    }
  };

  slider.addEventListener("scroll", () => {
    // ユーザーによる手動スクロール（トラックパッドの2本指スワイプ含む）時のみ一時停止を起動
    if (!isProgrammaticScroll) {
      scheduleResume(USER_RESUME_DELAY);
    }

    const sliderRect = slider.getBoundingClientRect();
    let closestIndex = 0;
    let minDistance = Infinity;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const distance = Math.abs((slideRect.left + slideRect.width / 2) - (sliderRect.left + sliderRect.width / 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex = closestIndex;

    dots.forEach((dot, index) => {
      if (index === closestIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"));
      scrollToSlide(index);
      scheduleResume(USER_RESUME_DELAY);
    });
  });

  const userEvents = ["touchstart", "mousedown", "pointerdown", "wheel"];
  userEvents.forEach((eventType) => {
    slider.addEventListener(eventType, () => {
      scheduleResume(USER_RESUME_DELAY);
    }, { passive: true });
  });

  window.addEventListener("blur", () => {
    if (document.activeElement && document.activeElement.tagName === "IFRAME") {
      isVideoPlaying = true;
      stopAutoScroll();
    }
  });

  const iframes = slider.querySelectorAll("iframe");

  if (iframes.length > 0) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      iframes.forEach((iframe) => {
        new YT.Player(iframe, {
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                isVideoPlaying = true;
                stopAutoScroll();
              } else if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED
              ) {
                isVideoPlaying = false;
                scheduleResume(VIDEO_RESUME_DELAY);
              }
            }
          }
        });
      });
    };
  }

  startAutoScroll();
});