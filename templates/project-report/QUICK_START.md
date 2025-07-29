# 🚀 クイックスタートガイド

## 新しいプロジェクトで報告書を作成する手順

### 1. テンプレートをコピー
```bash
# 最新の連番を確認
ls -d published-apps/*/v1-* 2>/dev/null | sort | tail -1

# 例: 2025年8月の新プロジェクト（v1-00001）
mkdir -p published-apps/2025-08/v1-00001-my-new-app
cp templates/project-report/*_TEMPLATE.md published-apps/2025-08/v1-00001-my-new-app/
```

### 2. プレースホルダーを置換
各ファイルの `[プロジェクト名]` などを実際の値に置き換える

### 3. 開発しながら記録
- **作業開始時**: WORK_LOG.mdに開始時刻を記入
- **エージェント使用時**: 即座に記録
- **エラー発生時**: TROUBLESHOOTING.mdに追記
- **テスト実施時**: TEST_REPORT.mdを更新

### 4. 完了時の確認
- [ ] すべての統計情報を更新
- [ ] プレースホルダーが残っていないか確認
- [ ] GitHubにコミット&プッシュ

## 📁 推奨フォルダ構成

```
published-apps/
├── index.html                    # メインページ
├── templates/                    # テンプレート（このフォルダ）
│   └── project-report/
│       ├── README.md
│       ├── TEST_REPORT_TEMPLATE.md
│       ├── WORK_LOG_TEMPLATE.md
│       ├── TROUBLESHOOTING_TEMPLATE.md
│       └── QUICK_START.md
├── 2025-07/                      # 2025年7月のプロジェクト
│   └── calculator-app/           # 旧形式（そのまま）
│       ├── index.html
│       ├── TEST_REPORT.md
│       ├── WORK_LOG.md
│       └── TROUBLESHOOTING.md
└── 2025-08/                      # 2025年8月のプロジェクト
    ├── v1-00001-todo-app/        # 新形式
    └── v1-00002-weather-app/     # 新形式
```

## 💡 メリット
- GitHub Pagesの設定変更不要
- URLが整理される（年月で分類）
- 古いアプリをアーカイブしやすい
- index.htmlの更新も簡単