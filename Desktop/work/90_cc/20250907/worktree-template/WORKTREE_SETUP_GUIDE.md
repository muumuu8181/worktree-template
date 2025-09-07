# 🌳 worktree-template Git Worktree セットアップガイド

## 📋 概要

このプロジェクトは**Git Worktree**を活用して、複数のAI開発者が同時に独立した機能開発を行えるように設計されています。各開発者は自分専用の作業ディレクトリで、他の開発者の作業に影響を与えることなく開発できます。

## 🚀 クイックスタート

### 前提条件
- Git がインストールされていること
- Node.js 18以上がインストールされていること
- worktree-template リポジトリがクローン済みであること

### 基本的な使い方

```bash
# 1. プロジェクトルートに移動
cd C:\Users\user\Desktop\work\90_cc\20250907\worktree-template

# 2. 新しい機能の開発を開始（例：認証機能）
cd .worktree
./setup.bat auth  # Windows
# または
./setup.sh auth   # Mac/Linux

# 3. 作成されたworktreeに移動
cd ..\..\worktree-auth

# 4. 開発を開始！
```

## 🛠️ セットアップスクリプトの動作

### setup.bat / setup.sh が行うこと：

1. **Worktreeの作成**
   - `../../worktree-<機能名>` に新しい作業ディレクトリを作成
   - `feat/<機能名>` ブランチを自動作成

2. **Sparse-checkoutの設定**
   - 必要なファイルのみを表示（他の機能のコードは見えない）
   - 以下のディレクトリ/ファイルのみアクセス可能：
     - `/contracts` （読み取り専用）
     - `/features/<あなたの機能>` （読み書き可能）
     - `/tests/<あなたの機能>` （読み書き可能）
     - `/docs` （読み書き可能）
     - ルートの設定ファイル

3. **テンプレートのコピー**
   - `features/feature-template` から新機能用のテンプレートをコピー
   - manifest.json を機能名で自動更新

4. **依存関係のインストール**
   - npm install を自動実行

## 📂 ディレクトリ構造

```
worktree-template/              # メインリポジトリ
├── .worktree/                 # セットアップスクリプト
├── contracts/                 # インターフェース定義（全開発者共通）
├── src/                       # コアシステム（変更不可）
├── features/                  # 機能実装
│   └── feature-template/      # テンプレート
├── tests/                     # テスト
├── docs/                      # ドキュメント
└── tools/                     # 開発ツール

worktree-auth/                  # 認証機能用worktree
├── contracts/                 # 読み取り専用
├── features/
│   └── auth/                  # 認証機能の実装（編集可能）
├── tests/
│   └── auth/                  # 認証機能のテスト（編集可能）
└── docs/                      # ドキュメント（編集可能）
```

## 👥 複数AI開発者での使用例

### AI-1: 認証機能開発
```bash
cd .worktree && ./setup.bat auth
cd ..\..\worktree-auth
# features/auth/ で認証機能を実装
```

### AI-2: 決済機能開発
```bash
cd .worktree && ./setup.bat payment
cd ..\..\worktree-payment
# features/payment/ で決済機能を実装
```

### AI-3: ユーザープロフィール機能開発
```bash
cd .worktree && ./setup.bat user-profile
cd ..\..\worktree-user-profile
# features/user-profile/ でプロフィール機能を実装
```

**全員が同時に作業しても、お互いのコードは見えず、競合も発生しません！**

## 📝 開発フロー

### 1. 機能の実装

```bash
# worktree内で開発
cd features/<your-feature>/

# IFeatureインターフェースを実装
# index.ts を編集
# manifest.json でイベントを宣言
```

### 2. テストの作成

```bash
cd tests/<your-feature>/

# 契約テストを作成
# 機能テストを作成
```

### 3. ドキュメントの更新

```bash
cd docs/

# API.md を作成/更新
# 使用方法を記載
```

### 4. コミットとプッシュ

```bash
git add features/<your-feature>/ tests/<your-feature>/ docs/
git commit -m "feat(<your-feature>): 機能の説明"
git push origin feat/<your-feature>
```

## ⚠️ 注意事項

### やってはいけないこと

1. **他の機能のフォルダを編集しない**
   - `features/other-feature/` は触らない
   
2. **コアシステムを変更しない**
   - `src/` フォルダは読み取り専用

3. **契約を破らない**
   - `contracts/` のインターフェースに従う

4. **未宣言のイベントを発行しない**
   - manifest.json で宣言したイベントのみ使用

### 推奨事項

1. **小さくコミット**
   - 機能ごとに細かくコミット

2. **テストを書く**
   - 契約テストは必須

3. **ドキュメントを更新**
   - 他の開発者のためにAPIドキュメントを書く

## 🔧 トラブルシューティング

### Worktreeが作成できない
```bash
# 既存のworktreeを確認
git worktree list

# 不要なworktreeを削除
git worktree remove ../worktree-old-feature
```

### TypeScriptのエラーが出る
```bash
# 依存関係を再インストール
npm install

# TypeScriptのビルドを確認
npm run build
```

### Gitの権限エラー
```bash
# Gitの設定を確認
git config --list

# 必要に応じて認証情報を設定
git config user.name "Your Name"
git config user.email "your@email.com"
```

## 📊 容量管理

### 容量の確認
```bash
# 各worktreeのサイズを確認
du -sh ../worktree-*/

# 全体のサイズを確認
du -sh ../worktree-* | sort -h
```

### 不要なworktreeの削除
```bash
# 完了した機能のworktreeを削除
git worktree remove ../worktree-completed-feature

# 削除済みworktreeの参照をクリーンアップ
git worktree prune
```

## 🎯 ベストプラクティス

1. **機能名は明確に**
   - 良い例: `user-auth`, `payment-stripe`, `data-export`
   - 悪い例: `feature1`, `test`, `new`

2. **定期的にmainをマージ**
   ```bash
   git fetch origin
   git merge origin/main
   ```

3. **CI/CDの活用**
   - プッシュ時に自動テストが実行される
   - 契約準拠が自動チェックされる

4. **コミュニケーション**
   - 新しいイベントを追加する場合は他の開発者に通知
   - 大きな変更は事前に相談

## 📚 関連ドキュメント

- [Git Worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [プロジェクトREADME](./README.md)
- [契約層ドキュメント](./contracts/README.md)
- [統合フローガイド](./docs/INTEGRATION_FLOW.md)