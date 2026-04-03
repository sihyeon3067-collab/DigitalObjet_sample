// ─── 상수 ───────────────────────────────────────────────
const H_INNER = [254, 254, 255, 230];
const H_OUTER = [254, 254, 255, 230];
const M_INNER = [222, 222, 222, 220];
const M_OUTER = [222, 222, 222, 180];
const S_INNER = [192, 192, 192, 150];
const S_OUTER = [192, 192, 192, 110];

const ROTATE_SPEED = 0.001;
const HOUR_BLINK = 100;
const MINUTE_BLINK = 100;
const SECOND_BLINK = 50;

const SCALE_MIN = 0.98;
const SCALE_SPEED = 0.12;

// ─── 전역 상태 ──────────────────────────────────────────
let baseRad, img;

let prevH = -1,
  hourStart = 0;
let prevM = -1,
  minuteStart = 0;
let prevS = -1,
  secondStart = 0;

let scaleVal = 1;
let scaleTarget = 1;

const hTxt = [];
const mTxt = [];
const sTxt = [];

// ─── 셋업 ────────────────────────────────────────────────
async function setup() {
  createCanvas(windowWidth, windowHeight);
  img = await loadImage('img8.png');
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  updateRadiusValues();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateRadiusValues();
}

function updateRadiusValues() {
  baseRad = min(windowWidth, windowHeight) * 0.04;
}

function mousePressed() {
  scaleTarget = SCALE_MIN;
}

// ─── 메인 루프 ───────────────────────────────────────────
function draw() {
  push();
  resetMatrix();
  const ratio = max(windowWidth / img.width, windowHeight / img.height);
  const iw = img.width * ratio;
  const ih = img.height * ratio;
  image(img, (windowWidth - iw) * 0.5, (windowHeight - ih) * 0.5, iw, ih);
  pop();

  const now = millis();
  const curH = hour();
  const curM = minute();
  const curS = second();

  if (curH !== prevH) {
    hourStart = now;
    prevH = curH;
  }
  if (curM !== prevM) {
    minuteStart = now;
    prevM = curM;
  }
  if (curS !== prevS) {
    secondStart = now;
    prevS = curS;
  }

  fillLabel(hTxt, String(curH > 12 ? curH - 12 : curH), 'HOUR');
  fillLabel(mTxt, String(curM), 'MINUTE');
  fillLabel(sTxt, String(curS), 'SECOND');

  translate(windowWidth * 0.5, windowHeight * 0.5);

  // 스케일 보간
  scaleVal += (scaleTarget - scaleVal) * SCALE_SPEED;
  scale(scaleVal);
  if (scaleTarget < 1 && abs(scaleVal - scaleTarget) < 0.001) {
    scaleTarget = 1;
  }

  const hourMod = curH % 12;
  const minuteMod = curM % 10;
  const secondMod = curS % 10;

  let fontSize = 6;
  let rad = baseRad;

  // ── 시 링 ───────────────────────────────────────────
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    hourMod,
    H_INNER,
    now - hourStart,
    HOUR_BLINK,
    1,
    0.5,
    1,
    1,
    now,
  );

  rad += fontSize * 0.3;
  fill(...H_OUTER);
  textSize(fontSize + 3.5);
  textStyle(BOLD);
  push();
  rotate(now * ROTATE_SPEED);
  makeWaves(rad, hTxt, 1);
  pop();

  // ── 분 링 ───────────────────────────────────────────
  rad += baseRad / 2 + fontSize + 1;
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    minuteMod,
    M_INNER,
    now - minuteStart,
    MINUTE_BLINK,
    1,
    0.8,
    4,
    -1,
    now,
  );

  rad += fontSize * 0.8 + 2;
  fill(...M_OUTER);
  textSize(fontSize + 8);
  textStyle(BOLD);
  push();
  rotate(now * -ROTATE_SPEED);
  makeWaves(rad, mTxt, 1);
  pop();

  // ── 초 링 ───────────────────────────────────────────
  rad += baseRad + fontSize;
  fontSize += 4;
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    secondMod,
    S_INNER,
    now - secondStart,
    SECOND_BLINK,
    2.15,
    0.78,
    5,
    1,
    now,
  );

  rad += fontSize * 0.5;
  fill(...S_OUTER);
  textSize(fontSize + 12);
  textStyle(BOLD);
  push();
  rotate(now * ROTATE_SPEED);
  makeWaves(rad, sTxt, 0.9);
  pop();
}

// ─── 레이블 배열 채우기 ──────────────────────────────────
function fillLabel(arr, numStr, label) {
  let i = 0;
  for (const c of numStr) arr[i++] = c;
  arr[i++] = '';
  for (const c of label) arr[i++] = c;
  arr.length = i;
}

// ─── 링 그리기 ───────────────────────────────────────────
// fsStep      : fontSize 증가량 (시·분=1, 초=2.15)
// strokeRatio : strokeWeight 계수 (시=0.5, 분=0.8, 초=0.8)
// gap         : 링 사이 추가 간격 (시=1, 분=4, 초=5)
// rotDir      : 회전 방향 (1 또는 -1)
function drawRings(
  rad,
  fontSize,
  count,
  color,
  elapsed,
  blinkDur,
  fsStep,
  strokeRatio,
  gap,
  rotDir,
  now,
) {
  noFill();
  for (let i = 0; i < count; i++) {
    fontSize += fsStep;
    const strokeW = fontSize * strokeRatio;
    const alpha =
      elapsed >= i * blinkDur && elapsed < (i + 1) * blinkDur ? 204 : color[3];

    push();
    rotate(now * ROTATE_SPEED * rotDir);
    stroke(color[0], color[1], color[2], alpha);
    strokeWeight(strokeW);
    circle(0, 0, rad * 2);
    pop();

    rad += fontSize + gap;
  }
  return [rad, fontSize];
}

// ─── 텍스트를 원형으로 배치 ──────────────────────────────
function makeWaves(rad, arr, gapRatio = 0.8) {
  const txtGap = textWidth('...') * gapRatio;
  const circLen = TWO_PI * rad;
  const arrLen = arr.length;
  const dumpCount = floor(circLen / (txtGap * arrLen));
  const dumpAng = 360 / dumpCount;
  const charAng = 360 / floor(circLen / txtGap);

  for (let i = 0; i < dumpCount; i++) {
    push();
    rotate(i * dumpAng);
    for (let j = 0; j < arrLen; j++) {
      push();
      rotate(j * charAng);
      text(arr[j], 0, -rad);
      pop();
    }
    pop();
  }
}
