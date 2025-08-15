#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
体重管理データ機械学習分析システム
Firebase Realtime Databaseから体重データを取得し、機械学習で分析・改善提案を生成
"""

import json
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

class WeightAnalysisSystem:
    def __init__(self, firebase_url="https://shares-b1b97-default-rtdb.firebaseio.com"):
        """
        初期化
        Args:
            firebase_url: Firebase Realtime DatabaseのURL
        """
        self.firebase_url = firebase_url
        self.data = None
        self.df = None
        self.model = None
        self.scaler = StandardScaler()
        
        # 日本語フォント設定
        plt.rcParams['font.family'] = ['DejaVu Sans', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Noto Sans CJK JP']
        
    def fetch_weight_data(self, collection="weights"):
        """
        Firebaseから体重データを取得
        Args:
            collection: データコレクション名
        Returns:
            取得したデータ
        """
        try:
            url = f"{self.firebase_url}/{collection}.json"
            response = requests.get(url)
            
            if response.status_code == 200:
                self.data = response.json()
                print(f"データ取得成功: {len(self.data) if self.data else 0}件")
                return self.data
            else:
                print(f"データ取得失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"エラー: {e}")
            return None
    
    def preprocess_data(self):
        """
        データの前処理・DataFrame変換
        """
        if not self.data:
            print("データが存在しません")
            return None
            
        records = []
        for key, value in self.data.items():
            if isinstance(value, dict):
                record = value.copy()
                record['id'] = key
                records.append(record)
        
        if not records:
            print("有効なレコードがありません")
            return None
            
        self.df = pd.DataFrame(records)
        
        # 日付・時刻処理
        if 'date' in self.df.columns and 'time' in self.df.columns:
            self.df['datetime'] = pd.to_datetime(self.df['date'] + ' ' + self.df['time'])
        elif 'timestamp' in self.df.columns:
            self.df['datetime'] = pd.to_datetime(self.df['timestamp'], unit='ms')
        
        # 体重データの数値変換
        if 'weight' in self.df.columns:
            self.df['weight'] = pd.to_numeric(self.df['weight'], errors='coerce')
        
        # ソート
        self.df = self.df.sort_values('datetime').reset_index(drop=True)
        
        # 特徴量エンジニアリング
        self.df['day_of_week'] = self.df['datetime'].dt.dayofweek
        self.df['hour'] = self.df['datetime'].dt.hour
        self.df['days_from_start'] = (self.df['datetime'] - self.df['datetime'].min()).dt.days
        
        print(f"データ前処理完了: {len(self.df)}レコード")
        print(f"期間: {self.df['datetime'].min()} - {self.df['datetime'].max()}")
        
        return self.df
    
    def basic_analysis(self):
        """
        基本統計分析
        """
        if self.df is None or self.df.empty:
            print("❌ 分析対象データがありません")
            return
        
        print("\n=== 📊 基本統計分析 ===")
        print(f"記録期間: {(self.df['datetime'].max() - self.df['datetime'].min()).days}日間")
        print(f"記録回数: {len(self.df)}回")
        print(f"平均体重: {self.df['weight'].mean():.1f}kg")
        print(f"最大体重: {self.df['weight'].max():.1f}kg")
        print(f"最小体重: {self.df['weight'].min():.1f}kg")
        print(f"体重変動: {self.df['weight'].max() - self.df['weight'].min():.1f}kg")
        
        # 曜日別分析
        if 'day_of_week' in self.df.columns:
            weekday_avg = self.df.groupby('day_of_week')['weight'].mean()
            print(f"\n📅 曜日別平均体重:")
            weekdays = ['月', '火', '水', '木', '金', '土', '日']
            for i, avg in weekday_avg.items():
                print(f"  {weekdays[i]}: {avg:.1f}kg")
        
        # 測定タイミング別分析
        if 'timing' in self.df.columns:
            timing_avg = self.df.groupby('timing')['weight'].mean()
            print(f"\n⏰ 測定タイミング別平均体重:")
            for timing, avg in timing_avg.items():
                print(f"  {timing}: {avg:.1f}kg")
    
    def trend_analysis(self):
        """
        トレンド分析・予測モデル
        """
        if self.df is None or len(self.df) < 5:
            print("❌ トレンド分析には最低5レコード必要です")
            return
        
        print("\n=== 📈 トレンド分析 ===")
        
        # 特徴量準備
        features = ['days_from_start', 'day_of_week', 'hour']
        available_features = [f for f in features if f in self.df.columns]
        
        if not available_features:
            print("❌ 分析用特徴量が不足しています")
            return
        
        X = self.df[available_features].fillna(0)
        y = self.df['weight'].fillna(self.df['weight'].mean())
        
        # モデル学習
        if len(X) >= 10:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        else:
            X_train, y_train = X, y
            X_test, y_test = X, y
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.model = LinearRegression()
        self.model.fit(X_train_scaled, y_train)
        
        # 予測・評価
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"✅ モデル精度 (R²): {r2:.3f}")
        print(f"✅ 予測誤差 (RMSE): {np.sqrt(mse):.2f}kg")
        
        # 今後の予測
        self.future_prediction()
        
        return self.model
    
    def future_prediction(self, days_ahead=7):
        """
        未来の体重予測
        Args:
            days_ahead: 予測日数
        """
        if self.model is None:
            print("❌ 予測モデルが学習されていません")
            return
        
        print(f"\n🔮 {days_ahead}日後までの予測:")
        
        last_date = self.df['datetime'].max()
        current_weight = self.df['weight'].iloc[-1]
        
        for i in range(1, days_ahead + 1):
            future_date = last_date + timedelta(days=i)
            days_from_start = (future_date - self.df['datetime'].min()).days
            
            # 特徴量作成
            features = [days_from_start, future_date.weekday(), 8]  # 朝8時想定
            features_scaled = self.scaler.transform([features])
            
            predicted_weight = self.model.predict(features_scaled)[0]
            weight_change = predicted_weight - current_weight
            
            print(f"  {future_date.strftime('%Y-%m-%d')}: {predicted_weight:.1f}kg "
                  f"({weight_change:+.1f}kg)")
    
    def generate_insights(self):
        """
        AI改善提案生成
        """
        if self.df is None or self.df.empty:
            print("❌ 分析データがありません")
            return
        
        print("\n=== 🤖 AI改善提案 ===")
        
        insights = []
        
        # 体重変化傾向
        recent_data = self.df.tail(10)
        if len(recent_data) >= 2:
            weight_trend = recent_data['weight'].iloc[-1] - recent_data['weight'].iloc[0]
            if weight_trend > 0.5:
                insights.append("⚠️ 最近体重が増加傾向です。食事内容や運動量を見直しましょう")
            elif weight_trend < -0.5:
                insights.append("📉 体重減少が順調です。現在のペースを維持しましょう")
            else:
                insights.append("📊 体重は安定しています。健康的な状態です")
        
        # 曜日パターン分析
        if 'day_of_week' in self.df.columns and len(self.df) >= 14:
            weekday_avg = self.df.groupby('day_of_week')['weight'].mean()
            max_day = weekday_avg.idxmax()
            min_day = weekday_avg.idxmin()
            
            weekdays = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']
            insights.append(f"📅 {weekdays[max_day]}に体重が最も重く、{weekdays[min_day]}に最も軽い傾向があります")
        
        # 測定頻度分析
        total_days = (self.df['datetime'].max() - self.df['datetime'].min()).days
        if total_days > 0:
            measurement_frequency = len(self.df) / total_days
            if measurement_frequency < 0.5:
                insights.append("📝 測定頻度を上げることで、より正確な体重管理が可能になります")
            elif measurement_frequency > 2:
                insights.append("📊 測定頻度が高く、詳細な体重変化を把握できています")
        
        # 時間帯分析
        if 'hour' in self.df.columns:
            morning_data = self.df[self.df['hour'] < 10]
            evening_data = self.df[self.df['hour'] > 18]
            
            if len(morning_data) > len(evening_data):
                insights.append("🌅 朝の測定が多く、一日の始まりの体重管理ができています")
            else:
                insights.append("🌙 夜の測定が多いです。朝の測定も追加すると傾向がより分かりやすくなります")
        
        # 提案表示
        for i, insight in enumerate(insights, 1):
            print(f"{i}. {insight}")
        
        return insights
    
    def create_visualization(self, save_path="weight_analysis.png"):
        """
        可視化グラフ作成
        Args:
            save_path: 保存パス
        """
        if self.df is None or self.df.empty:
            print("❌ 可視化対象データがありません")
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('体重管理分析レポート', fontsize=16)
        
        # 1. 体重推移
        axes[0, 0].plot(self.df['datetime'], self.df['weight'], marker='o', linewidth=2)
        axes[0, 0].set_title('体重推移')
        axes[0, 0].set_xlabel('日付')
        axes[0, 0].set_ylabel('体重 (kg)')
        axes[0, 0].grid(True, alpha=0.3)
        
        # 2. 曜日別体重分布
        if 'day_of_week' in self.df.columns:
            weekday_labels = ['月', '火', '水', '木', '金', '土', '日']
            weekday_avg = self.df.groupby('day_of_week')['weight'].mean()
            axes[0, 1].bar(range(7), [weekday_avg.get(i, 0) for i in range(7)])
            axes[0, 1].set_title('曜日別平均体重')
            axes[0, 1].set_xlabel('曜日')
            axes[0, 1].set_ylabel('平均体重 (kg)')
            axes[0, 1].set_xticks(range(7))
            axes[0, 1].set_xticklabels(weekday_labels)
        
        # 3. 体重分布ヒストグラム
        axes[1, 0].hist(self.df['weight'], bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        axes[1, 0].set_title('体重分布')
        axes[1, 0].set_xlabel('体重 (kg)')
        axes[1, 0].set_ylabel('頻度')
        axes[1, 0].axvline(self.df['weight'].mean(), color='red', linestyle='--', label=f'平均: {self.df["weight"].mean():.1f}kg')
        axes[1, 0].legend()
        
        # 4. 測定タイミング別分布
        if 'timing' in self.df.columns and self.df['timing'].notna().any():
            timing_counts = self.df['timing'].value_counts()
            axes[1, 1].pie(timing_counts.values, labels=timing_counts.index, autopct='%1.1f%%')
            axes[1, 1].set_title('測定タイミング分布')
        else:
            axes[1, 1].text(0.5, 0.5, 'タイミングデータなし', ha='center', va='center', transform=axes[1, 1].transAxes)
            axes[1, 1].set_title('測定タイミング分布')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"✅ グラフを保存しました: {save_path}")
        
        return fig
    
    def run_full_analysis(self):
        """
        完全分析実行
        """
        print("体重管理データ分析を開始します...")
        
        # 1. データ取得
        if not self.fetch_weight_data():
            return
        
        # 2. 前処理
        if self.preprocess_data() is None:
            return
        
        # 3. 基本分析
        self.basic_analysis()
        
        # 4. トレンド分析
        self.trend_analysis()
        
        # 5. 改善提案
        self.generate_insights()
        
        # 6. 可視化
        self.create_visualization()
        
        print("\n分析完了!")

def main():
    """
    メイン実行関数
    """
    analyzer = WeightAnalysisSystem()
    analyzer.run_full_analysis()

if __name__ == "__main__":
    main()