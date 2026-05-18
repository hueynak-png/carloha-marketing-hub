// Google Apps Script Web App for the Carloha Marketing Hub request form.
//
// Setup:
// 1. Open the target Google Sheet.
// 2. Go to Extensions -> Apps Script.
// 3. Paste this file into Code.gs.
// 4. Deploy -> New deployment -> Web app.
// 5. Execute as: Me. Who has access: Anyone.
// 6. Copy the Web app URL into Vercel as REQUEST_FORM_SUBMIT_URL.

const SHEET_NAME = "Form Responses";
const HEADERS = [
  "Submitted At",
  "Request Type",
  "Name",
  "Email",
  "WhatsApp",
  "Market / Dealer",
  "Vehicle",
  "Material Type",
  "Urgency",
  "Request Details",
  "Source",
];

function doPost(event) {
  const sheet = getResponseSheet_();
  const data = JSON.parse(event.postData.contents || "{}");

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.requestType || "",
    data.name || "",
    data.email || "",
    data.whatsapp || "",
    data.market || "",
    data.vehicle || "",
    data.materialType || "",
    data.urgency || "",
    data.message || "",
    data.source || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
