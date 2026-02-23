let operator = "+";
let signedMode = true;
let steps = [];
let playbackTimer = null;
let lastComputation = null;

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".op-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".op-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      operator = btn.dataset.op;
    };
  });




  // INFO MODAL
const infoBtn = document.getElementById("infoBtn");
const infoModal = document.getElementById("infoModal");
const closeInfo = document.getElementById("closeInfo");

infoBtn.onclick = () => {
  infoModal.classList.add("active");
};

closeInfo.onclick = () => {
  infoModal.classList.remove("active");
};

infoModal.onclick = (e) => {
  if(e.target === infoModal){
    infoModal.classList.remove("active");
  }
};



  document.getElementById("signedBtn").onclick = () => {
    signedMode = true;
    toggleMode();
  };

  document.getElementById("unsignedBtn").onclick = () => {
    signedMode = false;
    toggleMode();
  };
// AUTO OPEN ONLY ONCE PER SESSION
if (!sessionStorage.getItem("unstableNoticeShown")) {
  setTimeout(() => {
    document.getElementById("infoModal").classList.add("active");
    sessionStorage.setItem("unstableNoticeShown", "true");
  }, 300);
}
  document.getElementById("calculateBtn").onclick = calculate;
  document.getElementById("seeHowBtn").onclick = toggleExplanation;
  document.getElementById("playBtn").onclick = startPlayback;

});

function toggleMode(){
  document.getElementById("signedBtn").classList.toggle("active", signedMode);
  document.getElementById("unsignedBtn").classList.toggle("active", !signedMode);
}

function calculate(){

  clearInterval(playbackTimer);
  steps = [];
  document.getElementById("modeAlert").textContent = "";

  const base = parseInt(document.getElementById("inputBase").value);
  const widthSetting = document.getElementById("bitWidth").value;

  const raw1 = document.getElementById("num1").value.trim();
  const raw2 = document.getElementById("num2").value.trim();

  if(!signedMode && (raw1.startsWith("-") || raw2.startsWith("-"))){
    document.getElementById("modeAlert").textContent =
      "Negative numbers are not allowed in Unsigned mode. Switch to Signed mode.";
    return;
  }

  let n1 = parseInt(raw1, base);
  let n2 = parseInt(raw2, base);

  if(isNaN(n1) || isNaN(n2)) return;

  let width;

  if(widthSetting === "dynamic"){
    width = Math.max(
      Math.abs(n1).toString(2).length,
      Math.abs(n2).toString(2).length
    ) + 1;
  } else {
    width = parseInt(widthSetting);
  }

  const bin1 = toBinary(n1, width);
  const bin2 = toBinary(n2, width);

  let resultData;

  if(operator === "+") resultData = addBinary(bin1, bin2, width);
  //subtraction using signed 
  if(operator === "-"){

   if(signedMode){

      steps.push("Subtraction in signed mode is performed using 2's complement.");
      steps.push("Taking 2's complement of second operand.");

      const ones = bin2.split("").map(b=> b==="0"?"1":"0").join("");
      steps.push("1's Complement: " + ones);

      const twos = addBinary(
        ones,
        "1".padStart(width,"0"),
        width,
        true
      ).finalBinary;

      steps.push("2's Complement: " + twos);
      steps.push("Now perform addition.");

      resultData = addBinary(bin1, twos, width);

   } else {

      resultData = subtractBinary(bin1, bin2, width);
   }
}
  //

  if(operator === "*") resultData = multiplyBinary(bin1, bin2, width);

  lastComputation = {bin1, bin2, resultData};

  showFinalResult(resultData.finalBinary);
  document.getElementById("resultSection").style.display = "block";
}

function toBinary(num, width){

  if(num >= 0){
    return num.toString(2).padStart(width,"0");
  }

  if(!signedMode) return null;

  let abs = Math.abs(num).toString(2).padStart(width,"0");
  steps.push("Binary of absolute value: " + abs);

  let ones = abs.split("").map(b=> b==="0"?"1":"0").join("");
  steps.push("1's Complement: " + ones);

  let twos = addBinary(ones,"1".padStart(width,"0"),width,true).finalBinary;
  steps.push("2's Complement: " + twos);

  return twos;
}

function addBinary(a,b,width,silent=false){

  let carry = 0;
  let result = "";
  let carryRow = new Array(width).fill(0);

  for(let i=width-1;i>=0;i--){

    let bitA = parseInt(a[i]);
    let bitB = parseInt(b[i]);

    let sum = bitA + bitB + carry;

    let resultBit = sum % 2;
    let carryOut = sum >= 2 ? 1 : 0;

    result = resultBit + result;

    // store carry OUT for this column (correct position)
    carryRow[i] = carryOut;

    carry = carryOut;
  }

  let overflow = carryRow[0]; // final carry out of MSB

  if(!silent){
    steps.push("Performing column addition.");
  }

  return {
    finalBinary: result,
    carryRow,
    overflow
  };
}

function subtractBinary(a,b,width){

  let borrow = 0;
  let result="";
  let borrowRow=[];

  for(let i=width-1;i>=0;i--){

    let bitA=parseInt(a[i]);
    let bitB=parseInt(b[i]);

    let diff = bitA - bitB - borrow;

    if(diff<0){
      diff+=2;
      borrow=1;
    }else{
      borrow=0;
    }

    borrowRow.unshift(borrow);
    result = diff + result;
  }

  steps.push("Performing column subtraction.");

  return {
    finalBinary: result,
    borrowRow,
    overflow: borrow
  };
}

function multiplyBinary(a,b,width){

  let rows=[];
  let result="0".repeat(width);

  for(let i=width-1;i>=0;i--){
    if(b[i]==="1"){
      let shift = width-1-i;
      let shifted = a + "0".repeat(shift);
      shifted = shifted.slice(-width);
      rows.push(shifted);
      result = addBinary(result,shifted,width,true).finalBinary;
    }
  }

  steps.push("Performing long multiplication.");

  return {
    finalBinary: result,
    rows
  };
}

function showFinalResult(binary){

  const box = document.getElementById("resultBox");
  box.innerHTML="";

  const final = document.createElement("div");
  final.className="final-box";
  final.textContent="Final Answer: " + binary;

  box.appendChild(final);
}

function toggleExplanation(){

  const box = document.getElementById("howBox");
  box.classList.toggle("open");

  if(box.classList.contains("open")){
    renderExplanation();
  }
}

function renderExplanation(){

  const box = document.getElementById("howBox");
  box.innerHTML="";

  // Step text first
  steps.forEach(step=>{
    const div=document.createElement("div");
    div.className="step";
    div.textContent=step;
    box.appendChild(div);
  });

  // Then render vertical math
  if(lastComputation){
    renderVertical(lastComputation);
  }
}

function startPlayback(){

  const box = document.getElementById("howBox");
  box.classList.add("open");
  box.innerHTML="";

  let index=0;

  playbackTimer = setInterval(()=>{
    if(index>=steps.length){
      clearInterval(playbackTimer);
      return;
    }
    const div=document.createElement("div");
    div.className="step";
    div.textContent=steps[index];
    box.appendChild(div);
    index++;
  },700);
}


function renderVertical(data){

  const {bin1, bin2, resultData} = data;
  const width = bin1.length;

  const container = document.getElementById("howBox");

  const wrapper = document.createElement("div");
  wrapper.className = "vertical-grid";

  // grid columns = operator column + bit width
  wrapper.style.gridTemplateColumns = `repeat(${width + 1}, 32px)`;

  // --- CARRY ROW ---
  if(resultData.carryRow){
    resultData.carryRow.forEach((bit,i)=>{
      if(bit===1){
        const cell=document.createElement("div");
        cell.className="carry-cell";
        cell.textContent="1";
        cell.style.gridRow="1";
        cell.style.gridColumn = i+2;
        wrapper.appendChild(cell);
      }
    });
  }

  // --- FIRST NUMBER ---
  bin1.split("").forEach((bit,i)=>{
    const cell=document.createElement("div");
    cell.className="bit-cell";
    cell.textContent=bit;
    cell.style.gridRow="2";
    cell.style.gridColumn = i+2;
    wrapper.appendChild(cell);
  });

  // --- OPERATOR ---
  const opCell=document.createElement("div");
  opCell.textContent=operator;
  opCell.className="bit-cell";
  opCell.style.gridRow="3";
  opCell.style.gridColumn="1";
  wrapper.appendChild(opCell);

  // --- SECOND NUMBER ---
  bin2.split("").forEach((bit,i)=>{
    const cell=document.createElement("div");
    cell.className="bit-cell";
    cell.textContent=bit;
    cell.style.gridRow="3";
    cell.style.gridColumn = i+2;
    wrapper.appendChild(cell);
  });

  // --- LINE ---
  const line=document.createElement("div");
  line.className="math-line";
  line.style.gridRow="4";
  line.style.gridColumn=`1 / span ${width+1}`;
  wrapper.appendChild(line);

  // --- RESULT ---
  resultData.finalBinary.split("").forEach((bit,i)=>{
    const cell=document.createElement("div");
    cell.className="bit-cell";

    if(resultData.overflow===1 && i===0){
      cell.classList.add("overflow-bit");
    }

    cell.textContent=bit;
    cell.style.gridRow="5";
    cell.style.gridColumn = i+2;
    wrapper.appendChild(cell);
  });

  container.appendChild(wrapper);

  // overflow note
  if(resultData.overflow===1){
    const note=document.createElement("div");
    note.className="overflow-note";
    note.textContent="⚠ Overflow occurred. Overflow bit discarded in signed result.";
    container.appendChild(note);
  }
}