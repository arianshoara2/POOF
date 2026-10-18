POOF — PWA files (Persian)

1) In your GitHub repo (arianshoara2/POOF):
   - Rename poof-wort-5.html to index.html (if not done yet)
   - Upload ALL files from this zip to the repo ROOT (same place as index.html):
     manifest.webmanifest, sw.js, icon-192.png, icon-512.png,
     icon-maskable-512.png, apple-touch-icon.png

2) Edit index.html on GitHub (pencil icon), add these lines inside <head>:
     <link rel="manifest" href="manifest.webmanifest">
     <link rel="apple-touch-icon" href="apple-touch-icon.png">
     <meta name="mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
     <meta name="apple-mobile-web-app-title" content="POOF">

   And add this right before </body>:
     <script>
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
     }
     </script>

   Commit the change.

3) Wait ~1 minute, open https://arianshoara2.github.io/POOF/
   - iPhone (Safari): Share -> Add to Home Screen
   - Android (Chrome): menu -> Add to Home screen / Install app
