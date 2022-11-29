import * as THREE from 'three'

import { Model, body } from './Model'

export class Mutant extends Model{
   private search: THREE.Vector3[] = [];
   private minAngle = 75;
   private maxAngle = 220;
   

    //HP
   private hpMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
   private hpGeometry = new THREE.PlaneGeometry(2,.2);
   private hpBar = new THREE.Mesh(this.hpGeometry,this.hpMat);
   private gotHit = false;


   constructor(model: THREE.Group, 
      mixer: THREE.AnimationMixer,  
      animationsMap: Map<string, THREE.AnimationAction>,
      currentAction: string,
      body: body,

      ) {
      super(model,mixer,animationsMap,currentAction,body)
      // console.log(this.search)
      this.hpBar.position.y=this.model.position.y+1.8;
      this.hpBar.name = "hpBar";
      this.model.add(this.hpBar);
   }

   public update(delta:number,camera:THREE.PerspectiveCamera, playerModel:THREE.Group) : void{
        //animation checks
      this.play='idle'

        //hpChanges
      //TODO create collision detection flag //function
      this.hpBar.lookAt(camera.position)
        //lower enemy hp on hit
      if(this.gotHit)
      {
         //only change x value of subHealthvec
         //x value is  how much damage mutant takes per hit
            let subHealthVec = new THREE.Vector3(0.05,0,0);
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
      

      this.updateAnimations(delta)
      this.gettingCloser(playerModel)

      const shape = this.body.shape
      const skeleton = this.body.skeleton
      shape.position.copy(this.model.position)
      if(shape.geometry.boundingBox){skeleton.copy(shape.geometry.boundingBox).applyMatrix4(shape.matrixWorld)}
   }

   public attack():void {
        //todo shoot stuff
   }

   private gettingCloser(player:THREE.Group){
      if (player.position.x > this.model.position.x ){this.model.position.x += .1; this.model.rotation.y=1.5}
      if (player.position.z > this.model.position.z ){this.model.position.z += .1; }//this.model.rotation.y=3}
      if (player.position.z < this.model.position.z ){this.model.position.z -= .1; }//this.model.rotation.y=3}
      if (player.position.x < this.model.position.x ){this.model.position.x -= .1; this.model.rotation.y=-1.5}
      // this.model.position.set(this.model.position.x,this.model.position.y-5,this.model.position.z)//!CHECK THIS
   }
}
