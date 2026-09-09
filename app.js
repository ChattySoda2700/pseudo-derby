let points = Number(localStorage.getItem("points")) || 10000;

let currentRace = null;
let betType = "win";
let amount = 100;
let selection = [];

const races = {

  1: {
    venue: "中京",
    number: 1,
    name: "3歳未勝利",

    horses: [
      ["1", "サクラブレイブ", 3.2],
      ["2", "ブルースター", 5.8],
      ["3", "ミナトスター", 2.4],
      ["4", "オーシャンロード", 8.7],
      ["5", "グリーンアロー", 12.1],
      ["6", "ゴールドウイング", 6.3]
    ],

    result: ["3", "2", "1"]
  },

  2: {
    venue: "中京",
    number: 2,
    name: "2歳未勝利",

    horses: [
      ["1", "レッドファイア", 4.1],
      ["2", "ホワイトムーン", 3.5],
      ["3", "サンダー号", 7.2],
      ["4", "ブルーキング", 2.8],
      ["5", "スターライト", 10.5],
      ["6", "ミラクルラン", 15.2]
    ],

    result: ["4", "2", "1"]
  },

  11: {
    venue: "中京",
    number: 11,
    name: "メインレース",

    horses: [
      ["1", "サクラブレイブ", 3.2],
      ["2", "ブルースター", 5.8],
      ["3", "ミナトスター", 2.4],
      ["4", "オーシャンロード", 8.7],
      ["5", "グリーンアロー", 12.1],
      ["6", "ゴールドウイング", 6.3]
    ],

    result: ["3", "6", "1"]
  }

};


function updatePoints() {
  document.getElementById("points").textContent =
    points.toLocaleString();

  localStorage.setItem("points", points);
}


function openRace(number) {

  currentRace = races[number];

  document.getElementById("raceList")
    .classList.add("hidden");

  document.getElementById("resultScreen")
    .classList.add("hidden");

  document.getElementById("betScreen")
    .classList.remove("hidden");

  document.getElementById("raceTitle").textContent =
    `${currentRace.venue}${currentRace.number}R ${currentRace.name}`;

  const horses = document.getElementById("horses");

  horses.innerHTML = "";

  currentRace.horses.forEach(horse => {

    horses.innerHTML += `
      <div class="horse">
        <div class="horse-number">${horse[0]}</div>
        <div>${horse[1]}</div>
        <div class="odds">${horse[2]}</div>
      </div>
    `;

  });

  selectBetType("win");
}


function selectBetType(type) {

  betType = type;
  selection = [];

  document.querySelectorAll(".bet-types button")
    .forEach(btn => btn.classList.remove("active"));

  const names = {
    win: "単勝",
    place: "複勝",
    quinella: "馬連",
    wide: "ワイド",
    exacta: "馬単",
    trio: "3連複",
    trifecta: "3連単"
  };

  document.getElementById("betTypeName").textContent =
    names[type];

  createSelectionButtons();
}


function requiredSelections() {

  if (betType === "win") return 1;
  if (betType === "place") return 1;
  if (betType === "quinella") return 2;
  if (betType === "wide") return 2;
  if (betType === "exacta") return 2;
  if (betType === "trio") return 3;
  if (betType === "trifecta") return 3;

}


function createSelectionButtons() {

  const area = document.getElementById("selectionArea");

  area.innerHTML = "";

  currentRace.horses.forEach(horse => {

    const button = document.createElement("button");

    button.className = "selection-btn";

    button.textContent =
      `${horse[0]} ${horse[1]}`;

    button.onclick = () => toggleSelection(
      horse[0],
      button
    );

    area.appendChild(button);

  });

}


function toggleSelection(number, button) {

  const max = requiredSelections();

  if (selection.includes(number)) {

    selection =
      selection.filter(x => x !== number);

    button.classList.remove("selected");

    return;
  }

  if (selection.length >= max) {

    alert(`${max}頭まで選択できます`);

    return;
  }

  selection.push(number);

  button.classList.add("selected");
}


function changeAmount(value) {

  amount += value;

  if (amount < 100)
    amount = 100;

  if (amount > points)
    amount = points;

  document.getElementById("amount").textContent =
    amount.toLocaleString();

}


function placeBet() {

  const required = requiredSelections();

  if (selection.length !== required) {

    alert(
      `${required}頭を選択してください`
    );

    return;
  }

  if (amount <= 0 || amount > points) {

    alert("ポイントが不足しています");

    return;
  }

  points -= amount;

  updatePoints();

  // 現在はテスト用に即時結果表示
  showResult();

}


function showResult() {

  document.getElementById("betScreen")
    .classList.add("hidden");

  document.getElementById("resultScreen")
    .classList.remove("hidden");

  const result = currentRace.result;

  let html = "";

  result.forEach((number, index) => {

    html += `
      <div class="result-horse">
        ${index + 1}着　
        <strong>${number}番</strong>
      </div>
    `;

  });

  document.getElementById("result").innerHTML =
    html;

  const hit = checkHit();

  let payout = 0;

  if (hit) {

    // 試作版の簡易払い戻し
    payout = amount * getMultiplier();

    points += payout;

    updatePoints();

    document.getElementById("payout").innerHTML = `
      <div class="payout-box">
        🎯 <strong>的中！</strong><br><br>
        払戻<br>
        <strong>${payout.toLocaleString()} pt</strong>
      </div>
    `;

  } else {

    document.getElementById("payout").innerHTML = `
      <div class="payout-box">
        ❌ ハズレ<br><br>
        払戻 0 pt
      </div>
    `;

  }

}


function checkHit() {

  const result = currentRace.result;

  if (betType === "win")
    return selection[0] === result[0];

  if (betType === "place")
    return result.includes(selection[0]);

  if (betType === "quinella")
    return selection.every(x => result.slice(0,2).includes(x));

  if (betType === "wide")
    return selection.every(x => result.includes(x));

  if (betType === "exacta")
    return selection[0] === result[0]
        && selection[1] === result[1];

  if (betType === "trio")
    return selection.every(x => result.includes(x));

  if (betType === "trifecta")
    return selection[0] === result[0]
        && selection[1] === result[1]
        && selection[2] === result[2];

}


function getMultiplier() {

  const multipliers = {

    win: 3.2,
    place: 1.8,
    quinella: 5.5,
    wide: 3.0,
    exacta: 12.0,
    trio: 25.0,
    trifecta: 100.0

  };

  return multipliers[betType];

}


function showRaceList() {

  document.getElementById("betScreen")
    .classList.add("hidden");

  document.getElementById("resultScreen")
    .classList.add("hidden");

  document.getElementById("raceList")
    .classList.remove("hidden");

}


updatePoints();
