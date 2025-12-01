/**
 * Markdown 論文解析器
 *
 * ═══════════════════════════════════════════════════════════════
 * 支援語法一覽
 * ═══════════════════════════════════════════════════════════════
 *
 * 【文字格式】
 *   ==text==              → 螢光標記 (joke-highlight)
 *   ~~text~~{吐槽}        → hover 顯示吐槽 tooltip (roast-text)
 *   ==~~text~~{吐槽}==    → 螢光 + 吐槽（嵌套）
 *   ~~==text==~~{吐槽}    → 吐槽 + 螢光（嵌套）
 *   *text*                → 諷刺斜體 (sarcasm)，hover 顯示隨機 emoji
 *   **text**              → 粗體
 *   `code`                → 行內程式碼
 *
 * 【標題層級】
 *   # 標題                → 論文主標題（自動換行處理）
 *   ## N. 標題            → h1 章節標題，自動加 id="sec-N"
 *   ## 附錄 Z...          → h1，id="sec-z"
 *   ## 參考文獻           → h1，id="sec-ref"
 *   ### 標題              → h2 小節標題
 *   #### 標題             → h3 子標題
 *
 * 【區塊元素】
 *   > 引用                → 引用區塊（支援多行連續 >）
 *   - 項目                → 無序列表
 *   1. 項目               → 有序列表
 *   ---                   → 分頁符號
 *
 * 【特殊區塊】
 *   $$equation$$          → 公式區塊
 *   ```lang               → 程式碼區塊（保留格式）
 *   code
 *   ```
 *   | A | B |             → 表格（需要分隔行 |---|---|）
 *   |---|---|
 *   | 1 | 2 |
 *
 * 【自定義區塊】
 *   :::toc{title="標題"}  → 目錄區塊（可展開）
 *   - [文字](#anchor)
 *   :::
 *
 *   :::chat{title="標題"} → 聊天紀錄區塊（Discord 風格）
 *   @meta 描述文字
 *   @userId[時間] 訊息
 *   @userId[時間]! 重點訊息（高亮）
 *   :::
 *
 * 【圖片】
 *   ![alt](url)           → 基本圖片
 *   ![alt](url){w=寬}     → 指定寬度（如 {w=333}）
 *   ![alt](url){caption}  → 帶標題的圖片
 *
 * 【HTML 直接支援】
 *   <details>             → 折疊區塊
 *   <summary>             → 折疊標題
 *
 * 【自動處理】
 *   - 摘要章節自動包裝成 abstract 區塊
 *   - 參考文獻自動格式化
 *   - 英文副標題自動識別
 *
 * 【聊天用戶配置】（在 parseChatBlock 中定義）
 *   maboroshi22  → 黒幻₂₂
 *   kaze         → 月村手まりまり
 *   yoyo2007     → 林秋
 *
 * ═══════════════════════════════════════════════════════════════
 */

class MarkdownPaperParser {
  constructor(options = {}) {
    this.options = {
      contentFile: "./content.md",
      targetElement: "#content",
      ...options,
    };
  }

  async load() {
    try {
      const response = await fetch(this.options.contentFile);
      if (!response.ok) throw new Error("無法載入 Markdown 檔案");
      const markdown = await response.text();
      const html = this.parse(markdown);
      document.querySelector(this.options.targetElement).innerHTML = html;
      this.initEffects();
    } catch (error) {
      console.error("載入失敗:", error);
      document.querySelector(
        this.options.targetElement
      ).innerHTML = `<p style="color: var(--text-hint);">載入失敗：${error.message}</p>`;
    }
  }

  parse(markdown) {
    let html = markdown;

    // 處理註解（移除）
    html = html.replace(/<!--[\s\S]*?-->/g, "");

    // 處理程式碼區塊 ```...``` → pre code (要在其他處理之前)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/\x3c/g, "&lt;")
        .replace(/>/g, "&gt;")
        .trimEnd();
      return (
        '<pre class="code-block' +
        (lang ? " language-" + lang : "") +
        '"><code>' +
        escapedCode +
        "</code></pre>"
      );
    });

    // 處理表格
    html = this.parseTable(html);

    // 處理行內程式碼 `code` → <code>
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 處理公式區塊 $...$ → equation div
    html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="equation">$1</div>');

    // 處理圖片 ![alt](url){options}
    html = this.parseImages(html);

    // 處理分頁符號 ---
    html = html.replace(/^---$/gm, '<div class="page-break"></div>');

    // 處理聊天紀錄區塊 :::chat{title="..."}...:::
    html = this.parseChatBlock(html);

    // 處理目錄區塊 :::toc{title="..."}...:::
    html = this.parseTocBlock(html);

    // 處理標題
    // # 主標題 → title
    html = html.replace(/^# (.+)$/gm, (_, title) => {
      const parts = title.split("：");
      if (parts.length > 1) {
        return `<div class="title">${parts[0]}<br>之跨領域整合研究：<br>${parts
          .slice(1)
          .join("：")
          .replace(/從(.+)到(.+)的/, "從$1到$2的<br>")}</div>`;
      }
      return `<div class="title">${title}</div>`;
    });

    // ## 章節標題 → h1 (帶 id)
    html = html.replace(/^## (\d+)\. (.+)$/gm, (_, num, title) => {
      return `<h1 id="sec-${num}">${num}. ${title}</h1>`;
    });
    html = html.replace(/^## (附錄 Z.*)$/gm, '<h1 id="sec-z">$1</h1>');
    html = html.replace(/^## (參考文獻.*)$/gm, '<h1 id="sec-ref">$1</h1>');
    html = html.replace(/^## (結語.*)$/gm, '<h1 id="sec-end">$1</h1>');
    html = html.replace(/^## (.+)$/gm, "<h1>$1</h1>");

    // ### 小節標題 → h2
    html = html.replace(/^### (.+)$/gm, "<h2>$1</h2>");

    // #### 子標題 → h3
    html = html.replace(/^#### (.+)$/gm, "<h3>$1</h3>");

    // 處理多行引用區塊 (連續的 > 行)
    html = html.replace(/(?:^> .+$\n?)+/gm, (match) => {
      const lines = match
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => l.replace(/^> /, ""))
        .join("<br>");
      return `<blockquote class="quote-block">${lines}</blockquote>`;
    });

    // 處理無序列表
    html = html.replace(/^- (.+)$/gm, "{{UL_ITEM}}$1{{/UL_ITEM}}");

    // 處理有序列表
    html = html.replace(/^\d+\. (.+)$/gm, "{{OL_ITEM}}$1{{/OL_ITEM}}");

    // 包裝連續的無序列表項目
    html = html.replace(/({{UL_ITEM}}.*?{{\/UL_ITEM}}\n?)+/g, (match) => {
      const items = match
        .replace(/{{UL_ITEM}}/g, "<li>")
        .replace(/{{\/UL_ITEM}}/g, "</li>");
      return "<ul>" + items + "</ul>";
    });

    // 包裝連續的有序列表項目
    html = html.replace(/({{OL_ITEM}}.*?{{\/OL_ITEM}}\n?)+/g, (match) => {
      const items = match
        .replace(/{{OL_ITEM}}/g, "<li>")
        .replace(/{{\/OL_ITEM}}/g, "</li>");
      return "<ol>" + items + "</ol>";
    });

    // 先保護 pre 和 code 區塊，避免被後續處理破壞
    const preBlocks = [];
    html = html.replace(/<pre[\s\S]*?<\/pre>/g, (match) => {
      preBlocks.push(match);
      return `__PRE_BLOCK_${preBlocks.length - 1}__`;
    });

    // 處理嵌套標記：==~~text~~{吐槽}== 或 ~~==text==~~{吐槽}
    // 先處理外層是螢光、內層是吐槽：==~~text~~{吐槽}==
    html = html.replace(
      /==~~([^~]+)~~\{([^}]+)\}==/g,
      '<span class="joke-highlight"><span class="roast-text" data-roast="$2">$1</span></span>'
    );

    // 處理外層是吐槽、內層是螢光：~~==text==~~{吐槽}
    html = html.replace(
      /~~==([^=]+)==~~\{([^}]+)\}/g,
      '<span class="roast-text" data-roast="$2"><span class="joke-highlight">$1</span></span>'
    );

    // 處理單獨的 hover 吐槽 ~~text~~{吐槽內容}
    html = html.replace(
      /~~([^~]+)~~\{([^}]+)\}/g,
      '<span class="roast-text" data-roast="$2">$1</span>'
    );

    // 處理單獨的螢光標記 ==text==
    html = html.replace(
      /==([^=]+)==/g,
      '<span class="joke-highlight">$1</span>'
    );

    // 處理粗體 **text** (要在斜體之前處理)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

    // 處理諷刺斜體 *text*
    html = html.replace(/\*([^*]+)\*/g, '<span class="sarcasm">$1</span>');

    // 處理段落（空行分隔）
    const lines = html.split("\n");
    let result = [];
    let currentParagraph = [];

    for (let line of lines) {
      line = line.trim();

      if (line === "") {
        if (currentParagraph.length > 0) {
          const content = currentParagraph.join(" ");
          if (!content.startsWith("<")) {
            result.push(`<p>${content}</p>`);
          } else {
            result.push(content);
          }
          currentParagraph = [];
        }
        continue;
      }

      if (line.startsWith("<") || line.startsWith("__PRE_BLOCK_")) {
        if (currentParagraph.length > 0) {
          result.push(`<p>${currentParagraph.join(" ")}</p>`);
          currentParagraph = [];
        }
        result.push(line);
      } else {
        currentParagraph.push(line);
      }
    }

    if (currentParagraph.length > 0) {
      result.push(`<p>${currentParagraph.join(" ")}</p>`);
    }

    html = result.join("\n");

    // 還原 pre 區塊
    preBlocks.forEach((block, i) => {
      html = html.replace(`__PRE_BLOCK_${i}__`, block);
    });

    // 清理多餘的空 <p> 標籤
    html = html.replace(/<p>\s*<\/p>/g, "");

    // 處理摘要區塊
    html = this.wrapAbstract(html);

    // 處理副標題
    html = this.addSubtitle(html);

    // 處理參考文獻
    html = this.formatReferences(html);

    return html;
  }

  parseTable(html) {
    // 匹配表格：以 | 開頭的連續行
    const tableRegex = /(?:^\|.+\|$\n?)+/gm;

    return html.replace(tableRegex, (tableBlock) => {
      const rows = tableBlock
        .trim()
        .split("\n")
        .filter((r) => r.trim());
      if (rows.length < 2) return tableBlock;

      // 檢查是否有分隔行 (|---|---|)
      const separatorIndex = rows.findIndex((r) => /^\|[\s\-:|]+\|$/.test(r));
      if (separatorIndex === -1) return tableBlock;

      let tableHtml = '<table class="md-table">';

      // 處理表頭
      const headerRow = rows.slice(0, separatorIndex);
      if (headerRow.length > 0) {
        tableHtml += "<thead><tr>";
        const headerCells = this.parseTableRow(headerRow[0]);
        headerCells.forEach((cell) => {
          tableHtml += `<th>${cell}</th>`;
        });
        tableHtml += "</tr></thead>";
      }

      // 處理表身
      const bodyRows = rows.slice(separatorIndex + 1);
      if (bodyRows.length > 0) {
        tableHtml += "<tbody>";
        bodyRows.forEach((row) => {
          tableHtml += "<tr>";
          const cells = this.parseTableRow(row);
          cells.forEach((cell) => {
            tableHtml += `<td>${cell}</td>`;
          });
          tableHtml += "</tr>";
        });
        tableHtml += "</tbody>";
      }

      tableHtml += "</table>";
      return tableHtml;
    });
  }

  parseTableRow(row) {
    // 移除首尾的 |，然後按 | 分割
    return row
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());
  }

  wrapAbstract(html) {
    const abstractMatch = html.match(
      /<h1>摘要[\s\S]*?<\/h1>([\s\S]*?)(?=<h1>|<div class="page-break">)/
    );
    if (abstractMatch) {
      const abstractContent = abstractMatch[1];
      const wrappedAbstract = `
        <div class="abstract">
          <div class="abstract-title">摘要 ABSTRACT</div>
          ${abstractContent}
        </div>
      `;
      html = html.replace(
        /<h1>摘要[\s\S]*?<\/h1>[\s\S]*?(?=<h1>|<div class="page-break">)/,
        wrappedAbstract
      );
    }
    return html;
  }

  addSubtitle(html) {
    const titleEnd = html.indexOf("</div>");
    if (titleEnd > -1) {
      const afterTitle = html.substring(titleEnd + 6);
      const subtitleMatch = afterTitle.match(
        /^[\s\n]*<p>([^<]*A Hyper-Interdisciplinary[^<]*)<\/p>/
      );
      if (subtitleMatch) {
        const subtitle = `<div class="subtitle">${subtitleMatch[1].replace(
          /\. /g,
          ".<br>"
        )}</div>`;
        html = html.replace(subtitleMatch[0], subtitle);
      }
    }
    return html;
  }

  formatReferences(html) {
    const refMatch = html.match(/<h1>參考文獻<\/h1>([\s\S]*?)$/);
    if (refMatch) {
      let refContent = refMatch[1];
      refContent = refContent.replace(
        /<li>(.+?)<\/li>/g,
        '<div class="reference">$1</div>'
      );
      refContent = refContent.replace(/<ul>|<\/ul>/g, "");
      html = html.replace(refMatch[1], refContent);
    }
    return html;
  }

  // 聊天紀錄解析
  parseChatBlock(html) {
    const users = {
      maboroshi22: {
        name: "黒幻₂₂",
        gradient: "linear-gradient(90deg, #ffc6d5, #ff9cbf, #ffc6d5, #ff9cbf)",
      },
      kaze: {
        name: "月村手まりまり",
        gradient: "linear-gradient(90deg, #ffc6d5, #ff9cbf, #ffc6d5, #ff9cbf)",
      },
      yoyo2007: {
        name: "林秋",
        gradient: "linear-gradient(90deg, #ffc6d5, #ff9cbf, #ffc6d5, #ff9cbf)",
      },
    };

    const chatRegex = /:::chat\{title="([^"]+)"\}\n([\s\S]*?):::/g;

    return html.replace(chatRegex, (_, title, content) => {
      let chatHtml = `<details class="chat-details"><summary>${title}</summary><div class="chat-log"><div class="chat-header">`;

      const lines = content.trim().split("\n");
      let headerDone = false;

      for (const line of lines) {
        if (line.startsWith("@meta ")) {
          chatHtml += `<div class="chat-meta">${line.substring(6)}</div>`;
          continue;
        }

        if (!headerDone && !line.startsWith("@meta ")) {
          chatHtml += `</div>`;
          headerDone = true;
        }

        const msgMatch = line.match(/^@(\w+)\[([^\]]+)\](!?)\s*(.*)$/);
        if (msgMatch) {
          const [, userId, time, isHighlight, text] = msgMatch;
          const user = users[userId] || {
            name: userId,
            gradient: "linear-gradient(90deg, #5865f2, #7289da, #5865f2)",
          };
          const highlightClass = isHighlight ? " highlight-message" : "";

          chatHtml += `<div class="chat-message${highlightClass}" data-user="${userId}">
            <img class="chat-avatar" src="assets/avatars/${userId}.png" alt="${user.name}" onerror="this.style.display='none'">
            <div class="chat-content">
              <div class="chat-username gradient-name" style="--gradient: ${user.gradient};">${user.name} <span class="chat-time">${time}</span></div>
              <div class="chat-text">${text}</div>
            </div>
          </div>`;
        }
      }

      chatHtml += `</div></details>`;
      return chatHtml;
    });
  }

  // 目錄區塊解析 - 支援章節展開/收合子項目
  parseTocBlock(html) {
    const tocRegex = /:::toc\{title="([^"]+)"\}\n([\s\S]*?):::/g;

    return html.replace(tocRegex, (_, title, content) => {
      let tocHtml = `<details class="toc-details" open><summary>${title}</summary><nav class="toc-nav">`;

      const lines = content.trim().split("\n");
      let currentChapter = null;
      let subItems = [];

      const flushChapter = () => {
        if (currentChapter) {
          if (subItems.length > 0) {
            tocHtml += `<div class="toc-chapter">`;
            tocHtml += `<div class="toc-chapter-header">`;
            tocHtml += `<a class="toc-link toc-main" href="#${currentChapter.anchor}">${currentChapter.text}</a>`;
            tocHtml += `<button class="toc-toggle" aria-label="展開子項目">▼</button>`;
            tocHtml += `</div>`;
            tocHtml += `<div class="toc-subitems">`;
            for (const sub of subItems) {
              tocHtml += `<a class="toc-link toc-sub" href="#${sub.anchor}">${sub.text}</a>`;
            }
            tocHtml += `</div></div>`;
          } else {
            tocHtml += `<a class="toc-link toc-main" href="#${currentChapter.anchor}">${currentChapter.text}</a>`;
          }
        }
        currentChapter = null;
        subItems = [];
      };

      for (const line of lines) {
        const subMatch = line.match(/^(\s+)- \[([^\]]+)\]\(#([^)]+)\)$/);
        if (subMatch) {
          const [, , text, anchor] = subMatch;
          subItems.push({ text, anchor });
          continue;
        }
        const mainMatch = line.match(/^- \[([^\]]+)\]\(#([^)]+)\)$/);
        if (mainMatch) {
          flushChapter();
          const [, text, anchor] = mainMatch;
          currentChapter = { text, anchor };
        }
      }
      flushChapter();

      tocHtml += `</nav></details>`;
      return tocHtml;
    });
  }

  // 圖片解析
  parseImages(html) {
    // ![alt](url){w=數字} - 指定寬度
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)\{w=(\d+)\}/g,
      '<figure class="md-figure"><img src="$2" alt="$1" style="width: $3px; max-width: 100%;"></figure>'
    );
    // ![alt](url){caption文字} - 帶標題
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)\{([^}]+)\}/g,
      '<figure class="md-figure"><img src="$2" alt="$1"><figcaption>$3</figcaption></figure>'
    );
    // ![alt](url) - 基本圖片
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<figure class="md-figure"><img src="$2" alt="$1"></figure>'
    );
    return html;
  }

  initEffects() {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll("h1").forEach((h1) => {
      observer.observe(h1);
    });

    document.querySelectorAll(".joke-highlight").forEach((el) => {
      el.addEventListener("click", function () {
        this.style.animation = "none";
        this.offsetHeight;
        this.style.animation = "bounce 0.5s ease";
      });
    });

    // Roast tooltip 動態定位
    this.setupRoastTooltips();

    // 諷刺斜體隨機 emoji
    const sarcasmEmojis = [
      "😏",
      "🙄",
      "🤔",
      "😒",
      "🫠",
      "🤨",
      "😮‍💨",
      "🥴",
      "😑",
      "🫤",
    ];
    document.querySelectorAll(".sarcasm").forEach((el) => {
      el.addEventListener("mouseenter", function () {
        const randomEmoji =
          sarcasmEmojis[Math.floor(Math.random() * sarcasmEmojis.length)];
        this.setAttribute("data-emoji", randomEmoji);
      });
    });

    const title = document.querySelector(".title");
    if (title) {
      title.addEventListener("dblclick", () => {
        const emojis = ["🧱", "✈️", "🤔", "📚", "🎓"];
        for (let i = 0; i < 20; i++) {
          this.createFloatingEmoji(
            emojis[Math.floor(Math.random() * emojis.length)]
          );
        }
      });
    }

    if ("vibrate" in navigator) {
      document.querySelectorAll(".joke-highlight, .equation").forEach((el) => {
        el.addEventListener("touchstart", () => navigator.vibrate(10));
      });
    }
  }

  createFloatingEmoji(emoji) {
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

  setupRoastTooltips() {
    // 建立共用的 tooltip 元素
    const tooltip = document.createElement("div");
    tooltip.className = "roast-tooltip";
    document.body.appendChild(tooltip);

    let currentTarget = null;

    document.querySelectorAll(".roast-text").forEach((el) => {
      el.addEventListener("mouseenter", function (e) {
        const roastText = this.getAttribute("data-roast");
        if (!roastText) return;

        tooltip.textContent = roastText;
        tooltip.classList.add("show");
        currentTarget = this;

        // 計算位置
        const rect = this.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

        // 如果超出上方，改為顯示在下方
        if (top < 10) {
          top = rect.bottom + 10;
        }

        // 確保不超出左右邊界
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = top + "px";
        tooltip.style.left = left + "px";
      });

      el.addEventListener("mouseleave", function () {
        tooltip.classList.remove("show");
        currentTarget = null;
      });

      // 手機版點擊切換
      el.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const roastText = this.getAttribute("data-roast");
          if (!roastText) return;

          if (currentTarget === this && tooltip.classList.contains("show")) {
            tooltip.classList.remove("show");
            currentTarget = null;
          } else {
            tooltip.textContent = roastText;
            tooltip.classList.add("show");
            currentTarget = this;

            // 手機版置中顯示
            tooltip.style.top = "50%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translate(-50%, -50%) scale(1)";
          }
        }
      });
    });

    // 點擊其他地方關閉 tooltip
    document.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("roast-text") &&
        window.innerWidth <= 768
      ) {
        tooltip.classList.remove("show");
        currentTarget = null;
      }
    });
  }
}

// 自動載入
document.addEventListener("DOMContentLoaded", () => {
  const parser = new MarkdownPaperParser({
    contentFile: "./content.md",
    targetElement: "#content",
  });
  parser.load();
});
