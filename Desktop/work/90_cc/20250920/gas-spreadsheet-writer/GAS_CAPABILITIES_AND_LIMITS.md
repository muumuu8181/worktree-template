# GASで何ができて、何ができないか

## ✅ GASでできること（VBAより圧倒的に多い）

### Googleサービス完全制御
```javascript
SpreadsheetApp  // スプレッドシート
DocumentApp     // ドキュメント
SlidesApp       // スライド
FormApp         // フォーム
DriveApp        // ドライブ
GmailApp        // Gmail
CalendarApp     // カレンダー
MapsApp         // マップ
```

### 外部連携
```javascript
UrlFetchApp     // 外部API呼び出し（ChatGPT等も可）
HtmlService     // Webアプリ作成
ContentService  // JSON API作成
```

### データ処理
```javascript
Utilities       // Base64、暗号化、UUID生成
JDBC           // データベース接続（MySQL等）
```

## ❌ 制限事項

### 実行時間
- 1回: 最大6分
- 1日: 最大90分（無料版）

### API制限（無料版/日）
- メール送信: 100通
- URLフェッチ: 20,000回
- スプレッドシート読み書き: ほぼ無制限

### その他
- ファイルサイズ: 50MB以下
- 同時実行: 30まで
- カスタムドメイン: 不可

## 🎯 複数関数組み合わせサービス例

「タスク管理＋自動レポート」サービスを作ります！