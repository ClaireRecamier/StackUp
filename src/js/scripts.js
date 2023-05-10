import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import waterTexture from '../../static/images/waternormals.jpg';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import lensflareTexture0 from '../../static/images/lensflare0.png';
import lensflareTexture1 from '../../static/images/lensflare1.png';
// import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

var renderer, scene, camera, orbit, physWorld;
var sphereMesh, groundMesh;
var water, sky;
var meshList = new Array();
var boxPhysMat, groundPhysMat;
var sphereBody, groundBody;
var bodyList = new Array();
var dot;
var score;



initRenderer();
initScene();
initCamera();
//initSphereMesh();
initGroundMesh();
initPhysWorld();
//initSphereBody();
initGroundBody();
//addContact();
initDot();

renderer.setAnimationLoop(animate);


function initRenderer(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function initScene(){
    scene = new THREE.Scene();
    initLights();
    initWater();
    initSky();
}

function initCamera(){
    // camera = new THREE.PerspectiveCamera(
    //     45,
    //     window.innerWidth / window.innerHeight,
    //     0.1,
    //     1000
    // );
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    // Sets orbit control to move the camera around
    orbit = new OrbitControls(camera, renderer.domElement);

    // Camera positioning
    //camera.position.set(0, 20, 30);
    camera.position.set(0, 600, 1600);
    //rotating
    orbit.autoRotate = true;

    orbit.update();
}

function initLights()
{
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(0, 20, -200);
    scene.add(directionalLight);
    //add lensflare
    const textureLoader = new THREE.TextureLoader();
    const textureFlare0 = textureLoader.load(lensflareTexture0);
    const textureFlare1 = textureLoader.load(lensflareTexture1);
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textureFlare0, 600, 0, directionalLight.color));
    lensflare.addElement(new LensflareElement(textureFlare1, 60, .6));
    lensflare.addElement(new LensflareElement(textureFlare1, 70, .7));
    lensflare.addElement(new LensflareElement(textureFlare1, 120, .9));
    lensflare.addElement(new LensflareElement(textureFlare1, 70, 1));
    directionalLight.add(lensflare);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
}


function initWater()
{
    waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(waterTexture,  texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x0072ff,
    distortionScale: 4,
    fog: scene.fog !== undefined
    });
    water.rotation.x = - Math.PI / 2;
    scene.add(water);
}

function initSky()
{
    sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 20;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    // sun
    const sun = new THREE.Vector3();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const phi = THREE.MathUtils.degToRad(88);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    scene.environment = pmremGenerator.fromScene(sky).texture;
}

function initBoxMesh(){
    //box mesh
    const boxGeo = new THREE.BoxGeometry(80, 80, 80);
    // const boxMat = new THREE.MeshBasicMaterial({
    //     color: 0x00ff00,
    //     wireframe: true
    // });
    // const boxMat = new THREE.MeshLambertMaterial({
    //     side: THREE.DoubleSide,
    //     color: 0xFFFFFF*Math.random(),
    //     reflectivity: 0.5
    //   });
    const boxMat = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF*Math.random()
    });
    var boxMesh = new THREE.Mesh(boxGeo, boxMat);
    scene.add(boxMesh);
    meshList.push(boxMesh);
    boxMesh.position.copy(startPos);
    return boxMesh;
}

function initSphereMesh(){
    //sphere mesh
    const sphereGeo = new THREE.SphereGeometry(2);
    const sphereMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });
    sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);
}

// lena for the point under box
// function initDropDot(){
//     //box mesh
//     const boxGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
//     const boxMat = new THREE.MeshBasicMaterial({
//         color: 0xff0000,
//         wireframe: false
//     });
//     pointMesh = new THREE.Mesh(boxGeo, boxMat);
//     scene.add(pointMesh);
// }

// function dropSpot(){
//     var ray = new THREE.Raycaster(meshList[meshList.length - 1].position, new THREE.Vector3(0,-1,0));
//     var rayIntersects = ray.intersectObjects(scene.children, true);
//     console.log(rayIntersects);
//     if (rayIntersects[0]) {
//         const intersect = rayIntersects[0].point;
//         intersect.sub(new THREE.Vector3(0, 0.05, 0));
//         pointMesh.position.copy(intersect);
//     }
// }
// lena end

function initPhysWorld(){
    //physics world
    physWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -98.1, 0)
    });
    // define Sleep parameters - taken from https://github.com/pmndrs/cannon-es/blob/master/examples/sleep.html
    physWorld.allowSleep = true;
}

function initGroundMesh(){
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        wireframe: true
    })
    groundMesh = new THREE.Mesh(groundGeo, groundMat);
    scene.add(groundMesh);
}

function initGroundBody(){
    groundPhysMat = new CANNON.Material();

    groundBody = new CANNON.Body({
        shape: new CANNON.Plane(),
        //mass: 2,
        type: CANNON.Body.STATIC,
        material: groundPhysMat
    });
    physWorld.addBody(groundBody);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
}


function initBoxBody(worldVector){
    boxPhysMat = new CANNON.Material();

    //add box to physics world
    var boxBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(40, 40, 40)),
        position: new CANNON.Vec3(worldVector.x, worldVector.y, worldVector.z),
        material: boxPhysMat
    });
    physWorld.addBody(boxBody);

    boxBody.angularVelocity.set(1, 1, 1);
    boxBody.angularDamping = 0.2;

    // Sleep parameters
    //taken from https://github.com/pmndrs/cannon-es/blob/master/examples/sleep.html
    boxBody.allowSleep = true;
    boxBody.sleepSpeedLimit = 0.5 // Body will feel sleepy if speed<1 (speed == norm of velocity)
    boxBody.sleepTimeLimit = 0.1 // Body falls asleep after x sec of sleepiness

    bodyList.push(boxBody);
}

function addContact(){
    const groundBoxContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        boxPhysMat,
        {friction: 0.05}  //the contact should be slippery
    );

    physWorld.addContactMaterial(groundBoxContactMat);
}

function initSphereBody(){
    sphereBody = new CANNON.Body({
        mass: 10,
        shape: new CANNON.Sphere(2),
        position: new CANNON.Vec3(0, 15, 0)
    });
    physWorld.addBody(sphereBody);

    sphereBody.linearDamping = 0.31; //friction
}

//animate
function animate() {
    const timeStep = 1 / 60;
    water.material.uniforms['time'].value += 1.0 / 60.0;
    physWorld.step(timeStep);
    //update the plane
    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion);
    //update the box
    for (var i = 0; i< bodyList.length; i++)
    {
        var boxMesh = meshList[i];
        var boxBody = bodyList[i];

        boxMesh.position.copy(boxBody.position);
        boxMesh.quaternion.copy(boxBody.quaternion);
    }
    // //update the sphere
    // sphereMesh.position.copy(sphereBody.position);
    // sphereMesh.quaternion.copy(sphereBody.quaternion);

    // // LENA hide the dot behind camera
    // if (meshList.length == bodyList.length) {
    //     var pos = new THREE.Vector3(0,0,0);
    //     pos.copy(camera.position);
    //     // pointMesh.position.copy(pos.multiplyScalar(1.2));
    // }
    // // show dot in drop spot
    // // else {
    // //     dropSpot();
    // // }


    orbit.update();
    updateDot();
    updateScore();
    renderer.render(scene, camera);
}


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// CODE BELOW REPLACES THIS
// const mouse = new THREE.Vector2();
// const intersectionPoint = new THREE.Vector3();
// const planeNormal = new THREE.Vector3();
// const plane = new THREE.Plane();
// const raycaster = new THREE.Raycaster();
//
// window.addEventListener("click", function (e) {
//     mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
//     planeNormal.copy(camera.position).normalize();
//     plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
//     raycaster.setFromCamera(mouse, camera);
//     raycaster.ray.intersectPlane(plane, intersectionPoint);
//     initBoxMesh(intersectionPoint);
//     initBoxBody(intersectionPoint);
//   });

// LENAS CODE FOR KEYBOARD CONTROLS
//taken from https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
var open = true;
const startPos = new THREE.Vector3(0,700,0);

window.addEventListener("keydown", function (e) {
    // console.log(e.keyCode);
    // create mesh
    if (e.keyCode === 32 && open == true){
        // console.log("new");
        initBoxMesh(startPos);
        open = false;
        dot.visible = true;
    }
    // drop
    else if (e.keyCode === 32 && open == false){
        // console.log("drop")
        initBoxBody(meshList[meshList.length - 1].position);
        open = true;
        dot.visible = false;
    }

    // left
    else if (e.keyCode === 37 && open == false){
        meshList[meshList.length - 1].position.x -= 50;
    }
    // right
    else if (e.keyCode === 39 && open == false){
        meshList[meshList.length - 1].position.x += 50;
    }
    // forward
    else if (e.keyCode === 38 && open == false){
        meshList[meshList.length - 1].position.z -= 50;
    }
    // backward
    else if (e.keyCode === 40 && open == false){
        meshList[meshList.length - 1].position.z += 50;
    }

  });


//ClLAIRE's CODE
function initDot(){
  //taken from https://stackoverflow.com/questions/26297544/three-js-how-to-render-a-simple-white-dot-point-pixel
  //create red dot at origin of world coords and add to scene
  var dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array([0,0,0]), 3 ) );
  var dotMaterial = new THREE.PointsMaterial( { size: 20.0, color: 'red' } );
  dot = new THREE.Points( dotGeometry, dotMaterial );
  scene.add( dot );
  //initialize dot to be invisible upon creation
  dot.visible = false;
}

function updateDot() {
  //only update dot if a body exists
  if (meshList.length >= 1){
    //get current box from last items in array
    currBoxMesh = meshList.slice(-1);
    currBoxBody = bodyList.slice(-1);
    currPosition = currBoxBody.position;
    //create ray from bottom of box straight down.
    //raycaster code taken from https://threejs.org/docs/#api/en/core/Raycaster.intersectObject
    var ray = new THREE.Raycaster(meshList[meshList.length - 1].position, new THREE.Vector3(0,-1,0));
    // get all ray intersections
    var intersections = ray.intersectObjects(scene.children,false);
    //if an intersection exists
    if (intersections[0]) {
      //if that intersection is with an object of the scene, not the dot
      if (intersections[0].object.geometry.type != 'BufferGeometry'){
        //update dot position to closest intersection of ray with scene object
        var closest_intersect = intersections[0].point;
        dot.position.x = closest_intersect.x;
        dot.position.y = closest_intersect.y;
        dot.position.z = closest_intersect.z;
        //make sure dot is visible
        // dot.visible = true;
      }
      //if the intersection is with the dot, check next closest intersection
      else if (intersections[1]){
        //update dot position to closest intersection of ray with scene object
        var closest_intersect = intersections[1].point;
        dot.position.x = closest_intersect.x;
        dot.position.y = closest_intersect.y;
        dot.position.z = closest_intersect.z;
      }
    }
  }
}

//
//
// function initScore(){
  //load desired font

  //text can't be made 3d bc as camera view changes its position will also change.
  // const loader = new FontLoader();
  // loader.load('fonts/helvetiker_regular.typeface.json', function ( font ) {
  // const text_geometry = new TextGeometry( 'Score: 0', {
  // 		font: font,
  // 		size: 80,
  // 		height: 5,
  // 		curveSegments: 12,
  // 		bevelEnabled: true,
  // 		bevelThickness: 10,
  // 		bevelSize: 8,
  // 		bevelOffset: 0,
  // 		bevelSegments: 5
  // 	} );
  // } );
  // const text_material = new THREE.MeshLambertMaterial({color: 0x686868});
  // var text_mesh = new THREE.Mesh( text_geometry, text_material );
  // scene.add(text_mesh);
  // text_mesh.position.x =
  // text_mesh.position.y =
  // text_mesh.position.z =


// }
//
function updateScore(){
  //if a body exists
  if (bodyList.length >= 1){
    //get most recently used body
    var body = bodyList.slice(-1)[0];
    //if most recently used body has settled and another new object hasn't been created
    if (body.sleepState == 2 && open == true) {
      var score_obj = document.getElementById('score');
      // var prevScore = parseInt(score_obj.innerText.slice(7));
      var newScore = 0;

      // traverse all objects in meshList
      for (var i = 0; i< meshList.length; i++){
        //get list of vertices for current boxmesh
        var vertices = meshList[i].geometry.getAttribute('position');
        var vertex = new THREE.Vector3();
        //get y value of each of the 24 vertex in current boxmesh
        for (var j = 0; j < 24; j++){
          vertex.fromBufferAttribute(vertices, j );
          var height = meshList[i].localToWorld(vertex).getComponent(1);
          newScore = Math.max(height,newScore);
        }
      }
      //update score based on winning threshold
      if (newScore >= 230) {
        score_obj.innerHTML = 'You Win!';
      }
      else{
        score_obj.innerHTML = 'Score : ' + Math.round(newScore);
      }


    }
    // if (bodyList.slice(-1)){
    //   var score_obj = document.getElementById('score');
    //   var prevScore = parseInt(score_obj.innerText.slice(7));
    //   var newScore = 0;
    //   // traverse all objects in meshList
    //   // traverse all objects positions first and retain 5 highest
    //
    //   for (var i = 0; i< meshList.length; i++){
    //     //get list of vertices for current boxmesh
    //     var vertices = meshList[i].geometry.getAttribute('position');
    //     //get y value of each vertex in current boxmesh
    //     for (var j = 0; j < vertices.count/8; j++){
    //       var height = vertices.getY(j);
    //       newScore = Math.max(height,newScore);
    //     }
    //   }
    //
    //   score_obj.innerHTML = '<h1 style="text-align:right;color:green;"> Score: '+ newScore +' </h1>';
    // }
  }
}
