Firebase Functions backend (optional, recommended for secret API key)

概要
- YouTube Data API v3 のキーをサーバ側に保持し、フロントからは Functions 経由で検索する安全構成。
- CORS 設定、任意の Firebase 認証（特定 UID のみ許可）に対応。

ディレクトリ
- functions/
  - index.js: Express + Functions のエンドポイント (/yt/search)
  - package.json: Node 18 以上

セットアップ手順
1) Firebase プロジェクト作成（または既存を使用）
2) Firebase CLI インストール: npm i -g firebase-tools
3) ログイン: firebase login
4) このフォルダで初期化（既にある場合はスキップ可）:
   - firebase init functions（Node 18を選択、ESMでOK）
5) 環境変数設定（Functionsランタイム環境、またはデプロイ時のCI変数）
   - Linux/macOS例:
     - export YT_API_KEY="YOUR_YT_API_KEY"
     - export ALLOWED_ORIGINS="https://muumuu8181.github.io"
     - export ALLOWED_UIDS="＜許可するUIDをカンマ区切りで＞"  # 任意
   - Windows PowerShell 例:
     - $env:YT_API_KEY="YOUR_YT_API_KEY"
     - $env:ALLOWED_ORIGINS="https://muumuu8181.github.io"
     - $env:ALLOWED_UIDS="uid1,uid2"
   - もしくは .env に記入して読み込む運用（CI推奨）

6) 依存インストールとデプロイ
   - cd functions
   - npm ci
   - firebase deploy --only functions

エンドポイント
- GET https://us-central1-＜your-project-id＞.cloudfunctions.net/api/yt/search
  - クエリ: q, channelName, publishedAfter, publishedBefore, fuzzy=true|false, excludeShorts=true|false
  - レスポンス: { items: [{ id, title, url }], elapsedMs }
  - 認証: Authorization: Bearer ＜Firebase ID token＞（allowedUIDs を設定した場合のみ必須）

フロント設定
- src/config.js に次を追加（例）:
  window.APP_CONFIG = {
    proxyBase: "https://us-central1-＜your-project-id＞.cloudfunctions.net/api",
    allowedHosts: ["muumuu8181.github.io"],
  };

注意
- これによりクライアントにYouTube APIキーを配布せずに運用可能になります。
- Functions側のタイムアウトやレート制限は必要に応じて追加してください。
