// ==UserScript==
// @name         GeoFS Economy & Flight Plan Mod
// @version      1.0
// @description  Voegt passagiers, brandstofverbruik en flightplans toe aan GeoFS
// @match        https://*://*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Status van de actuele vlucht
    let currentFlight = { active: false, fuel: 100, distance: 0, passengers: 0 };

    // Wiskundige formule om afstand te berekenen tussen coördinaten (Haversine)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Straal van de aarde in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round((R * c) / 1.852); // Omrekenen naar Nautische Mijlen (NM)
    }

    // Wacht tot GeoFS volledig is opgestart, laad dan de interface
    let checkGeoFS = setInterval(function() {
        if (typeof geofs !== 'undefined' && geofs.animation && geofs.animation.values) {
            clearInterval(checkGeoFS);
            createEconomyMenu();
        }
    }, 2000);

    // Functie die de vlucht activeert na een klik op de knop
    window.startActiveFlight = function(dep, dest, pax) {
        if (!airportDatabase[dep] || !airportDatabase[dest]) {
            document.getElementById('eco-status').innerText = "FOUT: ICAO code niet bekend!";
            return;
        }

        let from = airportDatabase[dep];
        let to = airportDatabase[dest];
        
        // Bereken de afstand van je flight plan
        let NM = calculateDistance(from.lat, from.lon, to.lat, to.lon);
        
        currentFlight.distance = NM;
        currentFlight.passengers = pax;
        currentFlight.fuel = 100;
        currentFlight.active = true;

        // Update de status in je menu
        document.getElementById('eco-status').innerHTML = `
            <b>VLUCHT ACTIEF</b><br>
            Route: ${dep} ➔ ${dest}<br>
            Afstand: ${NM} NM<br>
            Passagiers: ${pax}<br>
            Brandstof: <span id="eco-fuel-disp">100</span>%
        `;
    };

    // Live simulatie-loop (draait elke seconde)
    setInterval(function() {
        if (currentFlight.active && typeof geofs !== 'undefined' && geofs.animation.values) {
            // Als de motor draait (RPM > 100), verbruik je brandstof
            if (geofs.animation.values.rpm > 100) {
                currentFlight.fuel -= 0.02; // Brandstof zakt langzaam
                
                // Update live de brandstofmeter in de UI
                let fuelMeter = document.getElementById('eco-fuel-disp');
                if (fuelMeter) fuelMeter.innerText = Math.round(currentFlight.fuel);
            }
            
            // Als de brandstof op is, valt de motor stil
            if (currentFlight.fuel <= 0) {
                currentFlight.fuel = 0;
                geofs.aircraft.instance.engine.stop(); // Schakel motor uit in GeoFS
                document.getElementById('eco-status').innerHTML = "<b style='color:red;'>🚨 ENGINE FAILURE: BRANDSTOF OP!</b>";
            }
        }
    }, 1000);
})();
