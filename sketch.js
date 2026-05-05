let capture;
let faceMesh;
let faces = [];

function gotFaces(results) {
  faces = results;
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();
  // 設定影像繪製模式為中心
  imageMode(CENTER);

  // 初始化 FaceMesh 模型並開始偵測影像中的臉部
  faceMesh = ml5.faceMesh(capture);
  faceMesh.detectStart(capture, gotFaces);
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

  // 如果有偵測到臉部，則繪製指定的線條
  if (faces.length > 0) {
    let face = faces[0];
    // 使用者指定的臉部特徵點編號序列
    let indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    
    stroke(255, 0, 0); // 設定線條為紅色
    strokeWeight(15);   // 設定線條粗細為 15
    noFill();

    for (let i = 0; i < indices.length - 1; i++) {
      let p1 = face.keypoints[indices[i]];
      let p2 = face.keypoints[indices[i+1]];
      
      // 將點的座標從影像原始尺寸映射到畫布上實際繪製的大小
      let x1 = map(p1.x, 0, capture.width, -width * 0.25, width * 0.25);
      let y1 = map(p1.y, 0, capture.height, -height * 0.25, height * 0.25);
      let x2 = map(p2.x, 0, capture.width, -width * 0.25, width * 0.25);
      let y2 = map(p2.y, 0, capture.height, -height * 0.25, height * 0.25);
      
      line(x1, y1, x2, y2);
    }
  }
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
