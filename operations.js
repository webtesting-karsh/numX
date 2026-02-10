function goHome() {
  window.location.href = "index.html";
}
/* ============================
   BINARY ARITHMETIC — FULL ENGINE
============================ */

let selectedOperator = "+";
let lastOperation = null;

let resultSection, resultBox, seeHowBtn, howBox;

/* ============================
   DOM READY
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const opButtons = document.querySelectorAll(".op-btn");

  opButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      opButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedOperator = btn.dataset.op;
    });
  });

  resultSection = document.getElementById("resultSection");
  resultBox = document.getElementById("resultBox");
  seeHowBtn = document.getElementById("seeHowBtn");
  howBox = document.getElementById("howBox");

  resultSection.style.display = "none";
  howBox.style.display = "none";

  seeHowBtn.addEventListener("click", () => {
    if (!lastOperation) return;

    const open = howBox.style.display === "block";
    if (open) {
      howBox.style.display = "none";
      seeHowBtn.classList.remove("open");
    } else {
      howBox.innerHTML = buildBinaryExplanation(lastOperation);
      howBox.style.display = "block";
      seeHowBtn.classList.add("open");
      animateSteps();
    }
  });
});

/* ============================
   MAIN CALCULATION
============================ */
function calculateOperation() {
  const a = document.getElementById("num1").value.trim();
  const b = document.getElementById("num2").value.trim();

  if (!/^[01]+$/.test(a) || !/^[01]+$/.test(b)) {
    showError("Only binary numbers (0 and 1) are allowed");
    return;
  }

  let result, remainder = null;

  switch (selectedOperator) {
    case "+":
      result = binaryAdd(a, b);
      break;
    case "-":
      result = binarySubtract(a, b);
      break;
    case "*":
      result = binaryMultiply(a, b);
      break;
    case "/":
      ({ quotient: result, remainder } = binaryDivide(a, b));
      break;
  }

  lastOperation = { a, b, operator: selectedOperator, result, remainder };
  resultBox.innerHTML = formatResult(result, remainder);
  resultSection.style.display = "block";

  howBox.style.display = "none";
  seeHowBtn.classList.remove("open");

  resultSection.scrollIntoView({ behavior: "smooth" });
  registerUserAction();
}

/* ============================
   RESULT FORMAT
============================ */
function formatResult(res, rem) {
  if (rem !== null) {
    return `<div class="value">${res}</div><div class="remainder">Remainder = ${rem}</div>`;
  }
  return `<div class="value">${res}</div>`;
}

function showError(msg) {
  resultBox.innerHTML = `<span class="error">${msg}</span>`;
  resultSection.style.display = "block";
}

/* ============================
   SEE HOW DISPATCHER
============================ */
function buildBinaryExplanation({ a, b, operator, result, remainder }) {
  let html = "";

  if (operator === "+") {
    html += `<div class="step-title">Binary Addition</div>`;
    html += explainBinaryAddition(a, b);
  }
  else if (operator === "-") {
    html += `<div class="step-title">Binary Subtraction</div>`;
    html += explainBinarySubtraction(a, b);
  }
  else if (operator === "*") {
    html += `<div class="step-title">Binary Multiplication</div>`;
    html += explainBinaryMultiplication(a, b);
  }
  else if (operator === "/") {
    html += `<div class="step-title">Binary Long Division</div>`;
    html += explainBinaryDivision(a, b);
  }

  html += `<div class="step-title">Final Result</div>`;
  html += `<div class="final-result glow">${result}</div>`;

  if (remainder !== null) {
    html += `<div class="step-row">Remainder = <b>${remainder}</b></div>`;
  }

  return html;
}

/* ============================
   ADDITION (CARRY PER BIT)
============================ */
function explainBinaryAddition(a, b) {
  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  let carry = 0;
  let steps = "";

  for (let i = a.length - 1; i >= 0; i--) {
    const sum = Number(a[i]) + Number(b[i]) + carry;
    steps += `
      <div class="step-row">
        ${a[i]} + ${b[i]} + carry(${carry}) = ${sum.toString(2)}
        → write ${sum % 2}, carry ${Math.floor(sum / 2)}
      </div>
    `;
    carry = Math.floor(sum / 2);
  }

  if (carry) {
    steps += `<div class="step-row">Final carry = ${carry}</div>`;
  }

  return steps;
}

/* ============================
   SUBTRACTION (BORROW PER BIT)
============================ */
function explainBinarySubtraction(a, b) {
  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  let borrow = 0;
  let steps = "";

  for (let i = a.length - 1; i >= 0; i--) {
    let d1 = Number(a[i]) - borrow;
    let d2 = Number(b[i]);

    if (d1 < d2) {
      d1 += 2;
      borrow = 1;
      steps += `<div class="step-row">Borrow → ${d1} - ${d2} = ${d1 - d2}</div>`;
    } else {
      borrow = 0;
      steps += `<div class="step-row">${d1} - ${d2} = ${d1 - d2}</div>`;
    }
  }

  return steps;
}

/* ============================
   MULTIPLICATION (PARTIAL PRODUCTS)
============================ */
function explainBinaryMultiplication(a, b) {
  let steps = "";

  for (let i = b.length - 1; i >= 0; i--) {
    const bit = b[i];
    if (bit === "1") {
      steps += `<div class="step-row">${a} shifted ${b.length - 1 - i} → ${a + "0".repeat(b.length - 1 - i)}</div>`;
    } else {
      steps += `<div class="step-row">${a} × 0 → 0</div>`;
    }
  }

  steps += `<div class="step-row">Add all partial products</div>`;
  return steps;
}

/* ============================
   BINARY LONG DIVISION (FULL)
============================ */
function explainBinaryDivision(dividend, divisor) {
  let steps = "";
  let temp = "";
  let quotient = "";

  for (let i = 0; i < dividend.length; i++) {
    temp += dividend[i];
    steps += `<div class="step-row">Bring down → ${temp}</div>`;

    if (parseInt(temp, 2) >= parseInt(divisor, 2)) {
      const diff = binarySubtract(temp, divisor);
      steps += `<div class="step-row">${temp} ≥ ${divisor} → subtract → ${diff}</div>`;
      temp = diff;
      quotient += "1";
    } else {
      steps += `<div class="step-row">${temp} < ${divisor} → write 0</div>`;
      quotient += "0";
    }
  }

  steps += `<div class="step-row">Quotient = ${quotient}</div>`;
  steps += `<div class="step-row">Remainder = ${temp}</div>`;

  return steps;
}

/* ============================
   CORE BINARY OPS
============================ */
function binaryAdd(a, b) {
  let carry = 0, res = "";
  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  for (let i = a.length - 1; i >= 0; i--) {
    const sum = Number(a[i]) + Number(b[i]) + carry;
    res = (sum % 2) + res;
    carry = Math.floor(sum / 2);
  }
  if (carry) res = "1" + res;
  return res;
}

function binarySubtract(a, b) {
  let res = "";
  let borrow = 0;
  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  for (let i = a.length - 1; i >= 0; i--) {
    let d1 = Number(a[i]) - borrow;
    let d2 = Number(b[i]);
    if (d1 < d2) {
      d1 += 2;
      borrow = 1;
    } else {
      borrow = 0;
    }
    res = (d1 - d2) + res;
  }
  return res.replace(/^0+/, "") || "0";
}

function binaryMultiply(a, b) {
  let res = "0";
  for (let i = b.length - 1; i >= 0; i--) {
    if (b[i] === "1") {
      res = binaryAdd(res, a + "0".repeat(b.length - 1 - i));
    }
  }
  return res;
}

function binaryDivide(a, b) {
  const q = Math.floor(parseInt(a, 2) / parseInt(b, 2));
  const r = parseInt(a, 2) % parseInt(b, 2);
  return { quotient: q.toString(2), remainder: r.toString(2) };
}

/* ============================
   ANIMATION
============================ */
function animateSteps() {
  howBox.querySelectorAll(".step-row").forEach((row, i) => {
    setTimeout(() => row.classList.add("active"), i * 120);
  });
}
