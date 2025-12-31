# Hur du ger din kollega tillgång till Google Login

Eftersom din app använder känsliga funktioner (som att läsa mail och kalender) är den i "Testing"-läge hos Google. Det betyder att ingen utom du kan logga in, om du inte lägger till dem manuellt.

## Så här gör du (Tar 2 minuter):

1.  **Gå till Google Cloud Console:**
    Klicka på denna länk: [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)

2.  **Se till att du är i rätt projekt:**
    Längst upp till vänster (bredvid "Google Cloud"-loggan), se till att projektet **`robotrna-demo-gashi`** är valt.

3.  **Gå till "Audience" (eller "Test users"):**
    Under rubriken **"Test users"** (Testanvändare), klicka på knappen **+ ADD USERS**.

4.  **Skriv in kollegans mail:**
    Skriv in din kollegas Gmail-adress (t.ex. `kollega@gmail.com`) och klicka på **SAVE**.

---

## Klart! 🚀
Nu kan din kollega gå till din hemsida (antingen lokalt eller på Hostinger), klicka på "Logga in med Google" och komma in utan problem.

*OBS: Eftersom appen inte är verifierad av Google än, kommer de få en varningsruta som säger "Google hasn’t verified this app". Detta är normalt! De behöver bara klicka på "Advanced" -> "Go to Robotrna (unsafe)" för att fortsätta.*
