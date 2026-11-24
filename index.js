export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Als je de website bezoekt, trekt de Worker live GeoFS binnen en bouwt jouw menu erin!
    if (path === '/' || path === '') {
      try {
        // 1. Haal de echte GeoFS pagina op vanaf hun server
        const geofsResponse = await fetch('https://www.geo-fs.com/geofs.php');
        let html = await geofsResponse.text();

        // 2. Dit is de code van jouw dashboard die we in de spelsite gaan injecteren
        const menuHTML = `
        <div id="launcher-sidebar" style="position:fixed; top:10px; right:10px; width:280px; background:rgba(20,30,50,0.92); backdrop-filter:blur(5px); color:white; font-family:sans-serif; z-index:999999; padding:20px; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);">
            <h2 style="margin:0 0 5px 0; font-size:20px; color:#4af37b; text-align:center;">✈️ Career Launcher</h2>
            <p style="margin:0 0 15px 0; font-size:12px; color:#ccc; text-align:center;">Volledig geïntegreerd dashboard</p>
            
            <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:6px; font-size:18px; font-weight:bold; text-align:center; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);">
                💰 Saldo: <span id="dash-balance">$10.000</span>
            </div>
            
            <div style="font-size:11px; color:#aaa; text-align:center;">
                Gebruik het vliegmenu links om je vlucht te starten.<br>Je voortgang wordt live bijgewerkt.
            </div>
        </div>
        <script>
            // Synchroniseer live het saldo met het dashboard
            setInterval(function() {
                let saved = localStorage.getItem('geofsEconMod_v1');
                if (saved) {
                    try {
                        let state = JSON.parse(saved);
                        document.getElementById('dash-balance').innerText = '$' + state.balance.toLocaleString();
                    } catch(e) {}
                }
            }, 1000);
        </script>
        `;

        // 3. Plak jouw menu en de mod-bestanden direct in de HTML-structuur van GeoFS
        const scriptsInject = `
        <script src="https://workers.dev"></script>
        <script src="https://workers.dev"></script>
        <script src="https://workers.dev"></script>
        `;

        // Voeg het menu toe aan de body, en laad direct de scripts in de head
        html = html.replace('</body>', `${menuHTML}</body>`);
        html = html.replace('</head>', `${scriptsInject}</head>`);

        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8' }
        });

      } catch (err) {
        return new Response('Fout bij het laden van GeoFS via de launcher', { status: 500 });
      }
    }

    // Zorg dat de losse scripts bereikbaar blijven voor de simulator
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
