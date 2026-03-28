/* =========================================
   ONSET — plan.js
   Execution Plan Checkbox Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  const checkboxes = document.querySelectorAll('.brutalist-checkbox');
  const productivityScore = document.getElementById('productivityScore');
  const streakScore = document.getElementById('streakScore');
  
  const totalTasks = checkboxes.length;

  function updateProgress() {
    let completedTasks = 0;

    checkboxes.forEach(cb => {
      const row = cb.closest('tr');
      
      if (cb.checked) {
        completedTasks++;
        row.classList.add('completed');
      } else {
        row.classList.remove('completed');
      }
    });

    // Update Productivity Score %
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    productivityScore.textContent = `${percentage}%`;
    
    // Minimal streak logic for demonstration
    // Assumes if you completed > 0 tasks, streak is active
    if (completedTasks > 0) {
      streakScore.textContent = '1 Days';
    } else {
      streakScore.textContent = '0 Days';
    }
  }

  // Bind change listener
  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateProgress);
  });

  // Run initialization in case checkboxes were checked automatically (e.g. back navigation)
  updateProgress();

});
