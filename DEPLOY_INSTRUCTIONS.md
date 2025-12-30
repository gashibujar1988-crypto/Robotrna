# Deploy to Hostinger (Guide)

Eftersom din frontend (React) verkar använda Firebase direkt för databas och inloggning, är det enklaste sättet att få upp sidan att ladda upp den som en **Statisk Sida** på Hostinger.

## Steg 1: Bygg Frontend
Kör detta kommando i din terminal (här i VS Code):
```bash
npm run build
```
Detta skapar en mapp som heter `dist`. Denna mapp innehåller din färdiga hemsida.

## Steg 2: Ladda upp till Hostinger
1. Logga in på Hostinger och gå till **File Manager** (Filhanterare).
2. Gå in i mappen `public_html`.
3. Ta bort eventuella standardfiler (som `default.php`).
4. Ladda upp **INNEHÅLLET** i `dist`-mappen (inte själva mappen, utan filerna inuti: `index.html`, `assets`, osv) direkt till `public_html`.

## Steg 3: Fixa Router (Viktigt!)
För att sidor som `/dashboard` och `/agents` ska fungera när man laddar om sidan, måste du lägga till en `.htaccess`-fil.

1. I Hostinger File Manager (inne i `public_html`), skapa en NY fil som heter `.htaccess`.
2. Klistra in följande kod i den:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. Spara.

## Klart! 🚀
Nu ska din sida fungera på din domän.

---

### Om backend-mappen
Du har en `backend`-mapp som verkar vara en separat Express-server. Just nu använder din frontend Firebase (inte denna backend), så du behöver **inte** ladda upp backend-mappen för att sidan ska fungera. 

Om du i framtiden vill driftsätta backend-servern på Hostinger behöver du en **VPS** eller en Node.js-specifik plan, vilket är mer avancerat. För nuvarande funktionalitet räcker stegen ovan!
