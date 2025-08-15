#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
簡易体重分析システム
"""

import json
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def fetch_weight_data():
    """Firebaseから体重データを取得"""
    try:
        url = "https://shares-b1b97-default-rtdb.firebaseio.com/weights.json"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"データ取得成功: {len(data) if data else 0}件")
            return data
        else:
            print(f"データ取得失敗: {response.status_code}")
            return None
    except Exception as e:
        print(f"エラー: {e}")
        return None

def analyze_data(data):
    """基本分析"""
    if not data:
        print("分析対象データがありません")
        return
    
    records = []
    for key, value in data.items():
        if isinstance(value, dict):
            record = value.copy()
            record['id'] = key
            records.append(record)
    
    if not records:
        print("有効なレコードがありません")
        return
    
    df = pd.DataFrame(records)
    
    print("\n=== 基本統計 ===")
    print(f"記録数: {len(df)}")
    
    if 'weight' in df.columns:
        df['weight'] = pd.to_numeric(df['weight'], errors='coerce')
        print(f"平均体重: {df['weight'].mean():.1f}kg")
        print(f"最大体重: {df['weight'].max():.1f}kg")
        print(f"最小体重: {df['weight'].min():.1f}kg")
        print(f"体重範囲: {df['weight'].max() - df['weight'].min():.1f}kg")
    
    if 'date' in df.columns:
        dates = pd.to_datetime(df['date'], errors='coerce')
        print(f"記録期間: {dates.min()} - {dates.max()}")
    
    print("\n=== データサンプル ===")
    print(df.head())
    
    return df

def main():
    print("体重データ分析を開始...")
    
    # データ取得
    data = fetch_weight_data()
    
    # 分析
    df = analyze_data(data)
    
    print("\n分析完了!")

if __name__ == "__main__":
    main()