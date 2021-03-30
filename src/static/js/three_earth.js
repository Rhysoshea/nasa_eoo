console.clear();
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';

var container = document.getElementById('container');
var renderer, scene, camera, distance, raycaster, projector;
distance = 400;


// const settings = {
//     animate: true,
//     context: "webgl",
//     scaleToView: true
//   };
  

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;



function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(devicePixelRatio);

    document.body.appendChild( renderer.domElement );

    container.appendChild(renderer.domElement);


    scene = new THREE.Scene();

    const texture = new THREE.TextureLoader().load("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/earth.jpg");
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const earth = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), material)
    earth.position.set(0, 0, 0); 

    scene.add( earth );

    const pivotPoint = new THREE.Object3D();
    pivotPoint.position.set(0,0,0);
    earth.add(pivotPoint);


    const satellite = new THREE.Sprite();
    satellite.scale.set(0.1, 0.1, 0.1);

    satellite.position.set(1,0,1);

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
    const controls = new OrbitControls( camera, renderer.domElement);



    function animate(now) {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      render();
    }

    function render(){
      // earth.rotation.x += 0.0001;
      earth.rotation.y += 0.0005;

      pivotPoint.rotation.y += 0.005;

      controls.update();
    }

    animate(0);
}

init()