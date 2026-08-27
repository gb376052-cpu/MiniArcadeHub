// --- ARCADE SWITCHER LOGIC ---
function switchGame(gameId) {
    document.querySelectorAll('.game-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`game-${gameId}`).classList.add('active');

    if (gameId === 'ttt') { toggleTTTMode(); initTTT(); }
    if (gameId === 'rps') resetRPS();
    if (gameId === 'memory') initMemory();
    if (gameId === 'guess') initGuess();
    if (gameId === 'snake') initSnake();
}

function goHome() {
    clearInterval(snakeInterval);
    document.querySelectorAll('.game-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('game-menu').classList.add('active');
}

// --- 1. TIC-TAC-TOE LOGIC ---
let tttN = 3, tttBoard = [], tttTurn = 'X', tttActive = true;

function toggleTTTMode() {
    let mode = document.getElementById('ttt-mode').value;
    let aiDiffSelect = document.getElementById('ttt-ai-diff');
    if (mode === 'pvp') {
        aiDiffSelect.style.display = 'none'; // Hide AI difficulty in 2-player mode
    } else {
        aiDiffSelect.style.display = 'inline-block'; // Show AI difficulty in vs AI mode
    }
}

function initTTT() {
    tttN = parseInt(document.getElementById('ttt-size').value);
    tttBoard = Array(tttN * tttN).fill('');
    tttTurn = 'X';
    tttActive = true;
    document.getElementById('ttt-status').textContent = "Player X's Turn";
    
    const boardEl = document.getElementById('ttt-board');
    let sizePx = tttN === 5 ? '45px' : tttN === 4 ? '52px' : '65px';
    let fontSize = tttN === 5 ? '1.4rem' : tttN === 4 ? '1.7rem' : '2rem';
    
    boardEl.style.gridTemplateColumns = `repeat(${tttN}, ${sizePx})`;
    boardEl.style.gridTemplateRows = `repeat(${tttN}, ${sizePx})`;
    boardEl.innerHTML = '';

    for (let i = 0; i < tttN * tttN; i++) {
        let cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.style.width = sizePx;
        cell.style.height = sizePx;
        cell.style.fontSize = fontSize;
        cell.dataset.index = i;
        cell.addEventListener('click', handleTTTClick);
        boardEl.appendChild(cell);
    }
}

function handleTTTClick(e) {
    let idx = e.target.dataset.index;
    let mode = document.getElementById('ttt-mode').value;
    if (tttBoard[idx] !== '' || !tttActive || (mode === 'pve' && tttTurn === 'O')) return;

    makeTTTMove(idx, tttTurn);
    if (checkTTTwin(tttTurn)) {
        document.getElementById('ttt-status').textContent = `Player ${tttTurn} Wins! 🎉`;
        tttActive = false;
        return;
    }
    if (tttBoard.every(c => c !== '')) {
        document.getElementById('ttt-status').textContent = "It's a Draw! 🤝";
        tttActive = false;
        return;
    }
    tttTurn = tttTurn === 'X' ? 'O' : 'X';
    document.getElementById('ttt-status').textContent = `Player ${tttTurn}'s Turn`;

    if (mode === 'pve' && tttTurn === 'O' && tttActive) {
        setTimeout(makeTTTAI, 400);
    }
}

function makeTTTMove(idx, player) {
    tttBoard[idx] = player;
    let cell = document.getElementById('ttt-board').children[idx];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
}

function makeTTTAI() {
    if (!tttActive) return;
    let empty = [];
    tttBoard.forEach((v, i) => { if (v === '') empty.push(i); });
    if (empty.length === 0) return;

    let diff = document.getElementById('ttt-ai-diff').value;
    let targetIdx = -1;

    if (diff === 'hard') {
        targetIdx = findBestTTTMove('O') || findBestTTTMove('X');
    } else if (diff === 'medium') {
        targetIdx = Math.random() < 0.6 ? findBestTTTMove('X') : -1;
    }

    if (targetIdx === -1 || targetIdx === undefined || tttBoard[targetIdx] !== '') {
        targetIdx = empty[Math.floor(Math.random() * empty.length)];
    }

    makeTTTMove(targetIdx, 'O');
    if (checkTTTwin('O')) {
        document.getElementById('ttt-status').textContent = "Computer Wins! 🤖";
        tttActive = false;
        return;
    }
    tttTurn = 'X';
    document.getElementById('ttt-status').textContent = "Player X's Turn";
}

function findBestTTTMove(player) {
    let empty = [];
    tttBoard.forEach((v, i) => { if (v === '') empty.push(i); });
    for (let idx of empty) {
        tttBoard[idx] = player;
        let wins = checkTTTwin(player);
        tttBoard[idx] = '';
        if (wins) return idx;
    }
    return -1;
}

function checkTTTwin(p) {
    for (let r = 0; r < tttN; r++) {
        if (-1 === [...Array(tttN)].findIndex((_, c) => tttBoard[r * tttN + c] !== p)) return true;
    }
    for (let c = 0; c < tttN; c++) {
        if (-1 === [...Array(tttN)].findIndex((_, r) => tttBoard[r * tttN + c] !== p)) return true;
    }
    if (-1 === [...Array(tttN)].findIndex((_, i) => tttBoard[i * tttN + i] !== p)) return true;
    if (-1 === [...Array(tttN)].findIndex((_, i) => tttBoard[i * tttN + (tttN - 1 - i)] !== p)) return true;
    return false;
}


// --- 2. ROCK PAPER SCISSORS LOGIC ---
let rpsUserScore = 0, rpsCpuScore = 0;
const rpsEmojis = { rock: '✊', paper: '✋', scissors: '✌️' };

function playRPS(userChoice) {
    let diff = document.getElementById('rps-diff').value;
    let choices = ['rock', 'paper', 'scissors'];
    let cpuChoice;

    if (diff === 'easy') {
        let losingMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
        cpuChoice = Math.random() < 0.6 ? losingMap[userChoice] : choices[Math.floor(Math.random() * 3)];
    } else if (diff === 'hard') {
        let winningMap = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
        cpuChoice = Math.random() < 0.75 ? winningMap[userChoice] : choices[Math.floor(Math.random() * 3)];
    } else {
        cpuChoice = choices[Math.floor(Math.random() * 3)];
    }

    document.getElementById('player-choice').textContent = rpsEmojis[userChoice];
    document.getElementById('cpu-choice').textContent = rpsEmojis[cpuChoice];

    let resMsg = "";
    if (userChoice === cpuChoice) {
        resMsg = "It's a Draw! 🤝";
    } else if ((userChoice === 'rock' && cpuChoice === 'scissors') || (userChoice === 'paper' && cpuChoice === 'rock') || (userChoice === 'scissors' && cpuChoice === 'paper')) {
        resMsg = "You Win! 🎉";
        rpsUserScore++;
    } else {
        resMsg = "Computer Wins! 🤖";
        rpsCpuScore++;
    }
    document.getElementById('rps-status').textContent = resMsg;
    document.getElementById('rps-score').textContent = `Score - You: ${rpsUserScore} | CPU: ${rpsCpuScore}`;
}

function resetRPS() {
    rpsUserScore = 0; rpsCpuScore = 0;
    document.getElementById('player-choice').textContent = '-';
    document.getElementById('cpu-choice').textContent = '-';
    document.getElementById('rps-status').textContent = 'Choose your weapon!';
    document.getElementById('rps-score').textContent = 'Score - You: 0 | CPU: 0';
}


// --- 3. MEMORY MATCH LOGIC ---
const allMemoryIcons = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];
let memoryCards = [], flippedCards = [], matchedPairs = 0, totalPairsToMatch = 4;

function initMemory() {
    let diff = document.getElementById('memory-diff').value;
    totalPairsToMatch = diff === 'hard' ? 8 : diff === 'medium' ? 6 : 4;
    
    let selectedIcons = allMemoryIcons.slice(0, totalPairsToMatch);
    let deck = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);
    memoryCards = deck;
    flippedCards = [];
    matchedPairs = 0;
    document.getElementById('memory-status').textContent = "Match all pairs!";
    
    let grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    let cols = 4;
    let cardSize = totalPairsToMatch === 8 ? '55px' : '65px';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    deck.forEach((icon, i) => {
        let card = document.createElement('div');
        card.className = 'memory-card';
        card.style.height = cardSize;
        card.dataset.icon = icon;
        card.dataset.index = i;
        card.textContent = '❓';
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    let card = this;
    let idx = card.dataset.index;
    if (flippedCards.length === 2 || card.classList.contains('flipped') || card.textContent !== '❓') return;

    card.textContent = card.dataset.icon;
    card.classList.add('flipped');
    flippedCards.push({ card, idx });

    if (flippedCards.length === 2) {
        let [c1, c2] = flippedCards;
        if (memoryCards[c1.idx] === memoryCards[c2.idx]) {
            matchedPairs++;
            flippedCards = [];
            if (matchedPairs === totalPairsToMatch) {
                document.getElementById('memory-status').textContent = "You Won! 🎉";
            }
        } else {
            setTimeout(() => {
                c1.card.textContent = '❓'; c1.card.classList.remove('flipped');
                c2.card.textContent = '❓'; c2.card.classList.remove('flipped');
                flippedCards = [];
            }, 600);
        }
    }
}


// --- 4. NUMBER GUESSING LOGIC ---
let targetNum = 0, attemptsLeft = 0, guessMaxRange = 50;

function initGuess() {
    let diff = document.getElementById('guess-diff').value;
    if (diff === 'hard') {
        guessMaxRange = 200;
        attemptsLeft = 8;
    } else if (diff === 'medium') {
        guessMaxRange = 100;
        attemptsLeft = 10;
    } else {
        guessMaxRange = 50;
        attemptsLeft = 12;
    }

    targetNum = Math.floor(Math.random() * guessMaxRange) + 1;
    document.getElementById('guess-range-label').textContent = `Guess a number between 1 and ${guessMaxRange} (${attemptsLeft} attempts left)`;
    document.getElementById('guess-status').textContent = "Make your guess!";
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-input').max = guessMaxRange;
}

function checkGuess() {
    let val = parseInt(document.getElementById('guess-input').value);
    let status = document.getElementById('guess-status');
    if (isNaN(val)) { status.textContent = "Enter a valid number!"; return; }
    
    attemptsLeft--;
    if (val === targetNum) {
        status.textContent = `Correct! 🎉 You found it!`;
    } else if (attemptsLeft <= 0) {
        status.textContent = `Game Over! 😢 Number was ${targetNum}.`;
    } else if (val < targetNum) {
        status.textContent = `Too Low! 📈 (${attemptsLeft} left)`;
    } else {
        status.textContent = `Too High! 📉 (${attemptsLeft} left)`;
    }
}


// --- 5. RETRO SNAKE LOGIC ---
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
let snake = [{x: 100, y: 100}], food = {x: 0, y: 0}, dx = 10, dy = 0, snakeScore = 0, snakeInterval = null;
let snakeColor = '#38bdf8';

function updateSnakeSkin() {
    let skin = document.getElementById('snake-skin').value;
    if (skin === 'green') snakeColor = '#22c55e';
    else if (skin === 'gold') snakeColor = '#eab308';
    else snakeColor = '#38bdf8';
}

function initSnake() {
    clearInterval(snakeInterval);
    snake = [{x: 100, y: 100}, {x: 90, y: 100}, {x: 80, y: 100}];
    dx = 10; dy = 0; snakeScore = 0;
    document.getElementById('snake-status').textContent = `Score: ${snakeScore}`;
    spawnFood();
    snakeInterval = setInterval(updateSnake, 110);
}

function spawnFood() {
    food.x = Math.floor(Math.random() * 26) * 10;
    food.y = Math.floor(Math.random() * 26) * 10;
}

function changeSnakeDir(newDx, newDy) {	
    // Prevent 180-degree immediate reverse self-collision
    if ((newDx === -10 && dx === 10) || (newDx === 10 && dx === -10)) return;
    if ((newDy === -10 && dy === 10) || (newDy === 10 && dy === -10)) return;
    dx = newDx * 10;
    dy = newDy * 10;
}

function updateSnake() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.some(s => s.x === head.x && s.y === head.y)) {
        clearInterval(snakeInterval);
        snakeInterval = null;
        document.getElementById('snake-status').textContent = `Game Over! Score: ${snakeScore}`;
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        document.getElementById('snake-status').textContent = `Score: ${snakeScore}`;
        spawnFood();
    } else {
        snake.pop();
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(food.x, food.y, 10, 10);
    
    ctx.fillStyle = snakeColor;
    snake.forEach(part => ctx.fillRect(part.x, part.y, 10, 10));
}

// Keyboard Controls for Desktop
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { changeSnakeDir(0, -1); e.preventDefault(); }
    if (e.key === 'ArrowDown') { changeSnakeDir(0, 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { changeSnakeDir(-1, 0); e.preventDefault(); }
    if (e.key === 'ArrowRight') { changeSnakeDir(1, 0); e.preventDefault(); }
});

// Touch Swipe Gesture Support for Mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}, {passive: true});

canvas.addEventListener('touchmove', e => {
    e.preventDefault(); // Prevents page from scrolling while playing
}, {passive: false});

canvas.addEventListener('touchend', e => {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Minimum swipe threshold to avoid accidental micro-touches
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 20) {
            if (diffX > 0) changeSnakeDir(1, 0);   // Swipe Right
            else changeSnakeDir(-1, 0);          // Swipe Left
        }
    } else {
        if (Math.abs(diffY) > 20) {
            if (diffY > 0) changeSnakeDir(0, 1);   // Swipe Down
            else changeSnakeDir(0, -1);          // Swipe Up
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, {passive: true});
