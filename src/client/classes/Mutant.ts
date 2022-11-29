import * as THREE from 'three'
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
 import { Model } from './Model'
 import * as CANNON from 'cannon-es'
import { MathUtils, Vector2 } from 'three';

 export class Mutant extends Model{
    private raycaster = new THREE.Raycaster();
    private search: THREE.Vector3[] = [];

     constructor(model: THREE.Group, 
         mixer: THREE.AnimationMixer,  
         animationsMap: Map<string, THREE.AnimationAction>,
         currentAction: string,
         body: CANNON.Body
         ) {
            
         super(model,mixer,animationsMap,currentAction,body)
         for(let i = 100; i<220; i+=10) {
            this.search[i] = new THREE.Vector3(Math.cos(i * (Math.PI / 180)),0,Math.sin(i * (Math.PI / 180)));
            
         }
         console.log(this.search)
     }

   


     public update(delta:number,scene:THREE.Scene, playerModel:THREE.Group) : void{
        // this.body.position.set(posVec.x-10,posVec.y+10,posVec.z)
        // this.model.position.set(posVec.x-10,posVec.y-2,posVec.z)
        // this.model.rotation.y = rotation.y-.3

        this.mixer.update(delta)
        this.raycastCheck(scene,playerModel)
     }

     public attack():void {
        //todo shoot stuff
     }

     public raycastCheck(scene: THREE.Scene, playerModel:THREE.Group):void {
      // (A - B).magnitude < farDistance
      const dampSpeed = .025
      const far = 15
      if( (this.model.position.distanceTo(playerModel.position) < far) ) {

         this.search.forEach((direction) => {
            const angleDeg = this.model.position.dot(playerModel.position)
            // console.log(intersects?.[0]?.object?.name)
            if ((100<=angleDeg && angleDeg<=220)) {
                this.body.position.x += direction.x*dampSpeed;
                this.body.position.z += direction.z*dampSpeed;
                this.model.position.x += direction.x*dampSpeed;
                this.model.position.z += direction.z*dampSpeed;
                
            }
         //    if (100<=angleDeg && angleDeg<=105) {
         //       console.log("rotateY")
         //       this.model.rotateY(.5)
         //   }
        })
      } 
        
     }
 }