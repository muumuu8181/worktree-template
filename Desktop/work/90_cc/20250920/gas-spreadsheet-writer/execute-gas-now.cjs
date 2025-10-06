const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

// clasp認証情報を読み込む
function loadClaspToken() {
  const clasprcPath = path.join(os.homedir(), '.clasprc.json');
  const raw = fs.readFileSync(clasprcPath, 'utf8');
  const data = JSON.parse(raw);

  const tokenData = data.tokens?.default || data;

  const oauth2Client = new google.auth.OAuth2(
    tokenData.client_id,
    tokenData.client_secret,
    'http://localhost'
  );

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    token_type: tokenData.token_type || 'Bearer',
    expiry_date: tokenData.expiry_date
  });

  return oauth2Client;
}

async function executeGasFunction() {
  console.log('🚀 Google Apps Script 実行開始...\n');

  try {
    const auth = loadClaspToken();
    const script = google.script({ version: 'v1', auth });

    const scriptId = '1kJx_xJ5kiHt6OVFAMSiWBmmqzq_BW6PWgkkJLs4tYIg5OJ_6z7WwYzmK';

    console.log(`📝 Script ID: ${scriptId}`);
    console.log('⚡ 実行関数: testWriteToSheet\n');

    // スクリプトを実行
    const response = await script.scripts.run({
      scriptId: scriptId,
      requestBody: {
        function: 'testWriteToSheet',
        devMode: false
      }
    });

    console.log('✅ 実行成功！\n');

    if (response.data.done) {
      if (response.data.error) {
        console.error('❌ エラー:', response.data.error);
      } else if (response.data.response?.result) {
        const result = response.data.response.result;
        console.log('📊 実行結果:');
        console.log(JSON.stringify(result, null, 2));

        if (result.spreadsheetUrl) {
          console.log('\n🔗 作成されたスプレッドシート:');
          console.log(result.spreadsheetUrl);
        }
      } else {
        console.log('実行完了（戻り値なし）');
      }
    } else {
      console.log('⏳ 実行中...');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 403) {
        console.log('\n💡 解決方法:');
        console.log('1. https://script.google.com/home/usersettings にアクセス');
        console.log('2. "Google Apps Script API" をONにする');
        console.log('3. もう一度実行してください');
      } else if (error.response.status === 404) {
        console.log('\n💡 解決方法:');
        console.log('1. スクリプトIDが正しいか確認');
        console.log('2. スクリプトへのアクセス権限があるか確認');
      }
    } else {
      console.error(error.message);
    }
  }
}

// 実行
executeGasFunction();