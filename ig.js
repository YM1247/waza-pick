const originalTechniques = [
  "__lyiamm7124",
  "kumo_ouo",
  "liwei00428",
  "enderhow",
  "kaeru_0706",
  "maple_wotagei",
  "jun_leo_0727",
  "pin_ta.523",
  "xericco",
  "92ingrm",
  "kiwie_a1ice428",
  "linyue._wota",
  "daburu1227_evon",
  "ghostmaple_wotagei",
  "beta_cheating_player",
  "t.yanwei_egnell",
  "simu_uranchu",
  "yiming_wotagei",
  "cheng_xin980217",
  "weizhe_0160",
  "xiaoya._x",
  "soundofsou3310",
  "hoshino9547",
  "sx990123_wota",
  "matcha_elves",
  "ragon3581_rg",
  "linshuu1223",
  "okayulover_.wota",
  "go1d3n_celery_",
  "linweiting0707",
  "biyi8963",
  "east.w.west",
  "latte03270",
  "yorusaki0215",
  "fusiroyukoku",
  "bruce.wota0928",
  "fuguagua9848",
  "small_iceice._.1223",
  "asanagi_yoru",
  "asanagi._.kara",
  "tim_da_fox",
  "oilpig._.wota",
  "kuma_wota",
  "wu_u83_wota",
  "axomtir._.twps.__.0229",
  "_mope_mope",
  "kevinlai0409",
  "youko_cosplay_travel",
  "tigersomebody114514",
  "rayfangfang",
  "karaairin_0604",
  "nekofox123_wota",
  "sean._.02_17",
  "willson_0_tsai.wota",
  "shenhe.sig.mcx",
  "luke._wang",
  "xu._.eden",
  "2certificate",
  "cycc29_ire",
  "hibikasero",
  "b.o.mee_",
  "junyou_0614",
  "pcacg18_yoooo",
  "pcacg18_kitanana",
  "jyubeiaryu1103",
  "hahasooooo",
  "el_starcat",
  "yumi._401_",
  "zhijiang_wota",
  "czt__0410",
  "zone_wota",
  "donfon0409",
  "ricky_.wota",
  "billy_wotagei",
  "hoshi0108._.l",
  "ericzhang8956",
  "rika_970316",
  "yun._.oao_",
  "wayne_06_29",
  "iven3092",
  "eason_wota0904",
  "asanagi_haruma",
  "7._xzkkk",
  "2004.716.181",
  "jun._.9659",
  "kr._.343",
  "xiao._.xy",
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
  const repeatCount = Math.max(3, Math.ceil(82 / source.length));
  reelItems = Array.from({ length: repeatCount }, () => source).flat();
  reel.innerHTML = reelItems
    .map((name) => `<li class="${name === activeName ? "is-active" : ""}" data-name="${name}">${name}</li>`)
    .join("");
  fitReelItems();
  currentIndex = Math.max(0, reelItems.indexOf(activeName));
  moveReel(currentIndex, false);
}

function fitSingleLineText(text, maxPx, minPx, widthScale) {
  const length = Math.max(1, text.length);
  return Math.max(minPx, Math.min(maxPx, widthScale / length));
}

function fitReelItems() {
  reel.querySelectorAll("li").forEach((item) => {
    const name = item.dataset.name || item.textContent || "";
    item.style.fontSize = `${fitSingleLineText(name, 26, 11, 420)}px`;
  });
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
  remainingText.textContent = `剩餘 ${remaining.length} / ${originalTechniques.length} 則留言`;
  drawButton.disabled = isDrawing || remaining.length === 0;
  resetButton.disabled = isDrawing;
  if (!resetAwaitingConfirmation) {
    resetButton.textContent = "重置技庫";
    resetButton.classList.remove("confirming");
  }
  drawButton.textContent = isDrawing ? "抽選中..." : remaining.length === 0 ? "技庫已抽完" : "抽選開始";
}

function renderDrawnList() {
  if (!drawn.length) {
    drawnList.innerHTML = '<li class="empty">尚未抽出</li>';
    return;
  }

  drawnList.innerHTML = drawn
    .map((name, index) => `<li style="font-size: ${fitSingleLineText(name, 22, 12, 300)}px">${index + 1}. ${name}</li>`)
    .join("");
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
  resultText.style.fontSize = "";
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
  resultText.style.fontSize = `${fitSingleLineText(winner, 68, 18, 460)}px`;
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
  resultText.style.fontSize = "";
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
