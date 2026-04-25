// Google Apps Script - 像素遊戲後端

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId(); // 綁定本試算表

// GET /?action=getQuestions&count=5 -> 回傳隨機題目
function doGet(e) {
  // 防止從編輯器手動點擊「執行」時，因沒有 HTTP Request 而報錯
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("這是供前端呼叫的 API 端點，請勿在編輯器內直接執行。正常部署並供網頁呼叫即可運作。").setMimeType(ContentService.MimeType.TEXT);
  }

  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    const count = parseInt(e.parameter.count, 10) || 5;
    return getQuestions(count);
  }
  
  return ContentService.createTextOutput("Pixel Game GAS is running.").setMimeType(ContentService.MimeType.TEXT);
}

// POST 提交玩家分數
function doPost(e) {
  // 防止從編輯器手動點擊「執行」時報錯
  if (!e || !e.postData) {
     return ContentService.createTextOutput(JSON.stringify({ error: "請透過 POST 呼叫此端點，不要在編輯器內執行。" })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 解決 CORS Preflight 問題：前端可能會以 text/plain 的方式發送 JSON 字串過來
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'submitScore') {
      const result = submitScore(data.id, data.score, data.isPassed);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getQuestions(count) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('題目');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "無「題目」工作表" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 題號(A), 題目(B), A(C), B(D), C(E), D(F), 解答(G)
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ error: "題庫無資料" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = data[0]; 
  const rows = data.slice(1);
  
  // 打亂並取 count 題
  const shuffled = rows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  const questions = selected.map(row => {
    return {
      id: row[0],
      question: row[1],
      options: [
        { label: 'A', text: row[2] },
        { label: 'B', text: row[3] },
        { label: 'C', text: row[4] },
        { label: 'D', text: row[5] }
      ],
      answer: row[6] // 前端協助驗證答案
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify({ questions: questions })).setMimeType(ContentService.MimeType.JSON);
}

function submitScore(userId, score, isPassed) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('回答');
  if (!sheet) {
    return { error: "無「回答」工作表" };
  }
  
  const currentTimestamp = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  
  const data = sheet.getDataRange().getValues();
  
  let userRowIndex = -1;
  let userData = null;
  
  // 找是否已有資料 (假設 data[0] 是標題)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(userId).trim()) {
      userRowIndex = i + 1; // Google Sheet starts at 1
      userData = data[i];
      break;
    }
  }
  
  if (userRowIndex !== -1) {
    // === 更新舊玩家 ===
    let tries = (parseInt(userData[1]) || 0) + 1;
    let totalScore = (parseInt(userData[2]) || 0) + score;
    let highestScore = Math.max((parseInt(userData[3]) || 0), score);
    
    let firstPassScore = userData[4] || "";
    let triesToPass = userData[5] || "";
    
    // 如果之前還沒通關過，但這次過關了
    if (isPassed && firstPassScore === "") {
      firstPassScore = score;
      triesToPass = tries;
    }
    
    sheet.getRange(userRowIndex, 2).setValue(tries);
    sheet.getRange(userRowIndex, 3).setValue(totalScore);
    sheet.getRange(userRowIndex, 4).setValue(highestScore);
    sheet.getRange(userRowIndex, 5).setValue(firstPassScore);
    sheet.getRange(userRowIndex, 6).setValue(triesToPass);
    sheet.getRange(userRowIndex, 7).setValue(currentTimestamp);
    
    return { success: true, isNewUser: false };
    
  } else {
    // === 新玩家 ===
    let tries = 1;
    let totalScore = score;
    let highestScore = score;
    let firstPassScore = isPassed ? score : "";
    let triesToPass = isPassed ? 1 : "";
    
    // 依序: ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間
    sheet.appendRow([userId, tries, totalScore, highestScore, firstPassScore, triesToPass, currentTimestamp]);
    
    return { success: true, isNewUser: true };
  }
}
