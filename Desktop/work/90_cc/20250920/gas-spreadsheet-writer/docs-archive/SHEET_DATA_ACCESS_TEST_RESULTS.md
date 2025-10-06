# シートデータアクセス方法の検証結果

## テスト結果サマリー

### 1. Sheets API直接アクセス ❌
**結果**: 認証エラー
- CLASPの認証トークンをそのまま使うことはできない
- Sheets APIには別途認証設定が必要（サービスアカウントまたは専用OAuth）

### 2. CLASP run経由 ⚠️
**結果**: API実行可能設定が必要
- `clasp run`コマンドは特別な設定が必要
- Apps Script APIの有効化と実行可能権限の設定が複雑

### 3. Web App経由 ✅
**結果**: 最も確実に動作

デプロイしたWeb App:
```
https://script.google.com/macros/s/AKfycbybodQvnhAn7uteWRFay4AxMFfAeXtDe-XPu-m5P0g9GhUK1uFnhy2-BZPMAKgldRgk/exec
```

このURLにアクセスすると、スプレッドシートのデータがJSON形式で返される。

## 実証された内容

### できること ✅
1. **Web App経由でのデータ取得**
   - doGet()関数でJSONレスポンス
   - 認証不要の公開エンドポイント可能
   - Script IDを知らなくてもURLでアクセス

2. **GAS内でのデータ操作**
   - SpreadsheetApp経由で全データアクセス
   - CLASPでコードをpush → Web Appで実行

3. **コンテナバインド型の利点**
   - SpreadsheetApp.getActive()で直接アクセス
   - 権限はスプレッドシートに紐づく

### できないこと/難しいこと ❌
1. **CLASPだけでデータの直接読み取り**
   - CLASPはコード管理ツール
   - データビューアーではない

2. **Sheets APIを簡単に使う**
   - 別途認証設定が必要
   - CLASPトークンの流用は困難

3. **clasp runコマンドの利用**
   - API実行可能設定が複雑
   - 権限設定が難しい

## 実用的な解決策

### 推奨アプローチ
```javascript
// 1. データ取得用のWeb Appを作成
function doGet(e) {
  const action = e.parameter.action;

  switch(action) {
    case 'read':
      return getSheetData(e.parameter.range);
    case 'status':
      return getSheetStatus();
    default:
      return getAllData();
  }
}

// 2. CLASPでデプロイ
clasp push
clasp deploy

// 3. URLでアクセス
// https://script.google.com/.../exec?action=read&range=A1:C10
```

### 配布先の管理
```javascript
// 初回起動時にIDを収集
function reportInstallation() {
  const data = {
    scriptId: ScriptApp.getScriptId(),
    sheetId: SpreadsheetApp.getActive().getId(),
    webAppUrl: ScriptApp.getService().getUrl()
  };

  // 管理サーバーに送信
  UrlFetchApp.fetch('YOUR_MANAGEMENT_API', {
    method: 'POST',
    payload: JSON.stringify(data)
  });
}
```

## 結論

**CLASPの役割を正しく理解することが重要：**

| ツール | 用途 | データアクセス |
|--------|------|--------------|
| CLASP | コード管理・デプロイ | ❌ 直接不可 |
| Sheets API | データ読み書き | ✅ 可能（要認証） |
| Web App | API提供 | ✅ 最も簡単 |
| GAS関数 | 内部処理 | ✅ 完全アクセス |

**実用的には：**
1. CLASPでコードを管理
2. Web Appとしてデプロイ
3. URLエンドポイント経由でデータアクセス

これが最も現実的なアプローチです。