// 🔄 Step 2: ユーティリティ関数分離
const DataUtils = {
    // スケール別データ集約
    aggregateDataByScale(data, scale) {
        // Step 2 ログ出力
        if (typeof MigrationLog !== 'undefined') {
            MigrationLog.log(2, 'データ集約実行', {
                scale: scale,
                dataCount: data.length,
                source: 'utils/helpers.js'
            });
        }
        
        // エラーデータを除外
        const validData = data.filter(d => !isNaN(parseFloat(d.weight)));
        
        if (scale === 'hour') {
            // 時間別 - 日付+時間でグループ化
            const grouped = {};
            validData.forEach(d => {
                const key = `${d.date} ${d.time || '00:00'}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(parseFloat(d.weight));
            });
            
            return Object.keys(grouped).sort().map(key => {
                const weights = grouped[key];
                return {
                    label: key,
                    min: Math.min(...weights),
                    max: Math.max(...weights),
                    avg: weights.reduce((a, b) => a + b, 0) / weights.length,
                    count: weights.length
                };
            });
        }
        
        if (scale === 'day') {
            // 日別 - 日付でグループ化
            const grouped = {};
            validData.forEach(d => {
                const key = d.date;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(parseFloat(d.weight));
            });
            
            return Object.keys(grouped).sort().map(key => {
                const weights = grouped[key];
                return {
                    label: key,
                    min: Math.min(...weights),
                    max: Math.max(...weights),
                    avg: weights.reduce((a, b) => a + b, 0) / weights.length,
                    count: weights.length
                };
            });
        }
        
        if (scale === 'week') {
            // 週別 - 週の開始日でグループ化
            const grouped = {};
            validData.forEach(d => {
                const date = new Date(d.date);
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                const key = weekStart.toISOString().split('T')[0];
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(parseFloat(d.weight));
            });
            
            return Object.keys(grouped).sort().map(key => {
                const weights = grouped[key];
                return {
                    label: `${key}週`,
                    min: Math.min(...weights),
                    max: Math.max(...weights),
                    avg: weights.reduce((a, b) => a + b, 0) / weights.length,
                    count: weights.length
                };
            });
        }
        
        if (scale === 'month') {
            // 月別 - 年月でグループ化
            const grouped = {};
            validData.forEach(d => {
                const date = new Date(d.date);
                const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(parseFloat(d.weight));
            });
            
            return Object.keys(grouped).sort().map(key => {
                const weights = grouped[key];
                return {
                    label: `${key}月`,
                    min: Math.min(...weights),
                    max: Math.max(...weights),
                    avg: weights.reduce((a, b) => a + b, 0) / weights.length,
                    count: weights.length
                };
            });
        }
        
        return [];
    },
    
    // トレンド計算（線形回帰）
    calculateTrend(weights) {
        // Step 2 ログ出力
        if (typeof MigrationLog !== 'undefined') {
            MigrationLog.log(2, 'トレンド計算実行', {
                weightCount: weights.length,
                source: 'utils/helpers.js'
            });
        }
        
        const n = weights.length;
        const x = Array.from({length: n}, (_, i) => i);
        const y = weights;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const yMean = sumY / n;
        const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        const residualSumSquares = y.reduce((sum, yi, i) => {
            const predicted = slope * x[i] + intercept;
            return sum + Math.pow(yi - predicted, 2);
        }, 0);
        const r2 = 1 - (residualSumSquares / totalSumSquares);
        
        const direction = slope > 0.05 ? '増加傾向' : slope < -0.05 ? '減少傾向' : '安定';
        const prediction = slope * (n + 7) + intercept;
        const change = prediction - weights[weights.length - 1];
        
        return {
            direction,
            rate: slope,
            accuracy: Math.round(r2 * 100),
            prediction,
            change
        };
    },
    
    // AI改善提案生成
    generateInsights(data, trend) {
        // Step 2 ログ出力
        if (typeof MigrationLog !== 'undefined') {
            MigrationLog.log(2, '改善提案生成', {
                dataCount: data.length,
                trendDirection: trend.direction,
                source: 'utils/helpers.js'
            });
        }
        
        const insights = [];
        
        if (trend.direction === '増加傾向') {
            insights.push('体重が増加傾向にあります。食事内容の見直しや運動量の増加を検討しましょう');
            insights.push('カロリー摂取量の記録を開始することをお勧めします');
        } else if (trend.direction === '減少傾向') {
            insights.push('体重減少が順調です。現在の生活習慣を維持しましょう');
            insights.push('筋力維持のための適度な運動も併せて行いましょう');
        } else {
            insights.push('体重は安定しています。健康的な状態を維持できています');
        }
        
        const uniqueDates = new Set(data.map(d => d.date)).size;
        const totalDays = Math.ceil((new Date() - new Date(data[0].date)) / (1000 * 60 * 60 * 24));
        const frequency = uniqueDates / totalDays;
        
        if (frequency < 0.5) {
            insights.push('測定頻度を上げることで、より正確な体重管理が可能になります');
        }
        
        return insights;
    }
};

// グローバル公開（後方互換性のため）
window.DataUtils = DataUtils;

console.log('🔄 [Step2] utils/helpers.js ロード完了');