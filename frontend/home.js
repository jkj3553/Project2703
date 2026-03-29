/* =========================================
   ONSET — home.js
   Dashboard dynamics & Local Storage
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // Progress Drawer Toggle
  const progressTile = document.getElementById('progressTile');
  const progressDrawer = document.getElementById('progressDrawer');

  if (progressTile && progressDrawer) {
    progressTile.addEventListener('click', () => {
      progressDrawer.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!progressTile.contains(e.target) && !progressDrawer.contains(e.target)) {
        progressDrawer.classList.remove('active');
      }
    });
  }

  // Hydrate dashboard
  renderDashboard();
  generateCalendar();

  function renderDashboard() {
    const plans = window.OnsetApp.getPlans();
    const emptyState = document.getElementById('emptyStateContainer');
    const taskGrid = document.getElementById('taskGrid');

    if (plans.length === 0) {
      emptyState.style.display = 'flex';
      taskGrid.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      taskGrid.style.display = 'grid';
      taskGrid.innerHTML = ''; // Clear

      const colors = ['card-mint', 'card-purple', 'card-yellow'];

      plans.forEach((plan, index) => {
        // Calculate Progress
        const total = plan.tasks ? plan.tasks.length : 0;
        const done = total ? plan.tasks.filter(t => t.done).length : 0;
        const width = total === 0 ? 0 : Math.round((done / total) * 100);

        // Calculate Urgency Tag
        let tagText = 'Tracking';
        if (plan.examDate) {
          const today = new Date();
          const exam = new Date(plan.examDate);
          const diffDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 7) tagText = 'V-Urgent';
          else if (diffDays <= 14) tagText = 'urgent';
          else if (diffDays <= 21) tagText = 'Soon';
          else tagText = 'Tracking';
        }

        const cardColorMatch = colors[index % colors.length];
        const baseRot = Math.random() > 0.5 ? 5 : -5;

        const cardHTML = `
          <div class="brutalist-card task-card ${cardColorMatch}" onclick="localStorage.setItem('onset_active_plan_id', '${plan.id}'); window.location.href='plan.html?id=${plan.id}'" style="cursor: pointer;">
            <div class="sticker dynamic-sticker" data-base-rot="${baseRot}" style="transform: rotate(${baseRot}deg)">${tagText}</div>
            <h3 class="task-title">${plan.examName}</h3>
            <p class="task-desc">Finish by ${plan.examDate || 'TBD'}</p>
            
            <div class="plan-progress">
              <div class="health-bar-container" style="background-color: var(--bg-color); height: 16px; border: 2px solid var(--border-color);">
                <div class="health-bar-fill" style="background-color: var(--green); height: 100%; width: ${width}%;"></div>
              </div>
              <p style="font-size: 0.8rem; font-weight: 900; margin-top: 0.5rem; color: #000;">PROGRESS: ${width}%</p>
            </div>

            <div class="task-actions">
               <button class="btn btn-yellow" onclick="event.stopPropagation(); localStorage.setItem('onset_edit_plan_id', '${plan.id}'); window.location.href='input.html?editId=${plan.id}'">Rebalance</button>
            </div>
          </div>
        `;
        taskGrid.innerHTML += cardHTML;
      });

      // Bind fun sticker hover effect to newly created dynamic stickers
      document.querySelectorAll('.dynamic-sticker').forEach(sticker => {
        sticker.addEventListener('mouseenter', () => {
            const randomRot = Math.random() * 40 - 20; 
            sticker.style.transform = `scale(1.1) rotate(${randomRot}deg)`;
            sticker.style.transition = 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        sticker.addEventListener('mouseleave', () => {
            const baseRot = sticker.getAttribute('data-base-rot');
            sticker.style.transform = `rotate(${baseRot}deg)`; 
        });
      });
    }
  }

  // Consistency Tracker Logic
  function generateCalendar() {
    const grid = document.getElementById('calendarDaysGrid');
    if (!grid) return;

    const plans = window.OnsetApp.getPlans();
    const dateStats = {};

    plans.forEach(plan => {
      if (plan.examDate) {
        if (!dateStats[plan.examDate]) dateStats[plan.examDate] = { tasks: 0, done: 0, deadline: false };
        dateStats[plan.examDate].deadline = true;
      }
      if (plan.tasks) {
        plan.tasks.forEach(task => {
          if (!dateStats[task.date]) dateStats[task.date] = { tasks: 0, done: 0, deadline: false };
          dateStats[task.date].tasks += 1;
          if (task.done) dateStats[task.date].done += 1;
        });
      }
    });

    let currentDisplayDate = new Date();

    function renderCalendar(date) {
      grid.innerHTML = '';
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const firstDayIndex = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      const monthDisplay = document.getElementById('currentMonthDisplay');
      if (monthDisplay) {
        monthDisplay.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }

      for (let i = 0; i < firstDayIndex; i++) {
          grid.innerHTML += `<div class="cal-day-col" style="visibility: hidden; width: 60px; height: 60px;"></div>`;
      }

      const today = new Date();
      const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');

      for (let i = 1; i <= lastDate; i++) {
        const currentLoopDate = new Date(year, month, i);
        
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(i).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        
        const dayName = weekdays[currentLoopDate.getDay()];
        const dateNum = currentLoopDate.getDate();

        let boxColor = 'var(--bg-color)';
        const stat = dateStats[dateStr];
        if (stat) {
          if (stat.deadline) boxColor = 'var(--mint)';
          else if (stat.tasks > 0 && stat.done === stat.tasks) boxColor = 'var(--green)';
          else if (stat.tasks > 0 && stat.done < stat.tasks) boxColor = 'var(--bg-color)';
        }

        const isToday = (dateStr === todayStr);
        let currentDayLabel = isToday ? '<div style="font-size:0.7rem; font-weight:900; color:var(--yellow); position:absolute; bottom:-18px;">TODAY</div>' : '';

        const colHTML = `
              <div class="cal-day-col" style="display:flex; flex-direction:column; align-items:center; position:relative; gap:0.5rem; width: 60px;">
                  <span class="cal-weekday-label" style="font-size: 0.8rem; font-weight: 700;">${dayName}</span>
                  <div class="cal-day-box" style="
                      background-color: ${boxColor};
                      width: 60px; height: 60px;
                      border: var(--border-width) solid var(--border-color);
                      box-shadow: 4px 4px 0px 0px var(--shadow-color);
                      display: flex; align-items: center; justify-content: center;
                      font-size: 1.2rem; font-weight: 900;
                  ">${dateNum}</div>
                  ${currentDayLabel}
              </div>
          `;
        grid.innerHTML += colHTML;
      }
    }

    renderCalendar(currentDisplayDate);

    // Navigation Listeners
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');

    if (prevBtn) {
      const newPrev = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrev, prevBtn);
      newPrev.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderCalendar(currentDisplayDate);
      });
    }

    if (nextBtn) {
      const newNext = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNext, nextBtn);
      newNext.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderCalendar(currentDisplayDate);
      });
    }
  }

});
