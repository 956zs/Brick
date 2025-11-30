/**
 * 預渲染腳本
 * 將 content.md 轉換成 HTML
 *
 * 用法：node build-render.js
 * 輸出：.tmp_rendered_content.html
 *
 * 這是 md-parser.js 的 Node.js 版本，
 * 用於編譯時預渲染 Markdown 內容。
 */

const fs = require("fs");

// 簡化版的 MarkdownPaperParser（移除 DOM 相關功能）
class MarkdownPaperParser {
  constructor(options = {}) {
    this.options = options;
  }

  parse(markdown) {
    let html = markdown;

    // 處理註解（移除）
    html = html.replace(/<!--[\s\S]*?-->/g, "");

    // 處理程式碼區塊 ```...``` → pre code
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
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

    // 先保護 pre 和 code 區塊
    const preBlocks = [];
    html = html.replace(/<pre[\s\S]*?<\/pre>/g, (match) => {
      preBlocks.push(match);
      return `__PRE_BLOCK_${preBlocks.length - 1}__`;
    });

    // 處理行內程式碼 `code` → <code>
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 處理公式區塊 $$...$$ → equation div
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
    // ## 附錄/參考文獻等特殊標題
    html = html.replace(/^## (附錄 Z.*)$/gm, '<h1 id="sec-z">$1</h1>');
    html = html.replace(/^## (參考文獻.*)$/gm, '<h1 id="sec-ref">$1</h1>');
    html = html.replace(/^## (結語.*)$/gm, '<h1 id="sec-end">$1</h1>');
    // ## 其他標題（無 id）
    html = html.replace(/^## (.+)$/gm, "<h1>$1</h1>");
    html = html.replace(/^### (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#### (.+)$/gm, "<h3>$1</h3>");

    // 處理多行引用區塊
    html = html.replace(/(?:^> .+$\n?)+/gm, (match) => {
      const lines = match
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => l.replace(/^> /, ""))
        .join("<br>");
      return `<blockquote class="quote-block">${lines}</blockquote>`;
    });

    // 處理無序列表
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

    // 處理有序列表
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // 處理 hover 吐槽 ~~text~~{吐槽內容}
    html = html.replace(
      /~~([^~]+)~~\{([^}]+)\}/g,
      '<span class="roast-text" data-roast="$2">$1</span>'
    );

    // 處理螢光標記 ==text==
    html = html.replace(
      /==([^=]+)==/g,
      '<span class="joke-highlight">$1</span>'
    );

    // 處理粗體 **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

    // 處理諷刺斜體 *text*
    html = html.replace(/\*([^*]+)\*/g, '<span class="sarcasm">$1</span>');

    // 處理段落
    const lines = html.split("\n");
    let result = [];
    let currentParagraph = [];

    for (let line of lines) {
      line = line.trim();

      if (line === "") {
        if (currentParagraph.length > 0) {
          const content = currentParagraph.join(" ");
          if (!content.startsWith("<") && !content.startsWith("__PRE_BLOCK_")) {
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

    // 清理空 <p> 標籤
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
    const tableRegex = /(?:^\|.+\|$\n?)+/gm;

    return html.replace(tableRegex, (tableBlock) => {
      const rows = tableBlock
        .trim()
        .split("\n")
        .filter((r) => r.trim());
      if (rows.length < 2) return tableBlock;

      const separatorIndex = rows.findIndex((r) => /^\|[\s\-:|]+\|$/.test(r));
      if (separatorIndex === -1) return tableBlock;

      let tableHtml = '<table class="md-table">';

      const headerRow = rows.slice(0, separatorIndex);
      if (headerRow.length > 0) {
        tableHtml += "<thead><tr>";
        const headerCells = this.parseTableRow(headerRow[0]);
        headerCells.forEach((cell) => {
          tableHtml += `<th>${cell}</th>`;
        });
        tableHtml += "</tr></thead>";
      }

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
  // 語法：:::chat{title="標題"}...:::
  // @meta 描述
  // @username[時間] 訊息
  // @username[時間]! 重點訊息（高亮）
  parseChatBlock(html) {
    // 用戶配置：ID -> { name, gradient (兩色漸變) }
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
      let chatHtml = `
<details class="chat-details">
<summary>${title}</summary>
<div class="chat-log">
<div class="chat-header">`;

      const lines = content.trim().split("\n");
      let headerDone = false;

      for (const line of lines) {
        // @meta 行
        if (line.startsWith("@meta ")) {
          const metaText = line.substring(6);
          chatHtml += `<div class="chat-meta">${metaText}</div>`;
          continue;
        }

        // 結束 header
        if (!headerDone && !line.startsWith("@meta ")) {
          chatHtml += `</div>`;
          headerDone = true;
        }

        // @username[時間] 訊息 或 @username[時間]! 重點訊息
        const msgMatch = line.match(/^@(\w+)\[([^\]]+)\](!?)\s*(.*)$/);
        if (msgMatch) {
          const [, userId, time, isHighlight, text] = msgMatch;
          const user = users[userId] || {
            name: userId,
            gradient: "linear-gradient(90deg, #5865f2, #7289da, #5865f2)",
          };
          const highlightClass = isHighlight ? " highlight-message" : "";

          chatHtml += `
<div class="chat-message${highlightClass}" data-user="${userId}">
  <img class="chat-avatar" src="assets/avatars/${userId}.png" alt="${user.name}" onerror="this.style.display='none'">
  <div class="chat-content">
    <div class="chat-username gradient-name" style="--gradient: ${user.gradient};">${user.name} <span class="chat-time">${time}</span></div>
    <div class="chat-text">${text}</div>
  </div>
</div>`;
        }
      }

      chatHtml += `
</div>
</details>`;

      return chatHtml;
    });
  }

  // 目錄區塊解析
  // 語法：:::toc{title="標題"}...:::
  parseTocBlock(html) {
    const tocRegex = /:::toc\{title="([^"]+)"\}\n([\s\S]*?):::/g;

    return html.replace(tocRegex, (_, title, content) => {
      let tocHtml = `
<details class="toc-details" open>
<summary>${title}</summary>
<nav class="toc-nav">`;

      const lines = content.trim().split("\n");
      for (const line of lines) {
        // - [文字](#anchor)
        const linkMatch = line.match(/^- \[([^\]]+)\]\(#([^)]+)\)$/);
        if (linkMatch) {
          const [, text, anchor] = linkMatch;
          tocHtml += `<a class="toc-link" href="#${anchor}">${text}</a>`;
        }
      }

      tocHtml += `
</nav>
</details>`;

      return tocHtml;
    });
  }

  // 圖片解析
  // ![alt](url)           → 基本圖片
  // ![alt](url){w=寬}     → 指定寬度
  // ![alt](url){caption}  → 帶標題
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
}

// 執行渲染
const markdown = fs.readFileSync("content.md", "utf8");
const parser = new MarkdownPaperParser();
const html = parser.parse(markdown);

fs.writeFileSync(".tmp_rendered_content.html", html);
console.log("✓ Markdown 預渲染完成");
