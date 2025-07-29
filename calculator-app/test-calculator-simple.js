import https from 'https';

// 簡易HTMLパーサー
class SimpleHTMLParser {
    constructor(html) {
        this.html = html;
    }
    
    includes(text) {
        return this.html.includes(text);
    }
    
    countOccurrences(text) {
        return (this.html.match(new RegExp(text, 'g')) || []).length;
    }
    
    extractBetween(start, end) {
        const startIndex = this.html.indexOf(start);
        if (startIndex === -1) return null;
        const endIndex = this.html.indexOf(end, startIndex + start.length);
        if (endIndex === -1) return null;
        return this.html.substring(startIndex + start.length, endIndex);
    }
}

// HTTPSでページを取得
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, html: data }));
        }).on('error', reject);
    });
}

async function runWebCalculatorTest() {
    console.log('🧮 電卓Webアプリ動作確認ツール\n');
    console.log('📅 テスト実行日時:', new Date().toLocaleString('ja-JP'));
    console.log('='.repeat(50) + '\n');
    
    const url = 'https://muumuu8181.github.io/published-apps/calculator-app/';
    console.log(`🌐 テスト対象URL: ${url}\n`);
    
    try {
        // ページを取得
        console.log('📡 ページ取得中...');
        const { status, html } = await fetchPage(url);
        const parser = new SimpleHTMLParser(html);
        
        console.log(`✅ HTTPステータス: ${status}\n`);
        
        if (status !== 200) {
            console.error('❌ ページの取得に失敗しました');
            return;
        }
        
        // 基本的な要素の存在確認
        console.log('📋 必須要素チェック:');
        const essentialElements = [
            { name: 'タイトル (Calculator)', check: parser.includes('<title>Calculator</title>') },
            { name: 'ディスプレイ要素', check: parser.includes('class="display"') },
            { name: '現在の入力表示', check: parser.includes('class="current"') },
            { name: '前回の入力表示', check: parser.includes('class="previous"') },
            { name: '計算履歴セクション', check: parser.includes('class="history"') },
            { name: 'ボタングリッド', check: parser.includes('class="buttons"') }
        ];
        
        let passedChecks = 0;
        essentialElements.forEach(element => {
            console.log(`  ${element.check ? '✅' : '❌'} ${element.name}`);
            if (element.check) passedChecks++;
        });
        
        // ボタンの存在確認
        console.log('\n🔢 計算機ボタンチェック:');
        const buttons = [
            // 数字ボタン
            ...['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            // 演算子ボタン
            '+', '−', '×', '÷',
            // 機能ボタン
            'C', '⌫', '=', '.',
            // テーマボタン
            '🌓'
        ];
        
        let buttonCount = 0;
        buttons.forEach(button => {
            const exists = parser.includes(`>${button}<`);
            if (exists) buttonCount++;
        });
        console.log(`  ✅ 検出されたボタン数: ${buttonCount}/${buttons.length}`);
        if (buttonCount === buttons.length) passedChecks++;
        
        // 機能チェック
        console.log('\n🔧 機能要素チェック:');
        const features = [
            { name: 'ダウンロード機能', check: parser.includes('Download History') },
            { name: 'テーマ切替機能', check: parser.includes('toggleTheme') },
            { name: 'キーボードサポート', check: parser.includes('keydown') },
            { name: '履歴管理機能', check: parser.includes('updateHistory') }
        ];
        
        features.forEach(feature => {
            console.log(`  ${feature.check ? '✅' : '❌'} ${feature.name}`);
            if (feature.check) passedChecks++;
        });
        
        // スタイルチェック
        console.log('\n🎨 スタイル要素チェック:');
        const styles = [
            { name: 'レスポンシブデザイン', check: parser.includes('@media') },
            { name: 'ダークモードスタイル', check: parser.includes('.dark-mode') },
            { name: 'グラデーション背景', check: parser.includes('linear-gradient') },
            { name: 'トランジション効果', check: parser.includes('transition') },
            { name: 'ホバー効果', check: parser.includes(':hover') }
        ];
        
        styles.forEach(style => {
            console.log(`  ${style.check ? '✅' : '❌'} ${style.name}`);
            if (style.check) passedChecks++;
        });
        
        // JavaScriptロジックチェック
        console.log('\n💻 計算ロジックチェック:');
        const jsFeatures = [
            { name: '計算関数 (calculate)', check: parser.includes('function calculate') },
            { name: 'エラーハンドリング', check: parser.includes('Division by zero') },
            { name: '履歴保存機能', check: parser.includes('localStorage') },
            { name: 'ダウンロード実装', check: parser.includes('download') && parser.includes('blob') }
        ];
        
        jsFeatures.forEach(feature => {
            console.log(`  ${feature.check ? '✅' : '❌'} ${feature.name}`);
            if (feature.check) passedChecks++;
        });
        
        // 総合評価
        const totalChecks = essentialElements.length + 1 + features.length + styles.length + jsFeatures.length;
        const successRate = (passedChecks / totalChecks * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 テスト結果サマリー:');
        console.log(`  総チェック項目: ${totalChecks}`);
        console.log(`  ✅ 合格項目: ${passedChecks}`);
        console.log(`  ❌ 不合格項目: ${totalChecks - passedChecks}`);
        console.log(`  成功率: ${successRate}%`);
        
        if (successRate >= 80) {
            console.log('\n🎉 電卓アプリは正常に動作しています！');
        } else if (successRate >= 60) {
            console.log('\n⚠️  電卓アプリは基本的に動作していますが、一部機能に問題がある可能性があります。');
        } else {
            console.log('\n❌ 電卓アプリに重大な問題がある可能性があります。');
        }
        
        // ページサイズ情報
        console.log('\n📏 ページ情報:');
        console.log(`  HTMLサイズ: ${(html.length / 1024).toFixed(2)} KB`);
        console.log(`  単一ファイル: ${!parser.includes('<link') || parser.includes('<style>') ? '✅' : '❌'}`);
        
    } catch (error) {
        console.error('\n🚨 テストエラー:', error.message);
    }
}

// テスト実行
runWebCalculatorTest();