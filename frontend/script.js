const apiBase = "http://localhost:5000"; // Backend URL

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const msgDiv = document.getElementById("loginMsg");

    if (!email || !password) {
      msgDiv.textContent = "All fields are required!";
      msgDiv.className = "result red";
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.user.name || data.user.email);
        window.location.href = "dashboard.html";
      } else {
        msgDiv.textContent = data.msg || "Login failed!";
        msgDiv.className = "result red";
      }
    } catch (err) {
      console.error(err);
      msgDiv.textContent = "Server error!";
      msgDiv.className = "result red";
    }
  });
}

// ===== SIGNUP =====
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msgDiv = document.getElementById("signupMsg");

    if (!name || !email || !password) {
      msgDiv.textContent = "All fields are required!";
      msgDiv.className = "result red";
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.user.name || data.user.email);
        window.location.href = "dashboard.html";
      } else {
        msgDiv.textContent = data.msg || "Signup failed!";
        msgDiv.className = "result red";
      }
    } catch (err) {
      console.error(err);
      msgDiv.textContent = "Server error!";
      msgDiv.className = "result red";
    }
  });
}

// ===== WEATHER RISK (City Only) =====
const weatherForm = document.getElementById("weatherForm");
const resultDiv = document.getElementById("result");
if (weatherForm) {
  weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const city = document.getElementById("city").value.trim();
    const date = document.getElementById("date").value;
    const eventType = document.getElementById("event").value;

    resultDiv.textContent = "Fetching data...";
    resultDiv.className = "result";

    if (!city) {
      resultDiv.textContent = "Please enter a city!";
      resultDiv.className = "result red";
      return;
    }

    try {
      const res = await fetch(`${apiBase}/getRisk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, date, event: eventType })
      });

      const data = await res.json();

      if (!res.ok) {
  if (data.error === "future_date") {
    resultDiv.textContent = "⚠️ Forecast for future dates is not available.";
    resultDiv.className = "result yellow";
    return;
  }
  resultDiv.textContent = data.message || "Failed to fetch weather risk!";
    resultDiv.className = "result red";
  return;
}


      // Display results
      let colorClass = "green";
if (data.advice === "Warning") colorClass = "yellow";
else if (data.advice === "Not Recommended") colorClass = "red";

resultDiv.innerHTML = `
  <div class="weather-card ${colorClass}">
    <h3>📍 ${data.city}</h3>
    <p><strong>Date:</strong> ${data.requested_date}</p>
    <p><strong>Temperature:</strong> ${data.sample.temp_c ?? '--'} °C</p>
    <p><strong>Wind:</strong> ${data.sample.wind_kph} km/h</p>
    <p><strong>Rain:</strong> ${data.sample.rain_mm} mm</p>
    <p><strong>Event Type:</strong> ${eventType}</p>
    ${Array.isArray(data.risks?.categories) && data.risks.categories.length ? `<p><strong>Categories:</strong> ${data.risks.categories.join(', ')}</p>` : ''}
    <p><strong>Advice:</strong> ${data.advice} ${data.advice === "Safe" ? "✅" : data.advice === "Warning" ? "⚠️" : "❌"}</p>
  </div>
`;


      // Color-code based on advice
      if (data.advice === "Safe") resultDiv.className = "result green";
      else if (data.advice === "Warning") resultDiv.className = "result yellow";
      else resultDiv.className = "result red";

    } catch (err) {
      console.error(err);
      resultDiv.textContent = "Server error!";
      resultDiv.className = "result red";
    }
  });
}

// ===== DASHBOARD WELCOME =====
const userNameSpan = document.getElementById("userName");
if (userNameSpan) {
  userNameSpan.textContent = localStorage.getItem("user") || "User";
}
