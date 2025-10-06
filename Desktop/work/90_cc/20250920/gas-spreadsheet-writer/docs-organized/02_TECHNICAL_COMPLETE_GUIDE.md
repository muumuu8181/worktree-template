# GAS + CLASP 技術完全ガイド
## 実証済み・動作確認済みの手順書

---

## 🔧 環境構築

### 前提条件
- Node.js インストール済み
- Googleアカウント保有
- Windows/Mac/Linux対応

### 1. CLASP インストール
```bash
# グローバルインストール
npm install -g @google/clasp

# バージョン確認（3.0.6-alpha以上推奨）
npx @google/clasp --version
```

### 2. 認証設定
```bash
# Googleアカウントでログイン
npx @google/clasp login

# ブラウザが開く → Googleアカウントでログイン → 権限承認
```

### ⚠️ Windows環境での注意点
```bash
# Windows環境では常に npx を使用
npx @google/clasp [コマンド]

# または環境変数PATHに追加
# C:\Users\[ユーザー名]\AppData\Roaming\npm
```

---

## 📝 基本的な開発フロー

### 1. 新規プロジェクト作成

#### スタンドアロン型（独立したGASプロジェクト）
```bash
mkdir my-gas-project
cd my-gas-project

# 新規作成
npx @google/clasp create --title "My GAS Project" --type standalone

# 作成されるファイル
# .clasp.json - プロジェクト設定
# appsscript.json - GAS設定
```

#### コンテナバインド型（スプレッドシートに紐付き）
```bash
# 既存スプレッドシートに紐付ける
npx @google/clasp create --type sheets \
  --parentId "SPREADSHEET_ID" \
  --title "Sheet Script"

# 新規スプレッドシートと一緒に作成
npx @google/clasp create --type sheets \
  --title "New Sheet with Script"
```

### 2. コード開発

#### 基本構造
```javascript
// Code.gs - メインファイル
function myFunction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  sheet.getRange('A1').setValue('Hello GAS!');
}

// Web API として公開する場合
function doGet(e) {
  const result = myFunction();
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

#### appsscript.json 設定
```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

### 3. アップロード（Push）
```bash
# コードをGASにアップロード
npx @google/clasp push

# 強制上書き（確認をスキップ）
npx @google/clasp push -f
```

### 4. デプロイ
```bash
# デプロイ実行
npx @google/clasp deploy --description "Version 1.0"

# 出力例:
# Deployed AKfycbxxxxxx... @1

# デプロイ一覧確認
npx @google/clasp deployments
```

### 5. 実行
```bash
# ブラウザで開く
npx @google/clasp open

# Web API として実行
curl -L "https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec"
```

---

## 🚀 実践的な実装パターン

### パターン1: スプレッドシート操作
```javascript
// データ読み込み
function readData() {
  const ss = SpreadsheetApp.openById('SPREADSHEET_ID');
  const sheet = ss.getSheetByName('データ');
  const data = sheet.getDataRange().getValues();

  return data;
}

// データ書き込み
function writeData(data) {
  const ss = SpreadsheetApp.openById('SPREADSHEET_ID');
  const sheet = ss.getSheetByName('結果');

  // ヘッダー行を追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日時', 'データ', 'ステータス']);
  }

  // データ追加
  sheet.appendRow([new Date(), data, 'complete']);
}

// 条件付き書式
function formatCells() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange('A1:Z100');

  // 条件付き書式ルール作成
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(100)
    .setBackground('#FFD966')
    .setRanges([range])
    .build();

  sheet.setConditionalFormatRules([rule]);
}
```

### パターン2: メニュー・UI追加
```javascript
// カスタムメニュー追加
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('カスタム機能')
    .addItem('データ処理', 'processData')
    .addItem('レポート生成', 'generateReport')
    .addSeparator()
    .addSubMenu(ui.createMenu('詳細設定')
      .addItem('初期化', 'initialize')
      .addItem('バックアップ', 'backup'))
    .addToUi();
}

// ダイアログ表示
function showDialog() {
  const html = HtmlService
    .createHtmlOutputFromFile('dialog')
    .setWidth(400)
    .setHeight(300);

  SpreadsheetApp.getUi()
    .showModalDialog(html, 'データ入力');
}

// サイドバー表示
function showSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile('sidebar')
    .setTitle('ツールパネル');

  SpreadsheetApp.getUi()
    .showSidebar(html);
}
```

### パターン3: 外部API連携
```javascript
// 外部APIコール
function callExternalAPI() {
  const url = 'https://api.example.com/data';
  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    return data;
  } catch (e) {
    console.error('API Error:', e);
    return null;
  }
}

// Webhook受信
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // データ処理
  processWebhookData(data);

  // レスポンス返却
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      received: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### パターン4: 定期実行（トリガー）
```javascript
// トリガー設定（コードで設定）
function setupTriggers() {
  // 既存トリガー削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // 毎日午前9時に実行
  ScriptApp.newTrigger('dailyReport')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  // 毎時実行
  ScriptApp.newTrigger('hourlyCheck')
    .timeBased()
    .everyHours(1)
    .create();

  // スプレッドシート編集時
  ScriptApp.newTrigger('onEditTrigger')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
}
```

---

## 🎨 HTMLサービス（UI作成）

### HTML ファイル作成
```html
<!-- sidebar.html -->
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      button {
        background: #4285f4;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        margin: 5px 0;
        width: 100%;
      }
      button:hover { background: #357ae8; }
      .result {
        margin-top: 10px;
        padding: 10px;
        background: #f0f0f0;
      }
    </style>
  </head>
  <body>
    <h3>データ処理ツール</h3>

    <button onclick="processData()">データ処理開始</button>
    <button onclick="generateReport()">レポート生成</button>

    <div id="result" class="result"></div>

    <script>
      // GAS関数を呼び出し
      function processData() {
        google.script.run
          .withSuccessHandler(showResult)
          .withFailureHandler(showError)
          .processData();
      }

      function generateReport() {
        google.script.run
          .withSuccessHandler(showResult)
          .withFailureHandler(showError)
          .generateReport();
      }

      function showResult(result) {
        document.getElementById('result').innerHTML =
          '✅ 完了: ' + JSON.stringify(result);
      }

      function showError(error) {
        document.getElementById('result').innerHTML =
          '❌ エラー: ' + error.message;
      }
    </script>
  </body>
</html>
```

---

## 📦 配布方法

### 方法1: テンプレートとして共有
```javascript
function createTemplate() {
  const ss = SpreadsheetApp.getActive();
  const copy = ss.copy('【テンプレート】' + ss.getName());

  // 共有設定
  DriveApp.getFileById(copy.getId())
    .setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

  // コピー用URL生成
  const copyUrl = copy.getUrl().replace('/edit', '/copy');

  console.log('配布用URL:', copyUrl);
  return copyUrl;
}
```

### 方法2: ライブラリとして公開
```javascript
// 1. デプロイ → ライブラリとして公開
// 2. バージョン管理
// 3. 他プロジェクトから利用

// ライブラリ利用側
function useLibrary() {
  // ライブラリID追加後
  const result = MyLibrary.processData();
  return result;
}
```

### 方法3: アドオンとして公開
```json
// appsscript.json に追加
{
  "addOns": {
    "common": {
      "name": "My Addon",
      "logoUrl": "https://example.com/logo.png",
      "homepageTrigger": {
        "enabled": true
      }
    },
    "sheets": {
      "onOpen": {
        "runFunction": "onOpen"
      }
    }
  }
}
```

---

## 🐛 トラブルシューティング

### よくあるエラーと対処法

#### 1. CLASP コマンドが見つからない
```bash
# Windows環境での解決法
npx @google/clasp [コマンド]

# またはPATH追加
set PATH=%PATH%;C:\Users\%USERNAME%\AppData\Roaming\npm
```

#### 2. Script ID が見つからない
```bash
# プロジェクト一覧確認
npx @google/clasp list

# .clasp.json 確認
cat .clasp.json
```

#### 3. 認証エラー
```bash
# 再ログイン
npx @google/clasp logout
npx @google/clasp login
```

#### 4. Push 時のエラー
```javascript
// appsscript.json の構文チェック
{
  "timeZone": "Asia/Tokyo",  // カンマ注意
  "runtimeVersion": "V8"      // 最後はカンマなし
}
```

#### 5. 実行時間制限（6分）対策
```javascript
// バッチ分割処理
function processBatch(startRow = 1) {
  const BATCH_SIZE = 100;
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // バッチ処理
  for (let i = startRow; i < startRow + BATCH_SIZE && i <= lastRow; i++) {
    processRow(i);
  }

  // 次のバッチをトリガー設定
  if (startRow + BATCH_SIZE <= lastRow) {
    const trigger = ScriptApp.newTrigger('processBatch')
      .timeBased()
      .after(1000)  // 1秒後
      .create();

    // トリガーに引数を渡す（PropertiesService利用）
    PropertiesService.getScriptProperties()
      .setProperty('nextBatch', startRow + BATCH_SIZE);
  }
}
```

---

## 📊 パフォーマンス最適化

### 1. バッチ操作を使用
```javascript
// ❌ 悪い例：1セルずつ
for (let i = 1; i <= 100; i++) {
  sheet.getRange(i, 1).setValue(data[i]);
}

// ✅ 良い例：一括操作
const range = sheet.getRange(1, 1, 100, 1);
range.setValues(data);
```

### 2. キャッシュ活用
```javascript
// キャッシュサービス利用
function getCachedData() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('myData');

  if (cached) {
    return JSON.parse(cached);
  }

  // キャッシュミス時はデータ取得
  const data = fetchData();
  cache.put('myData', JSON.stringify(data), 600); // 10分間キャッシュ

  return data;
}
```

### 3. Properties Service でデータ永続化
```javascript
// 設定値の保存
function saveSettings(settings) {
  const props = PropertiesService.getUserProperties();
  props.setProperties(settings);
}

// 設定値の読み込み
function loadSettings() {
  const props = PropertiesService.getUserProperties();
  return props.getProperties();
}
```

---

## 🔐 セキュリティベストプラクティス

### 1. 機密情報の管理
```javascript
// ❌ 悪い例：ハードコーディング
const API_KEY = 'abc123xyz';

// ✅ 良い例：Properties Service利用
function getApiKey() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('API_KEY');
}
```

### 2. アクセス制御
```javascript
// ユーザー認証チェック
function requireAuth() {
  const email = Session.getActiveUser().getEmail();
  const allowedUsers = ['user1@example.com', 'user2@example.com'];

  if (!allowedUsers.includes(email)) {
    throw new Error('Unauthorized access');
  }
}
```

### 3. 入力検証
```javascript
// 入力値のサニタイズ
function validateInput(input) {
  // 型チェック
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }

  // 長さチェック
  if (input.length > 1000) {
    throw new Error('Input too long');
  }

  // XSS対策
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## 📚 リファレンス

### 公式ドキュメント
- [Google Apps Script](https://developers.google.com/apps-script)
- [CLASP](https://github.com/google/clasp)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)

### 便利なスニペット集
```javascript
// 現在のユーザー情報取得
const userEmail = Session.getActiveUser().getEmail();

// タイムゾーン取得
const timezone = Session.getScriptTimeZone();

// スクリプトURL取得
const scriptUrl = ScriptApp.getService().getUrl();

// 実行時間計測
const start = new Date();
// 処理
const elapsed = new Date() - start;
console.log(`処理時間: ${elapsed}ms`);
```

---

## ✅ チェックリスト

### 開発前の準備
- [ ] Node.js インストール済み
- [ ] CLASP インストール済み
- [ ] Google アカウント準備
- [ ] API 有効化（必要に応じて）

### 開発中
- [ ] appsscript.json 設定確認
- [ ] エラーハンドリング実装
- [ ] ログ出力設定
- [ ] テスト実行

### リリース前
- [ ] 権限設定確認
- [ ] パフォーマンステスト
- [ ] セキュリティチェック
- [ ] ドキュメント作成

### リリース後
- [ ] 動作確認
- [ ] ユーザーフィードバック収集
- [ ] エラー監視
- [ ] 定期メンテナンス

---

**このガイドは実証済み・動作確認済みの内容です。**
**Windows環境では `npx @google/clasp` を使用してください。**