// @ts-ignore
import Nebula, { SpriteRenderer } from 'three-nebula'
// @ts-ignore
import json from "./particles/blue.json"
// @ts-ignore
import { Water } from "./utils/Water2.js"
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {textureLoader, loader, fontLoader} from './utils/loaders'
import getThreeApp from "./classes/App"
import { Player } from './classes/Player'
import { Slime } from './classes/Slime'
import { body, Model } from './classes/Model'
// import { DragonPatron } from './classes/DragonPatron'


// Scene, camera, renderer, world
const app = getThreeApp()

const leavesMaterial : THREE.ShaderMaterial = shaderLeaves()

let dead       : boolean = false
let monster    : Model
let mushroom   : Model
let player     : Player  
let slimes     : Slime[] 
let skyboxMesh : THREE.Mesh
let nebula     : any
// let dragon : DragonPatron
// initDragon() 
initPlayer()
initLight() 
// initLevel_1() 
initLevel_2() 




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
    // dragon ? dragon.update(delta, player.getModel().position,player.getModel().rotation) : null
    if(monster)        monster.updateAnimations(delta,'idle');
    if(mushroom)        mushroom.updateAnimations(delta,'No.003');
    if(nebula)          nebula.update()       
    if(skyboxMesh)      skyboxMesh.position.copy( app.camera.position )
    if(slimes){
        slimes.forEach(slime => {
            if(player && slime){
                player.setCollading(player.checkCollision(slime.getSkeleton(),player.getSkeleton()))
                slime.update(delta,app.camera,player.getModel())
            }
        });
    }
    
    if(player){
        if(player.getLifeBar()<0){
            dead=true
        }else{
            dead=false
        }

        player.update(delta,keysPressed,mouseButtonsPressed,app.camera) 
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
                if(slimes){
                    slimes.forEach(slime => {
                        if(e.body.id==20){
                            setTimeout(() => { 
                            slime.setCollading(false) 
                            }, 100)  
                            if(player.getPlay()=='1H_attack'){
                                slime.setDamage(0.010)
                            }
                            if(player.getPlay()=='2H_attack'){
                                slime.setDamage(0.025)
                            }
                            if(player.getPlay()=='AOE'){
                                slime.setDamage(0.050)
                            }
                            slime.setCollading(true) 
                        }
                    })
                }
                
            })
            app.world.addBody(body)
            app.scene.add(mesh)
        }
    }
	leavesMaterial.uniforms.time.value = clock.getElapsedTime()
    leavesMaterial.uniformsNeedUpdate = true

    app.world.step(Math.min(delta, 0.1))
    app.renderer.render(app.scene, app.camera)
    requestAnimationFrame(animate)
}
animate()

//Things forgotten by the hand of god

function initPlayer() : void {
    loader.load('/models/characters/warlock.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        const shape = new THREE.Mesh(new THREE.BoxGeometry(2,8,1),new THREE.MeshPhongMaterial({color:0Xff0000}))
        const skeleton = new THREE.Box3(new THREE.Vector3(),new THREE.Vector3())
        const body : body = {shape: shape, skeleton: skeleton}
        gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        shape.visible=false
        skeleton.setFromObject(shape)
        model.name = 'Warlock'
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(shape)
        app.scene.add(model)
        Nebula.fromJSONAsync(json, THREE).then((particle:any) => {
            const nebulaRenderer = new SpriteRenderer(app.scene, THREE)
            player = new Player(model,mixer,animationMap,'idle',particle,body)
            nebula = particle.addRenderer(nebulaRenderer)
        })
    })
}

function initSlime(x:number,z:number,name:string):void {
    loader.load(name,function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Slime_IDLE').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        const shape = new THREE.Mesh(new THREE.BoxGeometry(3,5,1),new THREE.MeshPhongMaterial({color:0Xff0000}))
        const skeleton = new THREE.Box3(new THREE.Vector3(),new THREE.Vector3())
        const body : body = {shape: shape, skeleton: skeleton}
        const cannon =  new CANNON.Body({ mass: 25, shape: new CANNON.Cylinder(2, 2, 4, 12)})
        shape.visible=false//? CHECK THIS FOR LATER
        skeleton.setFromObject(shape)
        cannon.id=20
        model.name = 'slime'
        model.rotateY(-1)
        model.scale.set(4,4,4)
        cannon.position.set(x,4,z)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(shape)
        app.scene.add(model)
        app.world.addBody(cannon)
        slimes.push(new Slime(model,mixer,animationMap,'idle',body, cannon))
    })
}

function initLevel_2() : void {
       //!init enemies
    function circleXY(r:number, theta:number) {
        theta = (theta-90) * Math.PI/180;
        return {x: r*Math.cos(theta),y: -r*Math.sin(theta)}
    }

    slimes = new Array(2)
    for (let theta=0; theta<360; theta += 45) {
        const  answer = circleXY(40, theta)
        const x=answer.x
        const z=answer.y
        const ball = new THREE.Mesh(new THREE.SphereGeometry(.2), new THREE.MeshLambertMaterial({ color: 'white'}))
        initSlime(x,z,'/models/characters/slime.glb')
    }
    //!SKYBOX
    const ft = new THREE.TextureLoader().load("textures/skysnow/snowFRONT.jpg");
    const bk = new THREE.TextureLoader().load("textures/skysnow/snowBACK.jpg");
    const up = new THREE.TextureLoader().load("textures/skysnow/snowTOP.jpg");
    const dn = new THREE.TextureLoader().load("textures/skysnow/snowBOTTOM.jpg");
    const rt = new THREE.TextureLoader().load("textures/skysnow/snowRIGHT.jpg");
    const lf = new THREE.TextureLoader().load("textures/skysnow/snowLEFT.jpg")

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
    //!PLANE
    const soilBaseColor = textureLoader.load("./textures/snow/snow_02_diff_4k.jpg");
    const soilNormalMap = textureLoader.load("./textures/snow/snow_02_nor_gl_4k.jpg");
    const soilHeightMap = textureLoader.load("./textures/snow/snow_02_disp_4k.jng");
    const soilRoughness = textureLoader.load("./textures/snow/snow_02_rough_4k.jpg");
    const soilAmbientOcclusion = textureLoader.load("./textures/snow/snow_02_ao_4k.jpg");
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
    planeBody.id=5
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    app.world.addBody(planeBody)
    //!VILLAGE
    //!MONSTER
    loader.load('/models/characters/monster.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Key|Monster_Hunter_Mesh|Take 001_Monster_Hunter_Mesh').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        model.scale.set(.2,.2,.2)
        model.position.set(-32,-1,2)
        model.scale.set(2,2,2)
        model.rotateY(.8)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        const body : body = {shape: new THREE.Mesh, skeleton: new THREE.Box3}
        monster = new Model(model,mixer,animationMap,'idle',body)
    })
    //!umberMil
    loader.load('/models/village/LumberMill_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(-35,5,-5)
        model.rotateY(.5)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!HOUSE
    loader.load('/models/village/House_Level2_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(35,5,-15)
        model.rotateY(-2.55)

        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!HOUSE_2
    loader.load('/models/village/House_Level2_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(37,5,13)
        model.rotateY(-1.6)
        model.scale.x=1.5
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!GATE
    loader.load('/models/village/Gate_Level2_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(0,6,-30)
        model.rotateY(1.55)
        model.scale.y=.7
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!Walls
    let wallsX:number = -25.5
    for (let i = 0; i < 2; i++) {
        loader.load('/models/village/Wall_Level2_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(80)
            model.scale.y=2

            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(wallsX,5,-30)
            app.scene.add(model)
            wallsX+=51.5;
        })
    }
    let wallsXleft:number = -28.5
    for (let i = 0; i < 3; i++) {
        loader.load('/models/village/Wall_Level2_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(0)
            model.scale.y=2

            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(-55,5,wallsXleft)
            app.scene.add(model)
            wallsXleft+=15.5;
        })
    }
    let wallsXright:number = -28.5
    for (let i = 0; i < 3; i++) {
        loader.load('/models/village/Wall_Level2_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(0)
            model.scale.y=.1
            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(55,5,wallsXright)
            app.scene.add(model)
            wallsXright+=15.5;
        })
    }

    let towerX :number= -39.9
    for (let i = 0; i < 2; i++) {
        loader.load('/models/village/ArcherTower_Level2_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            // model.rotateY(80)
            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(towerX,8,-30)
            model.scale.set(1.5,7,1.5)

            app.scene.add(model)
            towerX+=79.7
        })
    }
}

function initLevel_1() : void {
    //!init enemies
    function circleXY(r:number, theta:number) {
        theta = (theta-90) * Math.PI/180;
        return {x: r*Math.cos(theta),y: -r*Math.sin(theta)}
    }
    slimes = new Array(2)
    for (let theta=0; theta<360; theta += 90) {
        const  answer = circleXY(40, theta)
        const x=answer.x
        const z=answer.y
        const ball = new THREE.Mesh(new THREE.SphereGeometry(.2), new THREE.MeshLambertMaterial({ color: 'white'}))
        initSlime(x,z,'/models/characters/greenSlime.glb')
    }
    //!SKYBOX
    const ft = new THREE.TextureLoader().load("textures/skybox/bluecloud_ft.jpg");
    const bk = new THREE.TextureLoader().load("textures/skybox/bluecloud_bk.jpg");
    const up = new THREE.TextureLoader().load("textures/skybox/bluecloud_up.jpg");
    const dn = new THREE.TextureLoader().load("textures/skybox/bluecloud_dn.jpg");
    const rt = new THREE.TextureLoader().load("textures/skybox/bluecloud_rt.jpg");
    const lf = new THREE.TextureLoader().load("textures/skybox/bluecloud_lf.jpg")

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
    //!GRASS
    const dummy = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry( 0.1, 1, 1, 4 );
    geometry.translate( 0, 0.5, 0 ); 
    const instancedMesh = new THREE.InstancedMesh( geometry, leavesMaterial, 5000 );
    app.scene.add( instancedMesh );
    for ( let i=0 ; i<5000 ; i++ ) {
        dummy.position.set(
        ( Math.random() - 2.5 ) * 19,
        0,
        ( Math.random() - .5 ) * 40
    );
    dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    instancedMesh.setMatrixAt( i, dummy.matrix );
    }
    //!PLANE
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
    planeBody.id=5
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    app.world.addBody(planeBody)
    //!VILLAGE
    //!Mushroom
    loader.load('/models/characters/mushroomMan.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Idle.018').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        model.scale.set(.2,.2,.2)
        model.position.set(-35,.5,10)
        model.rotateY(.8)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        const body : body = {shape: new THREE.Mesh, skeleton: new THREE.Box3}
        mushroom = new Model(model,mixer,animationMap,'idle',body)
    })
    //!BLACKSMITH
    loader.load('/models/village/Blacksmith_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(-35,5,-5)
        model.rotateY(1.55)

        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!HOUSE
    loader.load('/models/village/House_Level1_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(35,5,-15)
        model.rotateY(-2.55)

        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!mARKET
    loader.load('/models/village/Market_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(34,2,-4)
        model.rotateY(-1.8)

        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!HOUSE_2
    loader.load('/models/village/House_Level1_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(37,5,13)
        model.rotateY(-1.6)
        model.scale.x=1.5
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!GATE
    loader.load('/models/village/Gate_Level1_BlueTeam.glb',function (gltf) {
        const model = gltf.scene
        model.position.set(0,7.6,-30)
        model.rotateY(1.55)
        model.scale.y=.7
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
    })
    //!Walls
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
    let wallsXleft:number = -28.5
    for (let i = 0; i < 3; i++) {
        loader.load('/models/village/Wall_Level1_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(0)
            model.scale.y=2

            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(-55,5,wallsXleft)
            app.scene.add(model)
            wallsXleft+=15.5;
        })
    }
    let wallsXright:number = -28.5
    for (let i = 0; i < 3; i++) {
        loader.load('/models/village/Wall_Level1_BlueTeam.glb',function (gltf) {
            let model = gltf.scene
            model.rotateY(0)
            model.scale.y=2

            model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
            model.position.set(55,5,wallsXright)
            app.scene.add(model)
            wallsXright+=15.5;
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