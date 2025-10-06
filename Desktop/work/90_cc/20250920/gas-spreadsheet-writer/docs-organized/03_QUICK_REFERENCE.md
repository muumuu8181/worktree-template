# GAS クイックリファレンス
## コピペで使える実用コード集

---

## 🚀 最速スタート（3分で動かす）

### 1. 最小構成でE5セルに書き込み
```javascript
// これだけでOK！
function writeToE5() {
  SpreadsheetApp.getActiveSheet()
    .getRange('E5')
    .setValue('Hello GAS!');
}
```

### 2. CLASPコマンド（Windows用）
```bash
# インストール
npm install -g @google/clasp

# プロジェクト作成
npx @google/clasp create --title "My Project"

# コードアップロード
npx @google/clasp push -f

# デプロイ
npx @google/clasp deploy --description "v1"

# ブラウザで開く
npx @google/clasp open
```

---

## 📝 よく使うコード片（コピペ用）

### スプレッドシート操作
```javascript
// 新規スプレッドシート作成
const ss = SpreadsheetApp.create('新規シート');

// 既存スプレッドシート開く
const ss = SpreadsheetApp.openById('SPREADSHEET_ID');

// アクティブシート取得
const sheet = SpreadsheetApp.getActiveSheet();

// シート名で取得
const sheet = ss.getSheetByName('データ');

// セル値取得
const value = sheet.getRange('A1').getValue();

// セル値設定
sheet.getRange('A1').setValue('Hello');

// 範囲取得（A1:C10）
const values = sheet.getRange(1, 1, 10, 3).getValues();

// 範囲設定
const data = [[1,2,3],[4,5,6]];
sheet.getRange(1, 1, 2, 3).setValues(data);

// 最終行取得
const lastRow = sheet.getLastRow();

// 最終列取得
const lastCol = sheet.getLastColumn();

// 行追加
sheet.appendRow(['A', 'B', 'C']);

// 列追加
sheet.insertColumnAfter(1);

// クリア
sheet.clear();
```

### メニュー・UI
```javascript
// カスタムメニュー
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('カスタム')
    .addItem('実行', 'myFunction')
    .addToUi();
}

// アラート表示
SpreadsheetApp.getUi().alert('完了しました');

// 確認ダイアログ
const ui = SpreadsheetApp.getUi();
const response = ui.alert('続行しますか？', ui.ButtonSet.YES_NO);
if (response == ui.Button.YES) {
  // 処理
}

// 入力ダイアログ
const result = ui.prompt('名前を入力');
const name = result.getResponseText();
```

### 日付・時刻
```javascript
// 現在日時
const now = new Date();

// 日付フォーマット
const formatted = Utilities.formatDate(
  now,
  'Asia/Tokyo',
  'yyyy-MM-dd HH:mm:ss'
);

// 1日後
const tomorrow = new Date(now.getTime() + 24*60*60*1000);

// 月初
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

// 月末
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
```

### メール送信
```javascript
// シンプルなメール
GmailApp.sendEmail(
  'recipient@example.com',
  '件名',
  '本文'
);

// HTML メール
GmailApp.sendEmail({
  to: 'recipient@example.com',
  subject: '件名',
  htmlBody: '<h1>Hello</h1><p>本文</p>',
  cc: 'cc@example.com',
  bcc: 'bcc@example.com',
  attachments: [file]
});
```

### ファイル操作
```javascript
// フォルダ作成
const folder = DriveApp.createFolder('新規フォルダ');

// ファイル作成
const file = DriveApp.createFile('test.txt', 'content');

// ファイル取得
const file = DriveApp.getFileById('FILE_ID');

// ファイル検索
const files = DriveApp.searchFiles('title contains "test"');
while (files.hasNext()) {
  const file = files.next();
  console.log(file.getName());
}

// PDF出力
const blob = SpreadsheetApp.getActive().getAs('application/pdf');
DriveApp.createFile(blob);
```

---

## 🎯 実用テンプレート

### 1. 在庫管理システム（5分で作成）
```javascript
function 在庫管理システム() {
  const sheet = SpreadsheetApp.getActiveSheet();

  // ヘッダー設定
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['商品名', '在庫数', '最小在庫', '発注要否', '更新日時']);
    sheet.getRange('1:1').setBackground('#4285f4').setFontColor('white');
  }

  // 在庫チェック
  const lastRow = sheet.getLastRow();
  for (let i = 2; i <= lastRow; i++) {
    const stock = sheet.getRange(i, 2).getValue();
    const min = sheet.getRange(i, 3).getValue();

    // 発注判定
    if (stock < min) {
      sheet.getRange(i, 4).setValue('要発注').setBackground('#ff9999');
    } else {
      sheet.getRange(i, 4).setValue('OK').setBackground('#99ff99');
    }

    // 更新日時
    sheet.getRange(i, 5).setValue(new Date());
  }
}
```

### 2. 日報自動生成（3分で作成）
```javascript
function 日報生成() {
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const ss = SpreadsheetApp.getActive();

  // 日報シート作成
  let sheet = ss.getSheetByName(today);
  if (!sheet) {
    sheet = ss.insertSheet(today);
  }

  // テンプレート作成
  const template = [
    [`日報 - ${today}`],
    [''],
    ['【売上】'],
    ['売上金額:', '=SUM(D4:D100)'],
    ['客数:', '=COUNTA(D4:D100)'],
    ['客単価:', '=D4/D5'],
    [''],
    ['【業務内容】'],
    ['時間', '内容', '担当', '金額']
  ];

  sheet.getRange(1, 1, template.length, 4).setValues(template);

  // 書式設定
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  sheet.getRange('A3').setBackground('#e3f2fd');
  sheet.getRange('A8').setBackground('#e3f2fd');

  return sheet.getUrl();
}
```

### 3. 自動メール配信（5分で作成）
```javascript
function 自動メール配信() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // ヘッダー行をスキップ
  for (let i = 1; i < data.length; i++) {
    const email = data[i][0];  // A列: メールアドレス
    const name = data[i][1];   // B列: 名前
    const status = data[i][2]; // C列: 送信ステータス

    // 未送信の場合のみ送信
    if (status !== '送信済') {
      const subject = `${name}様へのお知らせ`;
      const body = `
${name}様

いつもお世話になっております。
本日のご案内をお送りいたします。

よろしくお願いいたします。
      `;

      GmailApp.sendEmail(email, subject, body);

      // ステータス更新
      sheet.getRange(i + 1, 3).setValue('送信済');
      sheet.getRange(i + 1, 4).setValue(new Date());
    }
  }
}
```

---

## ⚡ トリガー設定

### 定期実行
```javascript
// 毎日9時に実行
ScriptApp.newTrigger('myFunction')
  .timeBased()
  .atHour(9)
  .everyDays(1)
  .create();

// 毎時実行
ScriptApp.newTrigger('myFunction')
  .timeBased()
  .everyHours(1)
  .create();

// 毎分実行
ScriptApp.newTrigger('myFunction')
  .timeBased()
  .everyMinutes(1)
  .create();
```

### イベントトリガー
```javascript
// 編集時
ScriptApp.newTrigger('onEdit')
  .forSpreadsheet(SpreadsheetApp.getActive())
  .onEdit()
  .create();

// フォーム送信時
ScriptApp.newTrigger('onFormSubmit')
  .forSpreadsheet(SpreadsheetApp.getActive())
  .onFormSubmit()
  .create();
```

---

## 🔧 デバッグ・エラー処理

### ログ出力
```javascript
// コンソールログ（エディタで確認）
console.log('デバッグ情報:', data);

// ログビューアで確認
Logger.log('詳細情報:', data);

// スプレッドシートに出力
function debugLog(message) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('ログ') ||
                SpreadsheetApp.getActive().insertSheet('ログ');
  sheet.appendRow([new Date(), message]);
}
```

### エラー処理
```javascript
function safeExecute() {
  try {
    // メイン処理
    riskyFunction();
  } catch (error) {
    console.error('エラー発生:', error);

    // エラー通知
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      'GASエラー通知',
      `エラーが発生しました: ${error.message}\n\n${error.stack}`
    );

    // エラーを再throw
    throw error;
  } finally {
    // クリーンアップ処理
    cleanup();
  }
}
```

---

## 📊 パフォーマンス改善

### ❌ 遅いコード
```javascript
// 1000セルを1つずつ処理（約10秒）
for (let i = 1; i <= 1000; i++) {
  sheet.getRange(i, 1).setValue(i);
}
```

### ✅ 速いコード
```javascript
// 1000セルを一括処理（約0.5秒）
const values = [];
for (let i = 1; i <= 1000; i++) {
  values.push([i]);
}
sheet.getRange(1, 1, 1000, 1).setValues(values);
```

---

## 🎁 便利な小技

### プロパティ保存
```javascript
// 保存
PropertiesService.getUserProperties()
  .setProperty('key', 'value');

// 取得
const value = PropertiesService.getUserProperties()
  .getProperty('key');
```

### キャッシュ利用
```javascript
// 10分間キャッシュ
const cache = CacheService.getScriptCache();
cache.put('key', JSON.stringify(data), 600);

// 取得
const cached = cache.get('key');
if (cached) {
  const data = JSON.parse(cached);
}
```

### URL パラメータ取得
```javascript
function doGet(e) {
  const name = e.parameter.name;
  const id = e.parameter.id;

  return ContentService
    .createTextOutput(`Hello ${name}, ID: ${id}`)
    .setMimeType(ContentService.MimeType.TEXT);
}
// URL: ?name=John&id=123
```

---

## 🚨 制限事項早見表

| 項目 | 制限値 | 対策 |
|------|--------|------|
| 実行時間 | 6分/回 | バッチ分割 |
| トリガー実行時間 | 30分/回 | - |
| メール送信 | 100通/日 | 分散送信 |
| URL Fetch | 20,000回/日 | キャッシュ |
| ファイルサイズ | 50MB | 分割保存 |
| 同時実行 | 30 | キューイング |

---

## 📚 公式リンク集

- [GAS公式](https://developers.google.com/apps-script)
- [CLASP](https://github.com/google/clasp)
- [Spreadsheet API](https://developers.google.com/apps-script/reference/spreadsheet)
- [サンプル集](https://developers.google.com/apps-script/samples)

---

**💡 このガイドはコピペですぐ使えることを重視しています**
**🚀 まずは動かしてみて、必要に応じて改造してください**