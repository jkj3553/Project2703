/* =========================================
   ONSET — plan.js
   Execution Plan Checkbox Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  const urlParams = new URLSearchParams(window.location.search);
  let planId = urlParams.get('id');

  if (!planId) {
    planId = localStorage.getItem('onset_active_plan_id');
  }

  if (!planId) {
    alert("Plan ID missing! Redirecting to Dashboard.");
    window.location.href = 'home.html';
    return;
  }

  // Resecure it
  localStorage.setItem('onset_active_plan_id', planId);

  const plan = window.OnsetApp.getPlanById(planId);

  if (!plan) {
    alert("Plan not found! Redirecting to Dashboard.");
    window.location.href = 'home.html';
    return;
  }

  // Hydrate Header Strings
  document.querySelector('.plan-title').textContent = (plan.examName || "YOUR").toUpperCase() + " EXECUTION PLAN";
  
  // Set Rebalance Button Link
  document.querySelector('.btn-rebalance').addEventListener('click', () => {
    localStorage.setItem('onset_edit_plan_id', plan.id);
    window.location.href = `input.html?editId=${plan.id}`;
  });

  // Render Table content dynamically
  const tbody = document.querySelector('#planTable tbody');
  tbody.innerHTML = '';

  if (plan.tasks && plan.tasks.length > 0) {
    plan.tasks.forEach((task, index) => {
      // Create readable date
      const d = new Date(task.date);
      const parts = d.toDateString().split(' '); // e.g. "Wed Apr 14 2026"
      const shortDate = `${parts[1]} ${parts[2]}`; // "Apr 14"
      
      const tr = document.createElement('tr');
      if (task.done) tr.classList.add('completed');
      
      tr.innerHTML = `
        <td>${shortDate}</td>
        <td>${task.desc}</td>
        <td style="text-align: center;">
          <input type="checkbox" class="brutalist-checkbox" data-index="${index}" ${task.done ? 'checked' : ''}>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No tasks available for this plan.</td></tr>`;
  }

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

    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    productivityScore.textContent = `${percentage}%`;
    
    if (completedTasks > 0) {
      streakScore.textContent = `${completedTasks} Days`; // Fake streak based on total tasks done
    } else {
      streakScore.textContent = '0 Days';
    }
  }

  // Handle Box Check and save to LocalStorage
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      plan.tasks[index].done = e.target.checked;
      
      // Save back to local storage
      const allPlans = window.OnsetApp.getPlans();
      const planIndex = allPlans.findIndex(p => p.id === planId);
      if (planIndex !== -1) {
        allPlans[planIndex] = plan;
        window.OnsetApp.savePlans(allPlans);
      }
      
      updateProgress();
    });
  });

  // ================= DYNAMIC EXECUTION GUIDE =================
  const guideList = document.querySelector('.guide-list');
  if (guideList && plan.executionGuide && Array.isArray(plan.executionGuide) && plan.executionGuide.length > 0) {
    guideList.innerHTML = '';
    plan.executionGuide.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point.replace(/^- /, '').replace(/^\d+\.\s/, '').trim();
      guideList.appendChild(li);
    });
  }

  updateProgress();

});
