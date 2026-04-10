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

    var pdf = createLeadPDF(data, leadId, now);

    MailApp.sendEmail({
      to: 'info@cuidesa.ch',
      replyTo: 'info@cuidesa.ch',
      name: 'Cuidesa',
      subject: 'Neuer Lead ist eingegangen!',
      body: 'Neuer Lead ist eingegangen. Details siehe PDF im Anhang.',
      attachments: [pdf]
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

function createLeadPDF(data, leadId, now) {
  var datum = Utilities.formatDate(now, 'Europe/Zurich', 'dd. MMMM yyyy');

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">'
    + '<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">'
    + '<style>'
    + 'body{font-family:"Source Sans 3",sans-serif;color:#0B1F3A;margin:0;padding:40px 50px;font-size:13px;background:#fff;}'
    + '.header{border-bottom:3px solid #1A6DB5;padding-bottom:18px;margin-bottom:30px;}'
    + '.logo{font-family:"Lora",serif;font-size:30px;font-weight:bold;color:#0B1F3A;display:inline;}'
    + '.logo-accent{color:#1A6DB5;}'
    + '.header-meta{float:right;text-align:right;font-size:11px;color:#4A6E8A;margin-top:4px;}'
    + '.badge{display:inline-block;background:#1A6DB5;color:#fff;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:2px;margin-top:14px;}'
    + 'h1{font-family:"Lora",serif;font-size:19px;color:#0B1F3A;margin:0 0 4px 0;}'
    + '.subtitle{color:#4A6E8A;font-size:12px;margin:0 0 28px 0;}'
    + '.section{margin-bottom:22px;}'
    + '.section-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#1A6DB5;'
    +   'margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #B8D4EA;}'
    + 'table{width:100%;border-collapse:collapse;}'
    + 'td{padding:6px 0;vertical-align:top;font-size:13px;}'
    + 'td.label{width:160px;color:#4A6E8A;}'
    + 'td.value{color:#0B1F3A;font-weight:bold;}'
    + '.note{background:#EEF4FB;border-left:3px solid #1A6DB5;padding:12px 16px;margin:24px 0;font-size:12px;color:#2E5A84;}'
    + '.footer{margin-top:36px;padding-top:14px;border-top:1px solid #B8D4EA;font-size:10px;color:#4A6E8A;text-align:center;}'
    + '</style></head><body>'

    // Header
    + '<div class="header">'
    +   '<span class="header-meta">cuidesa.ch<br>Datum: ' + datum + '<br>Anfragen-ID: ' + leadId + '</span>'
    +   '<div class="logo">Cuide<span class="logo-accent">sa</span></div>'
    +   '<div style="clear:both"></div>'
    + '</div>'

    // Titel
    + '<div class="badge">Neue Pflegeanfrage</div>'
    + '<h1 style="margin-top:16px;">Weiterleitung an Spitex-Partner</h1>'
    + '<p class="subtitle">Die folgende Person hat über cuidesa.ch eine kostenlose Anspruchsprüfung angefragt.</p>'

    // Kontakt
    + '<div class="section">'
    +   '<div class="section-title">Kontaktdaten</div>'
    +   '<table>'
    +     row('Name',       data.name     || '–')
    +     row('Telefon',    data.telefon  || '–')
    +     row('E-Mail',     data.email    || '–')
    +     row('Kanton/PLZ', data.kanton   || '–')
    +   '</table>'
    + '</div>'

    // Pflegesituation
    + '<div class="section">'
    +   '<div class="section-title">Pflegesituation</div>'
    +   '<table>'
    +     row('Pflegestatus',  data.situation    || '–')
    +     row('Stunden/Woche', data.stunden      || '–')
    +     row('Beziehung',     data.beziehung    || '–')
    +     row('Tätigkeiten',   data.taetigkeiten || '–')
    +   '</table>'
    + '</div>'

    // Hinweis
    + '<div class="note">'
    +   'Bitte nehmen Sie innert 24 Stunden Kontakt auf, um die weiteren Schritte zu besprechen.'
    + '</div>'

    // Footer
    + '<div class="footer">'
    +   'Dieses Dokument wurde automatisch generiert von cuidesa.ch &nbsp;·&nbsp; Anfragen-ID: ' + leadId
    + '</div>'

    + '</body></html>';

  var blob = Utilities.newBlob(html, 'text/html', 'offerte.html');
  var file = DriveApp.createFile(blob);
  var pdf  = file.getAs('application/pdf');
  pdf.setName('Cuidesa_Lead_' + leadId + '.pdf');
  DriveApp.getFileById(file.getId()).setTrashed(true);

  return pdf;
}

function row(label, value) {
  return '<tr><td class="label">' + label + '</td><td class="value">' + value + '</td></tr>';
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
