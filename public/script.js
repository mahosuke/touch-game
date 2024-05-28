const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const startButton = document.getElementById('startButton');

let gameRunning = false;
let playerName = '';
let shapes = [];
let attempts = 0;
let maxAttempts = 10;
let results = [];
let startTime;

class Shape {
    constructor(type, x, y, size) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw() {
        ctx.fillStyle = 'white';
        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'square') {
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
    }
}

function startGame() {
    playerName = nameInput.value;
    if (playerName === '') {
        alert('名前を入力してください。');
        return;
    }
    gameRunning = true;
    attempts = 0;
    results = [];
    shapes = [];
    createRandomShape();
    startTime = new Date().getTime();
    nameInput.style.display = 'none';
    startButton.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
}

function createRandomShape() {
    const type = Math.random() > 0.5 ? 'circle' : 'square';
    const size = 30;
    const x = Math.random() * (canvas.width - size * 2) + size;
    const y = Math.random() * (canvas.height - size * 2) + size;
    shapes.push(new Shape(type, x, y, size));
}

function gameLoop() {
    if (gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => shape.draw());
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameRunning = false;
    displayResults();

    // Delay the display switch by 5 seconds (5000 milliseconds)
    setTimeout(() => {
        nameInput.style.display = 'block';
        startButton.style.display = 'block';
        canvas.style.display = 'none';
        // Clear the canvas after showing results
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);

    saveResults();
}

function displayResults() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';

    let totalTime = 0;
    results.forEach((result, index) => {
        ctx.fillText(`Attempt ${index + 1}: ${result.time}s ${result.hit ? 'Hit' : `Missed by ${result.distance}px at ${result.angle}°`}`, 10, 30 + index * 25);
        totalTime += parseFloat(result.time);
    });

    ctx.fillText(`Total Time: ${totalTime.toFixed(2)}s`, 10, 30 + results.length * 25 + 25);
}

function saveResults() {
    const gameResults = {
        name: playerName,
        results: results
    };

    fetch('/save_results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameResults)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

canvas.addEventListener('click', (event) => {
    if (!gameRunning) {
        startGame();
    } else {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedShape = shapes[0];
        const dx = x - clickedShape.x;
        const dy = y - clickedShape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const adjustedAngle = (angle + 360) % 360;
        const currentTime = new Date().getTime();
        const timeTaken = ((currentTime - startTime) / 1000).toFixed(2);

        if ((clickedShape.type === 'circle' && distance < clickedShape.size) ||
            (clickedShape.type === 'square' && Math.abs(dx) < clickedShape.size / 2 && Math.abs(dy) < clickedShape.size / 2)) {
            results.push({ time: timeTaken, hit: true, distance: 0, angle: 0 });
        } else {
            results.push({ time: timeTaken, hit: false, distance: distance.toFixed(2), angle: adjustedAngle.toFixed(2) });
        }

        attempts++;
        if (attempts < maxAttempts) {
            shapes = [];
            createRandomShape();
            startTime = new Date().getTime();
        } else {
            endGame();
        }
    }
});

startButton.addEventListener('click', startGame);
