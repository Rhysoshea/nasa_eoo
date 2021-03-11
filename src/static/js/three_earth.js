
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';


const settings = {
    animate: true,
    context: "webgl",
    scaleToView: true
  };
  

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

function startup() {

    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const map = await loadTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/earth.jpg");
    scene.add(new THREE.Mesh(new THREE.SphereBufferGeometry(1, 32, 32), new THREE.MeshBasicMaterial({map})));
   
    // camera

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 1000, 50, 1500 );

    // lights

    scene.add( new THREE.AmbientLight( 0x666666 ) );
    
    const light = new THREE.DirectionalLight( 0xdfebff, 1 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const d = 300;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 1000;

    scene.add( light );
}