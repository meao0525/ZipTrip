let map;
let postcodes = [];
let markers = []; // マーカーを管理する配列

// 初期化
function initMap() {
  // 郵便番号リストを取得
  fetch("data/postcodes.json")
    .then(res => res.json())
    .then(data => {
      postcodes = data;
      console.log(`📦 郵便番号を読み込みました: ${postcodes.length} 件`);
    });
}

function clearMarkers() {
  // 表示リセット
  document.getElementById("address").textContent = "";
  document.getElementById("addressKana").textContent = "";
}

function startRandom() {
  if (postcodes.length === 0) {
    alert("郵便番号データがまだ読み込まれていません。");
    return;
  }

  // 前のマーカーとズームをリセット
  clearMarkers();

  // まず候補からランダムに1つ選ぶ
  const target = postcodes[Math.floor(Math.random() * postcodes.length)];
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
