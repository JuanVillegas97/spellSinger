import * as THREE from 'three'
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
 import { Model } from './Model'
 import * as CANNON from 'cannon-es'
import { MathUtils, Vector2 } from 'three';

 export class Mutant extends Model{
    private raycaster = new THREE.Raycaster();
    private readonly fadeDuration : number = .2
    private search: THREE.Vector3[] = [];
    private minAngle = 75;
    private maxAngle = 220;
    private play = ''
    //HP
    private hpMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    private hpGeometry = new THREE.PlaneGeometry(2,.2);
    private hpBar = new THREE.Mesh(this.hpGeometry,this.hpMat);
    private gotHit = false;


     constructor(model: THREE.Group, 
         mixer: THREE.AnimationMixer,  
         animationsMap: Map<string, THREE.AnimationAction>,
         currentAction: string,
         body: CANNON.Body
         ) {
            
         super(model,mixer,animationsMap,currentAction,body)
         // console.log(this.search)
         this.hpBar.position.y=this.model.position.y+1.8;
         this.hpBar.name = "hpBar";
         this.model.add(this.hpBar);
     }

   


     public update(delta:number,scene:THREE.Scene,camera:THREE.PerspectiveCamera, playerModel:THREE.Group) : void{
        // this.body.position.set(posVec.x-10,posVec.y+10,posVec.z)
        // this.model.position.set(posVec.x-10,posVec.y-2,posVec.z)
        // this.model.rotation.y = rotation.y-.3
        for(let i = this.minAngle; i<this.maxAngle; i+=15) {
         this.search[i] = new THREE.Vector3(Math.cos(i * (Math.PI / 180)),1,Math.sin(i * (Math.PI / 180)));
      
        }
        //animation checks
        this.play='idle'

        //hpChanges
        //TODO create collision detection flag
        this.hpBar.lookAt(camera.position)
        if(this.gotHit)
        {
            let subHealthVec = new THREE.Vector3(0.2,0,0);
            this.hpBar.scale.sub(subHealthVec);
            this.hpBar.scale.clampScalar(0,1);
            // do something if died
            if (this.hpBar.scale.x <= 0) {
               //mutant died
               this.play ="die"
               //TTODO find way to lock animation

            } else{
               //animate recoil to dmg
               //this.play='recoil'
            }

        } else {
         this.play='idle'
        } 
        if (this.currentAction != this.play) {
         const toPlay= this.animationsMap.get(this.play)
         const current = this.animationsMap.get(this.currentAction)

         current?.fadeOut(this.fadeDuration)
         toPlay?.reset().fadeIn(this.fadeDuration).play()
         this.currentAction = this.play
     }
        

        this.mixer.update(delta)
        this.raycastCheck(scene,playerModel)
     }

     public attack():void {
        //todo shoot stuff
     }

     public raycastCheck(scene: THREE.Scene, playerModel:THREE.Group):void {
      const dampSpeed = .005
      const far = 15
      const distance = this.model.position.distanceTo(playerModel.position)
      const distanceVec = new THREE.Vector3().subVectors(this.model.position,playerModel.position)
      if( ( distance< far) ) {

         this.search.forEach((direction) => {
            const angleDeg = playerModel.position.dot(this.model.position)
            console.log(angleDeg)
           // console.log(this.model.position)
            // console.log(intersects?.[0]?.object?.name)
            if ((this.minAngle<=angleDeg && angleDeg<=this.maxAngle)) {
               this.model.position.x += direction.x*dampSpeed;
               this.model.position.z += direction.z*dampSpeed; 
               this.body.position.x += direction.x*dampSpeed;
               this.body.position.z += direction.z*dampSpeed;
                this.gotHit = true;
            } else {
               this.model.position.x -= direction.x*dampSpeed;
               this.model.position.z -= direction.z*dampSpeed; 
               this.body.position.x -= direction.x*dampSpeed;
               this.body.position.z -= direction.z*dampSpeed;
               this.gotHit = false
            }
         //    if (100<=angleDeg && angleDeg<=105) {
         //       console.log("rotateY")
         //       this.model.rotateY(.5)
         //   }
        })
      } 
        
     }
 }