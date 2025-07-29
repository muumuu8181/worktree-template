# 🔧 トラブルシューティング記録

## 📋 今回遭遇した問題と解決方法

### 1. ESモジュールエラー（8:34）

#### 🚨 問題
```
ReferenceError: require is not defined in ES module scope
```

#### 🔍 原因
- `package.json`に`"type": "module"`を設定したのに、`app.js`でCommonJS形式（require）を使用していた

#### ✅ 解決方法
```javascript
// 修正前（CommonJS）
const fs = require('fs');
const { calculate } = require('./src/calculate');

// 修正後（ESModules）
import fs from 'fs';
import { calculate } from './src/calculate.js';
```

#### 📝 教訓
- package.jsonでモジュール形式を指定したら、全ファイルで統一する
- ESModulesではファイル拡張子（.js）を明示的に指定する必要がある

---

### 2. GitHub Pages 404エラー（8:45-9:06）

#### 🚨 問題
- GitHub Pagesにアクセスすると404エラー
- ビルドステータスが「errored」

#### 🔍 原因
```bash
##[error]fatal: No url found for submodule path 'temp-req' in .gitmodules
```
- 存在しないサブモジュール参照がGitに残っていた

#### ✅ 解決方法
```bash
# サブモジュールエントリを確認
git ls-files -s | grep 160000

# 問題のあるサブモジュールを削除
git rm --cached temp-req
git commit -m "Remove broken submodule reference temp-req"
git push origin main
```

#### 📝 教訓
- GitHub Actionsのエラーログを確認する重要性
- サブモジュールの扱いには注意が必要

---

### 3. テストツールのインポートエラー（9:12）

#### 🚨 問題
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'jsdom'
```

#### 🔍 原因
- 外部パッケージ（jsdom）をインポートしようとしたが、プロジェクトは依存関係なしという要件

#### ✅ 解決方法
- JSDOMのインポートを削除し、純粋なNode.js標準モジュールのみを使用
```javascript
// 削除
import { JSDOM } from 'jsdom';

// 代わりに簡易HTMLパーサーを実装
class SimpleHTMLParser {
    constructor(html) {
        this.html = html;
    }
    // ...
}
```

#### 📝 教訓
- 要件を守り、標準モジュールのみで実装する工夫が必要

---

### 4. ディレクトリ移動エラー（8:36）

#### 🚨 問題
```
cd: published-app/calculator-app: No such file or directory
```

#### 🔍 原因
- 相対パスでのディレクトリ移動を試みたが、現在のディレクトリが想定と異なっていた

#### ✅ 解決方法
- 絶対パスを使用するか、現在のディレクトリから実行
```bash
# 相対パスの代わりに
cd /mnt/c/Users/user/published-apps/calculator-app

# または現在のディレクトリで直接実行
npm test
```

#### 📝 教訓
- 作業ディレクトリの確認は重要
- 絶対パスの使用で確実性を高める

---

### 5. GitHubページURLの誤解（9:13）

#### 🚨 問題
- TEST_REPORT.mdのURLで「404 - page not found」
- エラーメッセージ: "does not contain the path calculator-app/TEST_REPORT.m."

#### 🔍 原因
- URLの最後の文字「d」が欠けていた（コピー時の問題）

#### ✅ 解決方法
- 正しいURL: `TEST_REPORT.md`（最後の'd'を含む）
- 完全なURLを再度提供

#### 📝 教訓
- URLは完全にコピーすることの重要性
- エラーメッセージを注意深く読む

---

## 🛡️ 予防策とベストプラクティス

### 1. 開発開始前のチェックリスト
- [ ] package.jsonのモジュール形式を確認
- [ ] GitHubリポジトリの状態を確認
- [ ] 作業ディレクトリを明確にする

### 2. エラー発生時の対処フロー
1. エラーメッセージを完全に読む
2. GitHub Actionsのログを確認
3. `git status`でリポジトリ状態を確認
4. 必要に応じてAPIで詳細確認

### 3. テスト戦略
- 最小限のテストから始める
- 外部依存を避ける
- 段階的に機能を追加

### 4. デプロイ前の確認
- ローカルでの動作確認
- Gitの状態確認（サブモジュール含む）
- GitHub Pagesの設定確認

## 📊 問題解決にかかった時間

| 問題 | 発生時刻 | 解決時刻 | 所要時間 |
|------|---------|---------|----------|
| ESモジュールエラー | 8:34 | 8:35 | 1分 |
| GitHub Pages 404 | 8:45 | 9:06 | 21分 |
| テストツールインポート | 9:12 | 9:12 | <1分 |
| ディレクトリ移動 | 8:36 | 8:36 | <1分 |
| URL文字欠け | 9:13 | 9:14 | 1分 |

**合計トラブルシューティング時間**: 約24分（全体の51%）

## 🎯 今後の改善提案

1. **事前検証の強化**
   - リポジトリの初期状態確認
   - GitHub Pages設定の事前確認

2. **エラーハンドリングの改善**
   - より詳細なエラーメッセージ
   - 自動リトライ機能

3. **ドキュメントの充実**
   - トラブルシューティングガイド（本ファイル）
   - よくある問題のFAQ

4. **テストの自動化**
   - CI/CDパイプラインの構築
   - プッシュ前の自動検証