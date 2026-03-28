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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const planData = {
      id: editId ? editId : Date.now().toString(),
      examName: document.getElementById('examName').value.trim(),
      examDate: document.getElementById('examDate').value,
      level: document.getElementById('studyLevel').value,
      weakAreas: document.getElementById('weakAreas').value.trim(),
      situation: document.getElementById('situation').value.trim()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Generating UI...';
    submitBtn.disabled = true;

    try {
      const examDateObj = new Date(planData.examDate);
      const diffDays = Math.ceil((examDateObj - new Date()) / (1000 * 60 * 60 * 24));
      const days = diffDays > 0 ? diffDays : 7;

      const response = await fetch('http://localhost:3000/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: planData.examName,
          days: days,
          topics: planData.weakAreas || 'General Review',
          level: planData.level,
          extra: planData.situation || ''
        })
      });

      if (!response.ok) {
        let errMessage = 'Backend AI generation failed.';
        try {
           const errData = await response.json();
           if (errData.error) errMessage = errData.error;
        } catch(e) {}
        throw new Error(errMessage);
      }
      
      const data = await response.json();
      const aiText = data.plan || '';

      // Parse the plain-text AI plan into the {date, desc, done} structure expected by plan.html
      const aiLines = aiText.split('\n').filter(line => line.trim().length > 4);
      
      let tasks = [];
      const today = new Date();
      
      aiLines.forEach((line, i) => {
        let d = new Date(today);
        // Distribute tasks roughly across the days
        d.setDate(d.getDate() + Math.min(i, days - 1)); 
        
        let cleanedDesc = line.replace(/^- /, '').replace(/^\d+\.\s/, '').trim();
        if (cleanedDesc.length > 0) {
           tasks.push({
             date: d.toISOString().split('T')[0],
             desc: cleanedDesc,
             done: false
           });
        }
      });

      // Ensure the exam Date itself always has a final marker
      if (planData.examDate) {
          tasks.push({
              date: planData.examDate,
              desc: `ACE THE EXAM: ${planData.examName}`,
              done: false
          });
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

    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message + '\n\n(If it says "Failed to fetch", ensure the backend is running on port 3000.)');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
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
