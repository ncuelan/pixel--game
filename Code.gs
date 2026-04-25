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
