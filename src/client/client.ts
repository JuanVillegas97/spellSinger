import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Player } from './classes/Player'
// import { DragonPatron } from './classes/DragonPatron'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import getThreeApp, { scene } from "./classes/App"
// import { Mutant } from './classes/Mutant'
// @ts-ignore
import Nebula, { SpriteRenderer } from 'three-nebula'
// @ts-ignore
import json from "./particles/blue.json"
// @ts-ignore
import { Water } from "./utils/Water2.js"

import { body } from './classes/Model'
// Scene, camera, renderer, world
const app = getThreeApp()

// Cannon debugger
const cannonDebugRenderer = new CannonDebugRenderer(app.scene, app.world)

//Loading textures
const textureLoader = new THREE.TextureLoader()

//GLTF Loader
const loader = new GLTFLoader()

let player : Player  
// let dragon : DragonPatron
// let mutant : Mutant
let skyboxMesh : THREE.Mesh
let nebula : any
const leavesMaterial : THREE.ShaderMaterial = shaderLeaves() //leaves




const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(2,8,1),
    new THREE.MeshPhongMaterial({color:0Xff0000})
)
cube2.position.set(0,0,10)
let cube2BB = new THREE.Box3(new THREE.Vector3(),new THREE.Vector3())
cube2BB.setFromObject(cube2)
app.scene.add(cube2)


// initLeaves()
initPlane() 
initPlayer()
initLight() 

//  initMutant()
// initDragon() 
initSky()

// function checkCollision(){
//     if(cube2BB.intersectsBox(cube1BB)||cube2BB.containsBox(cube1BB)){
//         console.log('INTERSECTS')
//     }
// }

let removeBody:any;
let bodi: any
let meshi: any
const clock = new THREE.Clock()
function animate() : void {
    if(removeBody==1){
        meshi.visible=false
        app.world.removeBody(bodi)
    }
    const delta = clock.getDelta()


    // checkCollision()

	leavesMaterial.uniforms.time.value = clock.getElapsedTime()
    leavesMaterial.uniformsNeedUpdate = true
    nebula ? nebula.update() : null
    // dragon ? dragon.update(delta, player.getModel().position,player.getModel().rotation) : null
    // mutant ?  mutant.update(delta,app.scene,app.camera,player.getModel()) : null
    

    skyboxMesh ? skyboxMesh.position.copy( app.camera.position ):null

    if(player){
        console.log(player.checkCollision(cube2BB,player.getSkeleton()))
        player.update(delta,keysPressed,mouseButtonsPressed) 
        app.camera.position.x = player.getModel().position.x
        app.camera.lookAt(player.getModel().position)

        for (let index = 0; index < player.ballMeshes.length; index++) {
            
            let body = player.balls[index]
            let mesh = player.ballMeshes[index]
            body.addEventListener("collide",(e:any)=>{
                removeBody = 1
                bodi=body
                meshi=mesh
                player.ballMeshes.splice(index,1)
                player.balls.splice(index,1)
                // setTimeout(() => { //! CHECK THIS
                //     player.particles.emitters.forEach((a:any) => {
                //         a.dead=true
                //     })
                // }, 1000)  
            })
            app.world.addBody(body)
            app.scene.add(mesh)
        }

    }

    app.world.step(Math.min(delta, 0.1))
    // cannonDebugRenderer.update()
    app.renderer.render(app.scene, app.camera)
    requestAnimationFrame(animate)
}
animate()
    
//Things forgotten by the hand of god
// Player
function initPlayer() : void {
    loader.load('/models/warlock.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })

        const shape = new THREE.Mesh(new THREE.BoxGeometry(2,8,1),new THREE.MeshPhongMaterial({color:0Xff0000}))
        shape.visible=true
        const skeleton = new THREE.Box3(new THREE.Vector3(),new THREE.Vector3())
        skeleton.setFromObject(shape)

        app.scene.add(shape)
        
        const body : body = {shape: shape, skeleton: skeleton}

        model.name = 'Warlock'
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        Nebula.fromJSONAsync(json, THREE).then((particle:any) => {
            const nebulaRenderer = new SpriteRenderer(app.scene, THREE)
            player = new Player(model,mixer,animationMap,'idle',particle,body)//!HERE
            nebula = particle.addRenderer(nebulaRenderer);
        })
        
    })
}


// Mutant
// function initMutant():void {
//     loader.load('/models/mutant.glb',function (gltf) {
//         const model = gltf.scene
//         const gltfAnimations: THREE.AnimationClip[] = gltf.animations
//         const mixer = new THREE.AnimationMixer(model)
//         const animationMap: Map<string, THREE.AnimationAction> = new Map()
//         gltfAnimations.forEach((a:THREE.AnimationClip)=>{
//             animationMap.set(a.name,mixer.clipAction(a))
//         })
//         const shape =  new CANNON.Cylinder(2, 2, 9, 12)
//         const body = new CANNON.Body({ mass: 1, shape: shape})
//         body.position.y = 5
//         body.position.x = 15
//         model.name = 'Mutant'
//         model.position.y= 0
//         model.position.x= 15
//         model.rotateY(-1)
//         model.scale.set(4,4,4)
//         model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
//         app.scene.add(model)
//         app.world.addBody(body)
//         mutant = new Mutant(model,mixer,animationMap,'idle')
//     }
//     )
// }
// Skybox
function initSky() : void {
    const ft = new THREE.TextureLoader().load("/skybox/bluecloud_ft.jpg");
    const bk = new THREE.TextureLoader().load("/skybox/bluecloud_bk.jpg");
    const up = new THREE.TextureLoader().load("/skybox/bluecloud_up.jpg");
    const dn = new THREE.TextureLoader().load("/skybox/bluecloud_dn.jpg");
    const rt = new THREE.TextureLoader().load("/skybox/bluecloud_rt.jpg");
    const lf = new THREE.TextureLoader().load("/skybox/bluecloud_lf.jpg")
    const skyboxGeo = new THREE.BoxGeometry(2000,2000,2000);
    const skyboxMaterials =[
    new THREE.MeshBasicMaterial( { map: ft, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: bk, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: up, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: dn, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: rt, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: lf, side: THREE.BackSide } ),]

    skyboxMesh = new THREE.Mesh( skyboxGeo, skyboxMaterials );
    app.scene.add(skyboxMesh);
}
// Plane
function initPlane() : void {
    const dummy = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry( 0.1, 1, 1, 4 );
    geometry.translate( 0, 0.5, 0 ); 
    const instancedMesh = new THREE.InstancedMesh( geometry, leavesMaterial, 5000 );
    app.scene.add( instancedMesh );
    for ( let i=0 ; i<5000 ; i++ ) {
        dummy.position.set(
        ( Math.random() - 0.5 ) * 10,
        0,
        ( Math.random() - 0.5 ) * 10
    );

    dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    instancedMesh.setMatrixAt( i, dummy.matrix );
    }

    const soilBaseColor = textureLoader.load("./textures/soil/Rock_Moss_001_basecolor.jpg");
    const soilNormalMap = textureLoader.load("./textures/soil/Rock_Moss_001_normal.jpg");
    const soilHeightMap = textureLoader.load("./textures/soil/Rock_Moss_001_height.png");
    const soilRoughness = textureLoader.load("./textures/soil/Rock_Moss_001_roughness.jpg");
    const soilAmbientOcclusion = textureLoader.load("./textures/soil/Rock_Moss_001_ambientOcclusion.jpg");

    const geometrySoil = new THREE.PlaneGeometry(100, 50,200,200)
    const planeSoil = new THREE.Mesh(geometrySoil, new THREE.MeshStandardMaterial({
        map: soilBaseColor,
        normalMap: soilNormalMap,
        displacementMap: soilHeightMap, displacementScale: 2,
        roughnessMap: soilRoughness, roughness: 0,
        aoMap: soilAmbientOcclusion,

        // opacity: 1,
        // transparent:true
    }));

    planeSoil.rotateX(-Math.PI / 2) 
    planeSoil.receiveShadow = true;
    planeSoil.receiveShadow = true
    planeSoil.position.y = -1
    app.scene.add(planeSoil)
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0, shape: planeShape})

    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    app.world.addBody(planeBody)
    // loader.load('/models/village/BlackSmithShop.glb',function (gltf) {
    //     const model = gltf.scene
    //     model.position.set(0,3,-20)

    //     model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
    //     app.scene.add(model)
    // })

    

    loader.load('/models/village/Gate_Level1_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(0,7.6,-30)
        model.rotateY(1.55)
        model.scale.y=.7
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    
    let wallsX:number = -25.5
    for (let i = 0; i < 2; i++) {
        loader.load('/models/village/Wall_Level1_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(80)
            model.scale.y=2

            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(wallsX,5,-30)
            app.scene.add(model)
            wallsX+=51.5;
        })
    }
    let towerX :number= -39.9
    for (let i = 0; i < 2; i++) {
        loader.load('/models/village/ArcherTower_Level1_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            // model.rotateY(80)
            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(towerX,8,-30)
            model.scale.y=2

            app.scene.add(model)
            towerX+=79.7
        })
    }
}

// Lights
function initLight() : void {
    app.scene.add(new THREE.AmbientLight(0xffffff, .5))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    app.scene.add(dirLight);
}

//Leaves

function shaderLeaves(){
    const simpleNoise = `
    float N (vec2 st) { // https://thebookofshaders.com/10/
        return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
    }
    float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=zXsWftRdsvU
    vec2 lv = fract( ip );
    vec2 id = floor( ip );
    lv = lv * lv * ( 3. - 2. * lv );
    float bl = N( id );
    float br = N( id + vec2( 1, 0 ));
    float b = mix( bl, br, lv.x );
    float tl = N( id + vec2( 0, 1 ));
    float tr = N( id + vec2( 1, 1 ));
    float t = mix( tl, tr, lv.x );
    return mix( b, t, lv.y );
    }`;
    const vertexShader = `
    varying vec2 vUv;
    uniform float time;
    ${simpleNoise}
    void main() {
    vUv = uv;
    float t = time * 2.;
    // VERTEX POSITION
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    #endif
    // DISPLACEMENT
    float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t));
    noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    float displacement = noise * ( 0.3 * dispPower );
    mvPosition.z -= displacement;
    //
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;
	}
`;
    const fragmentShader = `
    varying vec2 vUv;
    
    void main() {
        vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
        float clarity = ( vUv.y * 0.875 ) + 0.125;
        gl_FragColor = vec4( baseColor * clarity, 1 );
    }
`;
    const uniforms = {time: {value: 0}}
    return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
    });
}


// function initDragon() : void {
//     loader.load('/models/bigboie.glb',function (gltf) {
//         const model = gltf.scene
//         const gltfAnimations: THREE.AnimationClip[] = gltf.animations
//         const mixer = new THREE.AnimationMixer(model)
//         const animationMap: Map<string, THREE.AnimationAction> = new Map()
//         gltfAnimations.forEach((a:THREE.AnimationClip)=>{
//             animationMap.set(a.name,mixer.clipAction(a))
//         })
//         const shape =  new CANNON.Cylinder(1, 1, .5, 12)
//         const body = new CANNON.Body({ mass: 1, shape: shape})
//         model.name = 'DragonPatron'
//         model.position.y= -10
//         model.rotateY(1)
//         model.scale.set(4,4,4)
//         model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
//         app.scene.add(model)
//         dragon = new DragonPatron(model,mixer,animationMap,'Flying',body)
//        // dragon.matrix = gltf.scene.matrix;
//         }
//     )
// }


// Resize handler
function onWindowResize() : void {
    app.camera.aspect = window.innerWidth / window.innerHeight
    app.camera.updateProjectionMatrix()
    app.renderer.setSize(window.innerWidth, window.innerHeight)
    app.renderer.render(app.scene, app.camera)
}
window.addEventListener('resize', onWindowResize, false)

// Player controller
const keysPressed  = { }
window.addEventListener("keydown", (event) => {
    if(event.shiftKey && player){
        player.switchRunToggle()
    }else{
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
    event.preventDefault();
}, false)
document.addEventListener('keyup', (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false)


//Mouse listener
const mouseButtonsPressed ={ }
window.addEventListener('mousedown',(e)=>{
    let key = ''
    if(e.button.valueOf()==0) key='left';
    if(e.button.valueOf()==1) key='middle';
    if(e.button.valueOf()==2) key='right';
     (mouseButtonsPressed as any)[key] = true   
    e.preventDefault();
})
window.addEventListener('mouseup',(e)=>{
    let key = ''
    if(e.button.valueOf()==0) key='left';
    if(e.button.valueOf()==1) key='middle';
    if(e.button.valueOf()==2) key='right';
     (mouseButtonsPressed as any)[key] = false   
    e.preventDefault();
    
})

window.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    
})