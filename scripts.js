// scripts.js

// פונקציה להראות מסך מסוים ולהחביא אחרים
function showScreen(screenId) {
    // אם במשחק ורוצים לעבור למסך אחר חוץ מ-about
    if (gameStarted && screenId !== "about" && screenId !== "endGame") {
      silentEndGame();
    }
  
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.style.display = 'none';
    });
  
    document.getElementById(screenId).style.display = 'block';
  
    if (screenId === "endGame") {
      const bgMusic = document.getElementById("backgroundMusic");
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.loop = false;
      }
    }
  }
  
  

  

// פתיחת About Modal
function openAbout() {
  document.getElementById('aboutModal').style.display = 'block';
}

// סגירת About Modal
function closeAbout() {
  document.getElementById('aboutModal').style.display = 'none';
}

// סגירה בלחיצה על Esc או מחוץ לחלון
window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeAbout();
});

window.addEventListener('click', function(event) {
  const modal = document.getElementById('aboutModal');
  if (event.target === modal) closeAbout();
});

// מילוי שדות תאריך לידה
function fillBirthdayOptions() {
  const birthYear = document.getElementById('birthYear');
  const birthMonth = document.getElementById('birthMonth');
  const birthDay = document.getElementById('birthDay');

  for (let y = 1900; y <= new Date().getFullYear(); y++) {
      const option = document.createElement('option');
      option.value = y;
      option.text = y;
      birthYear.add(option);
  }

  for (let m = 1; m <= 12; m++) {
      const option = document.createElement('option');
      option.value = m;
      option.text = m;
      birthMonth.add(option);
  }

  for (let d = 1; d <= 31; d++) {
      const option = document.createElement('option');
      option.value = d;
      option.text = d;
      birthDay.add(option);
  }
}

// קריאה ראשונית
fillBirthdayOptions();

// ניהול משתמשים
let users = [{ username: "p", password: "testuser" }];
let currentUser = null;
let scoreHistory = [];
let latestScore = null;

// רישום משתמש
const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!username || !password || !confirmPassword || !firstName || !lastName || !email) {
      alert("Please fill all fields.");
      return;
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      alert("Password must be at least 8 characters long and include letters and numbers.");
      return;
  }

  if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
  }

  if (/[0-9]/.test(firstName) || /[0-9]/.test(lastName)) {
      alert("First name and Last name should not contain numbers.");
      return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
      alert("Invalid email format.");
      return;
  }

  users.push({ username, password });
  alert("Registration successful! Please login.");
  showScreen("login");
});

// התחברות משתמש
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const loginUsername = document.getElementById("loginUsername").value.trim();
  const loginPassword = document.getElementById("loginPassword").value;

  const user = users.find(u => u.username === loginUsername && u.password === loginPassword);

  if (user) {
      currentUser = user;
      alert("Login successful!");
      scoreHistory = [];
      showScreen("config");
  } else {
      alert("Invalid username or password. Please try again.");
  }
});

// קונפיגורציה
let shootKey = " ";
let gameDuration = 120;


function chooseShootKey(event) {
    if (document.getElementById("config").style.display !== "none") {
      event.preventDefault();
  
      let keyPressed = event.key;
  
      if (keyPressed === " " || keyPressed === "Spacebar" || keyPressed === "Space") {
        document.getElementById('shootKey').value = "Space";
        shootKey = "Space";
      }
      else if (/^[a-zA-Z]$/.test(keyPressed)) {
        document.getElementById('shootKey').value = keyPressed;
        shootKey = keyPressed;
      }
      else {
        alert("Please choose only a letter (A-Z) or the Space key.");
      }
    }
  }
  
  
  

function startGame() {
  const shootKeyInput = document.getElementById("shootKey").value.trim();
  const gameTimeInput = parseInt(document.getElementById("gameTime").value);

  if (!shootKeyInput || (shootKeyInput.length !== 1 && shootKeyInput !== "Space")) {
      alert("Please select a valid shoot key (single letter or Space).");
      return;
  }

  if (isNaN(gameTimeInput) || gameTimeInput < 2) {
      alert("Game time must be at least 2 minutes.");
      return;
  }

  shootKey = shootKeyInput;
  gameDuration = gameTimeInput * 60;
  gameDurationLeft = gameDuration;

  showScreen("game");

  const shootKeyInputField = document.getElementById("shootKey");
  shootKeyInputField.onkeydown = null;

  startSpaceshipGame();
}


// שמירת ניקוד
function saveScore(currentScore) {
  latestScore = currentScore;
  scoreHistory.push(currentScore);
}


// הצגת היסטוריית ניקוד
function showScoreHistory() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "<h3>Your Score History:</h3><div>";
  
    const lastScore = scoreHistory[scoreHistory.length - 1];
    const sortedScores = [...scoreHistory].sort((a, b) => b - a);
  
    let place = 1;
    let foundLatest = false;
  
    for (let score of sortedScores) {
      if (score === lastScore && !foundLatest) {
        historyDiv.innerHTML += `<div>${place}. ${score} points (Latest)</div>`;
        foundLatest = true;
      } else {
        historyDiv.innerHTML += `<div>${place}. ${score} points</div>`;
      }
      place++;
    }
  
    historyDiv.innerHTML += "</div>";
  }
  
  


  function endGame(reason, saveScoreFlag = true) {
    gameOver = true;
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(gameTimerInterval);

    const bgMusic = document.getElementById("backgroundMusic");
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.loop = false;
    }

    setTimeout(() => {
        if (saveScoreFlag) {
            saveScore(score);
        }
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



function forceNewGame() {
    manualRestart = true;
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(gameTimerInterval);
    bullets = [];
    enemyBullets = [];
    enemies = [];
    keys = {};
    gameOver = false;
    gameStarted = false;
    score = 0;
    lives = 3;
    const bgMusic = document.getElementById("backgroundMusic");
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      bgMusic.loop = false;
    }

    showScreen('config');
}




function startNewGame() {
    enemySpeedX = 2;
    enemyBulletSpeed = 5;
    accelerationCount = 0;
    showScreen('config');
}

function silentEndGame() {
    gameOver = true;
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(gameTimerInterval);
  
    const bgMusic = document.getElementById("backgroundMusic");
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      bgMusic.loop = false;
    }
  
    gameStarted = false;
  }
  


  
