function goHome() {
  window.location.href = "index.html";
}
/* ============================
   NUMX — BINARY ARITHMETIC ENGINE
   Fully Stable Version
============================ */

let selectedOperator = "+";
let lastOperation = null;

/* ============================
   SAFE DOM READY
============================ */
document.addEventListener("DOMContentLoaded", () => {

  const opButtons = document.querySelectorAll(".op-btn");
  const resultSection = document.getElementById("resultSection");
  const resultBox = document.getElementById("resultBox");
  const seeHowBtn = document.getElementById("seeHowBtn");
  const howBox = document.getElementById("howBox");

  resultSection.style.display = "none";

  /* Operator selection */
  opButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      opButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedOperator = btn.dataset.op;
    });
  });

  /* See How Toggle */
  seeHowBtn.addEventListener("click", () => {

    if (!lastOperation) return;

    const isOpen = howBox.classList.contains("open");

    if (isOpen) {
      howBox.classList.remove("open");
      seeHowBtn.classList.remove("open");
      return;
    }

    howBox.innerHTML = buildExplanation(lastOperation);
    howBox.classList.add("open");
    seeHowBtn.classList.add("open");

    animateSteps(howBox);
  });

  /* Attach calculate globally */
  window.calculateOperation = function () {

    const a = document.getElementById("num1").value.trim();
    const b = document.getElementById("num2").value.trim();

    if (!/^[01]+$/.test(a) || !/^[01]+$/.test(b)) {
      showError("Only binary numbers (0 and 1) are allowed");
      return;
    }

    let result, remainder = null;

    switch (selectedOperator) {
      case "+": result = binaryAdd(a, b); break;
      case "-": result = binarySubtract(a, b); break;
      case "*": result = binaryMultiply(a, b); break;
      case "/":
        const div = binaryDivide(a, b);
        result = div.quotient;
        remainder = div.remainder;
        break;
    }

    lastOperation = { a, b, operator: selectedOperator, result, remainder };

    resultBox.innerHTML = formatResult(result, remainder);
    resultSection.style.display = "block";
    howBox.innerHTML = "";
howBox.classList.remove("open");
seeHowBtn.classList.remove("open");
    resultSection.classList.add("glow");

    howBox.classList.remove("open");
    seeHowBtn.classList.remove("open");

    resultSection.scrollIntoView({ behavior: "smooth" });

    /* Safe donate trigger */
    if (typeof registerUserAction === "function") {
      registerUserAction();
    }
  };

  function showError(msg) {
    resultBox.innerHTML = `<span class="error">${msg}</span>`;
    resultSection.style.display = "block";
  }

  function formatResult(res, rem) {
    if (rem !== null) {
      return `<div class="value">${res}</div>
              <div class="remainder">Remainder = ${rem}</div>`;
    }
    return `<div class="value">${res}</div>`;
  }

});

/* ============================
   EXPLANATION DISPATCH
============================ */
function buildExplanation({ a, b, operator, result, remainder }) {

  let html = "";

  if (operator === "+") {
    html += `<div class="step-title">Binary Addition</div>`;
    html += explainAddition(a, b);
  }

  if (operator === "-") {
    html += `<div class="step-title">Binary Subtraction</div>`;
    html += explainSubtraction(a, b);
  }

  if (operator === "*") {
    html += `<div class="step-title">Binary Multiplication</div>`;
    html += explainMultiplication(a, b);
  }

  if (operator === "/") {
    html += `<div class="step-title">Binary Long Division</div>`;
    html += explainDivision(a, b);
  }

  html += `<div class="final-result">${result}</div>`;

  if (remainder !== null) {
    html += `<div class="step-row">Remainder = <b>${remainder}</b></div>`;
  }

  return html;
}

/* ============================
   ADDITION
============================ */
function explainAddition(a, b) {

  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  let carry = 0;
  let steps = "";

  for (let i = a.length - 1; i >= 0; i--) {

    const sum = Number(a[i]) + Number(b[i]) + carry;
    const bit = sum % 2;
    const newCarry = Math.floor(sum / 2);

    steps += `
      <div class="step-row">
        ${a[i]} + ${b[i]} + carry(${carry}) = ${sum}
        → write ${bit}, carry ${newCarry}
      </div>
    `;

    carry = newCarry;
  }

  if (carry) {
    steps += `<div class="step-row">Final carry = ${carry}</div>`;
  }

  return steps;
}

/* ============================
   SUBTRACTION
============================ */
function explainSubtraction(a, b) {

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
   MULTIPLICATION
============================ */
function explainMultiplication(a, b) {

  let steps = "";

  for (let i = b.length - 1; i >= 0; i--) {

    if (b[i] === "1") {
      steps += `<div class="step-row">${a} shifted ${b.length - 1 - i}</div>`;
    } else {
      steps += `<div class="step-row">Multiply by 0 → 0</div>`;
    }
  }

  steps += `<div class="step-row">Add partial products</div>`;

  return steps;
}

/* ============================
   LONG DIVISION
============================ */
function explainDivision(dividend, divisor) {

  let steps = "";
  let temp = "";
  let quotient = "";

  for (let i = 0; i < dividend.length; i++) {

    temp += dividend[i];
    steps += `<div class="step-row">Bring down → ${temp}</div>`;

    if (parseInt(temp, 2) >= parseInt(divisor, 2)) {
      const diff = binarySubtract(temp, divisor);
      steps += `<div class="step-row">${temp} - ${divisor} = ${diff}</div>`;
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
   CORE BINARY OPERATIONS
============================ */
function binaryAdd(a, b) {

  let carry = 0;
  let result = "";

  a = a.padStart(Math.max(a.length, b.length), "0");
  b = b.padStart(a.length, "0");

  for (let i = a.length - 1; i >= 0; i--) {

    const sum = Number(a[i]) + Number(b[i]) + carry;
    result = (sum % 2) + result;
    carry = Math.floor(sum / 2);
  }

  if (carry) result = "1" + result;

  return result;
}

function binarySubtract(a, b) {

  let result = "";
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

    result = (d1 - d2) + result;
  }

  return result.replace(/^0+/, "") || "0";
}

function binaryMultiply(a, b) {

  let result = "0";

  for (let i = b.length - 1; i >= 0; i--) {
    if (b[i] === "1") {
      result = binaryAdd(result, a + "0".repeat(b.length - 1 - i));
    }
  }

  return result;
}

function binaryDivide(a, b) {

  if (b === "0") {
    return { quotient: "Error", remainder: "Error" };
  }

  const dividend = parseInt(a, 2);
  const divisor = parseInt(b, 2);

  const q = Math.floor(dividend / divisor);
  const r = dividend % divisor;

  return {
    quotient: q.toString(2),
    remainder: r.toString(2)
  };
}

/* ============================
   STEP ANIMATION
============================ */
function animateSteps(container) {

  const rows = container.querySelectorAll(".step-row");

  rows.forEach((row, i) => {
    setTimeout(() => {
      row.classList.add("active");
    }, i * 120);
  });
}
