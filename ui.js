function createEconomyMenu() {
    // Maak een zwevend venster aan op het scherm
    let menu = document.createElement('div');
    menu.id = 'geofs-eco-menu';
    menu.style = 'position:fixed; top:70px; left:20px; padding:15px; background:rgba(0,0,0,0.85); color:white; font-family:sans-serif; z-index:99999; border-radius:8px; width:220px; box-shadow: 0px 4px 10px rgba(0,0,0,0.5);';
    
    menu.innerHTML = `
        <h3 style="margin-top:0; color:#28a745; text-align:center;">✈️ GeoFS EcoMod</h3>
        <label>Vertrek (ICAO):</label><br>
        <input type="text" id="eco-dep" placeholder="bijv. EHAM" style="width:90%; margin-bottom:8px; padding:4px;"><br>
        <label>Bestemming (ICAO):</label><br>
        <input type="text" id="eco-dest" placeholder="bijv. EGLL" style="width:90%; margin-bottom:8px; padding:4px;"><br>
        <label>Passagiers:</label><br>
        <input type="number" id="eco-pax" value="0" min="0" style="width:90%; margin-bottom:12px; padding:4px;"><br>
        <button id="eco-start-btn" style="width:100%; padding:8px; background:#28a745; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Start Vlucht Plan</button>
        <hr style="border-color:#444; margin:12px 0;">
        <div id="eco-status" style="font-family:monospace; font-size:12px;">Status: Standby</div>
    `;
    
    document.body.appendChild(menu);
    
    // Koppel de knop aan de start-functie
    document.getElementById('eco-start-btn').addEventListener('click', function() {
        let dep = document.getElementById('eco-dep').value.toUpperCase().trim();
        let dest = document.getElementById('eco-dest').value.toUpperCase().trim();
        let pax = parseInt(document.getElementById('eco-pax').value) || 0;
        
        startActiveFlight(dep, dest, pax);
    });
}
