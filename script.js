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

// 滾動到特定位置時觸發磚頭掉落動畫
let brickDropped = false;
window.addEventListener("scroll", function () {
  const scrollPercent =
    (window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight)) *
    100;

  if (scrollPercent > 20 && !brickDropped) {
    brickDropped = true;
    animateBrickDrop();
  }
});

function animateBrickDrop() {
  let count = 100;
  const interval = setInterval(function () {
    count--;
    brickCount.textContent = count;
    brickCount.style.transform = "scale(1.2)";
    setTimeout(() => {
      brickCount.style.transform = "scale(1)";
    }, 100);

    if (count <= 99) {
      clearInterval(interval);
      brickCount.style.color = "#e74c3c";
      setTimeout(() => {
        brickCount.style.color = "";
      }, 500);
    }
  }, 50);
}

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
