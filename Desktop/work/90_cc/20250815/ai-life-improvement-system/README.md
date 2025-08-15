# AI生活改善システム v0.34

Deep Learning/機械学習を活用した生活データ分析・改善提案システム

## 📋 システム概要

### 目的
- 日常生活データ（体重、運動、時間管理等）をAIで分析
- 個人最適化された改善提案を毎日提供
- 複数データソースの相関分析による深い洞察の提供

### 現在の実装状況
**v0.34時点**: 体重データ分析機能が完成（ミニマムViableProduct）

## 🚀 クイックスタート

### 1. 起動方法
```bash
cd "C:\Users\user\Desktop\work\90_cc\20250815\ai-life-improvement-system"
python -m http.server 8000
```

### 2. ブラウザでアクセス
```
http://localhost:8000/weight_analyzer_v0.34.html
```

### 3. 基本操作
1. **Googleでログイン** - Firebase認証でユーザー別データ管理
2. **体重データを取得** - 実際のFirebaseデータを取得
3. **デモデータで動作確認** - テスト用データで機能確認
4. **機械学習分析実行** - トレンド分析とAI改善提案

## 📊 主要機能

### 体重データ分析
- **基本統計**: 平均体重、最大/最小体重、変動幅、測定回数
- **視覚化**: 
  - 体重推移グラフ（線グラフ）
  - 曜日別平均体重（棒グラフ）
  - Y軸動的スケール調整（微細な変化も視認可能）

### 機械学習分析
- **線形回帰**: 体重変化トレンドの定量分析
- **予測機能**: 7日後の体重予測
- **精度評価**: R²決定係数による予測精度表示

### AI改善提案
- トレンド分析に基づく個別化された改善提案
- 測定頻度の最適化提案
- 生活習慣改善アドバイス

## 🔧 技術仕様

### アーキテクチャ
```
Frontend: HTML5 + CSS3 + JavaScript (ES6)
Backend: Firebase Realtime Database (v8 SDK)
認証: Google OAuth 2.0
分析: JavaScript線形回帰実装
可視化: Chart.js
```

### Firebase設定
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
    authDomain: "shares-b1b97.firebaseapp.com",
    databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
    projectId: "shares-b1b97",
    storageBucket: "shares-b1b97.firebasestorage.app",
    messagingSenderId: "38311063248",
    appId: "1:38311063248:web:0d2d5726d12b305b24b8d5"
};
```

### データ構造
```
users/
  └─ {uid}/
      └─ weights/
          ├─ {recordId}/
          │   ├─ date: "2025-08-15"
          │   ├─ time: "08:00"
          │   ├─ weight: "71.5"
          │   ├─ timing: "morning"
          │   └─ memo: "メモ"
          └─ ...
```

## 🗂️ ファイル構成

```
ai-life-improvement-system/
├── weight_analyzer_v0.34.html     # 最新版メインファイル
├── weight_analyzer_v0.33.html     # 安定版（バックアップ）
├── weight_analyzer_v0.32.html     # 旧版（参考用）
├── README.md                      # このファイル
└── 開発履歴/
    ├── v0.01-v0.30.html          # 初期開発版群
    └── 各バージョンの変更ログ
```

## 📈 開発履歴

### v0.34 (2025-08-15) - 可視化改善版
- **Y軸スケール修正**: 動的最小値計算（最小体重-10kg、最低50kg）
- **視認性向上**: 71kgと72kgの違いが明確に見える
- **日付表示修正**: ソート機能の確認・修正

### v0.33 (2025-08-15) - 安定版
- **Firebase v8完全対応**: テンプレート準拠の実装
- **ユーザー別データパス**: `users/${uid}/weights`正式対応
- **全機能統合**: 認証・データ取得・分析・AI提案が完全動作

### v0.01-v0.32 (2025-08-15) - 開発過程
- Firebase SDK問題（v9→v8）の解決
- データパス問題（`weights`→`users/${uid}/weights`）の修正
- 認証・表示・分析機能の段階的実装

## 🔍 トラブルシューティング

### よくある問題

#### 1. Firebase認証エラー
```
症状: "認証に失敗しました"
原因: ポップアップブロック、ネットワーク問題
解決: ブラウザのポップアップ許可、再試行
```

#### 2. データ取得エラー
```
症状: "このユーザーの体重データが見つかりません"
原因: 初回ユーザー、データパス不一致
解決: デモデータボタンで動作確認
```

#### 3. グラフ表示問題
```
症状: グラフが表示されない
原因: Chart.js読み込み失敗、データ形式エラー
解決: ページリロード、コンソールエラー確認
```

### デバッグ方法
1. ブラウザ開発者ツール（F12）でコンソールログ確認
2. `window.loadDemoData()`でデモデータ強制読み込み
3. バージョンログ（`v0.34:`）でシステム動作確認

## 🎯 今後の拡張計画

### Phase 1: データソース拡張
- [ ] 運動データ連携（歩数、消費カロリー）
- [ ] 睡眠データ連携（睡眠時間、質）
- [ ] 食事データ連携（カロリー、栄養素）

### Phase 2: 分析強化
- [ ] 多変量解析（体重×運動×睡眠の相関）
- [ ] 時系列予測モデル（ARIMA、Neural Network）
- [ ] 異常検知（急激な変化の検出）

### Phase 3: 高度な機能
- [ ] Raspberry Pi映像解析連携
- [ ] 音声入力によるデータ記録
- [ ] PDF/Excel レポート自動生成
- [ ] LINE/Slack 通知連携

### Phase 4: AI機能強化
- [ ] Deep Learning モデル導入
- [ ] 個人特性学習（パーソナライゼーション）
- [ ] 予測精度向上（外部要因考慮）

## 💡 使用例・ユースケース

### 日常的な使用パターン
1. **朝の測定ルーチン**
   - 起床後に体重測定
   - システムでデータ確認
   - AIアドバイス確認

2. **週次レビュー**
   - 週間トレンド確認
   - 曜日別パターン分析
   - 改善計画調整

3. **月次詳細分析**
   - 機械学習分析実行
   - 予測精度評価
   - 長期目標見直し

### 応用事例
- **ダイエット管理**: 体重減少トレンドの科学的管理
- **健康維持**: 安定した体重管理のサポート
- **医療連携**: 定量的データの医師への提供

## 🛠️ 開発者向け情報

### コードの主要部分

#### Firebase認証
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
const result = await auth.signInWithPopup(provider);
```

#### データ取得
```javascript
const userRef = database.ref(`users/${userData.uid}/weights`);
const snapshot = await userRef.once('value');
```

#### 線形回帰分析
```javascript
const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;
const r2 = 1 - (residualSumSquares / totalSumSquares);
```

#### Y軸動的スケール
```javascript
const minWeight = Math.min(...weights);
const yAxisMin = Math.max(50, Math.floor(minWeight - 10));
```

### カスタマイズポイント
1. **Firebase設定**: 独自のFirebaseプロジェクト設定
2. **デザイン**: CSS変数でカラーテーマ変更
3. **分析ロジック**: `calculateTrend()`関数のカスタマイズ
4. **AI提案**: `generateInsights()`関数の改良

## 📝 ライセンス・クレジット

- **開発**: Claude Code with Human collaboration
- **UI Framework**: Custom CSS3 + Chart.js
- **Backend**: Firebase (Google)
- **ライセンス**: プロジェクト専用（商用利用の場合は相談）

## 📞 サポート・問い合わせ

- **バグ報告**: GitHubアドミン または 開発チーム
- **機能要望**: 仕様書レビュー後に実装検討
- **技術相談**: 開発履歴とコード参照後に質問

---

## 📚 参考資料

### 技術ドキュメント
- [Firebase Realtime Database v8 Documentation](https://firebase.google.com/docs/database/web/start)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

### 開発プロセス
- [テンプレート準拠開発法](../20250810/0000-00-00-project-template-clone/)
- [エラー解決履歴](../20250812/oops-yarakashi/20250815-091715-firebase-template-ignore.md)
- [バージョン管理規則](./development-log/)

---

**最終更新**: 2025-08-15 v0.34
**次回更新予定**: データソース拡張後（Phase 1完了時）