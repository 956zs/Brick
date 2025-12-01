// 閱讀統計動態效果
(function initReadingStats() {
  const charCountEl = document.getElementById("charCount");
  const wordCountEl = document.getElementById("wordCount");
  const readTimeEl = document.getElementById("readTime");
  const understandTimeEl = document.getElementById("understandTime");

  if (!charCountEl) return;

  // 從頁面內容動態計算字數（使用 textContent 避免強制重排）
  const content = document.getElementById("content");
  const text = content ? content.textContent : "";

  // 計算中文字數（匹配中文字符）
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;

  // 計算英文單字數（匹配連續英文字母）
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  // 閱讀時間計算（基於研究數據）
  // 中文：~260-315 字/分鐘，取 280 cpm（考慮專業術語會慢一點）
  // 英文：~238-260 詞/分鐘，取 250 wpm
  const readingMinutes = Math.ceil(chineseChars / 280 + englishWords / 250);

  // 數字跳動動畫
  function animateNumber(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * easeProgress);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // 延遲啟動動畫
  setTimeout(() => {
    animateNumber(charCountEl, chineseChars);
    animateNumber(wordCountEl, englishWords);
    animateNumber(readTimeEl, readingMinutes);
  }, 500);

  // 理解時間的荒謬動畫
  const absurdTimes = [
    "∞",
    "看造化",
    "3輩子",
    "等磚頭回來",
    "問哲學系",
    "∞",
    "放棄吧",
    "99年",
    "∞",
    `${chineseChars}秒`,
    "下輩子",
  ];
  let absurdIndex = 0;

  setInterval(() => {
    absurdIndex = (absurdIndex + 1) % absurdTimes.length;
    understandTimeEl.style.opacity = "0";
    setTimeout(() => {
      understandTimeEl.textContent = absurdTimes[absurdIndex];
      understandTimeEl.style.opacity = "1";
    }, 200);
  }, 3000);
})();

// 主題切換功能
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "dark";

if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
} else {
  themeToggle.textContent = "🌙";
}

themeToggle.addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  }
});

// 滾動進度條
window.addEventListener("scroll", function () {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById("progressBar").style.width = scrolled + "%";

  // 回到頂部按鈕顯示/隱藏
  const backToTop = document.getElementById("backToTop");
  if (winScroll > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

// 回到頂部功能
document.getElementById("backToTop").addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// 磚頭計數器動畫
const brickCounter = document.getElementById("brickCounter");
const brickCount = document.getElementById("brickCount");

setTimeout(function () {
  brickCounter.classList.add("show");
}, 1500);

// 磚頭掉落動畫系統
let brickDropped = false;

// 頁面載入後自動掉一塊磚
setTimeout(() => {
  if (!brickDropped) {
    triggerBrickDrop();
  }
}, 4000);

// 滾動到特定位置也會觸發（備用）
window.addEventListener("scroll", function () {
  const scrollPercent =
    (window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight)) *
    100;

  if (scrollPercent > 15 && !brickDropped) {
    triggerBrickDrop();
  }
});

// 點擊計數器可以再掉磚頭（彩蛋）
brickCounter.addEventListener("click", () => {
  const currentCount = parseInt(brickCount.textContent);
  if (currentCount > 0) {
    createFallingBrick();
    animateCountDown(currentCount, currentCount - 1);

    // 掉到 0 時觸發彩蛋
    if (currentCount - 1 === 0) {
      setTimeout(() => triggerZeroEasterEgg(), 1500);
    }
  }
});

function triggerBrickDrop() {
  brickDropped = true;
  createFallingBrick();

  // 延遲一下再更新計數器，配合磚頭掉落動畫
  setTimeout(() => {
    animateCountDown(100, 99);
  }, 800);
}

function createFallingBrick() {
  const brick = document.createElement("img");
  brick.className = "falling-brick";
  brick.src = "./favicon.png";
  brick.alt = "磚頭";

  // 隨機起始位置
  const startX = Math.random() * 60 + 20; // 20% - 80% 的螢幕寬度
  brick.style.left = startX + "vw";

  document.body.appendChild(brick);

  // 掉落完成後移除
  brick.addEventListener("animationend", () => {
    createImpactEffect(startX);
    brick.remove();
  });
}

function createImpactEffect(x) {
  // 撞擊粒子效果
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "brick-particle";
    particle.textContent = ["💥", "✨", "💨", "🔸"][
      Math.floor(Math.random() * 4)
    ];
    particle.style.left = x + "vw";
    particle.style.setProperty("--angle", Math.random() * 180 - 90 + "deg");
    particle.style.setProperty("--distance", Math.random() * 100 + 50 + "px");
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }

  // 螢幕震動效果（只震動內容區塊，不影響 fixed 元素）
  const paper = document.querySelector(".paper");
  if (paper) {
    paper.classList.add("screen-shake");
    setTimeout(() => {
      paper.classList.remove("screen-shake");
    }, 300);
  }
}

function animateCountDown(from, to) {
  brickCount.textContent = to;
  brickCount.style.transform = "scale(1.5)";
  brickCount.style.color = "#e74c3c";

  setTimeout(() => {
    brickCount.style.transform = "scale(1)";
  }, 200);

  setTimeout(() => {
    brickCount.style.color = "";
  }, 800);
}

// 偶爾在背景飄過小磚頭
function createAmbientBrick() {
  if (Math.random() > 0.3) return; // 70% 機率不產生

  const brick = document.createElement("img");
  brick.className = "ambient-brick";
  brick.src = "./favicon.png";
  brick.style.top = Math.random() * 100 + "vh";
  brick.style.animationDuration = Math.random() * 3 + 4 + "s";
  brick.style.width = Math.random() * 20 + 15 + "px";
  brick.style.opacity = Math.random() * 0.3 + 0.1;

  document.body.appendChild(brick);

  brick.addEventListener("animationend", () => brick.remove());
}

// 磚頭歸零彩蛋
function triggerZeroEasterEgg() {
  // 改變計數器文字
  const label = document.querySelector(".brick-counter .label");
  label.textContent = "磚頭已全數陣亡 🪦";

  // 計數器變成彩虹色
  brickCount.style.background =
    "linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)";
  brickCount.style.backgroundClip = "text";
  brickCount.style.webkitBackgroundClip = "text";
  brickCount.style.webkitTextFillColor = "transparent";
  brickCount.style.animation = "rainbow 2s linear infinite";

  // 大量磚頭從天而降
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const brick = document.createElement("img");
      brick.className = "falling-brick";
      brick.src = "./favicon.png";
      brick.style.left = Math.random() * 100 + "vw";
      brick.style.animationDuration = Math.random() * 1 + 1 + "s";
      document.body.appendChild(brick);
      brick.addEventListener("animationend", () => brick.remove());
    }, i * 100);
  }

  // 顯示訊息
  setTimeout(() => {
    // 背景遮罩 + blur
    const overlay = document.createElement("div");
    overlay.className = "zero-overlay";
    document.body.appendChild(overlay);

    const message = document.createElement("div");
    message.className = "zero-message";
    message.innerHTML = `
      <div class="zero-title">🪦 全員陣亡</div>
      <div class="zero-text">你成功把所有磚頭都丟掉了</div>
      <div class="zero-subtext">這證明了你真的很閒</div>
      <div class="zero-family">
        <div class="family-title">🧱 磚頭遺族聲明 🧱</div>
        <div class="family-quote">「我是磚頭#37的表親，磚頭#52。#37生前夢想是成為長城的一部分。現在牠躺在太平洋底，而你們卻在這裡點擊消費牠的不幸。」</div>
        <div class="family-member">—— 磚頭#52，原本仍在飛機上，現已被你丟下去</div>
        <div class="family-quote">「⋯⋯」</div>
        <div class="family-member">—— 磚頭#37（化名），太平洋海底，由海藻代筆</div>
        <div class="family-quote">「自從#37掉下去後，我再也無法信任任何飛機。現在我也掉下去了，至少不用再恐懼了。」</div>
        <div class="family-member">—— 磚頭#42，生前診斷為航空信任缺失障礙（ATDD）</div>
        <div class="family-quote">「我根本不是磚頭，我是紅土色的瑜珈磚！我被誤抓上飛機的！」</div>
        <div class="family-member">—— 物體#88，經DNA鑑定確認是磚頭，但牠至死拒絕接受結果</div>
        <div class="family-quote">「#37欠我50塊錢還沒還，現在大家都掉下去了，我找誰要？」</div>
        <div class="family-member">—— 磚頭#15，生前正在諮詢律師（律師說案子太荒謬拒絕接）</div>
      </div>
      <button class="zero-btn" onclick="location.reload()">🔄 重新投胎 100 塊磚頭</button>
    `;
    document.body.appendChild(message);
  }, 3500);
}

// 每隔一段時間產生背景磚頭
setInterval(createAmbientBrick, 5000);

// 標題滾動動畫 (Intersection Observer)
const observerOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll("h1").forEach((h1) => {
  observer.observe(h1);
});

// 點擊 joke-highlight 時的彈跳效果
document.querySelectorAll(".joke-highlight").forEach((el) => {
  el.addEventListener("click", function () {
    this.style.animation = "none";
    this.offsetHeight;
    this.style.animation = "bounce 0.5s ease";
  });
});

// Roast tooltip - 用滑鼠位置定位，解決跨行問題
(function setupRoastTooltips() {
  const roastElements = document.querySelectorAll(".roast-text");
  if (roastElements.length === 0) return;

  // 建立 tooltip 元素
  const tooltip = document.createElement("div");
  tooltip.className = "roast-tooltip";
  document.body.appendChild(tooltip);

  let currentTarget = null;
  let mouseX = 0;

  roastElements.forEach((el) => {
    el.addEventListener("mouseenter", function (e) {
      const text = this.getAttribute("data-roast");
      if (!text) return;

      currentTarget = this;
      mouseX = e.clientX;

      tooltip.textContent = "「" + text + "」";
      showTooltip(e.clientX, e.clientY);
    });

    el.addEventListener("mousemove", function (e) {
      if (currentTarget === this) {
        mouseX = e.clientX;
      }
    });

    el.addEventListener("mouseleave", function () {
      tooltip.classList.remove("show");
      currentTarget = null;
    });

    // 手機觸控支援：點擊顯示，再點擊或滾動隱藏
    el.addEventListener("touchstart", function (e) {
      const text = this.getAttribute("data-roast");
      if (!text) return;

      // 如果已經顯示，則隱藏
      if (currentTarget === this && tooltip.classList.contains("show")) {
        tooltip.classList.remove("show");
        currentTarget = null;
        return;
      }

      currentTarget = this;
      const touch = e.touches[0];
      tooltip.textContent = "「" + text + "」";
      showTooltip(touch.clientX, touch.clientY);
    });
  });

  // 滾動時隱藏 tooltip
  window.addEventListener(
    "scroll",
    function () {
      if (tooltip.classList.contains("show")) {
        tooltip.classList.remove("show");
        currentTarget = null;
      }
    },
    { passive: true }
  );

  // 點擊其他地方隱藏 tooltip（手機用）
  document.addEventListener("touchstart", function (e) {
    if (currentTarget && !currentTarget.contains(e.target)) {
      tooltip.classList.remove("show");
      currentTarget = null;
    }
  });

  function showTooltip(x, y) {
    // 先顯示以取得尺寸
    tooltip.style.opacity = "0";
    tooltip.classList.add("show");

    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 12;

    // 用滑鼠 X 位置為中心
    let left = x - tooltipRect.width / 2;
    // Y 位置在滑鼠上方
    let top = y - tooltipRect.height - 15;

    // 箭頭預設在中間
    let arrowLeft = 50;

    // 確保不超出左邊界
    if (left < margin) {
      const shift = margin - left;
      arrowLeft = 50 - (shift / tooltipRect.width) * 100;
      left = margin;
    }

    // 確保不超出右邊界
    if (left + tooltipRect.width > window.innerWidth - margin) {
      const shift = left + tooltipRect.width - (window.innerWidth - margin);
      arrowLeft = 50 + (shift / tooltipRect.width) * 100;
      left = window.innerWidth - tooltipRect.width - margin;
    }

    // 如果上方空間不夠，顯示在下方
    if (top < margin) {
      top = y + 20;
    }

    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";
    tooltip.style.setProperty("--arrow-left", arrowLeft + "%");
    tooltip.style.opacity = "";
  }
})();

// 觸控裝置的觸覺反饋模擬
if ("vibrate" in navigator) {
  document.querySelectorAll(".joke-highlight, .equation").forEach((el) => {
    el.addEventListener("touchstart", function () {
      navigator.vibrate(10);
    });
  });
}

// 雙擊標題顯示彩蛋
document.querySelector(".title").addEventListener("dblclick", function () {
  const emojis = ["🧱", "✈️", "🤔", "📚", "🎓"];
  for (let i = 0; i < 20; i++) {
    createFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }
});

function createFloatingEmoji(emoji) {
  const el = document.createElement("div");
  el.textContent = emoji;
  el.style.cssText = `
        position: fixed;
        font-size: 30px;
        left: ${Math.random() * 100}vw;
        top: 100vh;
        pointer-events: none;
        z-index: 9999;
        animation: floatUp 3s ease-out forwards;
    `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// 目錄功能：平滑滾動 + 章節展開/收合
(function setupToc() {
  // 平滑滾動跳轉
  const tocLinks = document.querySelectorAll(".toc-link");
  tocLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // 滾動完成後高亮目標
        setTimeout(() => {
          targetElement.classList.add("toc-target-highlight");
          setTimeout(() => {
            targetElement.classList.remove("toc-target-highlight");
          }, 1500);
        }, 500);
      }
    });
  });

  // 章節展開/收合
  const toggleBtns = document.querySelectorAll(".toc-toggle");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      const chapter = this.closest(".toc-chapter");
      const subitems = chapter.querySelector(".toc-subitems");

      if (subitems) {
        const isCollapsed = subitems.classList.contains("collapsed");

        if (isCollapsed) {
          subitems.classList.remove("collapsed");
          this.classList.remove("collapsed");
          this.textContent = "▼";
        } else {
          subitems.classList.add("collapsed");
          this.classList.add("collapsed");
          this.textContent = "▶";
        }
      }
    });
  });
})();

// 圖片放大 Lightbox
(function setupLightbox() {
  const images = document.querySelectorAll(".md-figure img");
  if (images.length === 0) return;

  // 建立 lightbox 元素
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="關閉">×</button>
    <div class="lightbox-content">
      <img src="" alt="">
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector(".lightbox-content img");
  const lightboxCaption = overlay.querySelector(".lightbox-caption");
  const closeBtn = overlay.querySelector(".lightbox-close");

  // 點擊圖片開啟 lightbox
  images.forEach((img) => {
    img.addEventListener("click", function () {
      lightboxImg.src = this.src;
      lightboxImg.alt = this.alt;

      // 取得 figcaption
      const figure = this.closest(".md-figure");
      const caption = figure ? figure.querySelector("figcaption") : null;
      lightboxCaption.textContent = caption ? caption.textContent : "";

      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  // 關閉 lightbox
  function closeLightbox() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // ESC 鍵關閉
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      closeLightbox();
    }
  });
})();
