export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Als je de website bezoekt, trekt de Worker live GeoFS binnen en injecteert het opstartscript
    if (path === '/' || path === '') {
      try {
        const geofsResponse = await fetch('https://geo-fs.com');
        let html = await geofsResponse.text();

        // Dit script wacht rustig op de achtergrond tot GeoFS helemaal klaar is, en laadt dan pas jouw 3 bestanden in de juiste volgorde!
        const injectorScript = `
        <script>
          (function() {
            console.log("GeoFS Career Launcher: Wachten op simulator...");
            
            let bootCheck = setInterval(function() {
              if (typeof geofs !== 'undefined' && geofs.animation && geofs.animation.values) {
                clearInterval(bootCheck);
                console.log("GeoFS geladen! Addon bestanden nu injecteren...");

                // 1. Laad airports.js
                let s1 = document.createElement('script');
                s1.src = 'https://workers.dev';
                document.body.appendChild(s1);

                // 2. Laad ui.js vlak daarna
                setTimeout(function() {
                  let s2 = document.createElement('script');
                  s2.src = 'https://workers.dev';
                  document.body.appendChild(s2);
                }, 500);

                // 3. Laad main.js als laatste om alles te starten
                setTimeout(function() {
                  let s3 = document.createElement('script');
                  s3.src = 'https://workers.dev';
                  document.body.appendChild(s3);
                  console.log("GeoFS Career Launcher: Alle scripts succesvol actief!");
                }, 1000);
              }
            }, 1000);
          })();
        </script>
        `;

        // Plak het slimme opstartscript vlak voor het einde van de pagina
        html = html.replace('</body>', `${injectorScript}</body>`);

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
