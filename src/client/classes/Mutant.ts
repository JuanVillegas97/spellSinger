import * as THREE from 'three'

import { Model, body } from './Model'

export class Mutant extends Model{
   private speed : number = 0
   constructor(
      model: THREE.Group, 
      mixer: THREE.AnimationMixer,  
      animationsMap: Map<string, THREE.AnimationAction>,
      currentAction: string,
      body: body){
      super(model,mixer,animationsMap,currentAction,body)
      this.lifeBar.position.y=this.model.position.y+1.8;
      this.model.add(this.lifeBar);
   }

   public update(delta:number,camera:THREE.PerspectiveCamera, playerModel:THREE.Group) : void{
      this.speed = this.isCollading ? 0 : .03 
      this.play='idle'
      this.lifeBar.lookAt(camera.position)
      this.lifeAction()
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
      const speed = this.speed
      if (player.position.x > this.model.position.x ){this.model.position.x += speed; this.model.rotation.y=1.5}
      if (player.position.z > this.model.position.z ){this.model.position.z += speed; }//this.model.rotation.y=3}
      if (player.position.z < this.model.position.z ){this.model.position.z -= speed; }//this.model.rotation.y=3}
      if (player.position.x < this.model.position.x ){this.model.position.x -= speed; this.model.rotation.y=-1.5}
      // this.model.position.set(this.model.position.x,this.model.position.y-5,this.model.position.z)//!CHECK THIS
   }
}
