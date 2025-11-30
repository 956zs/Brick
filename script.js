// 主題切換功能
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "light";

if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
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
      <div class="zero-title">🎉 恭喜你！</div>
      <div class="zero-text">你成功把所有磚頭都丟掉了</div>
      <div class="zero-subtext">這證明了你真的很閒</div>
      <button class="zero-btn" onclick="location.reload()">🔄 再來一次</button>
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
