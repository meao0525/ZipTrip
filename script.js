let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: { lat: 35.68, lng: 139.76 }, // 東京
  });
}

function startRandom() {
  let digits = Array(7).fill(0); // 7桁
  let intervals = [];

  // 7桁すべて高速に回す
  for (let i = 0; i < 7; i++) {
    intervals[i] = setInterval(() => {
      digits[i] = Math.floor(Math.random() * 10);
      showZip(digits);
    }, 50);
  }

  // 桁ごとに止める（0.5秒ごと）
  digits.forEach((_, i) => {
    setTimeout(() => {
      clearInterval(intervals[i]);
      if (i === 6) { // 最後の桁が止まったら確定
        let zipStr = digits.join("");
        let formatted = zipStr.slice(0,3) + "-" + zipStr.slice(3);
        showOnMap(formatted);
      }
    }, 1000 + i * 500);
  });
}

function showZip(digits) {
  let zipStr = digits.join("");
  let formatted = zipStr.slice(0,3) + "-" + zipStr.slice(3);
  document.getElementById("zip").textContent = "〒" + formatted;
}

function showOnMap(zip) {
  let geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: "日本 " + zip }, (results, status) => {
    if (status === "OK" && results[0]) {
      map.setCenter(results[0].geometry.location);
      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
      });
    } else {
      alert("この郵便番号は見つかりませんでした");
    }
  });
}

window.onload = initMap;
