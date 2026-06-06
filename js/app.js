// State & Data
let gamesData = JSON.parse(localStorage.getItem('gamesData')) || [];
let playerNames = JSON.parse(localStorage.getItem('playerNames')) || { p1: 'Speler 1', p2: 'Speler 2' };
let scoreChartInstance = null;

// Initialisatie
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.getElementById('game-date').value = new Date().toISOString().slice(0, 16);
});

// UI Updates
function updateUI() {
    // Update Namen
    document.getElementById('name-p1-disp').innerText = playerNames.p1;
    document.getElementById('name-p2-disp').innerText = playerNames.p2;
    document.getElementById('input-name-p1').value = playerNames.p1;
    document.getElementById('input-name-p2').value = playerNames.p2;
    document.getElementById('label-score-p1').innerText = `Score ${playerNames.p1}`;
    document.getElementById('label-score-p2').innerText = `Score ${playerNames.p2}`;
    document.getElementById('opt-win-p1').innerText = playerNames.p1;
    document.getElementById('opt-win-p2').innerText = playerNames.p2;

    // Bereken Scores
    let totalP1 = 0; let totalP2 = 0;
    gamesData.forEach(g => {
        if(g.w === 'p1') totalP1 += parseInt(g.m);
        if(g.w === 'p2') totalP2 += parseInt(g.m);
        if(g.w === 'draw') { totalP1 += parseInt(g.m); totalP2 += parseInt(g.m); }
    });
    
    document.getElementById('score-p1').innerText = totalP1;
    document.getElementById('score-p2').innerText = totalP2;

    renderHistory();
    renderChart();
}

// Spel Opslaan
function saveGame() {
    const gameSelect = document.getElementById('game-select').value;
    const customGame = document.getElementById('game-custom').value;
    const name = gameSelect === 'overig' ? customGame : gameSelect;
    
    const newGame = {
        id: Date.now().toString(),
        d: document.getElementById('game-date').value,
        g: name,
        s1: document.getElementById('score-input-p1').value,
        s2: document.getElementById('score-input-p2').value,
        m: document.getElementById('game-multiplier').value,
        w: document.getElementById('game-winner').value
    };

    if(!newGame.g || !newGame.d) return alert("Vul alle velden in!");

    gamesData.push(newGame);
    gamesData.sort((a, b) => new Date(a.d) - new Date(b.d)); // Sorteer chronologisch
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
    
    closeModal('modal-add-game');
    updateUI();
}

// Geschiedenis Renderen
function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    // Reverse voor nieuwste bovenaan in logboek
    [...gamesData].reverse().forEach(g => {
        let winnerText = g.w === 'draw' ? 'Gelijkspel' : (g.w === 'p1' ? playerNames.p1 : playerNames.p2);
        let dateStr = new Date(g.d).toLocaleString('nl-NL', {day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'});
        
        list.innerHTML += `
            <div class="history-item win-${g.w}">
                <div class="history-info">
                    <strong>${g.g}</strong> (x${g.m})<br>
                    <small>${dateStr} - Winnaar: ${winnerText}</small><br>
                    <small>Score: ${g.s1} - ${g.s2}</small>
                </div>
                <button class="del-btn" onclick="deleteGame('${g.id}')">🗑️</button>
            </div>
        `;
    });
}

function deleteGame(id) {
    if(confirm("Weet je zeker dat je dit spel wilt verwijderen?")) {
        gamesData = gamesData.filter(g => g.id !== id);
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        updateUI();
    }
}

// Grafiek Renderen (Chart.js)
function renderChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    let p1Cumulative = 0; let p2Cumulative = 0;
    const labels = []; const dataP1 = []; const dataP2 = [];

    gamesData.forEach(g => {
        labels.push(new Date(g.d).toLocaleDateString('nl-NL'));
        if(g.w === 'p1') p1Cumulative += parseInt(g.m);
        if(g.w === 'p2') p2Cumulative += parseInt(g.m);
        if(g.w === 'draw') { p1Cumulative += parseInt(g.m); p2Cumulative += parseInt(g.m); }
        dataP1.push(p1Cumulative);
        dataP2.push(p2Cumulative);
    });

    if(scoreChartInstance) scoreChartInstance.destroy();

    scoreChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: playerNames.p1, data: dataP1, borderColor: '#00e5ff', tension: 0.3, backgroundColor: 'transparent' },
                { label: playerNames.p2, data: dataP2, borderColor: '#ff00ea', tension: 0.3, backgroundColor: 'transparent' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            color: '#fff',
            scales: {
                x: { ticks: { color: '#a0a0a0' }, grid: { color: '#333' } },
                y: { ticks: { color: '#a0a0a0', stepSize: 1 }, grid: { color: '#333' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

// UI Helpers
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('nav-' + tabId.replace('tab-', '')).classList.add('active');
}
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function toggleCustomGame() {
    const customInput = document.getElementById('game-custom');
    document.getElementById('game-select').value === 'overig' ? customInput.classList.remove('hidden') : customInput.classList.add('hidden');
}
