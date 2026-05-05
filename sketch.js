let capture;
let facemesh;
let predictions = [];
let stars = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏 p5.js 自動產生的預設 HTML 影片標籤
  imageMode(CENTER); // 設定影像定位點在中心，方便後續置中對齊

  // ml5.js v1.x API: faceMesh（注意大寫 M）
  facemesh = ml5.faceMesh({ maxFaces: 1 }, modelReady);

  // 初始化星星位置
  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(width), y: random(height), size: random(1, 3) });
  }
}

function modelReady() {
  console.log("Facemesh model loaded!");
  facemesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  predictions = results;
}

function draw() {
  // 太空背景：深黑色與星光
  background(10, 10, 25);
  noStroke();
  fill(255);
  for (let star of stars) {
    ellipse(star.x, star.y, star.size);
  }

  // 在影像上方顯示文字（寫在 push/pop 之外，避免文字被左右顛倒）
  fill(255); // 改為白色在太空背景下較清晰
  textSize(32); // 設定文字大小
  textAlign(CENTER, CENTER); // 設定文字對齊方式為置中
  text('教科414730399', width / 2, height * 0.15); // 將文字繪製在畫布上方 (約 15% 高度處)

  push(); // 儲存目前的畫布座標狀態
  translate(width, 0); // 將座標原點移至畫布右側
  scale(-1, 1); // 水平翻轉影像（左右顛倒），垂直不變

  // 繪製 facemesh 特徵點
  if (predictions.length > 0 && capture.width > 0) {
    let keypoints = predictions[0].keypoints;
    
    // 1. 臉部最外圍輪廓編號 (Face Silhouette)
    let faceSilhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
    // 2. 黑眼圈 (247與467所在的外圈)
    let darkCircles = [
      [130, 247, 30, 29, 28, 27, 26, 25, 24, 23, 22, 110, 243, 112, 113, 124, 226], // 右眼外
      [359, 467, 260, 259, 258, 257, 256, 255, 254, 253, 252, 463, 341, 446, 353, 466]  // 左眼外
    ];
    
    // 3. 一般細線輪廓 (嘴唇與內眼圈)
    let thinContours = [
      [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
      [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184],
      [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7], // 右眼內
      [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]  // 左眼內
    ];

    // --- 遮罩處理：讓影像只出現在臉部範圍內 ---
    drawingContext.save();
    beginShape();
    for (let index of faceSilhouette) {
      let pt = keypoints[index];
      let px = map(pt.x, 0, capture.width, width / 2 - width * 0.25, width / 2 + width * 0.25);
      let py = map(pt.y, 0, capture.height, height / 2 - height * 0.25, height / 2 + height * 0.25);
      vertex(px, py);
    }
    endShape(CLOSE);
    drawingContext.clip(); // 開啟遮罩
    image(capture, width / 2, height / 2, width * 0.5, height * 0.5);
    drawingContext.restore(); // 關閉遮罩，恢復後續繪製

    // --- 繪製線條 ---
    
    // A. 繪製黑眼圈 (深灰色, 粗細 15)
    stroke(50); 
    strokeWeight(15);
    noFill();
    for (let indices of darkCircles) {
      drawContour(indices, keypoints);
    }

    // B. 繪製嘴唇與內眼圈 (紅色, 粗細 1)
    stroke(255, 0, 0);
    strokeWeight(1);
    for (let indices of thinContours) {
      drawContour(indices, keypoints);
    }

    // C. 繪製臉部最外圈輪廓 (螢光藍, 粗細 2)
    stroke(0, 255, 255); 
    strokeWeight(2);
    drawContour(faceSilhouette, keypoints);

  } else {
    // 如果沒偵測到臉，不繪製影像，只留下星空
  }
  pop(); // 恢復畫布座標狀態
}

// 輔助函式：根據點序號陣列繪製連接線
function drawContour(indices, keypoints) {
  for (let i = 0; i < indices.length; i++) {
    let pt1 = keypoints[indices[i]];
    let pt2 = keypoints[indices[(i + 1) % indices.length]]; 

    let x1 = map(pt1.x, 0, capture.width, width / 2 - width * 0.25, width / 2 + width * 0.25);
    let y1 = map(pt1.y, 0, capture.height, height / 2 - height * 0.25, height / 2 + height * 0.25);
    let x2 = map(pt2.x, 0, capture.width, width / 2 - width * 0.25, width / 2 + width * 0.25);
    let y2 = map(pt2.y, 0, capture.height, height / 2 - height * 0.25, height / 2 + height * 0.25);
    
    line(x1, y1, x2, y2);
  }
}