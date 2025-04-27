// scripts.js

// פונקציה להראות מסך מסוים ולהחביא אחרים
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
  }
  
  // פתיחת About Modal
  function openAbout() {
    document.getElementById('aboutModal').style.display = 'block';
  }
  
  // סגירת About Modal
  function closeAbout() {
    document.getElementById('aboutModal').style.display = 'none';
  }
  
  // סגירה ב-Esc או לחיצה מחוץ לדיאלוג
  window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeAbout();
  });
  
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('aboutModal');
    if (event.target === modal) closeAbout();
  });
  
  // מילוי שדות תאריך לידה ברישום (שנה/חודש/יום)
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
  
  // קריאה ראשונית למילוי תאריך לידה
  fillBirthdayOptions();
  
  // ניהול משתמשים וניקוד
  let users = [{ username: "p", password: "testuser" }];
  let scoreHistory = [];
  let latestScore = null;
  
  // הקשבה למקלדת פעם אחת בלבד
  let keys = {};
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => delete keys[e.key]);
  
  // טיפול בהרשמה
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
  
  // טיפול בלוגין
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
  
    const loginUsername = document.getElementById("loginUsername").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;
  
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
  
    if (user) {
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
  
      if (event.code === "Space") {
        document.getElementById("shootKey").value = "Space";
      } else if (event.code.startsWith("Key")) {
        document.getElementById("shootKey").value = event.code.replace("Key", "").toLowerCase();
      } else {
        alert("Please choose a letter (A-Z) or Space.");
      }
    }
  }
  
  function startGame() {
    const shootKeyInput = document.getElementById("shootKey").value.trim();
    const gameTimeInput = parseInt(document.getElementById("gameTime").value);
  
    if (!shootKeyInput || (shootKeyInput !== "Space" && shootKeyInput.length !== 1)) {
      alert("Please select a single shoot key.");
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
  
  function saveScore(currentScore) {
    latestScore = currentScore;
    scoreHistory.push(currentScore);
    scoreHistory.sort((a, b) => b - a);
  }
  
  function showScoreHistory() {
    const historyDiv = document.createElement('div');
    historyDiv.innerHTML = "<h3>Your Score History:</h3><ol>" +
      scoreHistory.map(score => {
        if (score === latestScore) {
          return `<li><strong>${score} points (Latest)</strong></li>`;
        } else {
          return `<li>${score} points</li>`;
        }
      }).join('') +
      "</ol>";
  
    const endMessage = document.getElementById("endMessage");
    endMessage.appendChild(historyDiv);
  }
  
  function endGame(reason) {
    gameOver = true;
    clearInterval(gameTimerInterval);
  
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