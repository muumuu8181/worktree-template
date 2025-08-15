#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ローカル開発サーバー起動スクリプト
Firebase認証のドメイン問題を回避するためHTTPサーバーで実行
"""

import http.server
import socketserver
import webbrowser
import os

def start_server():
    port = 8080
    handler = http.server.SimpleHTTPRequestHandler
    
    # カレントディレクトリを変更
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer(("localhost", port), handler) as httpd:
            print(f"ローカルサーバー起動: http://localhost:{port}")
            print(f"提供ディレクトリ: {os.getcwd()}")
            print("ブラウザを自動で開きます...")
            print("終了するには Ctrl+C を押してください")
            
            # ブラウザを自動で開く
            webbrowser.open(f"http://localhost:{port}/weight_ml_analyzer.html")
            
            # サーバー開始
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\nサーバーを停止しました")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"ポート {port} は既に使用中です")
            print("別のポートで再試行...")
            start_server_on_port(port + 1)
        else:
            print(f"サーバー起動エラー: {e}")

def start_server_on_port(port):
    handler = http.server.SimpleHTTPRequestHandler
    try:
        with socketserver.TCPServer(("localhost", port), handler) as httpd:
            print(f"ローカルサーバー起動: http://localhost:{port}")
            webbrowser.open(f"http://localhost:{port}/weight_ml_analyzer.html")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを停止しました")
    except OSError:
        print(f"ポート {port} も使用中です。手動でポートを指定してください")

if __name__ == "__main__":
    start_server()