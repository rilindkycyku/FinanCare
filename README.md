
## Statusi i Projektit

> [!WARNING]
> **KUJDES:** Ky projekt është ende në zhvillim e sipër (Work in Progress / Unfinished). Mund të ketë ndryshime dhe nuk është gati për t'u përdorur në produksion.

# FinanCare - POS, eOrder & More by Rilind Kyçyku

### Logo

![](ReadMeImages/Logo.png)

Projekti është i tipit Shitje dhe Kontabilitet.

Ky projekt është i punuar në:

- **React JS** (`financarevite`) - Frontend Administrativ (POS, Kalkulime, Statistika etj.)
- **React JS** (`financareonline`) - Frontend Publik (Porosi Online / eOrder)
- **ASP.NET Core** - Backend (WebAPI)
- **MSSQL** – Database

# Informata rreth Funksioneve, Konfigurimit dhe Pamjes

## Funksionet

- Authentikimi bëhet përmes JWToken.
- **Eksportimi i të Dhënave** - Eksportimi i të dhënave është i mundur në të gjitha faqet ku gjenden tabela. Eksportimi lejohet në formate të ndryshme si: Excel, JSON, CSV, Tekst etj.
- **Tabelat** - Secila tabelë është e konfiguruar në atë mënyrë që të mundësojë filtrimin e të dhënave pas kërkimit, apo të bëjë renditjen e tyre sipas të gjitha kolonave në tabelë.
- **Fatura** - Secila porosi ka të mundur shfaqjen, ruajtjen dhe printimin e faturës për atë porosi, gjithashtu gjatë blerjes me POS fatura shfaqet gjithmonë pas mbylljes së Paragonit.
- **Barcode** - Secila faturë ka të vendosur Barcode i cili përmban numrin e faturës.
- **Statistikat** - Kjo është një faqe e dedikuar vetëm për statistikat e Dyqanit e cila ka qasje vetëm Roli i Admin. Në këtë faqe gjenden statistika të ndryshme për shitje, produkte dhe klientë.
- **Zbritjet e Produktit** - Zbritjet mundësohen për të gjitha produktet dhe mund të vendosen sipas datave të ndryshme.
- **Të dhënat e Biznesit** - Këtu mund të vendosen të dhënat e biznesit si Emri i Biznesit, Numri Unik, TVSH etj., Logo si dhe informatat bankare të cilat shfaqen tek pjesa e faturës.
- **Atributi isDeleted** - Me këtë atribut mundësohet që gjatë largimit të produkteve, kategorive, kompanive etj. nga sistemi ato në të vërtetë nuk fshihen por mbeten në databazë, por nuk shfaqen tek klienti. Kjo është bërë që të mos ketë probleme pas largimit dhe të mos ndryshohen faturat e statistikat.
- **Menaxhimi i Borxheve - POS** - Çdo klient që posedon bonus kartelë në sistem ka mundësi që gjatë pagesës të marrë borxh, gjë që sistemi bën kalkulimin automatik të tij.
- **Çmimorja** - Çmimorja është aktive për printim gjatë kalkulimit si dhe zbritjeve.
- **Kartelat Financiare** - Kartelat financiare janë të mundura për cilin do partner që është i vendosur në sistem.
- **Kartelat e Artikullit** - Secili artikull posedon kartela të cilat përmbajnë informatat kyçe për produktin.

## Konfigurimi

Ju mund ta startoni projektin në dy mënyra: duke përdorur **Docker** (më e lehta) ose **Manulisht**.

### Opsioni 1: Përdorimi i Docker (Rekomandohet)

1. Në folderin kryesor të projektit, kopjoni file-in `.env.example` dhe emërtojeni `.env`.
2. Hapni terminalin në folderin kryesor dhe ekzekutoni komandën:
   ```bash
   docker compose up -d --build
   ```
   *(Kjo komandë do të ndërtojë dhe startojë automatikisht të katër shërbimet: databazën MSSQL, WebAPI-në, Frontend-in Administrativ dhe Frontend-in Publik. Databaza do të migrohet dhe të dhënat fillestare do të shtohen vetë).*
3. Pasi të jenë startuar të gjitha kontejnerët, hapni shfletuesin tuaj:
   - **Frontend Admin (`financarevite`):** `http://localhost:3000`
   - **Frontend Online (`financareonline`):** `http://localhost:3001`
   - **API (Swagger):** `http://localhost:7286/swagger`

   > **Shënim:** Adresa IP dhe portet konfigurohen automatikisht. Nuk keni nevojë të ekzekutoni `npm run dev` kur përdorni Docker.

---

### Opsioni 2: Konfigurimi Manual (Pa Docker)

Së pari duhet të bëhet konfigurimi i Connection String në `FinanCare/appsettings.json` dhe duhet të ndërrohet emri i Server me atë të serverit tuaj. Pastaj ju duhet të bëni run komandën **EntityFrameworkCore\update-database** në **Serverin e Projektit - FinanCare**, e cila do të mundësojë gjenerimin në tërësi të databazës dhe insertimin e të dhënave bazike.

### **Njoftimi për Ndryshimin e Serverit të API dhe Front**
API i cili vjen nga ASP.NET Core mund të ndryshohet duke vendosur adresën IP në file-in `.env` që gjendet në folderin `financare`. Adresa IP mund të gjendet duke ekzekutuar komandën `ipconfig` në Command Prompt (CMD).  
- **Hapi 1**: Hapni CMD dhe shkruani:
```ipconfig```
Kërkoni nën seksionin "IPv4 Address" (p.sh., `192.168.0.102`).  
- **Hapi 2**: Në file-in `.env`, shtoni ose përditësoni rreshtin:
```VITE_API_BASE_URL=http://192.168.0.102:7285```
```VITE_BASE_URL=http://192.168.0.102:5173```
- **Shënim**: Zëvendësoni `192.168.0.102` me adresën tuaj IP dhe `7285 dhe 5173 (Front)` me portin e konfiguruar për API-n tuaj (```7285 dhe 5173``` janë të konfiguruar automatikisht).

> **Shënim:** Kur ekzekutoni `npm run dev`, skripti `update-env.js` e përditëson `.env` automatikisht me IP-në dhe portin aktual të sistemit tuaj.

### **Konfigurimi i Certifikatës HTTPS**
Për të shmangur problemet gjatë përdorimit të HTTPS, duhet të krijohet dhe të besohet një certifikatë zhvillimi.  
- **Hapi 1**: Hapni PowerShell si Administrator.  
- **Hapi 2**: Ekzekutoni komandën:
```dotnet dev-certs https --trust```
- **Rezultati**: Do të shihni një mesazh konfirmimi dhe certifikata HTTPS do të regjistrohet në sistemin tuaj për komunikim të sigurt gjatë zhvillimit.  

### **Rregullimi i Skanerit të Barkodeve në Rrjet Lokal**
Kur përdorni Docker për përdorim final, serveri përgatit automatikisht HTTPS në portin `3443` në mënyrë që kamera e skanerit të punojë nga telefonat/tabletët në rrjetin e dyqanit pa asnjë konfigurim shtesë.

Kur zhvilloni manualisht me `npm run dev`, aplikacioni hapet në HTTP të thjeshtë (kështu menaxheri i fjalëkalimeve funksionon pa problem). Nëse dëshironi të testoni skanerin nga një telefon tjetër në rrjet pa aktivizuar HTTPS të komplikuar, bëni këtë në telefon:
1. Hapni: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Shtoni IP-në e serverit tuaj (p.sh., `http://192.168.1.10:5173`)
3. Ndryshoni në **`Enabled`** dhe bëni **Relaunch**.
Tani kamera do të punojë përmes HTTP pa ndonjë paralajmërim "Not Secure"!

Pasi të keni përfunduar me këto hapa, ju duhet të bëni **run** serverin dhe pastaj në Visual Studio Code, pjesën e React që gjendet tek **financare**, duhet të hapet në terminal. Më pas duhen të bëhen run këto komanda:

- **npm i** - Bën instalimin automatik të paketave të nevojshme.
- **npm run build** - Bën Build Projektin.  
_Këto duhen të bëhen vetëm nëse e keni hapur projektin për herë të parë._
- **npm run dev** - Bën startimin e projektit. (_Kjo duhet të bëhet gjithmonë kur startojmë projektin e Vite._)

Pasi të bëhet konfigurimi, ju mund të kyçeni me këto të dhëna:

| **Email**                               | **Password**               | **Aksesi**            |
|-----------------------------------------|----------------------------|-----------------------|
| financa.financa@financare.com           | financafinanca1@           | Financa               |
| mbeshtetje.klientit@financare.com       | mbeshtetjeklientit1@       | Mbështetje e Klientit |
| qmimore.qmimore@financare.com           | qmimoreqmimore1@           | Çmimore               |
| faturist.faturist@financare.com         | faturistfaturist1@         | Faturist              |
| kalkulant.kalkulant@financare.com       | kalkulantkalkulant1@       | Kalkulant             |
| menaxher.menaxher@financare.com         | menaxhermenaxher1@         | Menaxher              |
| komercialist.komercialist@financare.com | komercialistkomercialist1@ | Komercialist          |
| arkatar.arkatar@financare.com           | arkatararkatar1@           | Arkatar               |
| burime.njerzore@financare.com           | burimenjerzore1@           | Burime Njerzore       |
| puntor.thjeshte@financare.com           | puntorthjeshte1@           | Puntor i Thjeshtë     |

# AksesiFinancare

## Gjenerale

| **Faqja**                | **Roli**                                                                                                |
|---------------------------|----------------------------------------------------------------------------------------------------------|
| Partneret (grup)           | Menaxher, Financa, Mbeshtetje e Klientit, Kalkulant, Pergjegjes i Porosive, 1 Euro Menaxher, 1 Euro Staff |
| Kartela Financiare          | Menaxher, Financa, Mbeshtetje e Klientit, 1 Euro Menaxher                                                  |
| ShtoPagesat                 | Menaxher, Financa, 1 Euro Menaxher                                                                         |
| Lista e Partnereve          | Menaxher, Kalkulant, Komercialist, Pergjegjes i Porosive, 1 Euro Menaxher, 1 Euro Staff                   |
| Stafi (grup)                | Menaxher, Burime Njerzore, 1 Euro Menaxher                                                                 |
| Lista e Perdorueseve        | Menaxher, Burime Njerzore, 1 Euro Menaxher                                                                 |
| Te Dhenat (grup)            | Te Gjitha Rolet                                                                                            |
| Bankat                      | Menaxher, Financa, Burime Njerzore, 1 Euro Menaxher                                                        |
| Llogarit Bankare Biznesit   | Te Gjitha Rolet                                                                                            |
| Perditeso Fjalekalimin      | Te Gjitha Rolet                                                                                            |
| Te Dhenat e Biznesit        | Te Gjitha Rolet                                                                                            |
| Bart te Dhenat - Online     | Menaxher                                                                                                   |

## Materiali

| **Faqja**                          | **Roli**                                                                                                          |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Artikujt (grup)                      | Te Gjithe                                                                                                          |
| Grupet e Produktit                   | Menaxher, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                                                                 |
| Kartela e Artikullit                 | Menaxher, Kalkulant, Faturist, 1 Euro Menaxher                                                                     |
| Lista e Produkteve                   | Te Gjithe                                                                                                          |
| Njesia Matese                        | Menaxher, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                                                                 |
| Zbritjet e Produktit                 | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Stoqet                               | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Qmimore (Shtyp Etiketat)             | Menaxher, Pergjegjes i Porosive, Puntor i Thjeshte, Kalkulant, Arkatar, Faturist, 1 Euro Menaxher, 1 Euro Staff   |
| Hyrjet (grup)                        | Menaxher, Kalkulant, Komercialist, Faturist, Arkatar, Pergjegjes i Porosive, 1 Euro Menaxher, 1 Euro Staff        |
| Fletelejimet                         | Menaxher, Kalkulant, Komercialist, Faturist                                                                        |
| Fletelejimet Automatike              | Menaxher, Kalkulant, Komercialist, Faturist                                                                        |
| Kalkulimi i Mallit                   | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Kthim i Mallit te Shitur             | Menaxher, Kalkulant, Arkatar, 1 Euro Menaxher, 1 Euro Staff                                                        |
| Kalkulimi Fillestar Vjetor           | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Pranimi I Mallit                     | Menaxher, Kalkulant, Pergjegjes i Porosive, 1 Euro Menaxher, 1 Euro Staff                                          |
| Shitjet (grup)                       | Menaxher, Kalkulant, Komercialist, Faturist, Arkatar, 1 Euro Menaxher, 1 Euro Staff                               |
| Asgjesim i Stokut                    | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Kthim i Mallit te Blere              | Menaxher, Kalkulant, 1 Euro Menaxher                                                                               |
| Porosite                             | Menaxher, Kalkulant, Faturist                                                                                      |
| Ofertat                              | Menaxher, Kalkulant, Komercialist, Faturist                                                                        |
| Porosite Online                      | Menaxher, Kalkulant, Komercialist, Faturist                                                                        |
| Lista Shitjeve me Paragon            | Menaxher, 1 Euro Menaxher                                                                                          |
| POS                                  | Menaxher, Arkatar, 1 Euro Menaxher, 1 Euro Staff                                                                   |
| Statistika                           | Menaxher, 1 Euro Menaxher                                                                                          |
| Lista e Barazimeve                   | Menaxher, 1 Euro Menaxher                                                                                          |
| Barazo Arken                         | Menaxher, Arkatar, 1 Euro Menaxher, 1 Euro Staff                                                                   |

## Njoftimet

| **Faqja**                                  | **Roli**                                                                                                  |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Njoftimet (grup)                              | Menaxher, Puntor i Thjeshte, Pergjegjes i Porosive                                                        |
| Artikujt Pa Stok                              | Menaxher, Pergjegjes i Porosive, 1 Euro Menaxher, 1 Euro Staff                                            |
| Afatet e Skadimit                             | Menaxher, Puntor i Thjeshte, Pergjegjes i Porosive, Komercialist, Kalkulant, 1 Euro Menaxher, 1 Euro Staff |
| Furnitoret (grup)                             | Menaxher, Financa, Mbeshtetje e Klientit, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                         |
| &nbsp;&nbsp;Ditet e Furnizimit                | Menaxher, Pergjegjes i Porosive, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                                  |
| Porosite (grup)                               | Menaxher, Financa, Mbeshtetje e Klientit, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                         |
| &nbsp;&nbsp;Sugjerimi Porosise sipas Furnitorit | Menaxher, Pergjegjes i Porosive, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                                |
| &nbsp;&nbsp;Sugjerimi i Porosis               | Menaxher, Pergjegjes i Porosive, Kalkulant, 1 Euro Menaxher, 1 Euro Staff                                  |
| Faturat (grup)                                | Menaxher, Burime Njerzore                                                                                  |

## Te Tjera

| **Faqja**                       | **Roli**                                                                                  |
|------------------------------------|-------------------------------------------------------------------------------------------|
| Dashboard                           | Te Gjithe perveq Qmimore                                                                  |
| Shikimi Qmimeve                     | Te Gjithe                                                                                  |
| Login                                | Te Gjithe                                                                                  |
| Gjurmimi (grup)                      | Menaxher, Financa, Mbeshtetje e Klientit, Kalkulant, Pergjegjes i Porosive, 1 Euro Menaxher |
| &nbsp;&nbsp;Gjurmimi                 | Menaxher, 1 Euro Menaxher                                                                  |
| &nbsp;&nbsp;Lista e Gjitha Faturave  | Menaxher, Kalkulant, Financa, 1 Euro Menaxher                                              |

## Informata të tjera

Në rast se dëshironi të përdorni të dhënat e FinanCare, ato mund t’i gjeni në file-in që gjendet në folderin **Databaza** me emrin **FinanCareDB.sql**. Këtë file duhet ta bëni execute në **SQL Server** pasi të keni bërë konfigurimet paraprake.

## Pamja e FinanCare

### Login

![](ReadMeImages/Login.png)

### Dashboard

![](ReadMeImages/Dashboard.png)

### Tabela

![](ReadMeImages/Tabela.png)

### Eksportimi të Dhënave

![](ReadMeImages/ExportimiTeDhenave.png)

### Eksportimi të Dhënave - EXCEL

![](ReadMeImages/ExportimiTeDhenave.jpeg)

### Kartela e Artikullit

![](ReadMeImages/KartelaEArtikullit.png)

### Kartela Financiare

![](ReadMeImages/KartelaFinanciare.png)

### Kontrollimi Çmimeve

![](ReadMeImages/KontrollimiQmimev.png)

### Fatura

![](ReadMeImages/Fatura.jpg)

### Paragon

![](ReadMeImages/Paragon.jpg)

### Pagesat e Faturës

![](ReadMeImages/PagesatEFatures.png)

### POS

![](ReadMeImages/POS.png)

### Çmimorja

![](ReadMeImages/Qmimorja.jpg)

### Çmimorja Zbritjes

![](ReadMeImages/QmimorjaZbritjes.jpg)

### Statistikat

![](ReadMeImages/Statistikat.png)

## Të Drejtat e Autorit (Copyright & License)

Ky projekt është pronë intelektuale e **Rilind Kyçyku**. Nuk lejohet përdorimi, kopjimi, modifikimi apo shpërndarja e këtij kodi pa pëlqimin paraprak dhe miratimin me shkrim nga autori. Çdo përdorim i paautorizuar është rreptësisht i ndaluar.
