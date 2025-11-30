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
    
    <!-- Open Graph -->
    <meta property="og:title" content="飛機磚頭問題之跨領域研究">
    <meta property="og:description" content="一篇用50個學科分析「100-1=?」的學術論文。從量子力學到倫理學，認真探討一個不需要探討的問題。">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="zh_TW">
    <meta property="og:image" content="https://brick.n1cat.xyz/OG/og-image.png">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="飛機磚頭問題之跨領域研究">
    <meta name="twitter:description" content="一篇用50個學科分析「100-1=?」的學術論文。">
    <meta name="twitter:image" content="https://brick.n1cat.xyz/OG/og-image.png">
    
    <meta name="description" content="一篇用50個學科分析「飛機上100個磚頭掉了一個剩幾個」的學術論文。">
    
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    <button class="theme-toggle" id="themeToggle" aria-label="切換主題">🌙</button>
    
    <div class="brick-counter" id="brickCounter">
        <span class="count" id="brickCount">100</span>
        <span class="label">磚頭剩餘數量</span>
    </div>

    <button class="back-to-top" id="backToTop" aria-label="回到頂部">↑</button>

    <div class="paper" id="content">
EOF

# 嵌入預渲染的內容
cat .tmp_rendered_content.html >> index.html

cat >> index.html << 'EOF'
    </div>

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
