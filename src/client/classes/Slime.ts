//!Cosas interesantes :
    //!Esta es la clase hija de Model
    //!Dependiendo de la posicion del player es a donde va a mirar el slime
    //!Es el unico elemento que tiene 3 'cuerpos': CANNON.body,THREE.MESH,body->mi implementacion

import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Model, body } from './Model'
export class Slime extends Model{
   private speed : number = .03 
   private cannon: CANNON.Body
   constructor(
      model: THREE.Group, 
      mixer: THREE.AnimationMixer,  
      animationsMap: Map<string, THREE.AnimationAction>,
      currentAction: string,
      body: body,
      cannon:CANNON.Body
      ){
      super(model,mixer,animationsMap,currentAction,body)
      this.incomeDamage=0
      this.cannon=cannon
      this.lifeBar.position.y=this.model.position.y+1.8
      this.model.add(this.lifeBar)
   }

   public update(delta:number,camera:THREE.PerspectiveCamera, playerModel:THREE.Group) : void{
      this.lifeBar.lookAt(camera.position)
      this.updateAnimations(delta,'Slime_WALK')
      this.lifeAction(this.incomeDamage,'Slime_DEAD','Slime_WALK')
      this.gettingCloser(playerModel)
      const shape = this.body.shape
      const skeleton = this.body.skeleton
      const cannonPosition = this.cannon.position
      const modelPosition = this.model.position

      modelPosition.set(cannonPosition.x,cannonPosition.y-2,cannonPosition.z)
      shape.position.copy(modelPosition)
      if(shape.geometry.boundingBox){skeleton.copy(shape.geometry.boundingBox).applyMatrix4(shape.matrixWorld)}
   }

   public attack():void {
        //todo shoot stuff
   }

   private gettingCloser(player:THREE.Group){
      const speed = this.speed
      const cannonPosition = this.cannon.position

      if (player.position.x > cannonPosition.x ){cannonPosition.x += speed; this.model.rotation.y=1.5}
      if (player.position.z > cannonPosition.z ){cannonPosition.z += speed; }//this.model.rotation.y=3}
      if (player.position.z < cannonPosition.z ){cannonPosition.z -= speed; }//this.model.rotation.y=3}
      if (player.position.x < cannonPosition.x ){cannonPosition.x -= speed; this.model.rotation.y=-1.5}
      // this.model.position.set(this.model.position.x,this.model.position.y-5,this.model.position.z)//!CHECK THIS
   }
}
