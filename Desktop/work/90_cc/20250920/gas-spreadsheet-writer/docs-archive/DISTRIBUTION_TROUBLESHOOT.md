# 📋 配布トラブルシューティング

## 問題：コピーしてもメニューが表示されない

### 原因の可能性

1. **スクリプトの共有設定問題**
   - コンテナバインド型スクリプトがコピーされていない
   - 権限設定が不適切

2. **実行承認が必要**
   - 初回実行時はGoogle承認が必須

## 解決手順

### Step 1: コピーしたスプレッドシートでスクリプトを確認

1. コピーしたスプレッドシートを開く
2. **拡張機能 → Apps Script**をクリック
3. ファイルがあるか確認

### もしファイルが**空**の場合：

スクリプトがコピーされていません。以下の方法で解決：

## 方法A：配布元を修正して再配布

配布元（19zPNnf2zqQbqf_Pc0Sozc078A902t3HLYkMmO1Kiho4）で：

1. 拡張機能 → Apps Script
2. 左上のプロジェクト名をクリック
3. 「共有」設定を確認
4. 「リンクを知っている全員」に設定

## 方法B：手動インストール（確実）

### 1. 新しいスプレッドシート作成
```
https://sheets.new
```

### 2. 拡張機能 → Apps Script

### 3. 既存コードを削除して、以下を実行：

```javascript
// Code.gsに貼り付け
function installSalesToolkit() {
  // GitHubやGistから直接取得
  const codeUrl = 'YOUR_GIST_URL/Code.gs';
  const dashboardUrl = 'YOUR_GIST_URL/Dashboard.html';
  const formUrl = 'YOUR_GIST_URL/SalesForm.html';

  // または直接埋め込み
  const code = `[ここにCode.gsの内容]`;

  // ファイル作成...
}
```

## 方法C：アドオンとして配布（最も確実）

1. Google Workspace Marketplaceで公開
2. ユーザーは「インストール」クリックのみ
3. 全スプレッドシートで利用可能

## 現在の問題の根本原因

**コンテナバインド型スクリプトのコピー制限**

- スクリプトを含むスプレッドシートをコピーする際、スクリプトの共有設定によってはコピーされない
- これはGoogleのセキュリティ仕様

## 推奨される配布方法

### 1. ライブラリとして公開
```javascript
// ライブラリID: xxx
// ユーザー側で1行追加するだけ
function onOpen() {
  SalesToolkit.initialize();
}
```

### 2. Web App + iframe埋め込み
```javascript
// スプレッドシートにiframeで埋め込み
function showApp() {
  const html = '<iframe src="WEB_APP_URL" width="100%" height="600"></iframe>';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html),
    'Sales Toolkit'
  );
}
```

### 3. インストーラースクリプト
```javascript
// 1クリックインストール
function installFromUrl() {
  const scriptUrl = 'https://script.google.com/macros/s/xxx/exec?install=true';
  // 自動でコードをインストール
}
```