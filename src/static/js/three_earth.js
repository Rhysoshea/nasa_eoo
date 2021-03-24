console.clear();
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

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
    const earthMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), material)
    earthMesh.position.set(0, 0, 0); 

    scene.add( earthMesh );

    // camera
    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000 );
    // camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.2, 25000 );
    // camera.position.set(100, -400, 2000);
    // scene.add(camera);
    camera.position.z = 3;

    //first point light
    var light = new THREE.PointLight(0xffffff, 1, 4000);
    light.position.set(100, 200, 300);
    light.lookAt( new THREE.Vector3( 100, 0, 0 ) );
    // scene.add( light );

    var lightAmbient = new THREE.AmbientLight(0xffffff);
    // scene.add( lightAmbient);


 


    function animate(now) {
      requestAnimationFrame(animate);

      earthMesh.rotation.x += 0.0001;
      earthMesh.rotation.y += 0.0005;

      render();
    }

    function render(){
      renderer.render(scene, camera);

    }

    animate(0);
}

init()