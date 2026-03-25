function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID',
        'Timestamp',
        'Pflegestatus',
        'Stunden/Woche',
        'Beziehung',
        'Taetigkeiten',
        'Kanton/PLZ',
        'Name',
        'Telefon',
        'E-Mail'
      ]);
    }

    var data = JSON.parse(e.postData.contents);

    var now = new Date();
    var leadId = data.anfragenId || 'CU-??';

    sheet.appendRow([
      leadId,
      now,
      data.situation    || '',
      data.stunden      || '',
      data.beziehung    || '',
      data.taetigkeiten || '',
      data.kanton       || '',
      data.name         || '',
      data.telefon      || '',
      data.email        || ''
    ]);

    MailApp.sendEmail({
      to: 'krasniqiermir1995@gmail.com',
      subject: 'Neuer Lead ist eingegangen!',
      body: [
        'Neuer Lead ist eingegangen!',
        '',
        'ID:         ' + leadId,
        'Datum:      ' + now.toLocaleString('de-CH'),
        'Name:       ' + (data.name      || '–'),
        'Telefon:    ' + (data.telefon   || '–'),
        'E-Mail:     ' + (data.email     || '–'),
        'Kanton/PLZ: ' + (data.kanton    || '–'),
        'Status:     ' + (data.situation || '–'),
        'Stunden:    ' + (data.stunden   || '–'),
        'Beziehung:  ' + (data.beziehung || '–'),
        'Tätigkeiten:' + (data.taetigkeiten || '–'),
      ].join('\n')
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
