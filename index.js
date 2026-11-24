export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Prachtige Launcher Dashboard startpagina
    if (path === '/' || path === '') {
      const html = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GeoFS Career Mod - Dashboard</title>
          <style>
              body {
                  margin: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                  color: white;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .dashboard {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 16px;
                  padding: 30px;
                  width: 450px;
                  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  text-align: center;
              }
              h1 { margin-bottom: 5px; font-size: 28px; color: #4af37b; }
              p { color: #ddd; margin-bottom: 25px; }
              .stat-card {
                  background: rgba(0, 0, 0, 0.3);
                  padding: 15px;
                  border-radius: 8px;
                  margin-bottom: 20px;
                  font-size: 20px;
                  font-weight: bold;
              }
              .launch-btn {
                  display: inline-block;
                  width: 100%;
                  padding: 15px;
                  background: #28a745;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 18px;
                  font-weight: bold;
                  transition: background 0.3s;
                  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
              }
              .launch-btn:hover { background: #218838; }
              .footer { margin-top: 25px; font-size: 12px; color: #bbb; }
          </style>
      </head>
      <body>
          <div class="dashboard">
              <h1>✈️ GeoFS Career Launcher</h1>
              <p>Beheer je vliegmaatschappij en verdien virtueel geld!</p>
              
              <div class="stat-card">
                  💰 Ondernemingssaldo: <span id="dash-balance">$10.000</span>
              </div>

              <a href="https://geo-fs.com" target="_blank" class="launch-btn" id="launch-link">
                  🚀 Start Simulator met Mod
              </a>

              <div class="footer">
                  Gekoppeld met Cloudflare Workers & GitHub
              </div>
          </div>

          <script>
              // Haal het live saldo op uit de localStorage van de browser
              let saved = localStorage.getItem('geofsEconMod_v1');
              if (saved) {
                  try {
                      let state = JSON.parse(saved);
                      document.getElementById('dash-balance').innerText = '$' + state.balance.toLocaleString();
                  } catch(e) {}
              }

              // Sla de injector-code op in het klembord van de gebruiker zodra ze klikken om het makkelijk te maken
              document.getElementById('launch-link').addEventListener('click', function() {
                  alert("De simulator opent in een nieuw tabblad! Klik in de adresbalk van de simulator en typ je mod-naam om hem te activeren.");
              });
          </script>
      </body>
      </html>
      `;
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }

    // Bestanden doorsturen vanaf GitHub CDN (jsDelivr)
    try {
      const githubUrl = `https://jsdelivr.net{path}`;
      const response = await fetch(githubUrl);
      
      if (!response.ok) return new Response('Bestand niet gevonden', { status: 404 });

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
