
## Statusi i Projektit

> [!WARNING]
> **KUJDES:** Ky projekt është ende në zhvillim e sipër (Work in Progress / Unfinished). Mund të ketë ndryshime dhe nuk është gati për t'u përdorur në produksion.

# FinanCare Admin Frontend (Vite)

> [!IMPORTANT]
> **HTTPS ËSHTË I DETYRUESHËM (HTTPS IS REQUIRED)**
> Për shkak të rregullave të sigurisë së shfletuesve modernë (Google Chrome, Safari), ky aplikacion **DUHET** të hapet përmes `https://` kur qaseni nga një kompjuter tjetër, tablet, ose telefon. 
> 
> Nëse nuk përdorni HTTPS, veçoritë e mëposhtme **nuk do të funksionojnë**:
> 1. **Instalimi i Aplikacionit (PWA):** Butoni "Install App" nuk do të shfaqet.
> 2. **Skeneri i Barkodeve:** Kamera nuk do të lejohet të hapet nga shfletuesi.

## Përdorimi me Docker (Rekomandohet)

Kur e nisni projektin përmes Docker (`docker compose up -d --build`), Nginx konfigurohet automatikisht për të gjeneruar një certifikatë SSL vetë-nënshkruese (self-signed) dhe dëgjon në portin `3443`.

* **Qasja Lokale:** Mund të përdorni `http://localhost:3000` (Localhost trajtohet gjithmonë si i sigurt).
* **Qasja nga Rrjeti (LAN):** Kur qaseni nga një pajisje tjetër (p.sh. një tablet në dyqan), duhet të përdorni **`https://[IP-e-Serverit]:3443`**. 
  - *Kujdes:* Shfletuesi do t'ju shfaqë një paralajmërim "Your connection is not private". Klikoni **Advanced** dhe pastaj **Proceed to ... (unsafe)**. Pas kësaj, kamera dhe skeneri do të funksionojnë normalisht!

## Progressive Web App (PWA)

FinanCare është ndërtuar si një PWA. Kjo do të thotë që ju mund ta instaloni atë si një aplikacion të vërtetë në kompjuterin apo telefonin tuaj.
Nëse jeni duke përdorur një lidhje të sigurt (HTTPS ose Localhost), do të shihni një ikonë në shiritin e adresës për ta "Instaluar" atë, ose një buton "Add to Home Screen" në telefon.

Nëse dëshironi të instaloni PWA-në në një Rrjet Lokal (IP) pa përdorur një domain të vërtetë, duhet të aktivizoni këtë opsion në Chrome në pajisjen e klientit:
1. Shkoni te `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Shtoni IP-në tuaj (psh. `https://192.168.1.10:3443`)
3. Ndryshoni në **Enabled** dhe bëni Relaunch.

## Skeneri i Barkodeve

Aplikacioni integron një skener barkodesh direkt përmes kamerës së pajisjes. Për të përdorur këtë funksionalitet:
- Pajisja duhet të ketë një kamerë funksionale.
- Duhet t'i jepni leje shfletuesit për të përdorur kamerën kur t'ju kërkohet.
- **Kërkohet HTTPS** që shfletuesi të lejojë aktivizimin e kamerës (shih seksionin më lart).


## Të Drejtat e Autorit (Copyright & License)

Ky projekt është pronë intelektuale e **Rilind Kyçyku**. Nuk lejohet përdorimi, kopjimi, modifikimi apo shpërndarja e këtij kodi pa pëlqimin paraprak dhe miratimin me shkrim nga autori. Çdo përdorim i paautorizuar është rreptësisht i ndaluar.
