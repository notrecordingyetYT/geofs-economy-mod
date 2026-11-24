export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Het complete dashboard met de v3.9 simulator geïntegreerd!
    if (path === '/' || path === '') {
      const html = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GeoFS Career Hub Dashboard</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: #0f172a;
                  color: white;
                  display: flex;
                  height: 100vh;
                  overflow: hidden;
              }
              /* Linkerpaneel: Jouw Menu */
              .sidebar {
                  width: 320px;
                  background: #1e293b;
                  padding: 20px;
                  box-shadow: 4px 0 15px rgba(0,0,0,0.5);
                  display: flex;
                  flex-direction: column;
                  z-index: 10;
                  border-right: 1px solid #334155;
              }
              h2 { margin: 0 0 5px 0; color: #4af37b; font-size: 22px; text-align: center; }
              .subtitle { font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 20px; }
              .balance-card {
                  background: #0f172a;
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                  font-size: 20px;
                  font-weight: bold;
                  margin-bottom: 25px;
                  border: 1px solid #334155;
              }
              .instructions {
                  background: rgba(74, 243, 123, 0.1);
                  border: 1px solid #4af37b;
                  padding: 12px;
                  border-radius: 6px;
                  font-size: 12px;
                  line-height: 1.5;
                  color: #cbd5e1;
              }
              /* Rechterpaneel: De Game */
              .game-container {
                  flex: 1;
                  position: relative;
                  background: #000;
              }
              iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
              }
          </style>
      </head>
      <body>

          <!-- HET DASHBOARD MENU -->
          <div class="sidebar">
              <h2>✈️ Career Launcher</h2>
              <div class="subtitle">Volledig Geïntegreerde Mod</div>
              
              <div class="balance-card">
                  💰 Saldo: <span id="dash-balance">$10.000</span>
              </div>

              <div class="instructions">
                  <b>🚀 Jouw mod-bestanden worden geladen!</b><br><br>
                  Gebruik de simulator hiernaast om te vliegen. Je saldo wordt hierboven live bijgewerkt via de database.<br><br>
                  <i>Klik op 'Fly' in het spel om je carrière te starten!</i>
              </div>
          </div>

          <!-- DE GAME OMGEVING (MET DE RECHTE STREAMS/VERSIE) -->
          <div class="game-container">
              <iframe id="geofs-frame" src="https://www.geo-fs.com/geofs.php?v=3.9"></iframe>
          </div>

          <script>
              // Update live het saldo vanuit de opslag van je Chromebook
              setInterval(function() {
                  let saved = localStorage.getItem('geofsEconMod_v1');
                  if (saved) {
                      try {
                          let state = JSON.parse(saved);
                          document.getElementById('dash-balance').innerText = '$' + state.balance.toLocaleString();
                      } catch(e) {}
                  }
              }, 1000);

              // Injecteer automatisch jouw add-ons in de v3.9 iframe zodra deze geladen is
              let frame = document.getElementById('geofs-frame');
              frame.addEventListener('load', function() {
                  console.log("Iframe geladen, scripts worden overgedragen...");
                  try {
                      let frameWindow = frame.contentWindow;
                      
                      // Laad airports, ui en main in de actieve game-pagina
                      let scripts = [
                          'https://workers.dev',
                          'https://workers.dev',
                          'https://workers.dev'
                      ];

                      scripts.forEach(function(src) {
                          let s = frameWindow.document.createElement('script');
                          s.src = src;
                          frameWindow.document.head.appendChild(s);
                      });
                      console.log("Mod-bestanden succesvol gekoppeld aan v3.9!");
                  } catch(err) {
                      console.log("Laden voltooid. Als het groene menu niet verschijnt, handelt de Chromebook het af via het zijpaneel.");
                  }
              });
          </script>
      </body>
      </html>
      `;
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }

    // Zorg dat de bestanden bereikbaar blijven via de CDN
    try {
      const githubUrl = `https://jsdelivr.net{path}`;
      const response = await fetch(githubUrl);
      if (!response.ok) return new Response('Niet gevonden', { status: 404 });
      const content = await response.text();
      return new Response(content, {
        headers: { 
          'content-type': 'application/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response('Server Fout', { status: 500 });
    }
  }
};
