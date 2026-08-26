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
    }, 0);
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
// 6. トレーラーセクションの自動スクロール（標準スムーズスクロール版）
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("trailer-slider");
  const dots = document.querySelectorAll(".trailer-dot");
  const slides = document.querySelectorAll(".trailer-slide");

  if (!slider || dots.length === 0 || slides.length === 0) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  let resumeTimer = null;
  let isVideoPlaying = false; // 動画再生状態の管理フラグ

  const AUTO_SCROLL_INTERVAL = 5000; // 自動で切り替わる間隔（5秒）
  const RESUME_DELAY = 8000;         // 手動操作後、自動スクロールが再開するまでの時間（8秒）

  // ブラウザ標準のスムーズスクロールで移動する関数
  const scrollToSlide = (index) => {
    const targetSlide = slides[index];
    if (targetSlide) {
      targetSlide.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  };

  // 自動スクロールを開始する関数
  const startAutoScroll = () => {
    if (autoScrollTimer) clearInterval(autoScrollTimer);

    autoScrollTimer = setInterval(() => {
      if (window.innerWidth <= 768 && !isVideoPlaying) {
        currentIndex = (currentIndex + 1) % slides.length;
        scrollToSlide(currentIndex);
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  // タイマーを完全停止する関数
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

  // 一時停止して指定時間後に自動スクロールを再開する関数
  const pauseAndResetTimer = () => {
    stopAutoScroll();

    if (!isVideoPlaying) {
      resumeTimer = setTimeout(() => {
        startAutoScroll();
      }, RESUME_DELAY);
    }
  };

  // スクロール位置に合わせてドットの表示を更新
  slider.addEventListener("scroll", () => {
    if (window.innerWidth > 768) return;

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

  // ドットタップ時（一定時間後に再開）
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      isVideoPlaying = false;
      const index = parseInt(dot.getAttribute("data-index"));
      scrollToSlide(index);
      pauseAndResetTimer();
    });
  });

  // 画面操作・スワイプ時（一定時間後に再開）
  const userEvents = ["touchstart", "mousedown", "pointerdown", "wheel"];
  userEvents.forEach((eventType) => {
    slider.addEventListener(eventType, () => {
      isVideoPlaying = false;
      pauseAndResetTimer();
    }, { passive: true });
  });

  // YouTube動画（iframe）タップ時は自動スクロールを停止
  window.addEventListener("blur", () => {
    if (document.activeElement && document.activeElement.tagName === "IFRAME") {
      isVideoPlaying = true;
      stopAutoScroll();
    }
  });

  // ページ読み込み時に自動スクロールを開始
  startAutoScroll();
});