const originalTechniques = [
  "el_starcat",
  "sakatsuki_1120",
  "hahasooooo",
  "xuan06_",
  "jyubeiaryu1103",
  "kitanana_67",
  "yajuguy__",
  "junyou_0614",
  "b.o.mee_",
  "hibikasero",
  "t.yanwei_egnell",
  "ire_boom",
  "2certificate",
  "xericco",
  "latte03270",
  "go1d3n_celery_",
  "kaeru_0706",
  "xu._.eden",
  "luke._wang",
  "linshuu1223",
  "kuma_wota",
  "east.w.west",
  "east.w.west",
  "yorusaki0215",
  "daburu1227_evon",
  "yiming_wotagei",
  "kumo_ouo",
  "snow_glowing.px",
  "xx_a.me_xx",
  "fusiroyukoku",
  "willson_0_tsai.wota",
  "sean._.02_17",
  "nekofox123_wota",
  "karaairin_0604",
  "rayfangfang",
  "tigersomebody114514",
  "0623_jyun",
  "youko_cosplay_travel",
  "kevinlai0409",
  "ragon3581_rg",
  "biyi8963",
  "fusiroyukoku",
  "kirine_94",
  "arozen_rk_0524",
  "bokuha_rinyan",
  "blacktea34t",
  "pl_xaolo",
  "yaliduck_.wota",
  "rhd_exe",
  "hoshi0108._.l",
  "okayulover_.wota",
  "beta_cheating_player",
  "qsas30_kuroyama",
  "kr._.343",
  "jun._.9659",
  "pin_ta.523",
  "tim_da_fox",
  "jun_leo_0727",
  "ron.114514",
  "linweiting0707",
  "2004.716.181",
  "kiwie_a1ice428",
  "7._xzkkk",
  "asanagi_haruma",
  "enderhow",
  "okayulover_.wota",
  "eason_wota0904",
  "iven3092",
  "oilpig._.wota",
  "hoshino9547",
  "bruce.wota0928",
  "wayne_06_29",
  "matcha_elves",
  "wayne_06_29",
  "yun.*.oao*",
  "rika_970316",
  "maple_wotagei",
  "asanagi._.kara",
  "simu_uranchu",
  "ericzhang8956",
  "hoshino9547",
  "hoshi0108._.l",
  "cheng_xin980217",
  "billy_wotagei",
  "ricky_.wota",
  "asanagi_yoru",
  "asanagi_yoru",
  "donfon0409",
  "small_iceice._.1223",
  "liwei00428",
  "ghostmaple_wotagei",
  "fuguagua9848",
  "zone_wota",
  "czt__0410",
  "xiaoya._x",
  "cyunn00",
  "zhijiang_wota",
  "yumi.*401*",
  "__lyiamm7124",
  "liwei00428",
  "weizhe_0160",
  "_mope_mope",
  "kuma_wota",
  "xiao._.xy",
  "soundofsou3310",
  "axomtir._.twps.__.0229",
  "92ingrm",
  "linyue._wota",
  "wu_u83_wota",
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

function buildEmptyReel() {
  reelItems = [];
  reel.innerHTML = "";
  currentIndex = 0;
  reel.style.transition = "none";
  reel.style.setProperty("--offset", "0px");
  reel.offsetHeight;
  reel.style.transition = "";
}

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
    resetButton.textContent = "重置名單";
    resetButton.classList.remove("confirming");
  }
  drawButton.textContent = isDrawing ? "抽選中..." : remaining.length === 0 ? "名單已抽完" : "抽選開始";
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
  resetButton.textContent = "重置名單";
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
  buildEmptyReel();
  renderDrawnList();
  updateStatus();
}

drawButton.addEventListener("click", drawTechnique);
resetButton.addEventListener("click", resetDraw);
window.addEventListener("resize", () => moveReel(currentIndex, false));

buildEmptyReel();
renderDrawnList();
updateStatus();
