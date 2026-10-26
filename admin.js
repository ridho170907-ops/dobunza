"use strict";
// Ganti password ini sesuai keinginanmu. Ini login sederhana di browser, bukan keamanan server.
const ADMIN_PASSWORD = "Dobunza2026!";
const SESSION_KEY = "dobunzaAdminLoggedIn";
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

if (localStorage.getItem(SESSION_KEY) === "true") {
  window.location.replace("admin-dashboard.html");
}

togglePassword.addEventListener("click", function () {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Sembunyikan" : "Lihat";
  togglePassword.setAttribute("aria-label", isHidden ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (passwordInput.value === ADMIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, "true");
    loginMessage.textContent = "Login berhasil. Membuka dashboard...";
    loginMessage.className = "login-message success";
    window.location.href = new URL("admin-dashboard.html", window.location.href).href;
    return;
  }
  loginMessage.textContent = "Kata sandi belum benar. Silakan periksa kembali.";
  loginMessage.className = "login-message error";
  passwordInput.value = "";
  passwordInput.focus();
});
