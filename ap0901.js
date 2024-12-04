//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G284442022  河口歩夢
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import{OrbitControls}from 'three/addons';
import { GUI } from "ili-gui";

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    axes: false, // 座標軸
    prediction: 1, // 予想する車（1〜4）
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");
  gui.add(param, "prediction", { Red: 1, Blue: 2, Green: 3, Black: 4 }).name("1位の予想");


  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(55,20,15);
  camera.lookAt(0,0,0);

  // ゲーム状態管理
  let raceStarted = false;
  let raceFinished = false;
  let winners = [];

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
    document.getElementById("output").appendChild(renderer.domElement);
    renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor(0x204060);
  renderer.shadowMap.enabled=true;

   // カメラ制御
   const orbitControls
   =new OrbitControls(camera, renderer.domElement);
   orbitControls.listenToKeyEvents( window );
   orbitControls.enableDamping=true;


  // レース用の車 (Mesh)
  // 車の作成（修正版）
const createCar = (color) => {
  // 素材の設定
  const bodyMaterial = new THREE.MeshPhongMaterial({ color });
  const tyreMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

  // 車のサイズ
  const carW = 3.6;
  const carL = 8;
  const carH = 1.5;
  const LoofH = 1;

  // 座標点
  const v = [
      new THREE.Vector3(carW / 2, 0, carL / 8),  // 0
      new THREE.Vector3(carW / 2, 0, -carL / 2), // 1
      new THREE.Vector3(carW / 2, LoofH, 0),     // 2
      new THREE.Vector3(carW / 2, LoofH, -carL / 4), // 3 
      new THREE.Vector3(-carW / 2, 0, carL / 8), // 4
      new THREE.Vector3(-carW / 2, 0, -carL / 2), // 5
      new THREE.Vector3(-carW / 2, LoofH, 0),    // 6
      new THREE.Vector3(-carW / 2, LoofH, -carL / 4), // 7
  ];

  // 車の作成
  const car = new THREE.Group();
  let mesh;

  // ボディの作成
  mesh = new THREE.Mesh(new THREE.BoxGeometry(carW, carH, carL), bodyMaterial);
  mesh.position.y = -0.75;
  car.add(mesh);

  // 屋根の作成
  mesh = new THREE.Mesh(new THREE.BoxGeometry(carW,carH*1.5,carL/2),bodyMaterial);
  mesh.position.z=-1.5;
  car.add(mesh);


  // タイヤの作成
  const tyreR = 0.8;
  const tyreW = 0.5;

  for (let z of [3 / 8 * carL, 3 / 8 * -carL]) {
      for (let x of [carW / 2, -carW / 2]) {
          mesh = new THREE.Mesh(
              new THREE.CylinderGeometry(tyreR, tyreR, tyreW, 16, 1),
              tyreMaterial
          );
          mesh.rotation.z = Math.PI / 2;
          mesh.position.set(x, -carH, z);
          car.add(mesh);
      }
  }

  // 高さの調整
  car.position.y = carH + tyreR;

  return car;
};

// レース用の車を生成
const carColors = ["red", "blue", "green", "black"];
const cars = [];
for (let i = 0; i < 4; i++) {
  const car = createCar(carColors[i]);
  car.position.set(-15, 2.5, i * 5 -7.5); // 車の初期位置
  car.rotation.y = 0.5 * Math.PI;
  cars.push(car);
  scene.add(car);
}

  // ゴールライン
  const goalLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(22, 0, -12),
      new THREE.Vector3(22, 0, 12),
    ]),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  scene.add(goalLine);

  //平面の設定
  const planeGeometry = new THREE.PlaneGeometry(60, 30);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x303030});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow=true;
  scene.add(plane);

  //光源の設定
  const spotLight = new THREE.SpotLight(0xffffff, 5000);
  spotLight.position.set(-35, 20, 0);
  scene.add(spotLight);
  const spotLight2 = new THREE.SpotLight(0xffffff, 5000);
  spotLight2.position.set(35, 20, 0);
  scene.add(spotLight2);


  // スタートボタンを作成
  const startButton = document.createElement("button");
  startButton.innerText = "Start Race";
  startButton.style.position = "absolute";
  startButton.style.top = "70px";
  startButton.style.left = "20px";
  startButton.style.padding = "10px";
  startButton.style.backgroundColor = "#28a745";
  startButton.style.color = "white";
  startButton.style.border = "none";
  startButton.style.cursor = "pointer";
  startButton.style.fontSize = "16px";
  document.body.appendChild(startButton);

   // スタートボタンのクリックイベント
   startButton.addEventListener("click", () => {
    if (!raceStarted) {
      raceStarted = true;
      startButton.style.display = "none"; // ボタンを非表示にする
    }
  });

  // 結果メッセージ用の要素を取得
  const resultMessage = document.getElementById("result-message");
  
  // 描画処理

  // 描画関数
  function render() {
    if (raceStarted && !raceFinished) {
      // 車をランダムに進める
      cars.forEach((car, index) => {
        car.position.x += Math.random() * 0.2; // ランダムな速度
        if (car.position.x >= 20 && !winners.includes(carColors[index])) {
          winners.push(carColors[index]); // 色を格納
        }
      });

      // レース終了判定
      if (winners.length >= 4) {
        raceFinished = true;
        const winnerColor = winners[0]; // 勝者の色
        const message =
        winnerColor === carColors[param.prediction - 1]
        ? `当たり！1位は ${winnerColor}の車です！`
        : `ハズレ！1位は ${winnerColor}の車でした。`;


      // メッセージを画面に表示
      resultMessage.innerText = message;
      }
    }
    // カメラ位置の制御
    orbitControls.update();
    // 座標軸の表示
    axes.visible = param.axes;
    // 描画
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画開始
  render();
}

init();