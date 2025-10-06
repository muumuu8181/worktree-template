# GAS実行の仕組み - どうやって動いているか

## 🔄 全体の流れ

```
[ローカルPC] → [Googleサーバー] → [スプレッドシート]
```

## 📊 詳細な動作原理

### 1. 認証の仕組み
```
C:\Users\user\.clasprc.json
├── access_token    (Googleへのアクセス権限)
├── refresh_token   (期限切れ時の更新用)
└── client_id       (アプリケーション識別子)
```

**なぜ書き込めるか**: あなたのGoogleアカウントでログインした認証情報が保存されているから

### 2. コードのアップロード
```bash
clasp push -f
```
これで何が起きるか：
- ローカルの `Code.gs` をGoogleのサーバーにアップロード
- Script ID `1kJx_xJ5kiHt6OVFAMSiWBmmqzq_BW6PWgkkJLs4tYIg5OJ_6z7WwYzmK` のプロジェクトを更新
- Googleのサーバー上でコードが保存される

### 3. Web Appとしてデプロイ
```bash
clasp deploy --description "E5 Writer"
```
これで何が起きるか：
- GoogleがこのコードにURLを割り当てる
- 例: `https://script.google.com/macros/s/AKfycbz.../exec`
- このURLにアクセスすると、`doGet()` 関数が実行される

### 4. 実行の流れ

```javascript
// 1. URLアクセス時に自動実行される関数
function doGet() {
  const result = writeToExistingSheet();  // 2. 実際の処理を呼び出し
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. スプレッドシートへの書き込み処理
function writeToExistingSheet() {
  // Googleのサーバー上で実行される
  const ss = SpreadsheetApp.openById('...');  // 4. スプレッドシートを開く
  sheet.getRange('C3').setValue('値');         // 5. セルに書き込む
}
```

## 🔑 重要なポイント

### なぜローカルPCから書き込めるのか？

1. **認証済み**: `.clasprc.json` にGoogleアカウントの認証情報が入っている
2. **サーバー実行**: コードはGoogleのサーバー上で実行される（ローカルではない）
3. **API経由**: SpreadsheetApp はGoogle内部のAPIを使って直接書き込む

### セキュリティの仕組み

```
ローカルPC                    Googleサーバー
    |                              |
    | 1. clasp push (認証付き)      |
    |----------------------------->|
    |                              | 2. コード保存
    | 3. curl でURL呼び出し         |
    |----------------------------->|
    |                              | 4. doGet()実行
    |                              | 5. スプレッドシート書き込み
    | 6. JSON結果                  |
    |<-----------------------------|
```

## 📝 具体例での説明

今回の実行例：

1. **clasp push**:
   - `Code.gs` をScript ID `1kJx_xJ5kiHt6OVFAMSiWBmmqzq_BW6PWgkkJLs4tYIg5OJ_6z7WwYzmK` にアップロード

2. **clasp deploy**:
   - デプロイID `AKfycbztqudRYvYt9YFAY8sCsPnZMoAkXwQ4u0nWK-YkQXVX3YbGCxh-nW2nqxQ2BfuqbzIkgg` 取得

3. **curl実行**:
   ```bash
   curl -L "https://script.google.com/macros/s/AKfycbz.../exec"
   ```
   - GoogleサーバーがdoGet()を実行
   - SpreadsheetApp.openById()でスプレッドシートを開く
   - getRange().setValue()でセルに書き込み
   - 結果をJSONで返す

## 🎯 まとめ

**動いている理由**:
1. あなたのGoogleアカウントで認証済み（.clasprc.json）
2. コードはGoogleのサーバー上で実行される
3. GoogleサーバーからスプレッドシートAPIを直接呼び出している
4. Web App URLを叩くことで遠隔実行している

**ローカルPCの役割**:
- コードを書く
- Googleサーバーにアップロード
- 実行トリガー（URL呼び出し）

**実際の処理**:
- 全てGoogleサーバー側で実行される
- だからスプレッドシートへの書き込み権限がある