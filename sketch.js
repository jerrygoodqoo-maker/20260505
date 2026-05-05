let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();
  // 設定影像繪製模式為中心
  imageMode(CENTER);
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  push();
  // 將座標系統移至畫布中心
  translate(width / 2, height / 2);
  // 進行水平翻轉 (鏡像處理)
  scale(-1, 1);
  // 繪製影像，寬高為畫布寬高的 50%
  image(capture, 0, 0, width * 0.5, height * 0.5);
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
