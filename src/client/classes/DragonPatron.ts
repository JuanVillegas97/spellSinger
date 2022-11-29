// import * as THREE from 'three'
// import * as CANNON from 'cannon-es'
// import { Model } from './Model'

// export class DragonPatron extends Model{
//     constructor(model: THREE.Group, 
//         mixer: THREE.AnimationMixer,  
//         animationsMap: Map<string, THREE.AnimationAction>,
//         currentAction: string,
//         body: CANNON.Body
//         ){
//             super(model,mixer,animationsMap,currentAction,body)
//         }

//     public update(delta:number, posVec:THREE.Vector3, rotation:THREE.Euler) : void{
//         // this.body.position.set(posVec.x-15,posVec.y+10,posVec.z)
//         this.model.position.set(posVec.x-8,posVec.y-6,posVec.z)
//         this.model.rotation.y = rotation.y-.3
//         this.mixer.update(delta)
//     }

//     public dracarys():void {
//         //todo shoot stuff
//     }
// }