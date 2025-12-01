#!/bin/bash

# ============================================
# 磚頭論文編譯腳本 v2.0
# 預渲染版本：用 Node.js 將 markdown 轉成 HTML
# 輸出純靜態 HTML，不需要 JS 解析
# ============================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 時間戳記
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🧱 磚頭論文編譯器 v2.0 (預渲染版)${NC}"
echo "================================"

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 需要 Node.js 來執行編譯${NC}"
    exit 1
fi

# 檢查必要檔案
echo -e "${YELLOW}📋 檢查必要檔案...${NC}"

REQUIRED_FILES=("content.md" "styles.css" "script.js" "md-parser.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 找不到 $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ 所有必要檔案都存在${NC}"

# 備份舊的 index.html
if [ -f "index.html" ]; then
    BACKUP_NAME="index_old_${TIMESTAMP}.html"
    echo -e "${YELLOW}📦 備份舊的 index.html → ${BACKUP_NAME}${NC}"
    mv index.html "$BACKUP_NAME"
    echo -e "${GREEN}✓ 備份完成${NC}"
fi

# 使用 Node.js 預渲染 markdown
echo -e "${YELLOW}🔨 預渲染 Markdown...${NC}"

node build-render.js

if [ ! -f ".tmp_rendered_content.html" ]; then
    echo -e "${RED}❌ 預渲染失敗${NC}"
    exit 1
fi

# 組合最終 HTML
echo -e "${YELLOW}📝 組合最終 HTML...${NC}"

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>論「飛機上面有100個磚頭掉了一個剩幾個」之跨領域整合研究</title>
    <link rel="icon" href="./favicon.png" type="image/png">
    <link rel="canonical" href="https://brick.n1cat.xyz/">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="本研究動員數學、量子力學、哲學、古生物學等50個領域，耗時3個月，終於證明：答案是99。但更重要的是，我們證明了學術界真的很閒。">
    <meta name="keywords" content="磚頭,飛機,100-1,學術論文,跨領域研究,數學,物理學,哲學,搞笑論文,學術諷刺,99,減法">
    <meta name="author" content="虛構研究團隊">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="論「飛機上有100個磚頭掉了一個剩幾個」之跨領域整合研究">
    <meta property="og:description" content="本研究動員數學、量子力學、哲學、古生物學等50個領域，耗時3個月，終於證明：答案是99。但更重要的是，我們證明了學術界真的很閒。">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="zh_TW">
    <meta property="og:url" content="https://brick.n1cat.xyz/">
    <meta property="og:site_name" content="磚頭研究所">
    <meta property="og:image" content="https://brick.n1cat.xyz/OG/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="飛機上有100個磚頭掉了一個剩幾個？答案是99。">
    <meta property="article:published_time" content="2025-11-28">
    <meta property="article:author" content="虛構研究團隊">
    <meta property="article:section" content="學術研究">
    <meta property="article:tag" content="磚頭">
    <meta property="article:tag" content="學術諷刺">
    <meta property="article:tag" content="跨領域研究">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="論「飛機上有100個磚頭掉了一個剩幾個」之跨領域整合研究">
    <meta name="twitter:description" content="本研究動員數學、量子力學、哲學、古生物學等50個領域，耗時3個月，終於證明：答案是99。但更重要的是，我們證明了學術界真的很閒。">
    <meta name="twitter:image" content="https://brick.n1cat.xyz/OG/og-image.png">
    <meta name="twitter:image:alt" content="飛機上有100個磚頭掉了一個剩幾個？答案是99。">
    
    <!-- Structured Data - Article -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "論「飛機上面有100個磚頭掉了一個剩幾個」之跨領域整合研究",
        "description": "本研究動員數學、量子力學、哲學、古生物學等50個領域，耗時3個月，終於證明：答案是99。",
        "image": "https://brick.n1cat.xyz/OG/og-image.png",
        "author": {
            "@type": "Organization",
            "name": "虛構研究團隊"
        },
        "publisher": {
            "@type": "Organization",
            "name": "磚頭研究所",
            "logo": {
                "@type": "ImageObject",
                "url": "https://brick.n1cat.xyz/favicon.png"
            }
        },
        "datePublished": "2025-11-28",
        "dateModified": "2025-12-01",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://brick.n1cat.xyz/"
        },
        "keywords": ["磚頭", "飛機", "學術論文", "跨領域研究", "數學", "物理學", "哲學"],
        "articleSection": "學術研究",
        "wordCount": "18000",
        "inLanguage": "zh-TW"
    }
    </script>
    
    <!-- Structured Data - FAQ -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "飛機上有100個磚頭掉了一個剩幾個？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "答案是99個。但如果你夠無聊，可以找到至少50種理由質疑這個答案。"
                }
            },
            {
                "@type": "Question",
                "name": "這篇論文是認真的嗎？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "是的，我們非常認真地在不認真。這是一種後現代的認真，一種解構主義的嚴肅。"
                }
            }
        ]
    }
    </script>
    
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    <button class="theme-toggle" id="themeToggle" aria-label="切換主題">🌙</button>
    
    <div class="brick-counter" id="brickCounter" role="status" aria-live="polite">
        <span class="count" id="brickCount">100</span>
        <span class="label">磚頭剩餘數量</span>
    </div>

    <button class="back-to-top" id="backToTop" aria-label="回到頂部">↑</button>

    <main>
    <article class="paper" id="content">
<div class="reading-stats" id="readingStats">
  <div class="stats-row">
    <span class="stat-item">📝 中文 <span id="charCount">0</span> 字</span>
    <span class="stat-divider">|</span>
    <span class="stat-item">🔤 英文 <span id="wordCount">0</span> 詞</span>
    <span class="stat-divider">|</span>
    <span class="stat-item">📖 預計閱讀 <span id="readTime">0</span> 分鐘</span>
    <span class="stat-divider">|</span>
    <span class="stat-item stat-absurd">🧠 理解時間 <span id="understandTime">∞</span></span>
  </div>
  <div class="stats-row stats-extra">
    <span class="stat-item stat-small">⚠️ 閱讀本文可能導致：對學術界的信任崩塌、無法直視「100-1」、以及對磚頭產生不必要的同情</span>
  </div>
</div>
EOF

# 嵌入預渲染的內容
cat .tmp_rendered_content.html >> index.html

cat >> index.html << 'EOF'
    </article>
    </main>

    <script src="./script.js"></script>
</body>
</html>
EOF

# 清理暫存檔
rm -f .tmp_rendered_content.html

echo -e "${GREEN}✓ 編譯完成！${NC}"

# 顯示檔案大小
SIZE=$(du -h index.html | cut -f1)
LINES=$(wc -l < index.html)

echo ""
echo "================================"
echo -e "${GREEN}🎉 編譯成功！${NC}"
echo -e "   📄 輸出檔案: ${BLUE}index.html${NC}"
echo -e "   📦 檔案大小: ${BLUE}${SIZE}${NC}"
echo -e "   📝 總行數:   ${BLUE}${LINES}${NC}"
echo -e "   🕐 編譯時間: ${BLUE}${TIMESTAMP}${NC}"
if [ -f "$BACKUP_NAME" ]; then
    echo -e "   💾 舊版備份: ${BLUE}${BACKUP_NAME}${NC}"
fi
echo "================================"
echo -e "${YELLOW}提示: 編譯後的 HTML 是純靜態的，不需要 md-parser.js${NC}"
echo -e "${YELLOW}      部署時需要一起上傳: styles.css, script.js, favicon.png${NC}"
