# 電卓アプリ

多機能な電卓アプリケーション。CLI、バッチ処理、HTTPサーバーモードに対応。

## 特徴

- **3つの動作モード**: 対話型CLI、バッチ処理、HTTPサーバー
- **幅広い演算サポート**: 基本演算、三角関数、対数、累乗など
- **メモリ機能**: 計算結果の保存と再利用
- **エラーハンドリング**: 不正な入力に対する適切なエラーメッセージ

## インストール方法

```bash
# リポジトリをクローン
git clone <repository-url>
cd calculator-app

# 依存関係のインストール（現在は依存関係なし）
npm install
```

## 使い方

### 1. 対話型CLIモード

```bash
npm start
# または
node app.js
```

計算式を入力してEnterキーを押すと結果が表示されます。

```
> 2 + 3
5
> sin(90)
1
> log(10)
2.302585092994046
> exit
```

### 2. バッチ処理モード

複数の計算式を一度に処理：

```bash
node app.js --batch "2+3" "10*5" "sqrt(16)"
```

ファイルから計算式を読み込む：

```bash
node app.js --batch --file calculations.txt
```

### 3. HTTPサーバーモード

```bash
npm run start:server
# または
node app.js --server
```

デフォルトでポート3000で起動します。別のポートを使用する場合：

```bash
node app.js --server --port 8080
```

## API仕様

### エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /calculate | 計算式を評価して結果を返す |
| GET | /health | サーバーの状態を確認 |

### リクエスト/レスポンス例

**計算リクエスト:**
```bash
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "2 + 3 * 4"}'
```

**成功レスポンス:**
```json
{
  "result": 14,
  "expression": "2 + 3 * 4"
}
```

**エラーレスポンス:**
```json
{
  "error": "Invalid expression",
  "expression": "2 ++ 3"
}
```

## サポートされる演算

### 基本演算
- 加算: `+`
- 減算: `-`
- 乗算: `*`
- 除算: `/`
- 剰余: `%`
- 累乗: `^` または `**`

### 数学関数
- 三角関数: `sin()`, `cos()`, `tan()`
- 逆三角関数: `asin()`, `acos()`, `atan()`
- 対数: `log()`, `log10()`
- 平方根: `sqrt()`
- 絶対値: `abs()`
- 切り上げ/切り下げ: `ceil()`, `floor()`
- 四捨五入: `round()`

### 定数
- 円周率: `PI`
- 自然対数の底: `E`

### メモリ機能
- 保存: `M+`, `M-`, `MS`
- 読み込み: `MR`
- クリア: `MC`

## テスト

```bash
npm test
```

テストでは以下を確認：
- 基本的な計算の正確性
- エラーハンドリング
- 各動作モードの機能
- メモリ機能の動作

## エラーハンドリング

電卓アプリは以下のようなエラーを適切に処理：

- **構文エラー**: 不正な式の入力
- **ゼロ除算**: 0での除算を検出
- **関数エラー**: 存在しない関数の呼び出し
- **範囲エラー**: 数値の範囲外の計算

## 開発者向け情報

### ディレクトリ構造

```
calculator-app/
├── app.js          # メインアプリケーション
├── src/
│   └── calculate.js # 計算エンジン
├── test/
│   └── test.js     # テストスイート
├── docs/
│   └── requirements.md # 要件定義書
├── package.json
└── README.md
```

### コード規約

- ESモジュール形式を使用
- エラーは適切にキャッチして処理
- 関数は単一責任の原則に従う

## ライセンス

MIT License