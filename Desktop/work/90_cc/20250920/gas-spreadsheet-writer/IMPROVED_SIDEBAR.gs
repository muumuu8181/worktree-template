// 改良版：メッセージが5秒後に消える

function showSidebarImproved() {
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
      .result {
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        animation: fadeIn 0.3s;
      }
      .success {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
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
      let messageTimer;

      function showMessage(text, duration = 5000) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<div class="result success">' + text + '</div>';

        // 既存のタイマーをクリア
        if (messageTimer) clearTimeout(messageTimer);

        // 5秒後に消す
        messageTimer = setTimeout(() => {
          resultDiv.style.animation = 'fadeOut 0.5s';
          setTimeout(() => {
            resultDiv.innerHTML = '';
            resultDiv.style.animation = '';
          }, 500);
        }, duration);
      }

      function addTask() {
        const task = document.getElementById('task').value;
        const priority = document.getElementById('priority').value;

        if (!task) {
          showMessage('⚠️ タスク名を入力してください', 3000);
          return;
        }

        google.script.run
          .withSuccessHandler(function(result) {
            showMessage('✅ タスク「' + task + '」を追加しました！');
            document.getElementById('task').value = '';
          })
          .withFailureHandler(function(error) {
            showMessage('❌ エラー: ' + error, 5000);
          })
          .addTaskFromSidebar(task, priority);
      }

      function showReport() {
        google.script.run
          .withSuccessHandler(function(result) {
            showMessage(result, 10000); // レポートは10秒表示
          })
          .getSimpleReport();
      }
    </script>
  `)
  .setTitle('タスク管理')
  .setWidth(300);  // 最大300px

  SpreadsheetApp.getUi().showSidebar(html);
}