import https from 'https';

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

// APIレベルでの機能テスト
async function testCalculatorAPI() {
    console.log('\n🔬 API機能テスト（計算ロジック）:');
    
    // Node.js版の計算機能をテスト
    const { calculate } = await import('./src/calculate.js');
    
    const apiTests = [
        { expr: "2 + 3", expected: 5 },
        { expr: "10 - 4", expected: 6 },
        { expr: "5 * 6", expected: 30 },
        { expr: "20 / 4", expected: 5 },
        { expr: "10 / 0", expected: "Error: Division by zero" },
        { expr: "abc + 1", expected: "Invalid input" },
        { expr: "5 ^ 2", expected: "Invalid operator" },
        { expr: "3 + ", expected: "Invalid format" }
    ];
    
    let apiPassed = 0;
    apiTests.forEach(test => {
        const result = calculate(test.expr);
        const passed = result === test.expected;
        console.log(`  ${passed ? '✅' : '❌'} "${test.expr}" → ${result} ${passed ? '' : `(期待: ${test.expected})`}`);
        if (passed) apiPassed++;
    });
    
    return { total: apiTests.length, passed: apiPassed };
}

async function runComprehensiveTest() {
    console.log('🧮 電卓アプリ包括的動作確認\n');
    console.log('📅 テスト実行日時:', new Date().toLocaleString('ja-JP'));
    console.log('='.repeat(50));
    
    const url = 'https://muumuu8181.github.io/published-apps/calculator-app/';
    console.log(`\n🌐 対象URL: ${url}`);
    
    try {
        // 1. ページ取得テスト
        console.log('\n📡 ページアクセステスト:');
        const startTime = Date.now();
        const { status, html } = await fetchPage(url);
        const loadTime = Date.now() - startTime;
        
        console.log(`  ✅ HTTPステータス: ${status}`);
        console.log(`  ✅ 読み込み時間: ${loadTime}ms`);
        console.log(`  ✅ ページサイズ: ${(html.length / 1024).toFixed(2)} KB`);
        
        // 2. HTML構造テスト
        console.log('\n🏗️ HTML構造テスト:');
        const structureTests = [
            { name: 'DOCTYPE宣言', pattern: /<!DOCTYPE html>/i },
            { name: 'HTMLタグ', pattern: /<html[^>]*lang="ja"/ },
            { name: 'ヘッダー', pattern: /<head>[\s\S]*<\/head>/ },
            { name: 'ボディ', pattern: /<body[^>]*>[\s\S]*<\/body>/ },
            { name: 'メタビューポート', pattern: /viewport.*width=device-width/ },
            { name: 'タイトル', pattern: /<title>電卓アプリ/ }
        ];
        
        let htmlPassed = 0;
        structureTests.forEach(test => {
            const passed = test.pattern.test(html);
            console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
            if (passed) htmlPassed++;
        });
        
        // 3. UI要素テスト
        console.log('\n🎨 UI要素テスト:');
        const uiElements = [
            { name: 'ディスプレイエリア', pattern: /class="display"/ },
            { name: '数字ボタン (0-9)', check: () => {
                for (let i = 0; i <= 9; i++) {
                    if (!html.includes(`>${i}</button>`)) return false;
                }
                return true;
            }},
            { name: '演算子ボタン', check: () => 
                html.includes('>+</button>') && 
                html.includes('>−</button>') && 
                html.includes('>×</button>') && 
                html.includes('>÷</button>')
            },
            { name: 'クリアボタン', pattern: />C<\/button>/ },
            { name: 'イコールボタン', pattern: />=<\/button>/ },
            { name: 'テーマ切替ボタン', pattern: />🌓<\/button>/ },
            { name: '履歴エリア', pattern: /history-container/ },
            { name: 'ダウンロードボタン', pattern: /ダウンロード|Download/ }
        ];
        
        let uiPassed = 0;
        uiElements.forEach(element => {
            const passed = element.check ? element.check() : element.pattern.test(html);
            console.log(`  ${passed ? '✅' : '❌'} ${element.name}`);
            if (passed) uiPassed++;
        });
        
        // 4. JavaScript機能テスト
        console.log('\n💻 JavaScript機能テスト:');
        const jsFeatures = [
            { name: '計算関数実装', pattern: /function\s+calculate|const\s+calculate/ },
            { name: 'イベントリスナー', pattern: /addEventListener/ },
            { name: 'キーボードサポート', pattern: /keydown|keypress/ },
            { name: 'テーマ切替機能', pattern: /toggleTheme|dark-mode/ },
            { name: 'エラーハンドリング', pattern: /try[\s\S]*catch|Error|エラー/ },
            { name: '履歴管理', pattern: /history|履歴/ }
        ];
        
        let jsPassed = 0;
        jsFeatures.forEach(feature => {
            const passed = feature.pattern.test(html);
            console.log(`  ${passed ? '✅' : '❌'} ${feature.name}`);
            if (passed) jsPassed++;
        });
        
        // 5. レスポンシブデザインテスト
        console.log('\n📱 レスポンシブデザインテスト:');
        const responsiveTests = [
            { name: 'メディアクエリ', pattern: /@media/ },
            { name: 'フレックスボックス', pattern: /display:\s*flex/ },
            { name: 'グリッドレイアウト', pattern: /display:\s*grid/ },
            { name: 'レスポンシブ単位', pattern: /\d+(vw|vh|%|em|rem)/ }
        ];
        
        let responsivePassed = 0;
        responsiveTests.forEach(test => {
            const passed = test.pattern.test(html);
            console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
            if (passed) responsivePassed++;
        });
        
        // 6. Node.js API テスト
        const apiResult = await testCalculatorAPI();
        
        // 総合評価
        const totalTests = structureTests.length + uiElements.length + jsFeatures.length + 
                          responsiveTests.length + apiResult.total;
        const totalPassed = htmlPassed + uiPassed + jsPassed + responsivePassed + apiResult.passed;
        const successRate = (totalPassed / totalTests * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 総合テスト結果:');
        console.log(`  HTML構造: ${htmlPassed}/${structureTests.length}`);
        console.log(`  UI要素: ${uiPassed}/${uiElements.length}`);
        console.log(`  JavaScript機能: ${jsPassed}/${jsFeatures.length}`);
        console.log(`  レスポンシブ: ${responsivePassed}/${responsiveTests.length}`);
        console.log(`  計算API: ${apiResult.passed}/${apiResult.total}`);
        console.log(`  \n  総合: ${totalPassed}/${totalTests} (${successRate}%)`);
        
        // 評価
        console.log('\n🎯 評価:');
        if (successRate >= 90) {
            console.log('  🏆 優秀 - 電卓アプリは完璧に動作しています！');
        } else if (successRate >= 80) {
            console.log('  ✅ 良好 - 電卓アプリは正常に動作しています。');
        } else if (successRate >= 70) {
            console.log('  ⚠️  要改善 - 基本機能は動作しますが、一部改善が必要です。');
        } else {
            console.log('  ❌ 問題あり - 重要な機能に問題があります。');
        }
        
        // 推奨事項
        if (successRate < 100) {
            console.log('\n💡 改善推奨事項:');
            if (!html.includes('Download')) {
                console.log('  - ダウンロード機能のテキストを追加');
            }
            if (uiPassed < uiElements.length) {
                console.log('  - 不足しているUI要素を確認');
            }
            if (responsivePassed < responsiveTests.length) {
                console.log('  - レスポンシブデザインの改善');
            }
        }
        
    } catch (error) {
        console.error('\n🚨 テストエラー:', error.message);
    }
}

// テスト実行
runComprehensiveTest();