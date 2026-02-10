/* ======================================
   GLOBAL DONATE POPUP ENGINE (FINAL)
   Works across ALL pages
   Resets on app/site reload
====================================== */

/* -------------------------------
   Internal state (memory only)
-------------------------------- */
let actionCount = 0;

/* Random trigger between 2–5 actions */
let triggerAt = Math.floor(Math.random() * 4) + 2;

/* -------------------------------
   DOM READY
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("donateOverlay");
  const closeBtn = document.getElementById("donateClose");

  /* If popup HTML does not exist on page, exit safely */
  if (!popup) return;

  /* Close / Remind Me Later */
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.remove("show");
    });
  }
});

/* -------------------------------
   PUBLIC API
   Call this after a meaningful action
-------------------------------- */
function registerUserAction() {
  actionCount++;

  if (actionCount === triggerAt) {
    showDonatePopup();
  }
}

/* -------------------------------
   Show popup
-------------------------------- */
function showDonatePopup() {
  const popup = document.getElementById("donateOverlay");
  if (!popup) return;

  popup.classList.add("show");

  /* Prepare next random trigger (optional, safe) */
  triggerAt += Math.floor(Math.random() * 4) + 3;
}

/* -------------------------------
   OPTIONAL: expose for debugging
-------------------------------- */
// window.__donateDebug = { registerUserAction };
