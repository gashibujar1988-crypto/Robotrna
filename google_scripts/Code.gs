// Inställningar
const CONF = {
  sheetCustomers: 'Kunder',
  sheetOrders: 'Ordrar',
  prefixCustomer: 'K-',
  prefixOrder: 'ORD-',
  emailSupport: 'din.email@gmail.com' // <-- VIKTIGT: Ändra till din egen Gmail-adress här!
};

function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  
  // Vi låser skriptet i 10 sekunder för att undvika att två formulärsvar krockar och får samma ID
  try {
    lock.waitLock(10000); 
  } catch (e) {
    console.log('Kunde inte hämta lås, försök igen.');
    return;
  }

  // Hämta data från formuläret
  // OBS: Namnen här ('Tidsstämpel', 'Namn' etc) måste matcha exakt vad kolumnerna heter i ditt Google Sheet.
  const responses = e.namedValues;
  const timestamp = responses['Tidsstämpel'] ? responses['Tidsstämpel'][0] : new Date();
  
  // Vi försöker hitta mailadressen, kan heta olika beroende på formulärinställningar
  const email = responses['E-postadress'] ? responses['E-postadress'][0] : (responses['Email'] ? responses['Email'][0] : '');
  
  const namn = responses['Namn'] ? responses['Namn'][0] : '';
  const subject = responses['Ärende'] ? responses['Ärende'][0] : 'Inget ärende angivet';
  const description = responses['Beskrivning'] ? responses['Beskrivning'][0] : '';

  // 1. Hantera Kund (Kontrollera om finns, annars skapa)
  const customerId = getOrCreateCustomer(ss, email, namn);

  // 2. Skapa Ordernummer
  const orderSheet = ss.getSheetByName(CONF.sheetOrders);
  if (!orderSheet) {
    throw new Error("Kunde inte hitta fliken '" + CONF.sheetOrders + "'. Kontrollera namnet.");
  }
  
  const orderId = getNextId(orderSheet, CONF.prefixOrder);

  // Hitta raden som precis lades till av formuläret (sista raden)
  const lastRow = orderSheet.getLastRow();
  
  // Vi uppdaterar Ordernummer-kolumnen (Kolumn A) på den nya raden
  // Detta förutsätter att du lagt till en ny kolumn A som heter "Ordernummer"
  orderSheet.getRange(lastRow, 1).setValue(orderId);
  
  // Sätt status till "Ny" i sista kolumnen
  const lastCol = orderSheet.getLastColumn();
  orderSheet.getRange(lastRow, lastCol).setValue('Ny');

  // Skapa en direktlänk till raden
  const fileId = ss.getId();
  const sheetId = orderSheet.getSheetId();
  const rowLink = `https://docs.google.com/spreadsheets/d/${fileId}/edit#gid=${sheetId}&range=${lastRow}:${lastRow}`;

  // 3. Skicka Notis till Support
  sendSupportEmail(orderId, customerId, email, subject, description, rowLink);

  lock.releaseLock();
}

// Hjälpfunktion: Hämta eller skapa kund
function getOrCreateCustomer(ss, email, namn) {
  let sheet = ss.getSheetByName(CONF.sheetCustomers);
  
  // Om kundfliken saknas, skapa den automatiskt
  if (!sheet) {
    sheet = ss.insertSheet(CONF.sheetCustomers);
    sheet.appendRow(['Kundnummer', 'Email', 'Namn', 'Telefon', 'Skapad Datum']);
  }
  
  const data = sheet.getDataRange().getValues();
  let customerId = null;

  // Leta efter existerande kund (börjar på rad 2, index 1)
  // Vi matchar på Email (kolumn B, index 1)
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][1].toString().toLowerCase() == email.toString().toLowerCase()) { 
      customerId = data[i][0]; // Kolumn A är Kundnummer
      break;
    }
  }

  // Om ingen kund hittades, skapa ny
  if (!customerId) {
    customerId = getNextId(sheet, CONF.prefixCustomer);
    sheet.appendRow([customerId, email, namn, '', new Date()]);
  }

  return customerId;
}

// Hjälpfunktion: Generera nästa ID (t.ex. ORD-500 -> ORD-501)
function getNextId(sheet, prefix) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return prefix + '100'; // Startnummer om tomt

  // Hämta sista IDt från kolumn A
  // Vi loopar baklänges ifall det finns tomrader
  for (let i = lastRow; i > 1; i--) {
    const val = sheet.getRange(i, 1).getValue();
    if (val && val.toString().indexOf(prefix) === 0) {
      const numberPart = parseInt(val.toString().replace(prefix, ''), 10);
      return prefix + (numberPart + 1);
    }
  }
  
  return prefix + '100';
}

// Hjälpfunktion: Skicka mailet
function sendSupportEmail(orderId, customerId, email, subject, description, rowLink) {
  const subjectLine = `Ny Ticket: ${orderId} - ${subject}`;
  
  const body = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #444;">Nytt Supportärende Mottaget</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order ID:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${orderId}</td>
        </tr>
         <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Kund ID:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${customerId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Avsändare:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
      </table>
      
      <br>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">
        <h3 style="margin-top: 0;">${subject}</h3>
        <p style="white-space: pre-wrap;">${description}</p>
      </div>
      <br>
      
      <p style="text-align: center;">
        <a href="${rowLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Öppna Ärende i Google Sheets
        </a>
      </p>
      <p style="text-align: center; color: #888; font-size: 12px;">
        <em>Klicka på knappen för att öppna kalkylarket och ändra status.</em>
      </p>
    </div>
  `;

  GmailApp.sendEmail(CONF.emailSupport, subjectLine, '', { htmlBody: body });
}
