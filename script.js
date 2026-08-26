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
// 6. トレーラーセクションの自動スクロール（動画状態連動版）
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("trailer-slider");
  const dots = document.querySelectorAll(".trailer-dot");
  const slides = document.querySelectorAll(".trailer-slide");

  if (!slider || dots.length === 0 || slides.length === 0) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  let resumeTimer = null;
  let isVideoPlaying = false; // 動画が再生中かどうかのフラグ

  const AUTO_SCROLL_INTERVAL = 5000; // 通常時の自動切り替え間隔（5秒）
  const VIDEO_RESUME_DELAY = 5000;   // 動画が停止・終了してからスクロール再開までの時間（5秒）
  const USER_RESUME_DELAY = 8000;    // 手動スワイプ・ドット操作後にスクロール再開までの時間（8秒）

  // スライド移動処理
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

  // 自動スクロール開始
  const startAutoScroll = () => {
    if (autoScrollTimer) clearInterval(autoScrollTimer);

    autoScrollTimer = setInterval(() => {
      if (window.innerWidth <= 768 && !isVideoPlaying) {
        currentIndex = (currentIndex + 1) % slides.length;
        scrollToSlide(currentIndex);
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  // 完全停止処理
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

  // 指定した時間（delayMs）の後に自動スクロールを再開する予約処理
  const scheduleResume = (delayMs) => {
    stopAutoScroll();
    if (!isVideoPlaying) {
      resumeTimer = setTimeout(() => {
        startAutoScroll();
      }, delayMs);
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

  // ドットタップ時
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"));
      scrollToSlide(index);
      scheduleResume(USER_RESUME_DELAY);
    });
  });

  // 手動スワイプ・タッチ操作時
  const userEvents = ["touchstart", "mousedown", "pointerdown", "wheel"];
  userEvents.forEach((eventType) => {
    slider.addEventListener(eventType, () => {
      scheduleResume(USER_RESUME_DELAY);
    }, { passive: true });
  });

  // --------------------------------------------------------------------------
  // YouTube IFrame Player API の読み込みと再生イベント監視
  // --------------------------------------------------------------------------
  const iframes = slider.querySelectorAll("iframe");

  if (iframes.length > 0) {
    // YouTube APIのスクリプトタグを自動挿入
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // APIの準備が完了したときに実行される処理
    window.onYouTubeIframeAPIReady = () => {
      iframes.forEach((iframe) => {
        new YT.Player(iframe, {
          events: {
            onStateChange: (event) => {
              // event.data: 1 = 再生中, 2 = 一時停止, 0 = 再生終了
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

  // 初期読み込み時の自動スクロール開始
  startAutoScroll();
});