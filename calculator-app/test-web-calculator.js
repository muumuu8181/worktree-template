import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// テストケース定義
const testCases = [
    { name: "基本加算", input: ["1", "+", "5", "="], expected: "6" },
    { name: "基本減算", input: ["1", "0", "-", "3", "="], expected: "7" },
    { name: "基本乗算", input: ["4", "×", "3", "="], expected: "12" },
    { name: "基本除算", input: ["2", "0", "÷", "4", "="], expected: "5" },
    { name: "小数計算", input: ["3", ".", "5", "+", "1", ".", "5", "="], expected: "5" },
    { name: "連続計算", input: ["5", "+", "3", "=", "+", "2", "="], expected: "10" },
    { name: "クリア機能", input: ["9", "9", "9", "C"], expected: "0" },
    { name: "削除機能", input: ["1", "2", "3", "⌫"], expected: "12" },
    { name: "ゼロ除算", input: ["5", "÷", "0", "="], expected: "Error" },
    { name: "大きな数値", input: ["9", "9", "9", "9", "9", "9", "+", "1", "="], expected: "1000000" }
];

async function runTests() {
    console.log('🧮 電卓Webアプリ自動テスト開始\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // コンソールログを出力
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('❌ ブラウザエラー:', msg.text());
        }
    });
    
    try {
        // GitHub PagesのURLを使用
        const url = 'https://muumuu8181.github.io/published-apps/calculator-app/';
        console.log(`📍 テスト対象URL: ${url}\n`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // ページが正しく読み込まれたか確認
        const title = await page.title();
        console.log(`📄 ページタイトル: ${title}\n`);
        
        let passedTests = 0;
        let failedTests = 0;
        
        // 各テストケースを実行
        for (const testCase of testCases) {
            console.log(`🧪 テスト: ${testCase.name}`);
            
            // クリアボタンをクリックして初期化
            const clearButton = await page.$('button:has-text("C")');
            if (clearButton) {
                await clearButton.click();
                await page.waitForTimeout(100);
            }
            
            // 入力を実行
            for (const input of testCase.input) {
                // ボタンのテキストでセレクタを作成
                const button = await page.evaluateHandle((text) => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(btn => btn.textContent.trim() === text);
                }, input);
                
                if (button && button.asElement()) {
                    await button.asElement().click();
                    await page.waitForTimeout(50);
                } else {
                    console.log(`  ⚠️  ボタン "${input}" が見つかりません`);
                }
            }
            
            // 結果を取得
            const result = await page.$eval('.display', el => el.textContent.trim());
            
            // 結果を検証
            if (result === testCase.expected) {
                console.log(`  ✅ 成功: ${result}`);
                passedTests++;
            } else {
                console.log(`  ❌ 失敗: 期待値 "${testCase.expected}", 実際 "${result}"`);
                failedTests++;
            }
            
            console.log('');
        }
        
        // テーマ切り替えテスト
        console.log('🎨 テーマ切り替えテスト');
        const themeButton = await page.$('button:has-text("🌓")');
        if (themeButton) {
            await themeButton.click();
            await page.waitForTimeout(500);
            
            const isDarkMode = await page.evaluate(() => {
                return document.body.classList.contains('dark-mode');
            });
            
            console.log(`  ${isDarkMode ? '✅' : '❌'} テーマ切り替え機能\n`);
            if (!isDarkMode) failedTests++;
            else passedTests++;
        }
        
        // 履歴機能テスト
        console.log('📋 履歴機能テスト');
        const historyItems = await page.$$('.history-item');
        if (historyItems.length > 0) {
            console.log(`  ✅ 履歴アイテム数: ${historyItems.length}`);
            passedTests++;
        } else {
            console.log(`  ❌ 履歴が記録されていません`);
            failedTests++;
        }
        
        // ダウンロードボタンの存在確認
        const downloadButton = await page.$('button:has-text("Download History")');
        if (downloadButton) {
            console.log(`  ✅ ダウンロードボタンが存在\n`);
            passedTests++;
        } else {
            console.log(`  ❌ ダウンロードボタンが見つかりません\n`);
            failedTests++;
        }
        
        // テスト結果サマリー
        console.log('📊 テスト結果サマリー');
        console.log('='.repeat(40));
        console.log(`合計テスト数: ${passedTests + failedTests}`);
        console.log(`✅ 成功: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`成功率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
        
        // スクリーンショットを保存
        const screenshotPath = join(__dirname, 'test-screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n📸 スクリーンショット保存: ${screenshotPath}`);
        
    } catch (error) {
        console.error('🚨 テスト実行エラー:', error);
    } finally {
        await browser.close();
    }
}

// Puppeteerが利用できない場合の簡易テスト
async function runSimpleTest() {
    console.log('🧮 電卓Webアプリ簡易動作確認\n');
    
    try {
        const response = await fetch('https://muumuu8181.github.io/published-apps/calculator-app/');
        const html = await response.text();
        
        console.log('📋 ページ要素チェック:');
        console.log(`  ${html.includes('Calculator') ? '✅' : '❌'} タイトル要素`);
        console.log(`  ${html.includes('display') ? '✅' : '❌'} ディスプレイ要素`);
        console.log(`  ${html.includes('button') ? '✅' : '❌'} ボタン要素`);
        console.log(`  ${html.includes('history') ? '✅' : '❌'} 履歴要素`);
        console.log(`  ${html.includes('Download History') ? '✅' : '❌'} ダウンロード機能`);
        console.log(`  ${html.includes('🌓') ? '✅' : '❌'} テーマ切替機能`);
        
        console.log('\n📐 レスポンシブデザインチェック:');
        console.log(`  ${html.includes('viewport') ? '✅' : '❌'} ビューポート設定`);
        console.log(`  ${html.includes('media') ? '✅' : '❌'} メディアクエリ`);
        
        console.log(`\n📊 HTTPステータス: ${response.status} ${response.statusText}`);
        
    } catch (error) {
        console.error('🚨 簡易テストエラー:', error);
    }
}

// Puppeteerのインストール確認
try {
    await runTests();
} catch (error) {
    console.log('⚠️  Puppeteerが利用できないため、簡易テストを実行します\n');
    await runSimpleTest();
}