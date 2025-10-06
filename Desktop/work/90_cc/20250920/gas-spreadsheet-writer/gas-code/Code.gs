function writeToE5() {
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
}