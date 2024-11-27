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
    axes: true, // 座標軸
    prediction: 1, // 予想する車（1〜4）
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");
  gui.add(param, "prediction", { Red: 1, Blue: 2, Green: 3, Gold: 4 }).name("1位の予想");


  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(10,15,20);
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
  const carColors = ["赤", "青", "緑", "金",];
  const carGeometry = new THREE.BoxGeometry(2, 1, 1); // 車の形状
  const carMaterials = [
    new THREE.MeshBasicMaterial({ color: "red" }),
    new THREE.MeshBasicMaterial({ color: "blue" }),
    new THREE.MeshBasicMaterial({ color: "green" }),
    new THREE.MeshPhysicalMaterial({
      color: 0xffaa00,
      metalness: 1.0,             
      roughness: 0.3,             
      clearcoat: 1.0,            
      clearcoatRoughness: 0.1,  
    })
  ];
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3); // 弱めの環境光
  scene.add(ambientLight);

  const cars = [];
  for (let i = 0; i < 4; i++) {
    const car = new THREE.Mesh(carGeometry, carMaterials[i]);
    car.position.set(-10, 0.5, i * 3 - 4); // 車の初期位置
    cars.push(car);
    scene.add(car);
  }

  // ゴールライン
  const goalLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(10, 0, -6),
      new THREE.Vector3(10, 0, 6),
    ]),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  scene.add(goalLine);

  //平面の設定
  const planeGeometry = new THREE.PlaneGeometry(20, 15);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x303030});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow=true;
  scene.add(plane);

  //光源の設定
  const spotLight = new THREE.SpotLight(0xffffff, 500);
  spotLight.position.set(0, 10, 0);
  spotLight.castShadow=true;
  scene.add(spotLight);

  const numberOfLights = 30;  // 光源の数
  const lightIntensity = 30; // 光源の強さ

  for (let i = 0; i < numberOfLights; i++) {
    const pointLight = new THREE.PointLight(0xffffff, lightIntensity);
    pointLight.position.set(-15 + i, 2, 5); // x座標を-5からスタートし、iを足していく
    scene.add(pointLight);
  }


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
        car.position.x += Math.random() * 0.1; // ランダムな速度
        if (car.position.x >= 10 && !winners.includes(carColors[index])) {
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