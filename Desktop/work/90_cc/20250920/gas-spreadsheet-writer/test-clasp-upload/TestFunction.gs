// ============================================
// CLASPアップロードテスト用ファイル
// ============================================

/**
 * テスト関数 - CLASPからアップロードされたことを確認
 */
function testClaspUpload() {
  const sheet = SpreadsheetApp.getActiveSheet();

  // 現在時刻を記録
  const now = new Date().toLocaleString('ja-JP');

  // メッセージをA1に書き込み
  sheet.getRange('A1').setValue('🎉 CLASPからのアップロード成功！');
  sheet.getRange('A2').setValue('アップロード時刻: ' + now);
  sheet.getRange('A3').setValue('これはCLASPでpushされたコードです');

  // 背景色を設定
  sheet.getRange('A1:A3').setBackground('#e8f5e9');

  // ログ出力
  console.log('✅ testClaspUpload実行完了: ' + now);

  // UIに通知
  SpreadsheetApp.getUi().alert(
    '✅ CLASP Upload Test',
    'CLASPからのアップロードが成功しました！\n' +
    '時刻: ' + now,
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return {
    success: true,
    timestamp: now,
    message: 'CLASP upload verified'
  };
}

/**
 * メニューにテスト項目を追加
 */
function addTestMenu() {
  const ui = SpreadsheetApp.getUi();

  // 既存のメニューに追加
  ui.createMenu('🧪 CLASPテスト')
    .addItem('📝 アップロードテスト実行', 'testClaspUpload')
    .addItem('🔍 バージョン確認', 'showVersion')
    .addSeparator()
    .addItem('🚀 全機能テスト', 'runAllTests')
    .addToUi();
}

/**
 * バージョン情報を表示
 */
function showVersion() {
  const version = 'v1.0.0 - CLASP Upload Test';
  const deployTime = new Date().toLocaleString('ja-JP');

  SpreadsheetApp.getUi().alert(
    '📦 Version Info',
    'Version: ' + version + '\n' +
    'Deploy: ' + deployTime + '\n' +
    'Method: CLASP push',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 全テスト実行
 */
function runAllTests() {
  const results = [];

  // テスト1: 書き込みテスト
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.getRange('B1').setValue('Test 1: Write ✅');
    results.push('書き込みテスト: OK');
  } catch (e) {
    results.push('書き込みテスト: NG - ' + e.toString());
  }

  // テスト2: 読み込みテスト
  try {
    const value = SpreadsheetApp.getActiveSheet().getRange('A1').getValue();
    results.push('読み込みテスト: OK - ' + value);
  } catch (e) {
    results.push('読み込みテスト: NG - ' + e.toString());
  }

  // テスト3: UI表示テスト
  try {
    SpreadsheetApp.getUi().alert('テスト完了', results.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
    results.push('UI表示テスト: OK');
  } catch (e) {
    results.push('UI表示テスト: NG - ' + e.toString());
  }

  console.log('All tests completed:', results);
  return results;
}