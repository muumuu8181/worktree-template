const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

// このスクリプトのディレクトリ
const SCRIPT_DIR = __dirname;
const GAS_DIR = path.join(SCRIPT_DIR, 'gas-code');

// GASコード
const gasCode = `function writeToE5() {
  const now = new Date();
  const ss = SpreadsheetApp.create('Claude Was Here - ' + now.toLocaleString('ja-JP'));
  const sheet = ss.getActiveSheet();

  sheet.getRange('E5').setValue('Claude Was Here!');
  sheet.getRange('A1').setValue('実行成功');
  sheet.getRange('B1').setValue(now.toLocaleString('ja-JP'));

  return {
    success: true,
    spreadsheetUrl: ss.getUrl(),
    value: 'Claude Was Here!',
    cell: 'E5',
    timestamp: now.toISOString()
  };
}

function doGet() {
  const result = writeToE5();
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function myFunction() {
  return writeToE5();
}`;

async function execute() {
  console.log('🚀 Google Apps Script 実行開始...\n');
  console.log('📂 作業ディレクトリ:', GAS_DIR);

  // ディレクトリ作成
  if (fs.existsSync(GAS_DIR)) {
    fs.rmSync(GAS_DIR, { recursive: true });
  }
  fs.mkdirSync(GAS_DIR);

  // ファイル作成
  fs.writeFileSync(path.join(GAS_DIR, 'Code.gs'), gasCode);

  fs.writeFileSync(path.join(GAS_DIR, 'appsscript.json'), JSON.stringify({
    timeZone: "Asia/Tokyo",
    dependencies: {},
    exceptionLogging: "STACKDRIVER",
    runtimeVersion: "V8",
    webapp: {
      executeAs: "USER_DEPLOYING",
      access: "ANYONE_ANONYMOUS"
    }
  }, null, 2));

  fs.writeFileSync(path.join(GAS_DIR, '.clasp.json'), JSON.stringify({
    scriptId: "1kJx_xJ5kiHt6OVFAMSiWBmmqzq_BW6PWgkkJLs4tYIg5OJ_6z7WwYzmK",
    rootDir: "."
  }, null, 2));

  try {
    // プッシュ
    console.log('📤 コードをプッシュ中...');
    await execAsync(`cd "${GAS_DIR}" && npx @google/clasp push -f`);
    console.log('✅ プッシュ完了\n');

    // デプロイ
    console.log('🚀 デプロイ中...');
    const deployResult = await execAsync(`cd "${GAS_DIR}" && npx @google/clasp deploy --description "E5 Writer"`);
    console.log(deployResult.stdout);

    // デプロイIDを抽出して実行
    const match = deployResult.stdout.match(/Deployed (AKfyc[a-zA-Z0-9_-]+)/);
    if (match) {
      const deploymentId = match[1];
      const url = `https://script.google.com/macros/s/${deploymentId}/exec`;
      console.log(`\n📝 Web API URL:\n${url}\n`);

      // 実行
      console.log('🔥 実行中...');
      const { stdout } = await execAsync(`curl -L "${url}"`);
      console.log('\n✅ 結果:', stdout);
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

execute();