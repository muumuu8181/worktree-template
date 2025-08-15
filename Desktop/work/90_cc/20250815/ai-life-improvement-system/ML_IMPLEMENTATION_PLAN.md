# LifeLog AI分析システム 機械学習実装構想

## 📊 概要

体重・食事・運動データ間の相関関係分析に特化した機械学習システムの実装計画

### 🎯 目標
- **体重と食事の相関関係分析**: カロリー摂取量、栄養バランスと体重変化の関係性を解析
- **体重と運動の相関関係分析**: 運動種類、頻度、消費カロリーと体重変化の関係性を解析
- **多変量相関分析**: 体重・食事・運動の3要素の複合的な関係性を解析

### ❌ 実装しない機能
- 異常値検出（ユーザーが不要と判断）
- タイミング最適化機能
- 単純な体重予測モデル

## 🏗️ アーキテクチャ設計

### データ構造設計

```javascript
// Firebase Realtime Database構造
users/{uid}/
├── weights/          // 既存の体重データ
│   ├── {recordId}/
│   │   ├── date: "2025-08-15"
│   │   ├── time: "08:00"
│   │   ├── weight: "71.5"
│   │   ├── timing: "morning"
│   │   └── memo: "メモ"
│   └── ...
├── meals/            // 食事データ（新規実装）
│   ├── {recordId}/
│   │   ├── date: "2025-08-15"
│   │   ├── time: "12:30"
│   │   ├── type: "lunch"        // breakfast, lunch, dinner, snack
│   │   ├── calories: 650
│   │   ├── carbs: 80           // 炭水化物 (g)
│   │   ├── protein: 25         // タンパク質 (g)
│   │   ├── fat: 20             // 脂質 (g)
│   │   ├── fiber: 8            // 食物繊維 (g)
│   │   └── memo: "外食ランチ"
│   └── ...
└── exercises/        // 運動データ（新規実装）
    ├── {recordId}/
    │   ├── date: "2025-08-15"
    │   ├── time: "19:00"
    │   ├── type: "cardio"      // cardio, strength, flexibility, sports
    │   ├── activity: "running" // 具体的な運動名
    │   ├── duration: 30        // 分
    │   ├── calories: 250       // 消費カロリー
    │   ├── intensity: "medium" // low, medium, high
    │   └── memo: "公園でジョギング"
    └── ...
```

## 🔬 相関分析アルゴリズム

### 1. 基本相関分析

```javascript
// ピアソン相関係数による基本相関
function calculateCorrelation(weightData, targetData, metric) {
    // 同じ日付のデータを結合
    const pairedData = alignDataByDate(weightData, targetData);
    
    // ピアソン相関係数計算
    const correlation = pearsonCorrelation(
        pairedData.map(d => d.weight),
        pairedData.map(d => d[metric])
    );
    
    return {
        correlation: correlation,
        significance: calculatePValue(correlation, pairedData.length),
        dataPoints: pairedData.length
    };
}
```

### 2. 多変量相関分析

```javascript
// 体重・食事・運動の3次元相関
function multiVariateAnalysis(weightData, mealData, exerciseData) {
    const features = [
        'daily_calories',    // 日別総カロリー
        'daily_carbs',       // 日別炭水化物
        'daily_protein',     // 日別タンパク質
        'daily_fat',         // 日別脂質
        'exercise_calories', // 日別消費カロリー
        'exercise_duration', // 日別運動時間
        'weight_change'      // 前日からの体重変化
    ];
    
    // 相関行列の計算
    const correlationMatrix = calculateCorrelationMatrix(features);
    
    // 主成分分析（PCA）による次元削減
    const pcaResult = performPCA(correlationMatrix);
    
    return {
        correlations: correlationMatrix,
        principalComponents: pcaResult,
        featureImportance: calculateFeatureImportance(pcaResult)
    };
}
```

### 3. 時系列相関分析

```javascript
// ラグ相関分析（運動/食事の効果が体重に現れるまでの遅延を分析）
function lagCorrelationAnalysis(weightData, factorData, maxLag = 7) {
    const lagCorrelations = [];
    
    for (let lag = 0; lag <= maxLag; lag++) {
        const shiftedFactorData = shiftData(factorData, lag);
        const correlation = calculateCorrelation(weightData, shiftedFactorData);
        
        lagCorrelations.push({
            lag: lag,
            correlation: correlation.correlation,
            significance: correlation.significance
        });
    }
    
    // 最も強い相関を示すラグを特定
    const optimalLag = lagCorrelations.reduce((max, current) => 
        Math.abs(current.correlation) > Math.abs(max.correlation) ? current : max
    );
    
    return {
        lagAnalysis: lagCorrelations,
        optimalLag: optimalLag,
        interpretation: interpretLagResult(optimalLag)
    };
}
```

## 📈 実装フェーズ

### Phase 1: データ収集基盤（2週間）
1. **食事データ入力UI**: シンプルな食事記録フォーム
2. **運動データ入力UI**: 運動記録フォーム
3. **Firebase実装**: 新しいデータ構造の実装
4. **データ検証**: 入力値の妥当性チェック

### Phase 2: 基本相関分析（2週間）
1. **単変量相関**: 体重 vs カロリー、体重 vs 運動時間
2. **可視化**: 散布図、相関係数表示
3. **統計的有意性**: p値計算、信頼区間
4. **結果解釈**: 相関の強さの日本語説明

### Phase 3: 高度な分析（3週間）
1. **多変量相関分析**: 複数要素の同時分析
2. **時系列ラグ分析**: 効果の遅延分析
3. **主成分分析**: 重要な要素の特定
4. **クラスタリング**: 行動パターンのグループ化

### Phase 4: AI提案システム（2週間）
1. **相関ベース提案**: 強い相関関係に基づくアドバイス
2. **個別化**: ユーザー固有のパターン学習
3. **動的更新**: データ蓄積による提案精度向上
4. **説明可能AI**: 提案理由の明確な説明

## 🧮 技術仕様

### フロントエンド分析ライブラリ
```javascript
// 統計計算ライブラリ（軽量実装）
class CorrelationAnalyzer {
    constructor() {
        this.weightData = [];
        this.mealData = [];
        this.exerciseData = [];
    }
    
    // ピアソン相関係数
    pearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    // スピアマン順位相関（非線形関係の検出）
    spearmanCorrelation(x, y) {
        const rankX = this.getRanks(x);
        const rankY = this.getRanks(y);
        return this.pearsonCorrelation(rankX, rankY);
    }
    
    // データアライメント（日付ベース）
    alignDataByDate(primaryData, secondaryData) {
        const aligned = [];
        primaryData.forEach(primary => {
            const secondary = secondaryData.find(s => s.date === primary.date);
            if (secondary) {
                aligned.push({
                    date: primary.date,
                    ...primary,
                    ...secondary
                });
            }
        });
        return aligned;
    }
}
```

### UI/UX設計

```html
<!-- 相関分析結果表示 -->
<div class="correlation-results">
    <h3>体重と食事の相関分析</h3>
    <div class="correlation-card">
        <div class="correlation-value">r = 0.73</div>
        <div class="correlation-strength">強い正の相関</div>
        <div class="correlation-interpretation">
            カロリー摂取量と体重増加に強い関係が見られます
        </div>
    </div>
    
    <h3>体重と運動の相関分析</h3>
    <div class="correlation-card">
        <div class="correlation-value">r = -0.58</div>
        <div class="correlation-strength">中程度の負の相関</div>
        <div class="correlation-interpretation">
            運動時間の増加は体重減少と関連しています
        </div>
    </div>
</div>
```

## 📊 可視化戦略

### 1. 散布図行列
```javascript
// 全変数間の相関を一覧表示
function createScatterplotMatrix(data) {
    const variables = ['weight', 'calories', 'exercise_time', 'protein', 'carbs'];
    const matrix = [];
    
    variables.forEach((varY, i) => {
        variables.forEach((varX, j) => {
            if (i !== j) {
                matrix.push({
                    x: data.map(d => d[varX]),
                    y: data.map(d => d[varY]),
                    correlation: calculateCorrelation(varX, varY),
                    position: {row: i, col: j}
                });
            }
        });
    });
    
    return matrix;
}
```

### 2. ヒートマップ
```javascript
// 相関係数のヒートマップ表示
function createCorrelationHeatmap(correlationMatrix) {
    return {
        type: 'heatmap',
        data: correlationMatrix,
        colorScale: [
            [-1, 'rgb(165,0,38)'],    // 強い負の相関
            [-0.5, 'rgb(215,48,39)'],
            [0, 'rgb(255,255,255)'],   // 無相関
            [0.5, 'rgb(69,117,180)'],
            [1, 'rgb(49,54,149)']      // 強い正の相関
        ]
    };
}
```

### 3. 時系列プロット
```javascript
// 体重・食事・運動の時系列表示
function createTimeSeriesPlot(weightData, mealData, exerciseData) {
    return {
        type: 'line',
        data: {
            datasets: [
                {
                    label: '体重 (kg)',
                    data: weightData,
                    yAxisID: 'weight'
                },
                {
                    label: 'カロリー (kcal)',
                    data: mealData.map(d => d.calories),
                    yAxisID: 'calories'
                },
                {
                    label: '運動時間 (分)',
                    data: exerciseData.map(d => d.duration),
                    yAxisID: 'exercise'
                }
            ]
        },
        options: {
            scales: {
                weight: { type: 'linear', position: 'left' },
                calories: { type: 'linear', position: 'right' },
                exercise: { type: 'linear', position: 'right' }
            }
        }
    };
}
```

## 🎯 具体的な分析例

### シナリオ1: 炭水化物摂取量と体重の関係
```javascript
// 炭水化物制限の効果を分析
function analyzeCarbsEffect(weightData, mealData) {
    const dailyCarbsIntake = aggregateDailyCarbs(mealData);
    const correlation = calculateCorrelation(weightData, dailyCarbsIntake, 'carbs');
    
    const insights = [];
    if (correlation.correlation > 0.5) {
        insights.push("炭水化物摂取量の増加は体重増加と強く関連しています");
        insights.push("炭水化物を1日50g減らすことで、週に約0.2kg の体重減少が期待できます");
    }
    
    return {
        correlation: correlation,
        insights: insights,
        recommendation: generateCarbsRecommendation(correlation)
    };
}
```

### シナリオ2: 運動強度と体重減少の関係
```javascript
// 運動強度別の効果分析
function analyzeExerciseIntensity(weightData, exerciseData) {
    const intensityGroups = groupByIntensity(exerciseData);
    const results = {};
    
    ['low', 'medium', 'high'].forEach(intensity => {
        const intensityData = intensityGroups[intensity];
        results[intensity] = {
            correlation: calculateCorrelation(weightData, intensityData, 'calories'),
            avgWeightLoss: calculateAverageWeightLoss(weightData, intensityData),
            frequency: intensityData.length
        };
    });
    
    return {
        intensityAnalysis: results,
        optimalIntensity: findOptimalIntensity(results),
        personalizedPlan: generateExercisePlan(results)
    };
}
```

## 🔮 AI提案生成システム

### 相関ベース提案エンジン
```javascript
class CorrelationBasedAdvisor {
    constructor(correlationResults) {
        this.correlations = correlationResults;
        this.thresholds = {
            strong: 0.7,
            moderate: 0.5,
            weak: 0.3
        };
    }
    
    generateAdvice() {
        const advice = [];
        
        // 食事関連の提案
        if (this.correlations.weight_calories > this.thresholds.strong) {
            advice.push({
                category: 'nutrition',
                priority: 'high',
                message: 'カロリー摂取量が体重に強く影響しています。1日のカロリーを200kcal減らすことをお勧めします。',
                evidence: `相関係数: ${this.correlations.weight_calories.toFixed(2)}`
            });
        }
        
        // 運動関連の提案
        if (this.correlations.weight_exercise < -this.thresholds.moderate) {
            advice.push({
                category: 'exercise',
                priority: 'medium',
                message: '運動が体重管理に効果的です。週3回、30分程度の運動を継続しましょう。',
                evidence: `相関係数: ${this.correlations.weight_exercise.toFixed(2)}`
            });
        }
        
        return advice.sort((a, b) => b.priority.localeCompare(a.priority));
    }
}
```

## 📝 まとめ

この機械学習実装構想は、単純な予測ではなく**データ間の関係性理解**に重点を置いています。

### 重要なポイント:
1. **説明可能性**: すべての分析結果に明確な根拠を提示
2. **個別化**: ユーザー固有のパターンを学習
3. **実用性**: 具体的で実行可能な提案を生成
4. **継続的改善**: データ蓄積による精度向上

### 期待される成果:
- 体重変化の要因を科学的に特定
- 個人に最適化された生活習慣改善案
- データに基づく確信度の高いアドバイス
- 長期的な健康管理の自動化

---

**開発開始予定**: Phase 1から順次実装
**完成目標**: 9週間後に基本機能完成
**継続的改善**: ユーザーデータ蓄積による機能強化