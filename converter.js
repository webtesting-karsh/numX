function goHome() {
  window.location.href = "index.html";
}
/* ==========================
   CONSTANTS
========================== */
const DIGITS = "0123456789ABCDEF";
const DEFAULT_PRECISION = 7;

/* ==========================
   DOM
========================== */
const resultSection = document.getElementById("resultSection");
const resultBox = document.getElementById("resultBox");
const themeToggle = document.getElementById("themeToggle");
const copyBtn = document.getElementById("copyBtn");
const swapBtn = document.getElementById("swapBtn");
const toBase = document.getElementById("toBase");
const numberInput = document.getElementById("numberInput");
const fromBase = document.getElementById("fromBase");

// ===== Donate Popup Trigger Logic =====
// let conversionCount = 0;
// let donateTriggerAt = Math.floor(Math.random() * 4) + 2; 
// random number between 2 and 5

/* ==========================
   THEME
========================== */
document.body.classList.add("dark");

if (themeToggle) {
  themeToggle.checked = true;
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
  });
}


/* ==========================
   TOAST
========================== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

/* ==========================
   SWAP
========================== */
toBase.addEventListener("change", () => {
  swapBtn.disabled = toBase.value === "all";
});

function swapBases() {
  if (toBase.value === "all") return;
  [fromBase.value, toBase.value] = [toBase.value, fromBase.value];
}

/* ==========================
   VALIDATION
========================== */
function isValid(num, base) {
  const patterns = {
    2: /^[01]+(\.[01]+)?$/,
    8: /^[0-7]+(\.[0-7]+)?$/,
    10: /^[0-9]+(\.[0-9]+)?$/,
    16: /^[0-9a-fA-F]+(\.[0-9a-fA-F]+)?$/
  };
  return patterns[base].test(num);
}

/* ==========================
   PARSE
========================== */
function parseNumber(input) {
  const [integer, fraction = ""] = input.toUpperCase().split(".");
  return { integer, fraction };
}

/* ==========================
   BASE → DECIMAL
========================== */
function toDecimal(input, base) {
  const { integer, fraction } = parseNumber(input);
  let value = 0;

  for (let i = 0; i < integer.length; i++) {
    value += DIGITS.indexOf(integer[i]) * Math.pow(base, integer.length - 1 - i);
  }

  for (let i = 0; i < fraction.length; i++) {
    value += DIGITS.indexOf(fraction[i]) * Math.pow(base, -(i + 1));
  }

  return value;
}

/* ==========================
   DECIMAL → BASE (REPEAT SAFE)
========================== */
function fromDecimal(decimal, base, precision = DEFAULT_PRECISION) {
  let intPart = Math.floor(decimal);
  let fracPart = decimal - intPart;

  let intRes = intPart === 0 ? "0" : "";
  while (intPart > 0) {
    intRes = DIGITS[intPart % base] + intRes;
    intPart = Math.floor(intPart / base);
  }

  let fracRes = "";
  const seen = new Map();
  let repeating = false;
  let count = 0;

  while (fracPart > 0 && count < precision) {
    const key = fracPart.toFixed(12);
    if (seen.has(key)) {
      repeating = true;
      break;
    }
    seen.set(key, count);

    fracPart *= base;
    const digit = Math.floor(fracPart);
    fracRes += DIGITS[digit];
    fracPart -= digit;
    count++;
  }

  if (repeating) fracRes += ".....";
  return fracRes ? `${intRes}.${fracRes}` : intRes;
}

/* ==========================
   FORMAT
========================== */
function formatResult(val, base) {
  return `( ${val} )<sub>${base}</sub>`;
}

/* ==========================
   CONVERT
========================== */
function convert() {
  closeSeeHow();

  const num = numberInput.value.trim();
  const fBase = parseInt(fromBase.value);
  const tBaseVal = toBase.value;

  if (!num || !isValid(num, fBase)) {
    showToast("Invalid number for selected base");
    return;
  }

  const dec = toDecimal(num, fBase);
  let out = "";

  if (tBaseVal === "all") {
    out += `Binary: ${formatResult(fromDecimal(dec, 2), 2)}<br>`;
    out += `Decimal: ${formatResult(dec.toString(), 10)}<br>`;
    out += `Octal: ${formatResult(fromDecimal(dec, 8), 8)}<br>`;
    out += `Hexadecimal: ${formatResult(fromDecimal(dec, 16), 16)}`;
  } else {
    out = formatResult(fromDecimal(dec, parseInt(tBaseVal)), tBaseVal);
  }

  resultBox.innerHTML = out;
  resultSection.style.display = "block";
  resultSection.classList.add("glow");
  resultSection.scrollIntoView({ behavior: "smooth" });
}

//copy result
function copyResult() {
  const text = resultBox.innerText.trim();

  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => {
        copyBtn.classList.add("copied");
        showToast("Result copied!");
        setTimeout(() => copyBtn.classList.remove("copied"), 1200);
      })
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    copyBtn.classList.add("copied");
    showToast("Result copied!");
    setTimeout(() => copyBtn.classList.remove("copied"), 1200);
  } catch (err) {
    showToast("Copy failed");
  }

  document.body.removeChild(textarea);
}

//copy result function end 
/* ==========================
   SEE HOW (FIXED)
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("seeHowBtn");
  const box = document.getElementById("howBox");

  //see how temp 
//  if (!btn || !box) return;

//   btn.addEventListener("click", function () {

//     const isOpen = box.classList.contains("open");

//     if (isOpen) {
//       box.classList.remove("open");
//       btn.classList.remove("open");
//       return;
//     }

//     if (toBase.value === "all") {
//       box.innerHTML = "See How is available only for single conversions.";
//       box.classList.add("open");
//       btn.classList.add("open");
//       return;
//     }
  //

  function stepHeader(step, text) {
    return `<div class="step-header">Step: ${step}<div class="step-desc">${text}</div></div>`;
  }

  function collapsible(title, body, open = true) {
    return `
      <div class="collapse ${open ? "open" : ""}">
        <div class="collapse-head">${title}</div>
        <div class="collapse-body">${body}</div>
      </div>`;
  }

  btn.addEventListener("click", () => {
    //see how toggle logic fixed
  const isOpen = box.classList.contains("open");

if (isOpen) {
  box.classList.remove("open");
  btn.classList.remove("open");
  return;
}

   if (toBase.value === "all") {
  box.innerHTML = "See How is available only for single conversions.";
  box.classList.add("open");
  btn.classList.add("open");
  return;
}


    const num = numberInput.value.trim();
    if (!num) return;

    const fBase = parseInt(fromBase.value);
    const tBase = parseInt(toBase.value);
    const dec = toDecimal(num, fBase);

    let html = "";
    let step = 1;

    /* BASE → DECIMAL */
    if (fBase !== 10) {
      const { integer, fraction } = parseNumber(num);
      let parts = [];
      html += stepHeader(step++, `First we convert (${num})<sub>${fBase}</sub> to decimal`);

      integer.split("").forEach((d, i) => {
        const pow = integer.length - 1 - i;
        const val = DIGITS.indexOf(d) * Math.pow(fBase, pow);
        parts.push(val);
        html += `<div class="step-row step-item">${d} × ${fBase}<sup>${pow}</sup> = <b>${val}</b></div>`;
      });

      if (fraction) {
        fraction.split("").forEach((d, i) => {
          const val = DIGITS.indexOf(d) * Math.pow(fBase, -(i + 1));
          parts.push(val);
          html += `<div class="step-row step-item">${d} × ${fBase}<sup>-${i + 1}</sup> = <b>${val}</b></div>`;
        });
      }

      html += `<div class="math-line">${parts.join(" + ")} = <b>${dec}</b></div>`;
    }

    /* DECIMAL → BASE */
    if (tBase !== 10) {
      html += stepHeader(step++, `Now we convert the decimal result to base ${tBase}`);

      let intPart = Math.floor(dec);
      let intSteps = "";
      let remainders = [];

      while (intPart > 0) {
        const q = Math.floor(intPart / tBase);
        const r = intPart % tBase;
        intSteps += `<div class="step-row step-item">${intPart} ÷ ${tBase} = ${q} remainder <b>${r}</b></div>`;
        remainders.unshift(r);
        intPart = q;
      }

      intSteps += `<div class="math-line">Digits (Bottom to Top) → <b>${remainders.join("")}</b></div>`;

      /* FRACTION */
      let fracPart = dec - Math.floor(dec);
      let fracSteps = "";
      let fracDigits = "";
      let seen = new Map();
      let repeatNote = "";

      let count = 0;
      while (fracPart > 0 && count < DEFAULT_PRECISION) {
  const prev = fracPart;              // ✅ MOVE THIS UP
  const key = prev.toFixed(12);       // track safely

  if (seen.has(key)) {
    const firstIndex = seen.get(key);
    repeatNote = `
      <div class="repeat-note">
        Remainder <b>${prev.toFixed(6)}</b> appeared again.<br>
        Digits from position ${firstIndex + 1} will now repeat infinitely.
      </div>`;
    fracDigits += ".....";
    break;
  }

  seen.set(key, count);

 fracPart *= tBase;
const digit = Math.floor(fracPart);
fracSteps += `
  <div class="step-row step-item">
    ${prev.toFixed(6)} × ${tBase} = ${fracPart.toFixed(6)} → <b>${digit}</b>
  </div>`;

  fracDigits += digit;
  fracPart -= digit;
  count++;
}


      html += collapsible("Integer part", intSteps, true);

      if (fracSteps) {
        html += collapsible(
          "Fractional part",
          fracSteps +
            `<div class="math-line">Digits → <b>.${fracDigits}</b></div>` +
            repeatNote,
          false
        );
      }
    }

    html += `
      <div class="final-result">
        Final Result:
        <span class="final-value">${formatResult(fromDecimal(dec, tBase), tBase)}</span>
      </div>
    `;

   box.innerHTML = html;
box.classList.add("open");
btn.classList.add("open");
  });

  /* COLLAPSE TOGGLE */
  document.addEventListener("click", e => {
    const head = e.target.closest(".collapse-head");
    if (!head) return;
    head.parentElement.classList.toggle("open");
  });
});

/* ==========================
   CLOSE SEE HOW
========================== */
function closeSeeHow() {
  const box = document.getElementById("howBox");
  const btn = document.getElementById("seeHowBtn");
  if (!box) return;

  box.classList.remove("open");
  btn.classList.remove("open");
}


//donate us logic
const donateOverlay = document.getElementById("donateOverlay");
const donateClose = document.getElementById("donateClose");
const donateBtn = document.getElementById("donateBtn");

// Show popup (example: after first result)

function getDonateMessage(count) {
  if (count <= 2) {
    return "Enjoying NumX? Your support helps us keep it free ❤️. This service is served by 'karsh Securities' ";
  }
  if (count <= 4) {
    return "You’ve used NumX a few times 😊 Consider supporting the project! This service is served by 'karsh Securities' ";
  }
  return "Power user detected 🚀 Your contribution keeps NumX improving. This service is served by 'karsh Securities'";
}

// Close popup
donateClose.addEventListener("click", () => {
  donateOverlay.classList.remove("show");
});

// Donate button action
donateBtn.addEventListener("click", () => {
  // Replace with your real donation link later
  window.open("upi://pay?pa=khrgoshh@oksbi&pn=khrgosh&aid=uGICAgKDSy5zHRg", "_blank");
});




//remind me later
let donateDeferred = false;

function showDonatePopup() {
  if (donateDeferred) return;

  document.querySelector(".donate-popup p").textContent =
    getDonateMessage(conversionCount);

  donateOverlay.classList.add("show");
}


document.getElementById("donateClose").addEventListener("click", () => {
  donateOverlay.classList.remove("show");
  donateDeferred = true;
});

