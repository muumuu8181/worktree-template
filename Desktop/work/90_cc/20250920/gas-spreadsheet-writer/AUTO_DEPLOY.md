# 自動デプロイの代替方法

## 1. Apps Script APIを使う方法（上級者向け）
```javascript
// Node.jsでApps Script APIを使用
const {google} = require('googleapis');
const script = google.script('v1');

// スプレッドシートに紐付けたGASを更新
async function updateContainerBoundScript() {
  // 認証後...
  await script.projects.updateContent({
    scriptId: 'SCRIPT_ID',
    resource: {
      files: [...]
    }
  });
}
```

## 2. GAS側で自動更新する仕組み
```javascript
// GAS側でGitHubから自動取得
function syncFromGitHub() {
  const url = 'https://raw.githubusercontent.com/user/repo/main/code.gs';
  const response = UrlFetchApp.fetch(url);
  const code = response.getContentText();

  // 自己書き換え（危険だが可能）
  // ...実装は複雑
}
```

## 3. 現実的な解決策

### A. テンプレート管理
1. スタンドアロン型で開発（CLASP使用）
2. 完成したらコードをコピー
3. 各スプレッドシートに手動貼り付け

### B. ライブラリ化
1. 共通機能をライブラリとして公開
2. 各スプレッドシートから参照
```javascript
// ライブラリとして追加後
function onOpen() {
  MyLibrary.createMenu();
}
```

### C. Web Appとして提供
1. スタンドアロン型でWeb App作成
2. スプレッドシートからiframeで埋め込み
```javascript
function showWebApp() {
  const html = HtmlService.createHtmlOutput('<iframe src="WEB_APP_URL" width="100%" height="500"></iframe>');
  SpreadsheetApp.getUi().showModalDialog(html, 'アプリ');
}
```

## 結論
- **開発時**: CLASP + スタンドアロン型
- **配布時**: 手動コピペ or ライブラリ化
- **将来**: Apps Script APIで自動化可能