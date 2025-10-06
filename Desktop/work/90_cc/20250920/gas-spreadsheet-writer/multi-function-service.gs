// ============================================
// 複数関数を組み合わせた「タスク管理＋自動分析」サービス
// ============================================

// 設定
const SPREADSHEET_ID = '1gYcsLpT0O2NIHg7wS3pg1csmXKyBRuxBYomVDfKg-tU'; // 後で作成するシートのID

// ============================================
// 基本関数群（再利用可能なテンプレート）
// ============================================

// 関数1: データ保存
function saveData(sheetName, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['ID', 'タスク', 'ステータス', '優先度', '作成日時', 'カテゴリ']);
  }

  const id = Utilities.getUuid();
  const timestamp = new Date();
  sheet.appendRow([id, data.task, data.status || '未着手', data.priority || '中', timestamp, data.category || '一般']);

  return { success: true, id: id, timestamp: timestamp };
}

// 関数2: データ取得
function getData(sheetName, filters = {}) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // フィルタリング処理
  let filtered = rows;
  if (filters.status) {
    filtered = filtered.filter(row => row[2] === filters.status);
  }
  if (filters.priority) {
    filtered = filtered.filter(row => row[3] === filters.priority);
  }

  return filtered.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

// 関数3: 統計分析
function analyzeData(data) {
  const stats = {
    total: data.length,
    byStatus: {},
    byPriority: {},
    byCategory: {}
  };

  data.forEach(item => {
    // ステータス別集計
    stats.byStatus[item['ステータス']] = (stats.byStatus[item['ステータス']] || 0) + 1;

    // 優先度別集計
    stats.byPriority[item['優先度']] = (stats.byPriority[item['優先度']] || 0) + 1;

    // カテゴリ別集計
    stats.byCategory[item['カテゴリ']] = (stats.byCategory[item['カテゴリ']] || 0) + 1;
  });

  return stats;
}

// 関数4: レポート生成
function generateReport(stats) {
  const report = {
    summary: `総タスク数: ${stats.total}`,
    details: [],
    recommendations: []
  };

  // ステータス分析
  report.details.push('【ステータス別】');
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const percentage = Math.round((count / stats.total) * 100);
    report.details.push(`${status}: ${count}件 (${percentage}%)`);
  });

  // 優先度分析
  report.details.push('【優先度別】');
  Object.entries(stats.byPriority).forEach(([priority, count]) => {
    report.details.push(`${priority}: ${count}件`);
  });

  // レコメンデーション
  if (stats.byStatus['未着手'] > stats.total * 0.5) {
    report.recommendations.push('⚠️ 未着手タスクが50%を超えています');
  }
  if (stats.byPriority['高'] > 5) {
    report.recommendations.push('🔥 高優先度タスクが5件以上あります');
  }

  return report;
}

// 関数5: 通知送信（シミュレーション）
function sendNotification(report, method = 'log') {
  const message = [
    '📊 タスク分析レポート',
    report.summary,
    ...report.details,
    '',
    '💡 提案:',
    ...report.recommendations
  ].join('\n');

  if (method === 'email') {
    // GmailApp.sendEmail(Session.getActiveUser().getEmail(), 'タスクレポート', message);
    return { sent: true, method: 'email', preview: message };
  }

  return { sent: true, method: 'log', message: message };
}

// ============================================
// メインAPI（複数関数の組み合わせ）
// ============================================

function doGet(e) {
  const action = e.parameter.action || 'help';

  try {
    switch(action) {
      case 'add':
        // タスク追加
        return handleAddTask(e);

      case 'report':
        // レポート生成（複数関数の組み合わせ）
        return handleGenerateReport(e);

      case 'quick':
        // クイック分析（全関数を連携）
        return handleQuickAnalysis(e);

      default:
        return ContentService.createTextOutput(JSON.stringify({
          available_actions: ['add', 'report', 'quick'],
          example_urls: [
            '?action=add&task=新しいタスク&priority=高&category=開発',
            '?action=report&filter=未着手',
            '?action=quick'
          ]
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// タスク追加処理
function handleAddTask(e) {
  const taskData = {
    task: e.parameter.task || 'タスク',
    status: e.parameter.status || '未着手',
    priority: e.parameter.priority || '中',
    category: e.parameter.category || '一般'
  };

  const result = saveData('tasks', taskData);

  return ContentService.createTextOutput(JSON.stringify({
    action: 'add',
    result: result,
    data: taskData
  })).setMimeType(ContentService.MimeType.JSON);
}

// レポート生成処理（複数関数連携）
function handleGenerateReport(e) {
  // 1. データ取得
  const filters = {};
  if (e.parameter.filter) {
    filters.status = e.parameter.filter;
  }
  const data = getData('tasks', filters);

  // 2. 分析
  const stats = analyzeData(data);

  // 3. レポート生成
  const report = generateReport(stats);

  // 4. 通知
  const notification = sendNotification(report);

  return ContentService.createTextOutput(JSON.stringify({
    action: 'report',
    stats: stats,
    report: report,
    notification: notification
  })).setMimeType(ContentService.MimeType.JSON);
}

// クイック分析（全機能統合）
function handleQuickAnalysis(e) {
  // サンプルデータ自動生成
  const sampleTasks = [
    { task: 'ドキュメント作成', priority: '高', category: '文書' },
    { task: 'コードレビュー', priority: '高', category: '開発' },
    { task: 'テスト実行', priority: '中', category: '開発' },
    { task: 'ミーティング準備', priority: '低', category: '会議' },
    { task: 'メール返信', priority: '中', category: '連絡' }
  ];

  // 1. データ追加
  const addResults = sampleTasks.map(task => saveData('tasks', task));

  // 2. 全データ取得
  const allData = getData('tasks');

  // 3. 分析実行
  const analysis = analyzeData(allData);

  // 4. レポート作成
  const fullReport = generateReport(analysis);

  // 5. 通知送信
  const alert = sendNotification(fullReport);

  return ContentService.createTextOutput(JSON.stringify({
    action: 'quick_analysis',
    sample_added: addResults.length,
    total_tasks: allData.length,
    analysis: analysis,
    report: fullReport,
    notification: alert,
    message: '✅ 全関数を組み合わせて実行完了！'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 初期化関数（最初に1回だけ実行）
// ============================================

function initialize() {
  // 新しいスプレッドシート作成
  const ss = SpreadsheetApp.create('タスク管理システム - ' + new Date().toLocaleString());
  const id = ss.getId();

  console.log('作成されたスプレッドシートID:', id);
  console.log('URL:', ss.getUrl());
  console.log('このIDをSPREADSHEET_ID定数に設定してください');

  return {
    id: id,
    url: ss.getUrl()
  };
}