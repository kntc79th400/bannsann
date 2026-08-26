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
// 6. トレーラーセクションの自動スクロール＆手動解除機能
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("trailer-slider");
  const dots = document.querySelectorAll(".trailer-dot");
  const slides = document.querySelectorAll(".trailer-slide");

  if (!slider || dots.length === 0 || slides.length === 0) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  const AUTO_SCROLL_INTERVAL = 4000; // 自動スクロールの間隔（4000 = 4秒）

  // 指定インデックスへスクロールする関数
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
      // 768px以下のスマホ表示時のみ実行
      if (window.innerWidth <= 768) {
        currentIndex = (currentIndex + 1) % slides.length;
        scrollToSlide(currentIndex);
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  // 自動スクロールを解除（停止）する関数
  const stopAutoScroll = () => {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
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

  // ドットタップ時に自動スクロールを解除して切り替え
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAutoScroll();
      const index = parseInt(dot.getAttribute("data-index"));
      scrollToSlide(index);
    });
  });

  // 画面スワイプ・タッチ操作時に自動スクロールを解除
  const userEvents = ["touchstart", "mousedown", "pointerdown", "wheel"];
  userEvents.forEach((eventType) => {
    slider.addEventListener(eventType, stopAutoScroll, { passive: true });
  });

  // YouTube動画（iframe）がタップされた（フォーカス移動した）際に自動スクロールを解除
  window.addEventListener("blur", () => {
    if (document.activeElement && document.activeElement.tagName === "IFRAME") {
      stopAutoScroll();
    }
  });

  // ページ読み込み時に自動スクロールを開始
  startAutoScroll();
});