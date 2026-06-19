# Cloudflare Pages instellingen voor Sterrenzo

Gebruik deze instellingen bij het aanmaken van het Cloudflare Pages-project:

- Framework preset: Hugo
- Build command: `hugo --gc --minify`
- Build output directory: `public`
- Root directory: leeg laten
- Environment variable: `HUGO_VERSION=0.163.3`

## Eigen domein koppelen

Koppel het hoofddomein via het nieuwe Pages-project:

1. Open in Cloudflare `Workers & Pages`.
2. Selecteer het Pages-project voor Sterrenzo.
3. Open `Custom domains` en kies `Set up a custom domain`.
4. Voeg `sterrenzo.nl` toe.
5. Wacht tot het domein de status `Active` heeft.

## Pages-domein doorsturen

Maak daarna in Cloudflare een account-level Bulk Redirect aan zodat bestaande
links naar het Pages-domein hun pad en trackingparameters behouden:

| Instelling | Waarde |
| --- | --- |
| Source URL | `sterrenzo.pages.dev` |
| Target URL | `https://sterrenzo.nl` |
| Status | `301` |
| Preserve query string | aan |
| Subpath matching | aan |
| Preserve path suffix | aan |
| Include subdomains | aan |

Maak een Bulk Redirect Rule aan die deze lijst gebruikt.

Voorbeeld:

`https://sterrenzo.pages.dev/posts/example/?utm_source=pinterest`

wordt:

`https://sterrenzo.nl/posts/example/?utm_source=pinterest`

## Optioneel: www doorsturen

Als `www.sterrenzo.nl` ook gebruikt moet kunnen worden, maak een tweede
Bulk Redirect aan van `www.sterrenzo.nl` naar `https://sterrenzo.nl`
met dezelfde opties en status `301`. Voeg in DNS ook een proxied `A`-record toe:

| Type | Naam | IPv4-adres | Proxy status |
| --- | --- | --- | --- |
| `A` | `www` | `192.0.2.1` | Proxied |
