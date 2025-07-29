# ToDo List App - GitHub Pages版

## 概要
Node.js版のToDo List AppをGitHub Pages対応に改修した静的Webアプリケーションです。
ブラウザのローカルストレージを使用してタスクを保存します。

## 機能
- タスクの追加（最大50個、100文字まで）
- タスクの編集
- タスクの削除
- 完了/未完了の切り替え
- JSONファイルとしてダウンロード
- ローカルストレージへの自動保存

## GitHub Pagesへのデプロイ方法

### 1. リポジトリの準備
```bash
# 新しいリポジトリを作成するか、既存のリポジトリを使用
git init
git add .
git commit -m "Add ToDo List App for GitHub Pages"
git remote add origin https://github.com/YOUR_USERNAME/todo-list-app.git
git push -u origin main
```

### 2. GitHub Pagesの有効化
1. GitHubでリポジトリを開く
2. Settings → Pages に移動
3. Source: Deploy from a branch を選択
4. Branch: main（またはmaster）、フォルダ: /github-pages を選択
5. Save をクリック

### 3. アクセス
数分後、以下のURLでアプリにアクセスできます：
```
https://YOUR_USERNAME.github.io/todo-list-app/
```

## ローカルでのテスト
```bash
# Python 3の場合
python -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000

# Node.jsの場合
npx http-server -p 8000
```

ブラウザで http://localhost:8000 にアクセス

## 技術仕様
- 純粋なHTML/CSS/JavaScript（フレームワークなし）
- ローカルストレージでデータ永続化
- レスポンシブデザイン対応
- XSS対策済み

## ブラウザ対応
- Chrome（推奨）
- Firefox
- Safari
- Edge