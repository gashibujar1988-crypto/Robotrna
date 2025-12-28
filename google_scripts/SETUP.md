# Setup för Google Sheets Ticketsystem

Här är instruktionerna för att installera systemet du bad om.

## 1. Förbered Google Sheets

1.  Öppna kalkylarket som är kopplat till ditt Google Form.
2.  Döp om fliken (tabben) längst ner som innehåller formulärsvaren till: **`Ordrar`**
3.  **VIKTIGT:** Lägg till en **helt ny kolumn A** (längst till vänster).
    *   Högerklicka på kolumn A -> "Infoga kolumn till vänster".
    *   Döp Cellen A1 till: **`Ordernummer`**
4.  Längst till höger (efter alla frågor), lägg till en kolumnrubrik: **`Status`**
5.  Skapa en helt ny flik (Klicka på `+` längst ner) och döp den till: **`Kunder`**
    *   På rad 1 i "Kunder", lägg till dessa rubriker:
        *   A1: `Kundnummer`
        *   B1: `Email`
        *   C1: `Namn`
        *   D1: `Telefon`
        *   E1: `Skapad Datum`

---

## 2. Installera Skriptet

1.  I Google Sheets, klicka på menyn **Tillägg (Extensions)** -> **Apps Script**.
2.  En ny flik öppnas. Ta bort all kod som finns där (t.ex. `function myFunction() {...}`).
3.  Öppna filen `Code.gs` i denna mapp (`google_scripts/Code.gs`), kopiera **allt** innehåll och klistra in i Apps Script-editorn.
4.  **VIKTIGT:** På rad 6 i koden, ändra `din.email@gmail.com` till din riktiga mailadress dit du vill ha notiser.
5.  Klicka på diskett-ikonen (Spara) eller tryck `Ctrl + S`. Ge projektet ett namn, t.ex. "Ticketsystem".

---

## 3. Aktivera Automatisering (Trigger)

För att koden ska köras automatiskt när någon fyller i formuläret:

1.  I Apps Script-menyn till vänster, klicka på klock-ikonen (**Triggers**).
2.  Klicka på den blå knappen **"+ Add Trigger"** (längst ner till höger).
3.  Ställ in rutorna exakt så här:
    *   **Choose which function to run:** `onFormSubmit`
    *   **Select event source:** `From spreadsheet`
    *   **Select event type:** `On form submit`
4.  Klicka **Save**.
5.  Google kommer be dig välja konto och ge behörighet.
    *   Välj ditt konto.
    *   Om du ser en varning ("Google hasn't verified this app"), klicka på **Advanced** och sedan **Go to Ticketsystem (unsafe)** längst ner.
    *   Klicka **Allow**.

---

## 4. Klart!

Nu är det installerat.
1.  Fyll i ditt Google Form som en test-kund.
2.  Kolla i fliken `Ordrar`. Du ska se att `Ordernummer` (t.ex. ORD-100) fylls i automatiskt på raden.
3.  Kolla din mail. Du ska ha fått ett snyggt mail med en knapp som tar dig direkt till raden.
4.  Kolla fliken `Kunder`. Din test-kund ska ha lagts till där.
