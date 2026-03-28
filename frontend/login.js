/* =========================================
   ONSET — login.js
   Authentication mock logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide error initially
    errorMsg.style.display = 'none';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Verification Mock
    if (email === 'testuser@testing.com' && password === 'iamtesting01') {
      // Success - Redirect
      window.location.href = 'home.html';
    } else {
      // Failure - Show alert
      errorMsg.style.display = 'block';
      // Apply a brutalist shake effect manually
      errorMsg.style.transform = 'translate(-3px, -3px)';
      setTimeout(() => errorMsg.style.transform = 'translate(3px, 3px)', 50);
      setTimeout(() => errorMsg.style.transform = 'translate(0px, 0px)', 100);
    }
  });

});
