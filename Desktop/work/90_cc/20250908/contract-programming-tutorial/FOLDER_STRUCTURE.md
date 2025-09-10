# フォルダ構成 - Contract Programming Tutorial
更新日: 2025/01/10

## ✅ 整理完了！

## 📁 現在のフォルダ構成（整理済み）

```
C:\Users\user\Desktop\work\90_cc\20250908\contract-programming-tutorial\
│
├── 📄 FOLDER_STRUCTURE.md                 # このファイル
├── package.json                           # Node.js依存関係
├── package-lock.json                      # 固定バージョン
├── node_modules/                          # インストール済みパッケージ
│
├── 📚 docs/                               # ドキュメント類
│   ├── README.md                          # プロジェクト概要
│   ├── USAGE_MANUAL.md                    # 使い方マニュアル
│   └── contract_programming_guide.md      # 契約プログラミング詳細ガイド
│
├── 🎯 contracts/                          # 契約プログラミング基礎
│   ├── hello_contract.py                  # Python実装例
│   ├── hello_contract.js                  # JavaScript実装例
│   ├── weight_tracker_example.js          # 体重記録アプリの例
│   └── chart_with_contracts.html          # 契約付きチャートデモ
│
├── 🔍 f12-tools/                          # F12ログ収集ツール
│   ├── selenium_f12_tester.py             # Selenium版
│   ├── puppeteer_f12_test.js             # Puppeteer版
│   ├── playwright_f12_test.py             # Playwright版
│   ├── test_f12_logs.py                   # 統合テストツール
│   ├── tetris_f12_logger.py               # Tetrisログ収集
│   ├── rpg_f12_logger.py                  # RPGログ収集
│   └── *_test_page.html                   # テスト用HTMLページ
│
├── 🌐 scrapers/                           # スクレイピング＆自動化ツール
│   ├── selenium_yahoo_news.py             # Yahoo Newsスクレイピング
│   ├── puppeteer_yahoo_news.js            # Puppeteer版
│   ├── playwright_yahoo_news.py           # Playwright版
│   ├── paters_login_automation.py         # ログイン自動化
│   ├── paters_login_puppeteer.js          # Puppeteer版
│   ├── selenium_*.py                      # その他Seleniumツール
│   └── paters_android_automation.md       # Android調査結果
│
├── 🎮 game-tests/                         # ゲーム関連テスト
│   ├── rpg_battle_demo.py                 # RPGバトルデモ
│   ├── action_rpg_demo.py                 # アクションRPG基本デモ
│   ├── action_rpg_slow_demo.py            # ゆっくり動作版
│   ├── action_rpg_position_test.py        # 座標確認テスト
│   ├── action_rpg_js_test.py              # JS直接操作テスト
│   └── action_rpg_selenium_fix.py         # 修正版（成功！）
│
└── 📊 results/                            # 結果・ログファイル
    ├── *.json                             # 各種JSON形式の結果
    ├── *.txt                              # テキスト形式のログ
    └── *.png                              # スクリーンショット
```

## 🎯 整理結果

### ✅ 整理完了内容
1. **サブフォルダ化完了**:
   - `contracts/` - 契約プログラミングサンプル（4ファイル）
   - `docs/` - ドキュメント類（3ファイル）
   - `f12-tools/` - F12ログ収集ツール（9ファイル）
   - `scrapers/` - スクレイピングツール（11ファイル）
   - `game-tests/` - ゲーム関連テスト（6ファイル）
   - `results/` - 結果ファイル（画像・JSON・テキスト）

2. **削除済み**:
   - `nul` - 不要な空ファイル

3. **整理の効果**:
   - ファイルが機能別に分類され、見つけやすくなった
   - ルートディレクトリがスッキリした
   - 各カテゴリの役割が明確になった

### 📌 使い方
- **契約プログラミングを学ぶ**: `contracts/`フォルダ
- **F12ログを収集したい**: `f12-tools/`フォルダ
- **Webスクレイピング**: `scrapers/`フォルダ
- **ゲーム自動操作**: `game-tests/`フォルダ
- **実行結果を見る**: `results/`フォルダ