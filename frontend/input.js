/* =========================================
   ONSET — input.js
   Create / Edit Plan logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('planForm');
  const urlParams = new URLSearchParams(window.location.search);
  let editId = urlParams.get('editId') || localStorage.getItem('onset_edit_plan_id');

  // Fill form if editing
  if (editId) {
    document.querySelector('.mega-title').textContent = "REBALANCE PLAN";
    const plan = window.OnsetApp.getPlanById(editId);
    if (plan) {
      document.getElementById('examName').value = plan.examName;
      document.getElementById('examDate').value = plan.examDate;
      document.getElementById('subject').value = plan.subject || 'Operating Systems';
      document.getElementById('syllabusCoverage').value = plan.syllabusCoverage || '';
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
      subject: document.getElementById('subject').value,
      syllabusCoverage: document.getElementById('syllabusCoverage').value,
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

      // ========================
      // LAYER 3 — LocalStorage Reuse
      // ========================
      const planCacheKey = JSON.stringify({
        subject: planData.subject.trim().toLowerCase(),
        days,
        weakAreas: planData.weakAreas.trim().toLowerCase(),
        consistency: planData.level.trim().toLowerCase(),
        syllabusCoverage: planData.syllabusCoverage.trim()
      });

      const savedPlanCache = JSON.parse(localStorage.getItem('onset_plan_cache') || '{}');

      let aiData = null;
      let skipFetch = false;

      if (savedPlanCache[planCacheKey]) {
        console.log('[CACHE HIT] Loading plan from localStorage — no API call made.');
        aiData = savedPlanCache[planCacheKey];
        skipFetch = true;
      }

      if (!skipFetch) {
        // ========================
        // LAYER 1 — Generation Control
        // ========================
        console.log('[API CALL TRIGGERED]');

        const response = await fetch('http://localhost:3000/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exam: planData.examName,
            subject: planData.subject,
            days: days,
            weakAreas: planData.weakAreas,
            consistency: planData.level,
            syllabusCoverage: planData.syllabusCoverage,
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

        const provider = data.provider || "unknown";
        console.log("AI Provider:", provider);

        aiData = {
          plan: data.plan || [],
          executionGuide: data.executionGuide || []
        };

        // --- LAYER 3: Store in localStorage ---
        savedPlanCache[planCacheKey] = aiData;
        localStorage.setItem('onset_plan_cache', JSON.stringify(savedPlanCache));
        console.log('[CACHE MISS] Plan fetched from AI and saved to localStorage.');
      }

      // Validate AI Response against cross-subject hallucination
      const stringifiedPlan = JSON.stringify(aiData).toLowerCase();
      if (stringifiedPlan.includes("math") || stringifiedPlan.includes("physics") || stringifiedPlan.includes("chemistry")) {
         throw new Error("AI Subject Validation Failed — Irrelevant topics detected.");
      }

      let tasks = [];
      const today = new Date();
      let dateOffset = 0;

      if (Array.isArray(aiData.plan)) {
        aiData.plan.forEach(dayBlock => {
          let d = new Date(today);
          d.setDate(d.getDate() + Math.min(dateOffset, days - 1));

          if (Array.isArray(dayBlock.tasks)) {
            dayBlock.tasks.forEach(taskStr => {
               let cleanedDesc = taskStr.replace(/^- /, '').replace(/^\d+\.\s/, '').trim();
               if (cleanedDesc.length > 0) {
                 tasks.push({
                   date: d.toISOString().split('T')[0],
                   desc: cleanedDesc,
                   done: false
                 });
               }
            });
          }
          dateOffset++;
        });
      }

      // Ensure the exam Date itself always has a final marker
      if (planData.examDate) {
          tasks.push({
              date: planData.examDate,
              desc: `ACE THE EXAM: ${planData.examName}`,
              done: false
          });
      }

      planData.tasks = tasks;
      planData.executionGuide = aiData.executionGuide || [];

      const plans = window.OnsetApp.getPlans();
      
      if (editId) {
        const index = plans.findIndex(p => p.id === editId);
        if (index !== -1) plans[index] = planData;
        localStorage.removeItem('onset_edit_plan_id'); // clear it so next time is a clean slate
      } else {
        // Prevent duplicate names
        const duplicate = plans.find(p => p.examName.trim().toLowerCase() === planData.examName.trim().toLowerCase());
        if (duplicate) {
           throw new Error("A plan with this Target Exam exact name already exists. Please go to the dashboard and click 'Rebalance' instead.");
        }
        plans.push(planData);
      }

      window.OnsetApp.savePlans(plans);

      // Save natively to local storage just in case the server drops ?id= queries during redirects
      localStorage.setItem('onset_active_plan_id', planData.id);

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
