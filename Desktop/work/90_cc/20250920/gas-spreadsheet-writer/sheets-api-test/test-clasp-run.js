// clasp run経由でスプレッドシートのデータを取得

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testClaspRun() {
  console.log('🔧 CLASP run経由でのデータ取得テスト\n');

  // 1. まず、データ取得用のGAS関数を作成
  const gasCode = `
function getSheetStatus() {
  const ss = SpreadsheetApp.getActive();
  const sheets = ss.getSheets();

  const result = {
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    spreadsheetName: ss.getName(),
    numberOfSheets: sheets.length,
    sheetNames: sheets.map(s => s.getName()),
    lastModified: DriveApp.getFileById(ss.getId()).getLastUpdated(),
    currentUser: Session.getActiveUser().getEmail()
  };

  // 最初のシートの最初の10行を取得
  if (sheets.length > 0) {
    const firstSheet = sheets[0];
    const range = firstSheet.getRange(1, 1, Math.min(10, firstSheet.getLastRow()), Math.min(10, firstSheet.getLastColumn()));
    result.firstSheetData = {
      name: firstSheet.getName(),
      rows: firstSheet.getLastRow(),
      columns: firstSheet.getLastColumn(),
      sample: range.getValues()
    };
  }

  // E5の値を確認
  try {
    result.cellE5 = ss.getSheets()[0].getRange('E5').getValue();
  } catch(e) {
    result.cellE5 = 'Error: ' + e.message;
  }

  return JSON.stringify(result, null, 2);
}

function readSpecificRange(sheetName, rangeA1) {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return 'Sheet not found: ' + sheetName;
    }
    const values = sheet.getRange(rangeA1).getValues();
    return JSON.stringify(values, null, 2);
  } catch(e) {
    return 'Error: ' + e.message;
  }
}
  `;

  // 2. 関数を一時的に追加
  console.log('📝 データ取得関数をプッシュ中...\n');

  try {
    // StatusCheck.gsファイルを作成
    const fs = require('fs');
    const path = require('path');
    const tmpDir = '/tmp/clasp-container-test';
    const statusFile = path.join(tmpDir, 'StatusCheck.gs');

    fs.writeFileSync(statusFile, gasCode);

    // Push
    const pushResult = await execPromise('cd /tmp/clasp-container-test && clasp push');
    console.log('✅ Push完了\n');

    // 3. 関数を実行してデータ取得
    console.log('🚀 getSheetStatus関数を実行中...\n');

    const { stdout, stderr } = await execPromise('cd /tmp/clasp-container-test && clasp run getSheetStatus');

    if (stderr) {
      console.error('警告:', stderr);
    }

    // 結果をパース
    console.log('📊 取得したデータ:');
    console.log('----------------------------------------');

    // CLASPの出力から結果を抽出
    const lines = stdout.split('\n');
    let resultStarted = false;
    let resultJson = '';

    for (const line of lines) {
      if (line.includes('{')) {
        resultStarted = true;
      }
      if (resultStarted) {
        resultJson += line + '\n';
      }
    }

    try {
      const result = JSON.parse(resultJson);
      console.log('✅ スプレッドシート情報:');
      console.log('- ID:', result.spreadsheetId);
      console.log('- 名前:', result.spreadsheetName);
      console.log('- URL:', result.spreadsheetUrl);
      console.log('- シート数:', result.numberOfSheets);
      console.log('- シート名:', result.sheetNames);
      console.log('- E5セルの値:', result.cellE5);

      if (result.firstSheetData) {
        console.log('\n📋 最初のシートのデータ:');
        console.log('- シート名:', result.firstSheetData.name);
        console.log('- 行数:', result.firstSheetData.rows);
        console.log('- 列数:', result.firstSheetData.columns);
        console.log('- サンプルデータ（最初の3行）:');
        if (result.firstSheetData.sample) {
          result.firstSheetData.sample.slice(0, 3).forEach((row, i) => {
            console.log(`  行${i + 1}:`, row.slice(0, 5));
          });
        }
      }
    } catch (parseError) {
      console.log('生の出力:');
      console.log(stdout);
    }

    console.log('\n✅ CLASP run経由でのデータ取得成功！');
    console.log('📝 Script IDを使って、GAS関数経由でデータを取得できました。');

    // 4. 特定範囲の読み取り
    console.log('\n🎯 特定範囲の読み取りテスト...\n');

    const rangeResult = await execPromise('cd /tmp/clasp-container-test && clasp run readSpecificRange -p \'["Sheet1", "A1:C3"]\'');
    console.log('A1:C3の範囲:');
    console.log(rangeResult.stdout);

  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('\n💡 トラブルシューティング:');
    console.log('1. Script IDが正しいか確認');
    console.log('2. 認証が有効か確認: clasp login --status');
    console.log('3. プロジェクトへのアクセス権限を確認');
  }
}

// 実行
testClaspRun();