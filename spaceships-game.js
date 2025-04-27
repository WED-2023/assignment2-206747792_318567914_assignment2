let canvas, ctx;
let shipImg;
let fireSound, hitSound;

let ship;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let enemySpeedX = 2;
let enemyBulletSpeed = 5;
let enemyMoveDirection = 1;
let accelerationCount = 0;
let canShoot = true;
let canEnemyShoot = true;
let score = 0;
let gameOver = false;
let lives = 3;
let gameDurationLeft;
let keys = {};
let gameStarted = false;
let gameAnimationFrame;
let gameTimerInterval;
let enemyShootInterval;
let initialShipX;
let initialShipY;


function startSpaceshipGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  shipImg = new Image();
  shipImg.src = "images/spaceship.jpg";
  fireSound = document.getElementById("fireSound");
  hitSound = document.getElementById("hitSound");
  blockerHitSound = document.getElementById("blockerHitSound");


  ship = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: canvas.height - 60,
    width: 40,
    height: 60,
    speed: 5
  };
  
  initialShipX = ship.x;
  initialShipY = ship.y;
  
  bullets = [];
  enemyBullets = [];
  enemies = [];
  enemySpeedX = 2;
  enemyBulletSpeed = 5;
  enemyMoveDirection = 1;
  accelerationCount = 0;
  canShoot = true;
  canEnemyShoot = true;
  score = 0;
  gameOver = false;
  lives = 3;
  gameDurationLeft = gameDuration;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      enemies.push({
        x: 100 + c * 100,
        y: 50 + r * 60,
        radius: 20,
        row: r
      });
    }
  }

  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => delete keys[e.key]);

  startTimers();
  gameStarted = true;
  gameLoop();
  const bgMusic = document.getElementById("backgroundMusic");
  bgMusic.currentTime = 0;
  bgMusic.play();
}

function startTimers() {
  gameTimerInterval = setInterval(() => {
    if (gameDurationLeft > 0) {
      gameDurationLeft--;
    } else {
      endGame("Time Over");
    }
  }, 1000);

  setInterval(() => {
    if (accelerationCount < 4) {
      enemySpeedX += 1;
      enemyBulletSpeed += 1;
      accelerationCount++;
    }
  }, 5000);
}

function shoot() {
  if (canShoot) {
    bullets.push({ x: ship.x, y: ship.y, speed: 7 });
    fireSound.play();
    canShoot = false;
    setTimeout(() => canShoot = true, 300);
  }
}

function enemyShoot() {
  if (enemies.length > 0 && canEnemyShoot) {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({ x: randomEnemy.x, y: randomEnemy.y, speed: enemyBulletSpeed });
    canEnemyShoot = false;
  }
}

function update() {
  if (!gameStarted) return;

  if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
  if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;
  if (keys["ArrowUp"] && ship.y > canvas.height * 0.6) ship.y -= ship.speed;
  if (keys["ArrowDown"] && ship.y < canvas.height - ship.height) ship.y += ship.speed;
  if ((shootKey === "Space" && keys[" "]) || keys[shootKey.toLowerCase()] || keys[shootKey.toUpperCase()]) {
  shoot();
  }


  bullets.forEach(b => b.y -= b.speed);
  enemyBullets.forEach(b => b.y += b.speed);

  // תנועת אויבים רק ימינה ושמאלה
  let hitWall = false;
  enemies.forEach(e => {
    e.x += enemySpeedX * enemyMoveDirection;
    if (e.x > canvas.width - 30 || e.x < 30) {
      hitWall = true;
    }
  });
  if (hitWall) {
    enemyMoveDirection *= -1;
  }

  // ירי אויבים: רק אם אין כדור שלא ירד 3/4 מסך
  if (!enemyBullets.some(b => b.y < canvas.height * 0.75)) {
    canEnemyShoot = true;
  }
  if (canEnemyShoot) {
    enemyShoot();
  }

  // פגיעות: שחקן יורה על אויב
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const dx = enemies[i].x - bullets[j].x;
      const dy = enemies[i].y - bullets[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < enemies[i].radius) {
        switch (enemies[i].row) {
          case 0: score += 20; break;
          case 1: score += 15; break;
          case 2: score += 10; break;
          case 3: score += 5; break;
        }
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        hitSound.play();
        break;
      }
    }
  }

  // פגיעות: אויב יורה על שחקן
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (b.x > ship.x - ship.width / 2 &&
        b.x < ship.x + ship.width / 2 &&
        b.y > ship.y &&
        b.y < ship.y + ship.height) {
     blockerHitSound.play();
      lives--;
      enemyBullets.splice(i, 1);

      if (lives <= 0) {
        endGame("Lost");
      } else {
        ship.x = initialShipX;
        ship.y = initialShipY;
      }
    }
  }

  if (enemies.length === 0) {
    endGame("Won");
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(shipImg, ship.x - ship.width / 2, ship.y, ship.width, ship.height);

  ctx.fillStyle = "magenta";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = "yellow";
  enemyBullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Lives: " + lives, 150, 30);
  ctx.fillText("Time: " + formatTime(gameDurationLeft), 300, 30);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    gameAnimationFrame = requestAnimationFrame(gameLoop);
  }
}

function endGame(reason) {
  gameOver = true;
  cancelAnimationFrame(gameAnimationFrame);
  clearInterval(gameTimerInterval);

  // עצירה מיידית של מוזיקה
  const bgMusic = document.getElementById("backgroundMusic");
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic.loop = false;
  }

  setTimeout(() => {
    saveScore(score);
    showScreen("endGame");

    const endMessage = document.getElementById("endMessage");
    let message = "";

    if (reason === "Lost") {
      message = "You Lost!";
    } else if (reason === "Won") {
      message = "Champion!";
    } else if (reason === "Time Over") {
      message = score < 100 ? "You can do better!" : "Winner!";
    } else {
      message = "Game Over!";
    }
    
    endMessage.innerHTML = `<h2>${message}</h2>`;
    showScoreHistory();
  }, 500);
}



