// ============================================
// 配布用テンプレート - 設定不要で即使える
// ============================================

// スプレッドシートを開いた時に自動実行
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 初回セットアップチェック
  checkFirstRun();

  // メニュー追加
  ui.createMenu('📊 ツール')
    .addItem('🎯 メインパネルを開く', 'showMainPanel')
    .addItem('⚙️ 設定', 'showSettings')
    .addSeparator()
    .addItem('📖 使い方', 'showHelp')
    .addToUi();
}

// 初回起動時の自動セットアップ
function checkFirstRun() {
  const props = PropertiesService.getDocumentProperties();
  const isFirstRun = props.getProperty('initialized');

  if (!isFirstRun) {
    // 初期設定を自動実行
    initialSetup();
    props.setProperty('initialized', 'true');

    // ウェルカムメッセージ
    SpreadsheetApp.getUi().alert(
      '🎉 セットアップ完了！',
      'ツールの準備が整いました。\nメニューから「メインパネルを開く」をクリックしてください。',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// 初期設定（シート作成など）
function initialSetup() {
  const ss = SpreadsheetApp.getActive();

  // 必要なシートを自動作成
  const sheets = ['データ', '設定', 'ログ'];
  sheets.forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
    }
  });

  // デフォルト設定を書き込み
  const configSheet = ss.getSheetByName('設定');
  configSheet.getRange('A1:B3').setValues([
    ['項目', '値'],
    ['バージョン', '1.0.0'],
    ['作成日', new Date().toLocaleDateString('ja-JP')]
  ]);
}

// メインパネル表示
function showMainPanel() {
  const html = HtmlService.createHtmlOutputFromFile('MainPanel')
    .setTitle('メインパネル')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

// 設定画面表示
function showSettings() {
  const html = HtmlService.createHtmlOutputFromFile('Settings')
    .setTitle('設定')
    .setWidth(350);
  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ 設定');
}

// ヘルプ表示
function showHelp() {
  const helpText = `
📖 使い方ガイド

1. データシートに情報を入力
2. メニューから「メインパネル」を開く
3. 必要な処理を選択して実行

✨ 特徴：
• 設定不要で即使える
• 自動バックアップ機能
• データ分析機能

🔧 サポート：
support@example.com
  `;

  SpreadsheetApp.getUi().alert('使い方', helpText, SpreadsheetApp.getUi().ButtonSet.OK);
}

// === API関数（HTMLから呼ばれる）===

function processData(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('データ');
  const timestamp = new Date();

  // データ処理
  sheet.appendRow([timestamp, data.type, data.value, data.notes]);

  // ログ記録
  logActivity('データ処理', data);

  return {
    success: true,
    message: 'データを保存しました',
    timestamp: timestamp.toLocaleString('ja-JP')
  };
}

function getData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('データ');
  const data = sheet.getDataRange().getValues();

  return data.slice(1); // ヘッダーを除く
}

function logActivity(action, details) {
  const logSheet = SpreadsheetApp.getActive().getSheetByName('ログ');
  logSheet.appendRow([
    new Date(),
    Session.getActiveUser().getEmail(),
    action,
    JSON.stringify(details)
  ]);
}