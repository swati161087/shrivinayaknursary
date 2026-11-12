SHRI VINAYAK NURSERY — WEBSITE + ADMIN
======================================

FOLDER LAYOUT
  index.html        public website
  admin.html        password-protected admin page
  server.js         small server (no installs needed, only Node.js)
  start-server.bat  double-click to start on Windows
  css/              one small file per section (base, buttons, forms, layout, hero,
                    catalogue, gallery, videos, contact, responsive, admin).
                    main.css imports them all — add/remove a line there to add/remove a module.
  js/               one small file per feature; js/admin/ holds the admin modules
  data/site.json    all editable content (contact, photos, videos, plants) — written by the admin page
  assets/           site icons (Ganesha favicon files) — replace to change the favicon
  favicon.ico       browser-tab icon (Lord Ganesha)
  images/           uploaded photos land here
  videos/           uploaded videos land here

RUN IT
  1. Install Node.js (free): https://nodejs.org   (version 16 or newer)
  2. Double-click start-server.bat   (or run:  node server.js)
  3. FIRST START prints your admin password in the console window. Save it.
  4. Website: http://localhost:3000/        Admin: http://localhost:3000/admin.html

WHAT THE ADMIN CAN DO
  Photos   - upload photos (saved into images/), add title/caption, reorder, delete
  Videos   - upload video files (saved into videos/) or add YouTube links, reorder, delete
  Plants   - add/edit/delete catalogue items with photo, price, badge
  Contact  - phone, WhatsApp, email, address, hours, Google Map
  Password - change the admin password

PASSWORD
  - The password is stored only as a salted hash in data/admin.json (never in plain text).
  - Forgot it? Stop the server, delete data/admin.json, start again: a new password is printed.
  - Or set your own:   set ADMIN_PASSWORD=YourStrongPassword   (Windows cmd, before running node server.js)
  - 5 wrong attempts lock login for 10 minutes. Sessions expire after 8 hours.

PUTTING IT ONLINE
  The admin page can only save files when server.js is running, so host it where Node.js runs
  (a VPS, Render, Railway, Azure App Service, etc.), start with "node server.js" and set the
  ADMIN_PASSWORD environment variable. Use HTTPS (most hosts provide it) so the login is encrypted.
  Back up data/, images/ and videos/ regularly — that is everything you uploaded.
  If you host only the static files (no Node), the public site still works; edit data/site.json by hand.

LIMITS
  Photos up to 15 MB each (big photos are shrunk automatically). Videos up to 500 MB each —
  for long videos a YouTube link is lighter and faster.
