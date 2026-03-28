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

  // 2. Generate Consistency Tracker Heatmap -> Horizontal Strip
  const calendarDaysGrid = document.getElementById('calendarDaysGrid');
  if (calendarDaysGrid) {
    let currentDate = new Date();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    function renderCalendar(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthDisplay = document.getElementById('currentMonthDisplay');
      if (monthDisplay) {
        monthDisplay.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      
      calendarDaysGrid.innerHTML = '';
      
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      // Actual days
      for(let i=1; i <= lastDay; i++) {
          const current = new Date(year, month, i);
          const dayNameStr = dayNames[current.getDay()];

          const col = document.createElement('div');
          col.className = 'cal-day-col';

          const weekdayLabel = document.createElement('div');
          weekdayLabel.className = 'cal-weekday-label';
          weekdayLabel.textContent = dayNameStr;

          const dayBox = document.createElement('div');
          dayBox.className = 'cal-day-box';
          dayBox.textContent = i;
          
          // Randomly assign activity for visual demo
          const rand = Math.random();
          if (rand > 0.85) {
              dayBox.classList.add('active-high');
          } else if (rand > 0.75) {
              dayBox.classList.add('active-med');
          } else if (rand > 0.60) {
              dayBox.classList.add('active-low');
          }
          
          col.appendChild(weekdayLabel);
          col.appendChild(dayBox);
          calendarDaysGrid.appendChild(col);
      }
    }

    // Initialize calendar
    renderCalendar(currentDate);

    // Event listeners for month toggles
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
      });
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
