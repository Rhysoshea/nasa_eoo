import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject } from 'https://threejs.org/examples/jsm/renderers/CSS2DRenderer.js';

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var container, renderer, labelRenderer, scene, camera, parameters;
var satName = 'Sat';

// temporary measure to allow table to update after button click
// while event listener is not working on table contents
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function pollDOM() {
  const satNameElement = document.querySelector("#infoTable > tr:nth-child(1) > td:nth-child(2)");

  if (satNameElement != null) {

    container = document.getElementById('container');
    init();

  } else {
    setTimeout(pollDOM, 300); // try again in 300 milliseconds
  }
}









function init() {
    console.clear();
    const button = document.querySelector("#sat_list_div > form > div > input[type=submit]")
    button.addEventListener("click", updateVal);

    // const cell = document.querySelector("body > table");
    // cell.addEventListener("change", updateVal);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(devicePixelRatio);
    document.body.appendChild( renderer.domElement );


    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);

    container.appendChild(renderer.domElement);


    scene = new THREE.Scene();

    const textureEarth = new THREE.TextureLoader().load("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/earth.jpg");
    const materialEarth = new THREE.MeshBasicMaterial( { map: textureEarth } );
    const earth = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), materialEarth)
    earth.position.set(0, 0, 0); 

    scene.add( earth );

    const pivotPoint = new THREE.Object3D();
    pivotPoint.position.set(0,0,0);
    earth.add(pivotPoint);

    const textureSat = new THREE.TextureLoader().load("https://raw.githubusercontent.com/Rhysoshea/nasa_eoo/master/assets/sat_sprite.png");
    const materialSat = new THREE.SpriteMaterial( { map: textureSat, alphaTest:0.5 } );
    const satellite = new THREE.Sprite(materialSat);
    satellite.scale.set(0.3, 0.3, 0.3);
    satellite.position.set(1,0,1);

    const satelliteDiv = document.createElement( 'div' );
    satelliteDiv.className = 'label';
    satelliteDiv.textContent = satName;
    satelliteDiv.style.marginTop = '-2em';

    const satelliteLabel = new CSS2DObject( satelliteDiv );
    satelliteLabel.position.set(0, 0.1, 0);
    satellite.add(satelliteLabel);

    pivotPoint.add(satellite);
    // scene.add(satellite);

    // camera
    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000 );
    camera.position.z = 3;

    //first point light
    var light = new THREE.PointLight(0xffffff, 1, 4000);
    light.position.set(100, 200, 300);
    light.lookAt( new THREE.Vector3( 100, 0, 0 ) );
    scene.add( light );

    var lightAmbient = new THREE.AmbientLight(0xffffff);
    // scene.add( lightAmbient);

    renderer.shadowMap.enabled = true;

    // add orbit controls
    const controls = new OrbitControls( camera, labelRenderer.domElement);


    function animate(now) {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      render();
    }

    function render(){

     // earth.rotation.x += 0.0001;
      earth.rotation.y += 0.0005;
      pivotPoint.rotation.y += 0.005;
      controls.update();
    }

    function updateVal(){
      satelliteDiv.textContent = document.querySelector("#infoTable > tr:nth-child(1) > td:nth-child(2)").innerText;
      // satelliteDiv.textContent = document.querySelector("#infoTable > tr:nth-child(1) > td:nth-child(2)").innerText;
      // satelliteDiv.textContent = document.querySelector("#infoTable > tr:nth-child(1) > td:nth-child(2)").innerText;
      // satelliteDiv.textContent = document.querySelector("#infoTable > tr:nth-child(1) > td:nth-child(2)").innerText;

    }

    animate(0);
}


pollDOM();