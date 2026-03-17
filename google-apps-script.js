/**
 * CUIDESA — Google Apps Script Web App
 * =====================================
 * Dieses Script empfängt POST-Requests vom Formular auf angehoerige.html
 * und schreibt die Daten als neue Zeile in ein Google Sheet.
 *
 * EINRICHTUNG (einmalig, ca. 5 Minuten):
 * ----------------------------------------
 * 1. Öffne das Google Sheet, in das du die Daten speichern möchtest.
 *    (Erstelle ein neues Sheet unter sheets.google.com)
 *
 * 2. Klicke auf: Erweiterungen → Apps Script
 *
 * 3. Lösche den vorhandenen Code im Editor und füge den gesamten
 *    Inhalt dieser Datei (ab der Funktion doPost unten) ein.
 *
 * 4. Speichere das Script (Ctrl+S / Cmd+S).
 *
 * 5. Klicke auf "Deployen" → "Neue Deployments"
 *    - Typ: Web-App
 *    - Beschreibung: z. B. "Cuidesa Formular v1"
 *    - Ausführen als: Ich (dein Google-Konto)
 *    - Zugriff: Jeder  ← WICHTIG für CORS
 *    Klicke "Deployen" und erteile die Berechtigungen.
 *
 * 6. Kopiere die angezeigte Web-App-URL (sieht so aus:
 *    https://script.google.com/macros/s/XXXX.../exec)
 *
 * 7. Trage die URL in angehoerige.html ein:
 *    const GOOGLE_SCRIPT_URL = 'DEINE_URL_HIER';
 *
 * 8. Nach jeder Änderung am Script musst du ein neues Deployment erstellen
 *    (oder ein bestehendes aktualisieren), damit die Änderungen aktiv werden.
 *
 * SPALTEN IM SHEET:
 * -----------------
 * A: ID | B: Timestamp | C: Pflegestatus | D: Stunden/Woche | E: Beziehung
 * F: Tätigkeiten | G: Kanton/PLZ | H: Name | I: Telefon | J: E-Mail
 */

// ============================================================
// Ab hier in den Apps Script Editor kopieren:
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Header-Zeile anlegen, falls das Sheet noch leer ist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID',
        'Timestamp',
        'Pflegestatus',
        'Stunden/Woche',
        'Beziehung',
        'Tätigkeiten',
        'Kanton/PLZ',
        'Name',
        'Telefon',
        'E-Mail'
      ]);
    }

    // Formulardaten parsen
    var data = JSON.parse(e.postData.contents);

    // Eindeutige ID generieren (C-001, C-002, ...)
    var now = new Date();
    var rowCount = Math.max(0, sheet.getLastRow() - 1); // Header abziehen
    var leadId = 'C-' + ('00' + (rowCount + 1)).slice(-3);

    // Neue Zeile einfügen
    sheet.appendRow([
      leadId,                            // ID
      now,                               // Timestamp
      data.situation    || '',           // Pflegestatus
      data.stunden      || '',           // Stunden/Woche
      data.beziehung    || '',           // Beziehung
      data.taetigkeiten || '',           // Tätigkeiten (kommasepariert)
      data.kanton       || '',           // Kanton/PLZ
      data.name         || '',           // Name
      data.telefon      || '',           // Telefon
      data.email        || ''            // E-Mail
    ]);

    // Erfolgsantwort mit CORS-Header
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET-Requests für einfachen Health-Check
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Cuidesa Apps Script läuft.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
