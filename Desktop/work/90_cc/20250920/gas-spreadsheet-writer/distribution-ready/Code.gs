// ============================================
// 📊 売上管理ツール v1.0 - 設定不要ですぐ使える！
// ============================================

// スプレッドシートを開いた時に自動実行
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 初回セットアップ
  checkFirstTimeSetup();

  // カスタムメニュー追加
  ui.createMenu('🚀 売上管理ツール')
    .addItem('📊 ダッシュボードを開く', 'openDashboard')
    .addItem('➕ 売上を記録', 'recordSales')
    .addItem('📈 月次レポート生成', 'generateReport')
    .addSeparator()
    .addItem('⚙️ 設定', 'openSettings')
    .addItem('❓ 使い方', 'showHelp')
    .addToUi();
}

// 初回セットアップチェック
function checkFirstTimeSetup() {
  const props = PropertiesService.getDocumentProperties();
  const initialized = props.getProperty('initialized');

  if (!initialized) {
    // 初回セットアップ実行
    performInitialSetup();
    props.setProperty('initialized', 'true');
    props.setProperty('version', '1.0.0');
    props.setProperty('setupDate', new Date().toISOString());

    // ウェルカムメッセージ
    SpreadsheetApp.getUi().alert(
      '🎉 セットアップ完了！',
      '売上管理ツールの準備が整いました！\n\n' +
      '使い方：\n' +
      '1. メニューから「売上を記録」で日々の売上入力\n' +
      '2. 「ダッシュボード」で売上状況を確認\n' +
      '3. 「月次レポート」で詳細分析\n\n' +
      'まずは「売上を記録」から始めてみましょう！',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// 初期セットアップ
function performInitialSetup() {
  const ss = SpreadsheetApp.getActive();

  // 必要なシートを作成
  createSheet(ss, '売上データ', [
    ['日付', '商品カテゴリ', '商品名', '数量', '単価', '売上金額', '担当者', 'メモ']
  ]);

  createSheet(ss, 'ダッシュボード', [
    ['📊 売上ダッシュボード'],
    [''],
    ['今月の売上', '=SUMIF(売上データ!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),売上データ!F:F)'],
    ['今月の件数', '=COUNTIF(売上データ!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))'],
    ['平均単価', '=IFERROR(B3/B4,0)'],
    [''],
    ['カテゴリ別売上'],
    ['（データが入ると自動集計されます）']
  ]);

  createSheet(ss, '設定', [
    ['項目', '値'],
    ['会社名', 'サンプル株式会社'],
    ['部署名', '営業部'],
    ['通貨', '円'],
    ['消費税率', '10%'],
    ['レポート送信先', 'manager@example.com']
  ]);

  // サンプルデータを追加
  addSampleData();

  // フォーマット設定
  formatSheets(ss);
}

// シート作成ヘルパー
function createSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  }
  return sheet;
}

// サンプルデータ追加
function addSampleData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('売上データ');
  const today = new Date();

  const sampleData = [
    [new Date(today.getFullYear(), today.getMonth(), 1), '電子機器', 'ノートPC', 2, 150000, 300000, '田中太郎', '法人向け販売'],
    [new Date(today.getFullYear(), today.getMonth(), 5), '文具', 'ボールペンセット', 50, 500, 25000, '佐藤花子', ''],
    [new Date(today.getFullYear(), today.getMonth(), 10), '電子機器', 'タブレット', 3, 80000, 240000, '田中太郎', '教育機関向け']
  ];

  if (sheet.getLastRow() === 1) { // ヘッダーのみの場合
    sheet.getRange(2, 1, sampleData.length, 8).setValues(sampleData);
  }
}

// フォーマット設定
function formatSheets(ss) {
  // 売上データシートのフォーマット
  const dataSheet = ss.getSheetByName('売上データ');
  dataSheet.getRange('1:1').setBackground('#4285f4').setFontColor('#ffffff').setFontWeight('bold');
  dataSheet.setFrozenRows(1);

  // ダッシュボードのフォーマット
  const dashSheet = ss.getSheetByName('ダッシュボード');
  dashSheet.getRange('A1').setFontSize(20).setFontWeight('bold');
  dashSheet.getRange('A3:B5').setBorder(true, true, true, true, true, true);
  dashSheet.getRange('B3:B5').setNumberFormat('#,##0');
  dashSheet.setColumnWidth(1, 150);
  dashSheet.setColumnWidth(2, 200);
}

// ダッシュボードを開く
function openDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('売上ダッシュボード')
    .setWidth(500);
  SpreadsheetApp.getUi().showSidebar(html);
}

// 売上記録
function recordSales() {
  const html = HtmlService.createHtmlOutputFromFile('SalesForm')
    .setTitle('売上記録')
    .setWidth(400);
  SpreadsheetApp.getUi().showModalDialog(html, '➕ 売上を記録');
}

// レポート生成
function generateReport() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('売上データ');
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('データがありません', 'まず売上を記録してください。', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // 月次集計
  const thisMonth = new Date();
  thisMonth.setDate(1);
  let monthTotal = 0;
  let monthCount = 0;

  for (let i = 1; i < data.length; i++) {
    const date = new Date(data[i][0]);
    if (date >= thisMonth) {
      monthTotal += data[i][5];
      monthCount++;
    }
  }

  const monthNum = thisMonth.getMonth() + 1;
  const message = '📊 ' + monthNum + '月の売上レポート\n\n' +
    '売上合計: ' + monthTotal.toLocaleString() + '円\n' +
    '取引件数: ' + monthCount + '件\n' +
    '平均単価: ' + Math.round(monthTotal / monthCount).toLocaleString() + '円\n\n' +
    '詳細はダッシュボードシートをご確認ください。';

  SpreadsheetApp.getUi().alert('月次レポート', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ヘルプ表示
function showHelp() {
  const helpText = '📚 売上管理ツール - 使い方ガイド\n\n' +
    '【基本的な使い方】\n' +
    '1. 売上を記録: メニューから「売上を記録」を選択\n' +
    '2. データ確認: 「売上データ」シートで一覧確認\n' +
    '3. 分析: 「ダッシュボード」で集計結果を確認\n\n' +
    '【便利な機能】\n' +
    '• 自動集計: 売上データは自動的に集計されます\n' +
    '• 月次レポート: ワンクリックでレポート生成\n' +
    '• カテゴリ分析: 商品カテゴリ別の売上を自動分析\n\n' +
    'バージョン: 1.0.0';

  SpreadsheetApp.getUi().alert('使い方ガイド', helpText, SpreadsheetApp.getUi().ButtonSet.OK);
}

// === API関数（HTMLから呼ばれる）===

function saveSalesData(formData) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('売上データ');

  // 売上金額を計算
  const amount = formData.quantity * formData.unitPrice;

  // データを追加
  sheet.appendRow([
    new Date(formData.date),
    formData.category,
    formData.productName,
    formData.quantity,
    formData.unitPrice,
    amount,
    formData.person,
    formData.memo || ''
  ]);

  return {
    success: true,
    message: '売上を記録しました（' + amount.toLocaleString() + '円）'
  };
}

function getSalesData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('売上データ');
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // ヘッダーを除く
}