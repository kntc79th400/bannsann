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
// 2. ギャラリースライダーの要素自動複製処理（軽量化と保守性アップ）
// ==========================================================================
const slideTrack = document.getElementById('slide-track');
if (slideTrack) {
    // HTML内のスライド要素を取得して自動で複製・結合する
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
// 5. スマホ用ハンバーガーメニューの開閉制御（アクセシビリティ対応）
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('#nav-menu a');

hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // 開閉状態を aria-expanded 属性へ反映
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

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".trailer-slide");
  if (slides.length <= 1) return; // 動画が1つ以下の場合は何もしない

  let currentIndex = 0;
  const intervalTime = 4000; // 切り替わる時間（4000ミリ秒 = 4秒）

  function switchSlide() {
    // スマホサイズ（768px以下）のときだけスライドを動かす
    if (window.innerWidth <= 768) {
      slides[currentIndex].classList.remove("active-slide");
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add("active-slide");
    }
  }

  // 初期化：最初のスライドに active-slide を付与
  slides[0].classList.add("active-slide");

  // 定期的に切り替えるタイマーを開始
  setInterval(switchSlide, intervalTime);
});