# Hur ni jobbar två personer samtidigt i projektet

Eftersom ni redan har en GitHub-repo (`https://github.com/gashibujar1988-crypto/Robotrna`), är det superenkelt att samarbeta!

## Steg 1: Ge din kollega tillgång
1. Gå till din repo på GitHub: [Länk till Robotrna](https://github.com/gashibujar1988-crypto/Robotrna)
2. Klicka på **Settings** (överst) -> **Collaborators** (vänstermeny).
3. Klicka på **Add people** och skriv in din kollegas GitHub-användarnamn eller email.
4. De får nu en inbjudan via mail som de måste acceptera.

## Steg 2: Kollegan laddar ner projektet
Din kollega öppnar sin terminal (eller VS Code) och skriver:
```bash
git clone https://github.com/gashibujar1988-crypto/Robotrna.git
cd Robotrna
npm install
```
Nu har ni exakt samma kod!

## Steg 3: Det dagliga arbetet (The Loop)

### Innan du börjar jobba (Varje morgon):
Hämta alltid den senaste koden ifall din kollega har gjort ändringar:
```bash
git pull
```

### När du har gjort ändringar:
Spara dina ändringar och skicka upp dem till molnet:
```bash
git add .
git commit -m "Beskriv vad du gjort"
git push
```

### Om ni jobbar på samma fil (Konflikter)
Om ni båda ändrar i *samma fil* samtidigt kan det bli en "merge conflict".
- Git kommer varna er.
- Öppna filen i VS Code, så ser ni tydligt vad som är "Dina ändringar" och "Deras ändringar".
- Välj vilken kod som ska sparas, och gör sedan en ny commit.

**Tips:** Jobba gärna i olika filer eller prata med varandra ("Jag fixar Hero-sektionen nu") för att undvika krockar!
