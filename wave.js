let h, m, s;
let hArr, mArr, sArr;
let hTxt, mTxt, sTxt;
let fontSize = 10;
let radius;
let baseRad;

const bgColor = [218, 230, 236];
const sInnerColor = [15, 123, 210, 150];
const sOuterColor = [37, 74, 176];
const mInnerColor = [29, 134, 238, 150];
const mOuterColor = [37, 74, 176];
const hInnerColor = [14, 58, 179, 150];
const hOuterColor = [37, 74, 176];

let prevSecond = -1;
let secondStartTime = 0;
let prevMinute = -1;
let minuteStartTime = 0;
let prevHour = -1;
let hourStartTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  updateRadiusValues();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateRadiusValues();
}

function updateRadiusValues() {
  const minDimension = min(windowWidth, windowHeight) * 0.04;
  radius = minDimension;
  baseRad = minDimension;
}

function draw() {
  background(...bgColor);

  // 시간 값 캐싱
  const currentHour = hour();
  const currentMinute = minute();
  const currentSecond = second();
  const currentMillis = millis();

  if (currentHour !== prevHour) {
    hourStartTime = currentMillis;
    prevHour = currentHour;
  }

  if (currentMinute !== prevMinute) {
    minuteStartTime = currentMillis;
    prevMinute = currentMinute;
  }

  if (currentSecond !== prevSecond) {
    secondStartTime = currentMillis;
    prevSecond = currentSecond;
  }

  h = String(currentHour > 12 ? currentHour - 12 : currentHour);
  m = String(currentMinute);
  s = String(currentSecond);

  // 배열 생성 최적화
  hArr = [...h, ""];
  mArr = [...m, "", ""];
  sArr = [...s, ""];

  hTxt = [...h, " ", "H", "O", "U", "R"];
  mTxt = [...m, " ", "M", "I", "N", "U", "T", "E"];
  sTxt = [...s, " ", "S", "E", "C", "O", "N", "D"];

  translate(windowWidth * 0.5, windowHeight * 0.5);

  let rad = baseRad;
  const secondMod = currentSecond % 10;
  const minuteMod = currentMinute % 10;
  const hourMod = currentHour % 12;
  fontSize = 6;

  // 시 단위 안쪽 - 원으로 표시
  fill(hInnerColor);
  noStroke();

  const timeInHour = currentMillis - hourStartTime;
  const hourDuration = 100;

  for (let i = 0; i < hourMod; i++) {
    fontSize += 1;
    const circleSize = fontSize * 0.8;

    const startTime = i * hourDuration;
    const endTime = (i + 1) * hourDuration;

    let alpha;
    if (timeInHour >= startTime && timeInHour < endTime) {
      alpha = 0.8 * 255; // 완전 투명
    } else {
      alpha = mInnerColor[3]; // 원래 알파값
    }

    fill(hInnerColor[0], hInnerColor[1], hInnerColor[2], alpha);

    push();
    rotate(currentMillis * 0.001);
    makeCircles(rad, circleSize, hArr.length);
    pop();
    rad += fontSize + 1;
  }

  // 시 단위 바깥 문자
  rad += fontSize * 0.25;
  fill(hOuterColor);
  textSize(fontSize + 5);
  textStyle(BOLD);
  push();
  rotate(currentMillis * 0.001);
  makeWaves(rad, hTxt);
  pop();

  // 분 단위 안쪽 - 원으로 표시
  rad += baseRad / 2 + fontSize;
  fill(mInnerColor);
  noStroke();

  const timeInMinute = currentMillis - minuteStartTime;
  const minuteDuration = 100;

  for (let i = 0; i < minuteMod; i++) {
    fontSize++;
    const circleSize = fontSize * 0.8;

    const startTime = i * minuteDuration;
    const endTime = (i + 1) * minuteDuration;

    let alpha;
    if (timeInMinute >= startTime && timeInMinute < endTime) {
      alpha = 0.8 * 255; // 완전 투명
    } else {
      alpha = mInnerColor[3]; // 원래 알파값
    }

    fill(mInnerColor[0], mInnerColor[1], mInnerColor[2], alpha);

    push();
    rotate(currentMillis * -0.001);
    makeCircles(rad, circleSize, mArr.length);
    pop();
    rad += fontSize + 1;
  }

  // 분 단위 바깥 문자
  rad += fontSize * 0.8;
  fill(mOuterColor);
  textSize(fontSize + 16);
  textStyle(BOLD);
  push();
  rotate(currentMillis * -0.001);
  makeWaves(rad, mTxt);
  pop();

  // 초 단위 안쪽 - 원으로 표시 (애니메이션 적용)
  rad += baseRad + fontSize;
  fontSize += 4;
  noStroke();
  for (let i = 0; i < secondMod; i++) {
    fontSize += 2.15;
    const circleSize = fontSize * 0.8;

    const duration = 50;
    const startTime = i * duration;
    const endTime = (i + 1) * duration;
    const timeInSecond = currentMillis - secondStartTime;

    let alpha;
    if (timeInSecond >= startTime && timeInSecond < endTime) {
      alpha = 0.8 * 255;
    } else {
      alpha = sInnerColor[3]; // 원래 알파값
    }

    fill(sInnerColor[0], sInnerColor[1], sInnerColor[2], alpha);
    push();
    rotate(currentMillis * 0.001);
    makeCircles(rad, circleSize, sArr.length);
    pop();
    rad += fontSize + 1;
  }

  // 초 단위 바깥 문자
  rad += fontSize * 1.5;
  fill(sOuterColor);
  textSize(fontSize + 30);
  textStyle(BOLD);
  push();
  rotate(currentMillis * 0.001);
  makeWaves(rad, sTxt);
  pop();
}

// 원을 원형으로 배치하는 함수
function makeCircles(rad, circleSize, patternLength) {
  const spacing = circleSize * 1.5;
  const circleLength = TWO_PI * rad;

  // 패턴 한 세트의 간격
  const patternSpacing = spacing * patternLength;
  const patternCount = floor(circleLength / patternSpacing);
  const rotatePatternAng = 360 / patternCount;

  for (let i = 0; i < patternCount; i++) {
    push();
    rotate(i * rotatePatternAng);

    for (let j = 0; j < patternLength; j++) {
      push();
      const angle = ((j * spacing) / rad) * (180 / PI);
      rotate(angle);
      ellipse(0, -rad, circleSize, circleSize);
      pop();
    }
    pop();
  }
}

// 텍스트를 원형으로 배치하는 함수
function makeWaves(rad, arr, gapRatio = 0.8) {
  const txtW = textWidth("...");
  const txtGap = txtW * gapRatio;
  const circleLength = TWO_PI * rad;
  const txtDumpCount = floor(circleLength / (txtGap * arr.length));
  const rotateDumpAng = 360 / txtDumpCount;
  const rotateAng = 360 / floor(circleLength / txtGap);
  const arrLength = arr.length;

  for (let i = 0; i < txtDumpCount; i++) {
    push();
    rotate(i * rotateDumpAng);
    for (let j = 0; j < arrLength; j++) {
      push();
      rotate(j * rotateAng);
      text(arr[j], 0, -rad);
      pop();
    }
    pop();
  }
}
