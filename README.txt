# ALTZone — Clean The Zone

A standalone ALTZone promotional mini-game. It is NOT connected to Odoo.

## Included
- Responsive landing page
- ALTZone mascot from the supplied transparent PNG
- Catch-the-gear game
- Keyboard / mouse / touch controls
- 30-second round
- Win threshold: 15 caught items
- Reward screen with ALT15 / 15% OFF
- Shop CTA
- SVG gaming gear assets
- config.js for shop URL, coupon, win score and game duration
- qr.html helper for generating the campaign QR code

## Run locally
Option A: open `index.html` directly in a browser.

Option B (recommended for testing):
1. Open this folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html` → Open with Live Server.

## Publish it online
The easiest route is Netlify Drop:
1. Go to https://app.netlify.com/drop
2. Drag the entire `ALTZone-Clean-The-Zone` folder into the page.
3. Netlify gives you a public HTTPS URL.
4. Use that URL to make the QR code.

You can also deploy the same folder on Vercel or GitHub Pages.

## Important before a real coupon campaign
The current reward code is a front-end prototype. Anyone who inspects the JavaScript can find `ALT15`.
For a real campaign, use a backend/database to issue one-time unique coupon codes after verifying the score. This can be added after the visual/game experience is approved.

## Customize
Open `config.js` and change:
- `shopUrl` → your real ALTZone shop URL
- `couponCode` → your real campaign coupon
- `discountText` → the displayed discount
- `winScore` → how many items are needed
- `gameDuration` → seconds

After publishing, open `qr.html`, paste the public game URL, and generate the QR.
