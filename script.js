/* =========================================
   ONSET — script.js
   Pure Promotional Brutalist Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // Add click sounds or harsh visual feedback to buttons (brutalist style)
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
      btn.addEventListener('mousedown', () => {
          // Flatten the shadow instantly on mousedown
          btn.style.transform = 'translate(6px, 6px)';
          btn.style.boxShadow = 'none';
      });
      
      btn.addEventListener('mouseup', () => {
          // Pop back out
          btn.style.transform = 'translate(-3px, -3px)';
          
          if(btn.classList.contains('btn-massive')) {
              btn.style.boxShadow = '14px 14px 0px 0px #000';
          } else {
              btn.style.boxShadow = '9px 9px 0px 0px #000';
          }
      });
      
      btn.addEventListener('mouseleave', () => {
          // Reset
          btn.style.transform = '';
          btn.style.boxShadow = '';
      });
  });

  // Random rotation for the stickers on hover
  const stickers = document.querySelectorAll('.sticker');
  stickers.forEach(sticker => {
      sticker.addEventListener('mouseenter', () => {
          const randomRot = Math.random() * 40 - 20; // -20deg to 20deg
          sticker.style.transform = `scale(1.1) rotate(${randomRot}deg)`;
          sticker.style.transition = 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      });
      
      sticker.addEventListener('mouseleave', () => {
          sticker.style.transform = 'rotate(10deg)'; 
      });
  });

});
