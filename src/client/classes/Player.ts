import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Model } from './Model'
import { Vec3 } from 'cannon-es'

interface bullet { shape: THREE.Mesh, body:  CANNON.Body} 
    // private bullets : bullet[]  = new Array(100).fill({
    //     shape: new THREE.Mesh( new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x005ce6 })),
    //     body: new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.2)}),
    // })

export class Player extends Model{
    private readonly fadeDuration : number = .2
    private readonly runVelocity : number = .4
    private readonly walkVelocity :number = .1
    private shootVelocity : number = 0

    private toggleRun: boolean = true
    
    //animation binding
    private boundCastAttack1 = this.shoot.bind(this)
    
    public balls : CANNON.Body[]= []
    public ballMeshes : THREE.Mesh[] = []
    public particles : any
    private balldirection = {x:0,y:0,z:0}
    private ballposition = {x:0,y:-2,z:0}
    private ballScale = 0;
    private lookingAt=''
    private ballColor=''
    private play = ''
    //nebula colors
    private greenPFX = '#2EE866'
    private bluePFX = '#002a4f'
    private purplePFX = '#6c25be'
    private redPFX = '#DE2222'
    
    constructor(
        model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        currentAction: string,
        body: CANNON.Body,
        particles:any
        ){
        super(model,mixer,animationsMap,currentAction,body)
        this.particles=particles

    }


    public shoot(){
        const ballGeometry = new THREE.SphereGeometry(this.ballScale)
        const ballBody = new CANNON.Body({ mass: .0001 })
        ballBody.addShape(new CANNON.Sphere(this.ballScale))
        const ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({ color: this.ballColor, opacity: .5, transparent:true}))
        ballMesh.castShadow = true
        ballMesh.receiveShadow = true
    
        this.balls.push(ballBody)
        this.ballMeshes.push(ballMesh)
    
        
        ballBody.velocity.set(
        this.balldirection.x * this.shootVelocity,
        this.balldirection.y * this.shootVelocity,
        this.balldirection.z * this.shootVelocity
        )
        const x = this.model.position.x + this.ballposition.x
        const y = this.model.position.y + this.ballposition.y
        const z = this.model.position.z + this.ballposition.z
        ballBody.position.set(x, y, z)
        ballMesh.position.set(ballBody.position.x,ballBody.position.y,ballBody.position.z)
    }

    public update(delta:number, keysPressed:any, mouseButtonsPressed:any) : void{
        this.updateBullets()
        if(this.body.position.z<-10) this.body.position.z=-10;
        if(this.body.position.z>10) this.body.position.z=10;
        if(this.body.position.x<-30) this.body.position.x=-30;
        if(this.body.position.x>30) this.body.position.x=30;

        const directionPressed = ['w','a','s','d'].some(key => keysPressed[key] == true)
        const clickPressed =['left','middle','right'].some(key => mouseButtonsPressed[key] == true)


        // let play = ''
        this.play = ''
        if (directionPressed && this.toggleRun) {
            this.play = 'walk'
        } else if (directionPressed) {
            this.play = 'run.001' //walking
        } else if(clickPressed){
            if(mouseButtonsPressed.left==true){
                this.play = '1H_attack' 
                if(this.lookingAt=='right'){
                    this.ballposition={x:1,y:3,z:1}
                    this.balldirection={x:1,y:0,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ballposition={x:-1,y:3,z:-2}
                    this.balldirection={x:-1,y:0,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ballposition={x:1,y:3,z:-2}
                    this.balldirection={x:0,y:0,z:-1}
                }
                if(this.lookingAt=='down'){
                    this.ballposition={x:-1,y:3,z:2}
                    this.balldirection={x:0,y:0,z:1}
                }
                this.ballColor='#061258'
                this.ballScale=.2
                this.shootVelocity=10
            }
            if(mouseButtonsPressed.right==true){
                this.play = '2H_attack' 

                if(this.lookingAt=='right'){
                    this.ballposition={x:2.5,y:3,z:1}
                    this.balldirection={x:1,y:0,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ballposition={x:-2.5,y:3,z:-2}
                    this.balldirection={x:-1,y:0,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ballposition={x:1,y:3,z:-2.5}
                    this.balldirection={x:0,y:0,z:-1}
                }
                if(this.lookingAt=='down'){
                    this.ballposition={x:-1,y:3,z:2.5}
                    this.balldirection={x:0,y:0,z:1}
                }
                this.ballColor='#2EE866'
                this.ballScale=.5
                this.shootVelocity=18
            }
            if(mouseButtonsPressed.middle==true){
                if(this.lookingAt=='right'){
                    this.ballposition={x:1,y:6,z:1}
                    this.balldirection={x:1,y:-1,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ballposition={x:-1,y:6,z:-2}
                    this.balldirection={x:-1,y:-1,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ballposition={x:1,y:6,z:-2}
                    this.balldirection={x:0,y:-1,z:0}
                }
                if(this.lookingAt=='down'){
                    this.ballposition={x:-1,y:6,z:2}
                    this.balldirection={x:0,y:-1,z:0}
                }
                this.ballScale=.8
                this.ballColor=this.redPFX
                this.play = 'AOE' 
                this.shootVelocity=10
            }
            
            this.mixer.addEventListener( 'loop', this.boundCastAttack1)
        }else {
            this.play = 'idle'
        }
        if (this.currentAction != this.play) {
            const toPlay= this.animationsMap.get(this.play)
            const current = this.animationsMap.get(this.currentAction)

            current?.fadeOut(this.fadeDuration)
            toPlay?.reset().fadeIn(this.fadeDuration).play()
            this.currentAction = this.play
        }
        this.mixer.update(delta)
        if (this.currentAction == 'run.001' || this.currentAction == 'walk') {
            const velocity = this.currentAction == 'run.001' ? this.runVelocity : this.walkVelocity
            if(keysPressed.d==true){
                this.lookingAt='right'
                this.body.position.x += velocity
                this.model.rotation.y = 1.5
            }
            if(keysPressed.a==true){
                this.lookingAt='left'
                this.body.position.x -= velocity
                this.model.rotation.y = -1.5

            }
            if(keysPressed.s==true){
                this.lookingAt='down'
                this.body.position.z += velocity
                this.model.rotation.y = 0
            }
            if(keysPressed.w==true){
                this.lookingAt='up'
                this.body.position.z -= velocity
                this.model.rotation.y = 3
            }
        }
        this.model.position.set(this.body.position.x,this.body.position.y-2,this.body.position.z)
        this.mixer.removeEventListener('loop',this.boundCastAttack1)
    }

    private updateBullets() : void {
        for (let i = 0; i < this.balls.length; i++) {
            this.ballMeshes[i].position.set(this.balls[i].position.x,this.balls[i].position.y,this.balls[i].position.z)
            this.ballMeshes[i].quaternion.set(this.balls[i].quaternion.x,this.balls[i].quaternion.y,this.balls[i].quaternion.z,this.balls[i].quaternion.w)
            this.particles.emitters.forEach((a:any) => {
                a.position.set(this.balls[i].position.x,this.balls[i].position.y,this.balls[i].position.z)
                a.position.scale=.1
                a.dead=false
                //change color depending on attack
                if(this.play == "1H_attack") {
                    a.behaviours[1].colorA.colors = [this.bluePFX]
                } else if (this.play == "2H_attack") {
                    a.behaviours[1].colorA.colors = [this.greenPFX]
                } else if (this.play == "AOE") {
                    a.behaviours[1].colorA.colors = [this.purplePFX]
                  //  a.behaviours[1].colorB.colors = [this.redPFX]
                    
                } 
            })
        }
    }
    
    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }
    
}