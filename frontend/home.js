/* =========================================
   ONSET — home.js
   Dashboard-specific interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Progress Drawer Toggle
  const progressToggle = document.getElementById('progressToggle');
  const progressDrawer = document.getElementById('progressDrawer');

  if (progressToggle && progressDrawer) {
    progressToggle.addEventListener('click', () => {
      progressDrawer.classList.toggle('active');
    });
  }

  // 2. Generate Consistency Tracker Heatmap
  const trackerGrid = document.getElementById('trackerGrid');
  if (trackerGrid) {
    const totalDays = 52 * 7 - 4; // Approx 1 year to fit nicely
    for (let i = 0; i < totalDays; i++) {
        const day = document.createElement('div');
        day.classList.add('tracker-day');
        
        // Randomly assign activity for visual demo
        const rand = Math.random();
        if (rand > 0.90) {
            day.classList.add('active-high');
        } else if (rand > 0.75) {
            day.classList.add('active-med');
        } else if (rand > 0.60) {
            day.classList.add('active-low');
        }

        trackerGrid.appendChild(day);
    }
  }

  // 3. Toggle Empty State vs Active Tasks (Demo specific)
  const toggleEmptyBtn = document.getElementById('toggleEmptyBtn');
  const emptyState = document.getElementById('emptyState');
  const taskGrid = document.getElementById('taskGrid');

  if (toggleEmptyBtn && emptyState && taskGrid) {
    toggleEmptyBtn.addEventListener('click', () => {
      if (emptyState.style.display === 'none') {
        emptyState.style.display = 'block';
        taskGrid.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        taskGrid.style.display = 'grid';
      }
    });

    // We also want brutalist click styling on toggleEmptyBtn since it's dynamically added a listener here
    // But script.js already adds listeners to all .btn up front.
  }

});
