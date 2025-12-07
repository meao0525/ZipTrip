let postcodes = [];
const PREFS = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県",
  "沖縄県"
];

// 初期化
function initMap() {
  // 郵便番号リストを取得
  fetch("data/postcodes.json")
    .then(res => res.json())
    .then(data => {
      postcodes = data;
      console.log(`📦 郵便番号を読み込みました: ${postcodes.length} 件`);
    });

  // 都道府県チェックボックス生成
  const prefList = document.getElementById("prefList");
  PREFS.forEach(pref => {
    const id = "pref_" + pref;
    prefList.innerHTML += `
      <label><input type="checkbox" value="${pref}" id="${id}"> ${pref}</label>
    `;
  });
}

function clearMarkers() {
  // 表示リセット
  document.getElementById("address").textContent = "";
  document.getElementById("addressKana").textContent = "";
}

function togglePrefList() {
  const box = document.getElementById("prefContainer");
  const tab = document.getElementById("prefTab");

  if (box.classList.contains("hidden")) {
    box.classList.remove("hidden");
    tab.textContent = "▲ 都道府県を選択";
  } else {
    box.classList.add("hidden");
    tab.textContent = "▼ 都道府県を選択";
  }
}

// チェックされている都道府県リストを取得
function getSelectedPrefs() {
  const checked = Array.from(document.querySelectorAll("#prefList input:checked"))
                      .map(el => el.value);
  return checked;
}

function startRandom() {
  if (postcodes.length === 0) {
    alert("郵便番号データがまだ読み込まれていません。");
    return;
  }

  // 前のマーカーとズームをリセット
  clearMarkers();

  // ▼ フィルタ処理
  const selectedPrefs = getSelectedPrefs();

  // 何も選択なし → 全県対象
  const filtered = selectedPrefs.length === 0
    ? postcodes
    : postcodes.filter(pc => selectedPrefs.includes(pc.pref));

  if (filtered.length === 0) {
    alert("選択した都道府県のデータがありません。");
    return;
  }

  // ランダム抽選
  const target = filtered[Math.floor(Math.random() * filtered.length)];

  const digits = Array(7).fill(0);
  const intervals = [];

  // 各桁をルーレットで回す
  for (let i = 0; i < 7; i++) {
    intervals[i] = setInterval(() => {
      digits[i] = Math.floor(Math.random() * 10);
      showZip(digits);
    }, 50);
  }

  // 桁ごとに止めてターゲットの数字に固定
  digits.forEach((_, i) => {
    setTimeout(() => {
      clearInterval(intervals[i]);
      digits[i] = Number(target.zip[i]); // JSONのzipから数字を取得
      showZip(digits);

      if (i === 6) { // 最後の桁が止まったら確定
        const formatted = target.zip.slice(0, 3) + "-" + target.zip.slice(3);
        // ページにも住所を表示
        document.getElementById("address").textContent =
          `${target.pref}${target.city}${target.town}`;
        document.getElementById("addressKana").textContent =
          `${target.prefKana} ${target.cityKana} ${target.townKana}`;

        // Googleマップリンクを生成
        const mapUrl =
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("日本 " + formatted + " " + target.pref + target.city + target.town)}`;

        document.getElementById("mapLink").innerHTML =
          `<a href="${mapUrl}" target="_blank"><button>Googleマップで表示</button></a>`;
      }
    }, 1000 + i * 500);
  });
}

function showZip(digits) {
  const zipStr = digits.join("");
  const formatted = zipStr.slice(0, 3) + "-" + zipStr.slice(3);
  document.getElementById("zip").textContent = "〒" + formatted;
}

window.onload = initMap;
