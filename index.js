export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Toon een basispagina als je de hoofdlink bezoekt
    if (path === '/' || path === '') {
      return new Response('<h1>GeoFS Economy Mod Worker is Live!</h1><p>Gebruik /main.js, /ui.js of /airports.js om de scripts te laden.</p>', {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Probeer het juiste bestand op te halen vanaf jouw GitHub repository via jsDelivr CDN
    // Dit zorgt ervoor dat je Worker altijd de allernieuwste code van je GitHub stuurt!
    try {
      const githubUrl = `https://jsdelivr.net{path}`;
      const response = await fetch(githubUrl);
      
      if (!response.ok) {
        return new Response('Bestand niet gevonden', { status: 404 });
      }

      const content = await response.text();
      return new Response(content, {
        headers: { 
          'content-type': 'application/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*' // Zorgt ervoor dat GeoFS dit script mag inladen!
        }
      });
    } catch (e) {
      return new Response('Server Fout', { status: 500 });
    }
  }
};
