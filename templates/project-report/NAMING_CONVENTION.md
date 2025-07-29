# 📁 プロジェクト命名規則

## 🎯 新しい命名規則（v1以降）

### フォルダ名の形式
```
v1-[連番]-[プロジェクト名]
```

### 例
- `v1-00001-calculator-app`
- `v1-00002-todo-manager`
- `v1-00003-weather-widget`

## 📅 年月別フォルダと組み合わせた場合
```
published-apps/
├── 2025-07/
│   └── v1-00001-calculator-app/
├── 2025-08/
│   ├── v1-00002-todo-manager/
│   └── v1-00003-weather-widget/
└── 2025-09/
    └── v1-00004-[次のアプリ]/
```

## 🔢 連番の管理

### 連番ルール
- 5桁のゼロパディング（00001, 00002, ...）
- バージョンごとに1から開始
- 削除されたプロジェクトの番号は再利用しない

### バージョンアップ時
- メジャーアップデート時は `v2-00001-[名前]` から開始
- 同じアプリの更新は `-v2` をサフィックスに追加
  - 例: `v1-00001-calculator-app-v2`

## 📝 プロジェクト作成時のコマンド例

```bash
# 次の連番を確認
ls -d published-apps/*/v1-* | sort | tail -1

# 新しいプロジェクトフォルダを作成（例：v1-00005）
mkdir -p published-apps/2025-08/v1-00005-my-new-app

# テンプレートをコピー
cp templates/project-report/*_TEMPLATE.md published-apps/2025-08/v1-00005-my-new-app/
```

## 🏷️ メタデータファイル

各プロジェクトフォルダに `PROJECT_INFO.json` を作成することを推奨：

```json
{
  "version": "v1",
  "number": "00005",
  "name": "my-new-app",
  "created": "2025-08-01",
  "type": "web-app",
  "status": "active"
}
```

## 🔄 既存プロジェクトの移行

既存の `app-000001-xxx` 形式のフォルダは：
1. そのまま残す（過去の履歴として）
2. または `legacy/` フォルダに移動
3. 新規プロジェクトから `v1-` 形式を適用

```bash
# 既存アプリを整理する場合
mkdir -p published-apps/legacy
mv published-apps/app-* published-apps/legacy/
```

## ✅ チェックリスト

新しいプロジェクト作成時：
- [ ] 最新の連番を確認
- [ ] `v1-[連番]-[名前]` 形式でフォルダ作成
- [ ] 年月フォルダ（YYYY-MM）に配置
- [ ] PROJECT_INFO.json を作成
- [ ] テンプレートをコピー