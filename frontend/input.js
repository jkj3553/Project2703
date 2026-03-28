/* =========================================
   ONSET — input.js
   Create / Edit Plan logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('planForm');
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('editId');
  
  // Fill form if editing
  if (editId) {
    document.querySelector('.mega-title').textContent = "REBALANCE PLAN";
    const plan = window.OnsetApp.getPlanById(editId);
    if (plan) {
      document.getElementById('examName').value = plan.examName;
      document.getElementById('examDate').value = plan.examDate;
      document.getElementById('studyLevel').value = plan.level;
      document.getElementById('weakAreas').value = plan.weakAreas;
      document.getElementById('situation').value = plan.situation || '';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const planData = {
      id: editId ? editId : Date.now().toString(),
      examName: document.getElementById('examName').value.trim(),
      examDate: document.getElementById('examDate').value,
      level: document.getElementById('studyLevel').value,
      weakAreas: document.getElementById('weakAreas').value.trim(),
      situation: document.getElementById('situation').value.trim()
    };

    // If it's a new plan, dynamically generate 5 mock tasks starting from today covering the subject
    let tasks = [];
    if (editId) {
      const existing = window.OnsetApp.getPlanById(editId);
      tasks = existing ? existing.tasks : generateTasks(planData);
      
      // If we are regenerating entirely, we could overwrite tasks. 
      // User says "same name target exam means editing" but ID is safer.
      // For now we keep old tasks when just editing details, or replace them. Let's keep existing.
    } else {
      tasks = generateTasks(planData);
    }
    
    planData.tasks = tasks;

    const plans = window.OnsetApp.getPlans();
    if (editId) {
      const index = plans.findIndex(p => p.id === editId);
      if (index !== -1) plans[index] = planData;
    } else {
      plans.push(planData);
    }

    window.OnsetApp.savePlans(plans);

    // Redirect to plan execution view
    window.location.href = `plan.html?id=${planData.id}`;
  });
  
  function generateTasks(planData) {
    // Generate tasks for the next 5 days
    const arr = [];
    const today = new Date();
    const subjects = planData.weakAreas.split(',').map(s => s.trim())[0] || "Core Concepts";
    
    for(let i=0; i<5; i++) {
        let d = new Date(today);
        d.setDate(d.getDate() + i);
        let dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        
        arr.push({
            date: dateStr,
            desc: `Master module ${i+1} of ${subjects}`,
            done: false
        });
    }
    
    // Ensure the exam Date itself has a task
    if (planData.examDate) {
        arr.push({
            date: planData.examDate,
            desc: `ACE THE EXAM: ${planData.examName}`,
            done: false
        });
    }
    return arr;
  }
});
