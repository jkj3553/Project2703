/* =========================================
   ONSET — login.js
   Authentication mock logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect away
  if (localStorage.getItem('onset_user')) {
    window.location.href = 'home.html';
  }

  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    errorMsg.style.display = 'none';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Specific auth requirement from user logic
    if (email === 'testuser@testing.com' && password === 'iamtesting01') {
      localStorage.setItem('onset_user', JSON.stringify({ email: email }));
      window.location.href = 'home.html';
    } else {
      errorMsg.style.display = 'block';
      errorMsg.style.transform = 'translate(-4px, -4px)';
      setTimeout(() => errorMsg.style.transform = 'translate(4px, 4px)', 50);
      setTimeout(() => errorMsg.style.transform = 'translate(0px, 0px)', 100);
    }
  });
});
