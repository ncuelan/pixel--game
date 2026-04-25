# Pixel Arcade Quiz - 像素闖關問答遊戲

這是一個採用 React Vite 開發，並以 Google Apps Script 作為輕量後端的像素風格問答遊戲。

## 📦 1. 本地啟動與安裝

確保您已安裝 [Node.js](https://nodejs.org/en/)，接著打開終端機並在專案目錄下執行：

```bash
# 安裝依賴套件
npm install

# 啟動開發伺服器
npm run dev
```

接著即可在瀏覽器打開 `http://localhost:5173` 預覽畫面。一開始在還沒有串接好後端時，遊戲會使用預設的 Mock 資料進行。

---

## 📊 2. Google Sheets 配置

您需要建立一個 Google 試算表（Google Sheets）來儲存題庫與分數紀錄。

1. 建立一個新的 Google 試算表。
2. 建立兩個工作表，請務必命名為以下名稱並填入第一列標題欄位：
   - **工作表一：`題目`**
     - A1: `題號`
     - B1: `題目`
     - C1: `A` (選項A)
     - D1: `B` (選項B)
     - E1: `C` (選項C)
     - F1: `D` (選項D)
     - G1: `解答` (請填入正確選項的英文字母，如 A)
   - **工作表二：`回答`**
     - A1: `ID`
     - B1: `闖關次數`
     - C1: `總分`
     - D1: `最高分`
     - E1: `第一次通關分數`
     - F1: `花了幾次通關`
     - G1: `最近遊玩時間`

---

## ☁️ 3. Google Apps Script 部署

1. 在剛才的試算表上方選單點擊 **「擴充功能」** > **「Apps Script」**。
2. 將打開的編輯器預設程式碼全部刪除。
3. 把專案根目錄中的 `Code.gs` 檔案內容完整複製並貼到編輯器內。
4. 儲存檔案（可命名為 Pixel Backend 等）。
5. 點擊右上角的 **「部署」** > **「新增部署作業」**。
6. 將設定調整為：
   - 選取類型：**網頁應用程式**
   - 執行身分：**我 (您的 Google 帳號)**
   - 誰可以存取：**所有人**
7. 點擊「部署」。(首次啟用可能會跳出安全性授權，請點擊「進階」並允許存取該腳本)
8. 部署成功後將獲得一段 **「網頁應用程式網址 (URL)」**，請將它複製下來。

---

## ⚙️ 4. 環境變數設定

在遊戲專案根目錄下會有一個 `.env` 檔案，請將剛才的部署 URL 更新進去：

```env
# 填入剛才取得的 Google Apps Script URL
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/您的ID/exec

# 設定幾分算過關
VITE_PASS_THRESHOLD=3

# 設定每次要抽出幾題
VITE_QUESTION_COUNT=5
```

存檔，重啟 `npm run dev` 即可完整連線您的資料庫！

---

## 🚀 5. 自動部署到 GitHub Pages

專案已配置好 `.github/workflows/deploy.yml`。推送到 `main` 分支便會自動執行部署。

### 部署前設定：
1. 進入 GitHub 專案的 **Settings** > **Pages**，將 **Build and deployment** 下的 **Source** 改為 **GitHub Actions**。
2. 進入 **Settings** > **Secrets and variables** > **Actions**：
   - 點選 **Secrets** 標籤頁：新增 `VITE_GOOGLE_APP_SCRIPT_URL`，填入您的 GAS URL。
   - 點選 **Variables** 標籤頁：新增 `VITE_PASS_THRESHOLD` 及 `VITE_QUESTION_COUNT`（可參考 `.env.example` 填寫預設值）。

設定完成後，每次推送程式碼至 `main` 分支，即會自動打包發佈至您的 GitHub Pages！
