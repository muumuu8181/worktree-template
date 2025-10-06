// Sheets APIでスプレッドシートのデータを直接読む

const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');

// 配布したスプレッドシートのID
const SPREADSHEET_ID = '19zPNnf2zqQbqf_Pc0Sozc078A902t3HLYkMmO1Kiho4';

async function readSheetData() {
  try {
    // 認証設定
    // 方法1: サービスアカウント（推奨）
    // const auth = new google.auth.GoogleAuth({
    //   keyFile: 'service-account-key.json',
    //   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    // });

    // 方法2: OAuth2（既存のCLASP認証を利用）
    const credentialsPath = path.join(process.env.HOME || process.env.USERPROFILE, '.clasprc.json');

    if (!fs.existsSync(credentialsPath)) {
      console.error('CLASPの認証ファイルが見つかりません:', credentialsPath);
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = credentials.tokens.default;

    // OAuth2クライアント設定
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_type: token.token_type
    });

    // Sheets APIクライアント作成
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    console.log('📊 スプレッドシートのデータを読み取り中...\n');
    console.log('Spreadsheet ID:', SPREADSHEET_ID);
    console.log('URL: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit\n');

    // 1. スプレッドシートの情報を取得
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log('📋 スプレッドシート情報:');
    console.log('- タイトル:', spreadsheet.data.properties.title);
    console.log('- シート数:', spreadsheet.data.sheets.length);
    console.log('- シート名:');
    spreadsheet.data.sheets.forEach(sheet => {
      console.log('  •', sheet.properties.title);
    });

    // 2. 各シートのデータを読み取り
    console.log('\n📊 データ読み取り:');

    for (const sheet of spreadsheet.data.sheets) {
      const sheetName = sheet.properties.title;
      console.log(`\n【${sheetName}】シートの内容:`);

      try {
        // A1:Z10の範囲を読み取り（最初の10行）
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1:Z10`
        });

        const rows = response.data.values;

        if (rows && rows.length) {
          console.log(`  ${rows.length}行のデータが見つかりました`);

          // 最初の3行を表示
          rows.slice(0, 3).forEach((row, index) => {
            console.log(`  行${index + 1}:`, row.slice(0, 5).join(' | '));
          });

          if (rows.length > 3) {
            console.log(`  ... 他 ${rows.length - 3} 行`);
          }
        } else {
          console.log('  （データなし）');
        }
      } catch (error) {
        console.log('  読み取りエラー:', error.message);
      }
    }

    // 3. 特定のセルの値を取得
    console.log('\n🎯 特定セルの値:');

    const cellResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!E5'
    });

    console.log('- E5セルの値:', cellResponse.data.values ? cellResponse.data.values[0][0] : '（空）');

    // 4. バッチ取得（複数範囲を一度に）
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Sheet1!A1', 'Sheet1!E5', 'ダッシュボード!B3:B5']
    });

    console.log('\n📦 バッチ取得結果:');
    batchResponse.data.valueRanges.forEach((range, index) => {
      console.log(`- 範囲${index + 1}:`, range.values ? range.values[0] : '（空）');
    });

    console.log('\n✅ Sheets API経由でのデータ読み取り成功！');
    console.log('Script ID不要で、Spreadsheet IDだけでアクセスできました。');

  } catch (error) {
    console.error('❌ エラー:', error.message);

    if (error.code === 403) {
      console.log('\n📝 権限エラーの解決方法:');
      console.log('1. スプレッドシートの共有設定を確認');
      console.log('2. または、サービスアカウントを使用');
      console.log('3. または、適切なスコープで認証');
    }
  }
}

// 実行
readSheetData();