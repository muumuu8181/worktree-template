# 作業フォルダ整理計画

## 📁 現状の問題

### 散らばったプロジェクトフォルダ
- `20250801/` ~ `20250815/` に日付別でプロジェクトが分散
- 同じような名前のプロジェクトが複数存在（例: multi-app-manager-v0.2, v0.3, v0.4）
- テンプレートファイルが複数の場所に重複
- 関連プロジェクトが分離している

### 重複・不要ファイル
- `0000-00-00-project-template` が複数箇所に存在
- 類似の機能を持つアプリが分散（weight-management, task-manager等）
- 古いバージョンファイルが残存

## 🎯 整理後の理想的な構造

```
Desktop/work/90_cc/
├── 📁 ACTIVE_PROJECTS/           # アクティブプロジェクト
│   ├── ai-life-improvement-system/  # 現在のメインプロジェクト
│   ├── multi-app-manager/          # 統合アプリ管理
│   └── task-automation/            # 自動化関連
│
├── 📁 TEMPLATES/                 # 再利用可能テンプレート
│   ├── firebase-auth-template/
│   ├── project-template/
│   └── ui-components/
│
├── 📁 COMPLETED_PROJECTS/        # 完成プロジェクト
│   ├── 2025-08-weight-management/
│   ├── 2025-08-conversation-test/
│   └── 2025-08-firebase-experiments/
│
├── 📁 EXPERIMENTS/               # 実験・プロトタイプ
│   ├── ai-agent-experiments/
│   ├── ui-testing/
│   └── ml-poc/
│
├── 📁 ARCHIVE/                   # アーカイブ
│   ├── 20250801-20250814/      # 日付別アーカイブ
│   └── deprecated-projects/
│
└── 📁 DOCUMENTATION/             # ドキュメント
    ├── setup-guides/
    ├── troubleshooting/
    └── project-summaries/
```

## 🔄 移行手順

### Phase 1: メインプロジェクト整理
```bash
# 1. ai-life-improvement-systemを正式な場所に移動
mkdir -p "C:\Users\user\Desktop\work\90_cc\ACTIVE_PROJECTS"
mv "C:\Users\user\Desktop\work\90_cc\20250815\ai-life-improvement-system" "C:\Users\user\Desktop\work\90_cc\ACTIVE_PROJECTS\"

# 2. 最新バージョンを明確化
cd "C:\Users\user\Desktop\work\90_cc\ACTIVE_PROJECTS\ai-life-improvement-system"
```

### Phase 2: テンプレート統合
```bash
# 最新のproject-templateを特定して統合
mkdir -p "C:\Users\user\Desktop\work\90_cc\TEMPLATES\project-template"
# 各日付フォルダから最新版を選択してコピー
```

### Phase 3: 完成プロジェクト移動
```bash
mkdir -p "C:\Users\user\Desktop\work\90_cc\COMPLETED_PROJECTS"
# weight-management-app, simple-task-manager等を移動
```

### Phase 4: アーカイブ作成
```bash
mkdir -p "C:\Users\user\Desktop\work\90_cc\ARCHIVE\daily-work-20250801-20250814"
# 20250801-20250814フォルダを統合アーカイブに移動
```

## 📋 具体的な整理対象

### 重複プロジェクト
- **multi-app-manager**: v0.2, v0.3, v0.4 → 最新版のみ残す
- **project-template**: 複数存在 → 最新版に統合
- **weight-management**: v1.0-stable版を採用

### 統合対象
- **Firebase実験群**: 複数のFirebase関連テストを統合
- **AI Agent実験**: conversation-test系を統合
- **タスク管理**: task-manager系を統合

### アーカイブ対象
- 20250808, 20250809, 20250810 (空フォルダ)
- 古いバージョンファイル群
- 実験途中で停止したプロジェクト

## 🎯 整理の優先順位

### 最優先 (今すぐ実行)
1. **ai-life-improvement-system** を ACTIVE_PROJECTS に移動
2. 最新のweight_analyzer_v0.36.04.htmlを main.html にリネーム
3. 不要な古いバージョンファイルを削除

### 中優先 (今週中)
1. 重複テンプレートの統合
2. multi-app-managerの最新版特定・移動
3. 空フォルダの削除

### 低優先 (来週以降)
1. 完成プロジェクトのアーカイブ
2. ドキュメントの整理
3. 実験プロジェクトのカテゴリ分け

## 💡 整理後のメリット

### 作業効率向上
- プロジェクト場所が明確
- 重複ファイルによる混乱の解消
- 最新版の特定が容易

### 保守性向上
- テンプレートの再利用性向上
- プロジェクト間の関係性が明確
- バックアップ・復元が容易

### 開発速度向上
- 必要なファイルへの高速アクセス
- プロジェクト切り替えの効率化
- ドキュメント参照の高速化

## 🚨 注意事項

### バックアップ必須
```bash
# 整理前に全体バックアップを作成
xcopy "C:\Users\user\Desktop\work\90_cc" "C:\Users\user\Desktop\work\backup_20250815" /E /I
```

### 段階的実行
- 一度に全てを移動せず、重要なプロジェクトから順次実行
- 各段階で動作確認を実施
- 問題発生時は即座にロールバック

### 依存関係の確認
- プロジェクト間の参照関係を事前確認
- 相対パスの修正が必要な場合は事前対応
- Git履歴の保持に注意

---

**実行開始**: 最優先項目から段階的に実行
**完了目標**: 今週末までに基本整理完了
**最終確認**: 全プロジェクトの動作確認実施