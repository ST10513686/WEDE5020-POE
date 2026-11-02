# DriveHub Motors – WEDE5020 POE (Part 3)

**Student:** Ntatiso Mabunda (ST10513686) · **Module:** WEDE5020 · **Group:** 3
**Repository:** _add your GitHub repository link here_
**Live site:** _add your Netlify / GitHub Pages link here_

DriveHub Motors is a Braamfontein dealership that curates premium and performance vehicles through trusted partners such as Pharoah Auto Investments. This repository contains the seven-page website built in HTML5, CSS3 and vanilla JavaScript.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home – welcome, value proposition, featured vehicles, showroom video |
| `about.html` | About Us – story, mission, values |
| `products-and-services.html` | Vehicles loaded with JavaScript, with filter, search and sort |
| `gallery.html` | Photo gallery with lightbox |
| `news.html` | News and updates |
| `enquiry.html` | Enquiry form – instant cost / availability response |
| `contact.html` | Contact form, opening hours and interactive map |

Other files: `CSS/style.css`, `JAVASCRIPT/script.js`, `IMAGE/`, `robots.txt`, `sitemap.xml`, `_headers` (security headers for Netlify).

## Part 3 – What was added

### JavaScript functionality (`JAVASCRIPT/script.js`)
- **Dynamic content:** the vehicle listing on the Products page is generated from a JavaScript array.
- **Search, filter and sort:** live search box, category filter buttons, and sort by name (A–Z / Z–A) or category, with a results count and a "no results" message.
- **Enquiry form (`enquiry.html`):** validates name, email, optional phone, category, enquiry type, preferred date (required for test drives, not in the past, not a Sunday) and message length; then shows a cost / availability response and a reference number.
- **Contact form (`contact.html`):** validates name, email, optional phone, message type and message length; on success it compiles the details into an email to the address in the code (`info@drivehubmotors.co.za`) which the visitor can send with one click.
- **AJAX submission:** both forms submit with `fetch` (asynchronously, JSON, 10 second timeout) to the URL in the form's `action` attribute and handle errors without reloading the page. The endpoint is the free test service `jsonplaceholder.typicode.com`, which accepts the data and returns a fake id; it does not deliver email. Replace the `action` URL with a real form service when going live.
- **Error handling:** inline red error messages beside each field, a status message, and a mailto fallback if the network fails.
- **Gallery lightbox:** click to enlarge, next/previous buttons, arrow keys and Esc.
- **Scroll-reveal animation** (respects reduced-motion settings) and an **interactive Leaflet / OpenStreetMap map** of the showroom.

### SEO
- Unique `<title>`, meta description and keywords on every page; one `<h1>` per page with a logical heading order.
- Descriptive image file names (for example `porsche-911-gts-rear.jpg`) and alt text on every image.
- Clean, descriptive page URLs (`products-and-services.html`, `enquiry.html`, …) and internal links between pages (home, about, news and products link to the enquiry and contact pages).
- Mobile friendly: responsive layout with `viewport` meta tag and CSS media queries.
- Local SEO: Braamfontein / Johannesburg keywords, `AutoDealer` structured data (address, geo, opening hours), canonical URLs and Open Graph tags.
- `robots.txt` and `sitemap.xml` listing all seven pages.

### Page speed
- Lazy loading and `decoding="async"` on below-the-fold images, explicit image width and height, high priority for the hero image, and `preload="none"` on the video.

### Security
- Content-Security-Policy and referrer policy meta tags, plus `_headers` (X-Frame-Options, nosniff, Permissions-Policy) for Netlify.
- User input is written to the page with `textContent` (never `innerHTML`), and Leaflet is loaded with Subresource Integrity hashes.

## Changelog

### Part 3
- Added `enquiry.html` and moved the enquiry form there; added Enquiry to the navigation on every page.
- Renamed pages from `Page 1–6.html` to descriptive file names and renamed images to descriptive, hyphenated names.
- Linked `JAVASCRIPT/script.js` correctly on all pages and corrected the stylesheet path to `CSS/style.css`.
- Added vehicle search and sort, AJAX form submission, phone / date / length validation, and the lightbox.
- Replaced the Google Maps iframe with an interactive Leaflet map.
- Fixed a broken image tag on the Gallery page, an invalid `<p><h3>` on the Home page, a wrong width and alt text on the Home page BMW M4 image, and a misplaced `<body>` tag on the Contact page.
- Test-drive and opening-hours text now agree across the Contact and Enquiry pages.
- Added SEO tags, structured data, security headers, performance improvements and this README.

### Feedback edits from Part 2
_Add each change you made in response to your lecturer's Part 2 feedback here, one line per change (for example: "Feedback: …  →  Change: …")._

### Part 2 and earlier
_Paste your existing Part 1 / Part 2 changelog entries here._

## Running locally
Open `index.html` in a browser. The map needs an internet connection, and the forms need one to reach the test endpoint.

## Deploying (free hosting)
**Netlify:** sign in, choose *Add new site → Deploy manually* and drag the project folder in (or connect the GitHub repository). **GitHub Pages:** in the repository go to *Settings → Pages*, choose the `main` branch and root folder. After deploying, replace `https://www.drivehubmotors.co.za/` in the canonical, Open Graph and structured-data tags, `sitemap.xml` and `robots.txt` with your real site address.

## Pushing to GitHub
```
git add .
git commit -m "Part 3: JavaScript, enquiry page, SEO and README"
git push origin main
```

## References
- Leaflet. (2023). *Leaflet – an open-source JavaScript library for interactive maps*. https://leafletjs.com
- OpenStreetMap contributors. *OpenStreetMap*. https://www.openstreetmap.org
- Mozilla Developer Network. *Intersection Observer API*. https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Mozilla Developer Network. *Using the Fetch API*. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Mozilla Developer Network. *Client-side form validation*. https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
- JSONPlaceholder. *Free fake and reliable API for testing and prototyping*. https://jsonplaceholder.typicode.com
- Schema.org. *AutoDealer*. https://schema.org/AutoDealer
- Google Search Central. *SEO Starter Guide*. https://developers.google.com/search/docs/fundamentals/seo-starter-guide
