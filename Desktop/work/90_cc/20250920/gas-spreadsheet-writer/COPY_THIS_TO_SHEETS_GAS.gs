// ============================================
// このコード全体をコピーしてスプレッドシートのGASエディタに貼り付け
// ============================================

// スプレッドシートを開いた時に自動実行
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // カスタムメニュー追加
  ui.createMenu('📊 タスク管理')
    .addItem('🎯 サイドバーを開く', 'showSidebar')
    .addItem('➕ クイックタスク追加', 'quickAddTask')
    .addSeparator()
    .addItem('📈 レポート生成', 'generateQuickReport')
    .addItem('🎲 サンプルデータ追加', 'addSampleFromMenu')
    .addToUi();
}

// サイドバーを表示（簡易版）
function showSidebar() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial; padding: 20px; }
      button {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover { background: #357ae8; }
      input, select {
        width: 100%;
        padding: 8px;
        margin: 5px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    </style>

    <h3>📊 タスク管理</h3>

    <label>タスク名:</label>
    <input type="text" id="task" placeholder="タスク名">

    <label>優先度:</label>
    <select id="priority">
      <option value="高">🔴 高</option>
      <option value="中">🟡 中</option>
      <option value="低">🟢 低</option>
    </select>

    <button onclick="addTask()">➕ タスク追加</button>
    <button onclick="showReport()">📈 レポート</button>

    <div id="result"></div>

    <script>
      function addTask() {
        const task = document.getElementById('task').value;
        const priority = document.getElementById('priority').value;

        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('result').innerHTML = '✅ 追加完了！';
            document.getElementById('task').value = '';
          })
          .addTaskFromSidebar(task, priority);
      }

      function showReport() {
        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('result').innerHTML = result;
          })
          .getSimpleReport();
      }
    </script>
  `)
  .setTitle('タスク管理')
  .setWidth(300);

  SpreadsheetApp.getUi().showSidebar(html);
}

// タスク追加（サイドバー用）
function addTaskFromSidebar(taskName, priority) {
  const sheet = SpreadsheetApp.getActiveSheet();

  // ヘッダーがなければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['タスク', '優先度', '作成日時']);
  }

  // データ追加
  sheet.appendRow([taskName, priority, new Date()]);
  return true;
}

// 簡易レポート
function getSimpleReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return 'データがありません';
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const high = data.filter(row => row[1] === '高').length;
  const mid = data.filter(row => row[1] === '中').length;
  const low = data.filter(row => row[1] === '低').length;

  return `📊 レポート<br>
    総タスク: ${data.length}<br>
    🔴 高: ${high}<br>
    🟡 中: ${mid}<br>
    🟢 低: ${low}`;
}

// クイックタスク追加（メニュー用）
function quickAddTask() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('タスク追加', 'タスク名を入力:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() === ui.Button.OK) {
    const sheet = SpreadsheetApp.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['タスク', '優先度', '作成日時']);
    }

    sheet.appendRow([response.getResponseText(), '中', new Date()]);
    ui.alert('✅ タスクを追加しました！');
  }
}

// レポート生成（メニュー用）
function generateQuickReport() {
  const report = getSimpleReport().replace(/<br>/g, '\n');
  SpreadsheetApp.getUi().alert('📊 レポート', report, SpreadsheetApp.getUi().ButtonSet.OK);
}

// サンプルデータ追加（メニュー用）
function addSampleFromMenu() {
  const sheet = SpreadsheetApp.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['タスク', '優先度', '作成日時']);
  }

  const samples = [
    ['ドキュメント作成', '高', new Date()],
    ['コードレビュー', '高', new Date()],
    ['テスト実行', '中', new Date()],
    ['会議準備', '低', new Date()],
    ['メール返信', '中', new Date()]
  ];

  samples.forEach(task => sheet.appendRow(task));

  SpreadsheetApp.getUi().alert('✅ サンプルデータを追加しました！');
}