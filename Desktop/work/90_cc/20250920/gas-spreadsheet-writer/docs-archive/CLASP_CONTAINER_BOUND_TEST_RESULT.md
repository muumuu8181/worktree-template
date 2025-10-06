# CLASPでコンテナバインド型へのアップロード テスト結果

## テスト結果

### 試したこと

1. **既存のコンテナバインド型Script IDで直接push**
   - 結果: ❌ エラー「Request contains an invalid argument」

2. **clasp cloneでコンテナバインド型を取得**
   - 結果: ❌ 「Project file already exists」エラー

### 判明したこと

#### ✅ 理論的には可能（ドキュメント通り）

```bash
# 新規作成時
clasp create --parentId <SpreadsheetID> --title "My Project"

# 既存をclone
clasp clone <ScriptID>
```

#### ⚠️ 実際の制約

1. **権限の問題**
   - コンテナバインド型は所有者権限が必要
   - 共有されたスプレッドシートでは制限あり

2. **Script IDの取得**
   - スプレッドシートから「拡張機能→Apps Script」
   - プロジェクトの設定からScript IDをコピー
   - このIDでclaspから操作

3. **作成タイミング**
   - 最初から`--parentId`で作成 → ✅ 動作
   - 後から紐付け → ❌ 困難

## 結論

### できること
- **新規作成時に紐付け**: `clasp create --parentId`
- **既存のclone**: 権限があれば`clasp clone`
- **その後のpush/pull**: 通常通り可能

### できないこと
- スタンドアロン型を後からコンテナバインドに変換
- 他人のスプレッドシートのGASを勝手に更新

## 実用的な方法

### 1. 開発フロー
```bash
# 開発: ローカルでTypeScript
npm run dev

# テスト: スタンドアロン型で確認
clasp push --project standalone

# 本番: コンテナバインド型へ
clasp push --project production
```

### 2. CI/CD（前述のテンプレート）
- Apps Script APIで直接更新
- GitHub Actionsで自動化
- 複数顧客への一括配布

### 3. 手動フォールバック
- GASエディタでコピペ（最終手段）
- 顧客に手順書提供
- Add-on化を検討