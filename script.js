const originalTechniques = [
  "ステルス．ヒッキー",
  "スーパープルーム",
  "キャノン砲",
  "イザナギ",
  "桜華",
  "カンザシ",
  "くをん刀",
  "ななえる",
];

const reel = document.querySelector("#reel");
const drawButton = document.querySelector("#drawButton");
const resetButton = document.querySelector("#resetButton");
const resultText = document.querySelector("#resultText");
const remainingText = document.querySelector("#remainingText");
const drawnList = document.querySelector("#drawnList");
const stage = document.querySelector(".stage");
const reelWindow = document.querySelector(".reel-window");

let remaining = [...originalTechniques];
let drawn = [];
let reelItems = [];
let currentIndex = 0;
let isDrawing = false;
let resetAwaitingConfirmation = false;
let resetConfirmTimer = null;

function buildReel(activeName = remaining[0]) {
  const source = remaining.length ? remaining : originalTechniques;
  const repeatCount = Math.max(14, Math.ceil(82 / source.length));
  reelItems = Array.from({ length: repeatCount }, () => source).flat();
  reel.innerHTML = reelItems
    .map((name) => `<li class="${name === activeName ? "is-active" : ""}">${name}</li>`)
    .join("");
  currentIndex = Math.max(0, reelItems.indexOf(activeName));
  moveReel(currentIndex, false);
}

function moveReel(index, animated = true) {
  const itemHeight = getItemHeight();
  const centerOffset = (reelWindow.clientHeight - itemHeight) / 2;
  reel.style.transition = animated ? "" : "none";
  reel.style.setProperty("--offset", `${centerOffset - index * itemHeight}px`);
  if (!animated) {
    reel.offsetHeight;
    reel.style.transition = "";
  }
}

function getItemHeight() {
  return reel.querySelector("li")?.getBoundingClientRect().height || 74;
}

function setActive(index) {
  reel.querySelectorAll("li").forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === index);
  });
}

function updateStatus() {
  remainingText.textContent = `剩餘 ${remaining.length} / ${originalTechniques.length} 技`;
  drawButton.disabled = isDrawing || remaining.length === 0;
  resetButton.disabled = isDrawing;
  if (!resetAwaitingConfirmation) {
    resetButton.textContent = "重置技庫";
    resetButton.classList.remove("confirming");
  }
  drawButton.textContent = isDrawing ? "抽選中" : remaining.length === 0 ? "技庫已抽完" : "抽選開始";
}

function renderDrawnList() {
  if (!drawn.length) {
    drawnList.innerHTML = '<li class="empty">尚未抽出</li>';
    return;
  }

  drawnList.innerHTML = drawn.map((name, index) => `<li>${index + 1}. ${name}</li>`).join("");
}

function randomTechnique() {
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function drawTechnique() {
  if (isDrawing || remaining.length === 0) return;

  cancelResetConfirmation();
  isDrawing = true;
  updateStatus();
  resultText.textContent = "抽選中...";
  stage.classList.remove("flash", "final-hit", "is-drawing");
  stage.classList.add("is-drawing");

  const winner = randomTechnique();
  buildReel(remaining[currentIndex % remaining.length]);
  const targetBaseIndex = reelItems.findIndex((name, index) => index > 58 && name === winner);
  const targetIndex = targetBaseIndex === -1 ? reelItems.lastIndexOf(winner) : targetBaseIndex;
  const totalSteps = targetIndex - currentIndex;

  reel.classList.add("spinning");
  for (let step = 1; step <= totalSteps; step += 1) {
    const progress = step / totalSteps;
    const wait = 18 + Math.pow(progress, 3.6) * 280;
    currentIndex += 1;
    moveReel(currentIndex);
    setActive(currentIndex);
    if (progress > 0.54) {
      reel.classList.remove("spinning");
      reel.classList.add("slowing");
    }
    if (progress > 0.82) {
      reel.classList.add("suspense");
      resultText.textContent = "抽選中...";
    }
    await delay(wait);
  }

  reel.classList.remove("spinning", "slowing", "suspense");
  currentIndex = targetIndex;
  setActive(currentIndex);
  await delay(220);
  resultText.textContent = winner;
  remaining = remaining.filter((name) => name !== winner);
  drawn.push(winner);
  isDrawing = false;
  stage.classList.remove("is-drawing");
  stage.classList.add("flash", "final-hit");
  renderDrawnList();
  updateStatus();
}

function cancelResetConfirmation() {
  resetAwaitingConfirmation = false;
  window.clearTimeout(resetConfirmTimer);
  resetConfirmTimer = null;
  resetButton.textContent = "重置技庫";
  resetButton.classList.remove("confirming");
}

function resetDraw() {
  if (isDrawing) return;

  if (!resetAwaitingConfirmation) {
    resetAwaitingConfirmation = true;
    resetButton.textContent = "再按一次確認";
    resetButton.classList.add("confirming");
    resetConfirmTimer = window.setTimeout(cancelResetConfirmation, 4200);
    return;
  }

  cancelResetConfirmation();
  remaining = [...originalTechniques];
  drawn = [];
  resultText.textContent = "等待抽選";
  stage.classList.remove("flash", "final-hit", "is-drawing");
  reel.classList.remove("spinning", "slowing", "suspense");
  buildReel();
  renderDrawnList();
  updateStatus();
}

drawButton.addEventListener("click", drawTechnique);
resetButton.addEventListener("click", resetDraw);
window.addEventListener("resize", () => moveReel(currentIndex, false));

buildReel();
renderDrawnList();
updateStatus();
