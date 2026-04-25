# Pixel Quiz Quest - 像素風闖關問答遊戲

這是一個基於 React Vite 構建的像素街機風格闖關問答遊戲。前端呈現復古的 2000 年代設計（帶有 CRT 螢幕掃描線效果與像素字體），並結合 DiceBear API 生成多變的像素風關主。後端資料來源則是透過 Google Apps Script 連接 Google Sheets，實現輕量化的雲端題庫與成績記錄。

## 🚀 快速開始 (安裝與執行)

1. **安裝依賴套件**
   在專案根目錄下開啟終端機，執行以下指令：
   ```bash
   npm install
   ```

2. **設定環境變數**
   複製 `.env.example` 並重新命名為 `.env`：
   ```bash
   cp .env.example .env
   ```
   根據您的需求修改 `.env` 內的參數（特別是 `VITE_GOOGLE_APP_SCRIPT_URL`）。

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   瀏覽器將開啟 `http://localhost:5173/`，即可開始遊戲！

---

## 📊 Google Sheets 題庫與記錄表設定

請建立一個新的 Google Sheets，並在下方建立兩個工作表 (Sheet)：

### 1. 工作表命名為：「題目」
設定第一列為標題，包含以下欄位（請完全一致）：
- **A欄**: 題號
- **B欄**: 題目
- **C欄**: A
- **D欄**: B
- **E欄**: C
- **F欄**: D
- **G欄**: 解答

### 2. 工作表命名為：「回答」
設定第一列為標題，包含以下欄位：
- **A欄**: ID
- **B欄**: 闖關次數
- **C欄**: 總分
- **D欄**: 最高分
- **E欄**: 第一次通關分數
- **F欄**: 花了幾次通關
- **G欄**: 最近遊玩時間

---

## ⚙️ Google Apps Script (GAS) 設定

這份專案依賴 GAS 作為 API 伺服器，將前端請求橋接至 Google Sheets。

1. 在剛剛建立的 Google Sheets 中，點選選單上的 **「擴充功能」 > 「Apps Script」**。
2. 將編輯器內原本的程式碼清空，並貼上以下範例程式碼：

```javascript
const SHEET_ID = '貼上您的_Google_Sheets_ID'; // 請替換成您的 Sheets ID

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    const count = parseInt(e.parameter.count || '5', 10);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('題目');
    const data = sheet.getDataRange().getValues();
    
    // 移除標題列
    const headers = data.shift();
    
    // 隨機打亂題目
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    const questions = selected.map(row => ({
      id: row[0].toString(),
      question: row[1],
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5],
    }));
    
    return ContentService.createTextOutput(JSON.stringify(questions))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  
  if (postData.action === 'submit') {
    const userId = postData.id;
    const answers = postData.answers; // { "1": "A", "2": "C" ... }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const qSheet = ss.getSheetByName('題目');
    const ansSheet = ss.getSheetByName('回答');
    
    const qData = qSheet.getDataRange().getValues();
    qData.shift(); // 移除標題
    
    // 計算分數 (假設每題 100/總題數 分)
    let correctCount = 0;
    const totalQuestions = Object.keys(answers).length;
    const scorePerQuestion = 100 / totalQuestions;
    
    for (const qId in answers) {
      const qRow = qData.find(r => r[0].toString() === qId);
      if (qRow && qRow[6] === answers[qId]) {
        correctCount++;
      }
    }
    
    const finalScore = Math.round(correctCount * scorePerQuestion);
    
    const isPass = correctCount >= 3; // 假設門檻為答對 3 題
    
    // 寫入「回答」工作表
    const ansData = ansSheet.getDataRange().getValues();
    let userRowIndex = -1;
    for (let i = 1; i < ansData.length; i++) {
      if (ansData[i][0].toString() === userId.toString()) {
        userRowIndex = i + 1; // Google Sheets 是從 1 開始算
        break;
      }
    }
    
    const now = new Date();
    
    if (userRowIndex !== -1) {
      // 舊玩家更新
      const rowData = ansData[userRowIndex - 1];
      const currentTimes = parseInt(rowData[1] || 0) + 1;
      const highestScore = Math.max(parseInt(rowData[3] || 0), finalScore);
      let firstPassScore = rowData[4];
      let passTries = rowData[5];
      
      // 如果之前沒通關過，但這次通關了，就記錄下來
      if (isPass && !firstPassScore && firstPassScore !== 0) {
        firstPassScore = finalScore;
        passTries = currentTimes;
      }
      
      // 更新資料：闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間
      ansSheet.getRange(userRowIndex, 2, 1, 6).setValues([[
        currentTimes, finalScore, highestScore, firstPassScore, passTries, now
      ]]);
    } else {
      // 新玩家新增
      ansSheet.appendRow([
        userId, 
        1, 
        finalScore, 
        finalScore, 
        isPass ? finalScore : "", 
        isPass ? 1 : "", 
        now
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      score: finalScore,
      isPass: isPass,
      correctCount: correctCount
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 點選右上角的 **「部署」 > 「新增部署」**。
4. 選擇類型為 **「網頁應用程式 (Web App)」**。
5. **執行身分** 選擇「我」。
6. **誰可以存取** 選擇「所有人 (Anyone)」。
7. 點擊 **「部署」**，並授權存取權限。
8. 複製最後產生出來的 **「網頁應用程式網址」**。
9. 將該網址貼到專案中的 `.env` 檔案的 `VITE_GOOGLE_APP_SCRIPT_URL` 中。

## 🎮 環境變數設定說明

| 變數名稱 | 說明 |
| --- | --- |
| `VITE_GOOGLE_APP_SCRIPT_URL` | 部署後的 Google Apps Script 網址 |
| `VITE_PASS_THRESHOLD` | 通關需要答對的題數門檻（例如：`3` 代表需答對 3 題才算通關） |
| `VITE_QUESTION_COUNT` | 每次遊玩從題庫中隨機抽取的題數 |

---
*Developed with React Vite & DiceBear API*

## 🌐 自動部署至 GitHub Pages

本專案已內建 GitHub Actions 工作流程 (`.github/workflows/deploy.yml`)，只要將程式碼推送到 GitHub 上，就可以自動部署到 GitHub Pages 讓所有人遊玩！

### 步驟說明：

1. **上傳至 GitHub Repository**
   請確保您的專案已經推送到 GitHub 上的儲存庫 (Repository)。

2. **設定 Secrets (機密環境變數)**
   因為您的 Google Apps Script 網址屬於比較私密的連線資訊，所以我們將它設為 Secret。
   - 進入您的 GitHub 專案頁面。
   - 點選 **Settings** > **Secrets and variables** > **Actions**。
   - 點擊 **New repository secret**。
   - **Name**: 輸入 `VITE_GOOGLE_APP_SCRIPT_URL`
   - **Secret**: 貼上您的 GAS 網頁應用程式網址。
   - 點擊 **Add secret**。

3. **設定 Variables (一般環境變數)**
   通關門檻與題目數量是可以公開的設定，我們將它設為 Variables。
   - 停留在剛剛的頁面，切換到 **Variables** 頁籤。
   - 點擊 **New repository variable**。
   - 分別新增：
     - Name: `VITE_PASS_THRESHOLD` / Value: `3`
     - Name: `VITE_QUESTION_COUNT` / Value: `5`

4. **開啟 GitHub Pages 功能**
   - 點選專案的 **Settings** > **Pages**。
   - 在 **Build and deployment** 區塊，將 **Source** 更改為 **GitHub Actions**。

5. **觸發部署**
   完成上述設定後，只要您推送到 `main` 或 `master` 分支，GitHub Actions 就會自動開始進行建置並發布到 GitHub Pages！您也可以到專案的 **Actions** 頁籤手動觸發流程。
