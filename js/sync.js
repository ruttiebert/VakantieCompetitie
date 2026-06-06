// Namen opslaan
function saveNames() {
    playerNames.p1 = document.getElementById('input-name-p1').value || 'Speler 1';
    playerNames.p2 = document.getElementById('input-name-p2').value || 'Speler 2';
    localStorage.setItem('playerNames', JSON.stringify(playerNames));
    updateUI();
}

// JSON Export
function exportJSON() {
    const exportData = { p: playerNames, d: gamesData };
    const blob = new Blob([JSON.stringify(exportData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Competitie_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

// JSON Import
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            processImport(imported);
        } catch (err) { alert("Ongeldig bestand!"); }
    };
    reader.readAsText(file);
}

// Verwerk geïmporteerde of gescande data (Slimme Merge)
function processImport(data) {
    if(!data.p || !data.d) return alert("Verkeerd dataformaat.");
    
    // Voeg ontbrekende spellen toe (o.b.v. ID)
    let added = 0;
    data.d.forEach(importedGame => {
        if(!gamesData.find(g => g.id === importedGame.id)) {
            gamesData.push(importedGame);
            added++;
        }
    });

    if(added > 0) {
        gamesData.sort((a, b) => new Date(a.d) - new Date(b.d));
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        alert(`Synchronisatie geslaagd! ${added} nieuwe spellen toegevoegd.`);
        updateUI();
    } else {
        alert("Je bent al helemaal up-to-date!");
    }
}

// QR Code Genereren
let qrCode = null;
function generateQR() {
    const container = document.getElementById("qr-container");
    container.innerHTML = "";
    
    // Comprimeer data om te zorgen dat het in de QR past (alleen id's van spellen om grote data te voorkomen bij veel spellen, of de volledige JSON als het klein is)
    // Voor stabiliteit zenden we de laatste 20 spellen.
    const recentGames = gamesData.slice(-20); 
    const syncData = { p: playerNames, d: recentGames };
    const jsonString = JSON.stringify(syncData);

    qrCode = new QRCode(container, {
        text: jsonString,
        width: 250, height: 250,
        colorDark : "#121212", colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    openModal('modal-show-qr');
}

// QR Code Scanner
let html5QrcodeScanner = null;
function openScanner() {
    openModal('modal-scan-qr');
    if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
    }
    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

function closeScanner() {
    closeModal('modal-scan-qr');
    if(html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
}

function onScanSuccess(decodedText, decodedResult) {
    closeScanner();
    try {
        const data = JSON.parse(decodedText);
        processImport(data);
    } catch(e) {
        alert("Dit is geen geldige competitie QR-code.");
    }
}

function onScanError(errorMessage) {
    // Optioneel: handle errors, maar de library spamt deze vaak als hij *bijna* iets ziet.
}
