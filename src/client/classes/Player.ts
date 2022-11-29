import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Model } from './Model'


enum colors {greenPFX = '#2EE866',bluePFX = "#002a4f",purplePFX = "#6c25be",redPFX = "#DE2222"}

interface bullet { shape: THREE.Mesh, body:  CANNON.Body} 
interface ball {
    direction:{x:number, y:number, z:number},
    position : {x:number, y:number, z:number},
    scale :  number,
    color :string,
    speed : number
}

export class Player extends Model{
    private readonly fadeDuration : number = .2
    private readonly runVelocity : number = .4
    private readonly walkVelocity :number = .1
    private boundAttack = this.shoot.bind(this)
    private lookingAt = ''
    private play = ''
    private toggleRun: boolean = true
    public particles : any

    
    public balls : CANNON.Body[]= []
    public ballMeshes : THREE.Mesh[] = []

    private ball : ball = {
    direction:{x:0, y:0, z:0},
    position : {x:0, y:0, z:0},
    scale :  0.1,
    color :'',
    speed : 0
    }

    
    constructor(
        model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        currentAction: string,
        particles:any
        ){
        super(model,mixer,animationsMap,currentAction)
        this.particles=particles
    }


    private shoot() : void{
        const scale = this.ball.scale
        const color = this.ball.color
        const direction = this.ball.direction
        const speed = this.ball.speed
        const position = this.ball.position
        const ballBody = new CANNON.Body({ shape:new CANNON.Sphere(scale), mass:.0001})
        const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(scale), new THREE.MeshLambertMaterial({ color: color, opacity: .5, transparent:true}))
        ballMesh.castShadow = true
        ballMesh.receiveShadow = true
    
        this.balls.push(ballBody)
        this.ballMeshes.push(ballMesh)
    
        ballBody.velocity.set(
        direction.x * speed,
        direction.y * speed,
        direction.z * speed
        )
        ballBody.position.set(
            this.model.position.x + position.x,
            this.model.position.y + position.y, 
            this.model.position.z + position.z
        )
        ballMesh.position.set(
            ballBody.position.x,
            ballBody.position.y,
            ballBody.position.z
        )
    }

    public update(delta:number, keysPressed:any, mouseButtonsPressed:any) : void {
        const directionPressed = ['w','a','s','d'].some(key => keysPressed[key] == true)
        const clickPressed =['left','middle','right'].some(key => mouseButtonsPressed[key] == true)

        if(this.model.position.z<-10) this.model.position.z=-10;
        if(this.model.position.z>10 ) this.model.position.z=10;
        if(this.model.position.x<-30) this.model.position.x=-30;
        if(this.model.position.x>30 ) this.model.position.x=30;

        if(keysPressed.d==true) this.lookingAt= 'right';
        if(keysPressed.a==true) this.lookingAt= 'left';
        if(keysPressed.s==true) this.lookingAt= 'down';
        if(keysPressed.w==true) this.lookingAt= 'up';
        
        this.play = ''
        if (directionPressed && this.toggleRun) {
            this.play = 'walk'
        } else if (directionPressed) {
            this.play = 'run.001' //walking
        } else if(clickPressed){
            if(mouseButtonsPressed.left){
                this.play = '1H_attack' 
                if(this.lookingAt=='right'){
                    this.ball.position={x:1,y:3,z:1}
                    this.ball.direction={x:1,y:0,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ball.position={x:-1,y:3,z:-2}
                    this.ball.direction={x:-1,y:0,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ball.position={x:1,y:3,z:-2}
                    this.ball.direction={x:0,y:0,z:-1}
                }
                if(this.lookingAt=='down'){
                    this.ball.position={x:-1,y:3,z:2}
                    this.ball.direction={x:0,y:0,z:1}
                }
                this.ball.color='#061258'
                this.ball.scale=.2
                this.ball.speed=10
            }
            if(mouseButtonsPressed.right){
                this.play = '2H_attack' 
                if(this.lookingAt=='right'){
                    this.ball.position={x:2.5,y:3,z:1}
                    this.ball.direction={x:1,y:0,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ball.position={x:-2.5,y:3,z:-2}
                    this.ball.direction={x:-1,y:0,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ball.position={x:1,y:3,z:-2.5}
                    this.ball.direction={x:0,y:0,z:-1}
                }
                if(this.lookingAt=='down'){
                    this.ball.position={x:-1,y:3,z:2.5}
                    this.ball.direction={x:0,y:0,z:1}
                }
                this.ball.color='#2EE866'
                this.ball.scale=.5
                this.ball.speed=18
            }
            if(mouseButtonsPressed.middle){
                if(this.lookingAt=='right'){
                    this.ball.position={x:1,y:6,z:1}
                    this.ball.direction={x:1,y:-1,z:0}
                }
                if(this.lookingAt=='left'){
                    this.ball.position={x:-1,y:6,z:-2}
                    this.ball.direction={x:-1,y:-1,z:0}
                }
                if(this.lookingAt=='up'){
                    this.ball.position={x:1,y:6,z:-2}
                    this.ball.direction={x:0,y:-1,z:0}
                }
                if(this.lookingAt=='down'){
                    this.ball.position={x:-1,y:6,z:2}
                    this.ball.direction={x:0,y:-1,z:0}
                }
                this.ball.scale=.8
                this.ball.color=colors.redPFX
                this.play = 'AOE' 
                this.ball.speed=10
            }
            this.mixer.addEventListener( 'loop', this.boundAttack)
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
            if(keysPressed.d){
                this.model.position.x += velocity
                this.model.rotation.y = 1.5
            }
            if(keysPressed.a){
                this.model.position.x -= velocity
                this.model.rotation.y = -1.5
            }
            if(keysPressed.s){
                this.model.position.z += velocity
                this.model.rotation.y = 0
            }
            if(keysPressed.w){
                this.model.position.z -= velocity
                this.model.rotation.y = 3
            }
        }
        // this.model.position.set(this.body.position.x,this.body.position.y-2,this.body.position.z)//!CHECK THIS
        this.mixer.removeEventListener('loop',this.boundAttack)
        this.updateBullets()

    }
    private updateBullets() : void {
        const balls = this.balls
        const ballMeshes = this.ballMeshes
        for (let i = 0; i < balls.length; i++) {
            ballMeshes[i].position.set(balls[i].position.x,balls[i].position.y,balls[i].position.z)
            ballMeshes[i].quaternion.set(balls[i].quaternion.x,balls[i].quaternion.y,balls[i].quaternion.z,balls[i].quaternion.w)
            this.particles.emitters.forEach((a:any) => {
                a.position.set(this.balls[i].position.x,this.balls[i].position.y,this.balls[i].position.z)
                a.position.scale=.1
                a.dead=false
                if(this.play == "1H_attack") {
                    a.behaviours[1].colorA.colors = [colors.bluePFX]
                } else if (this.play == "2H_attack") {
                    a.behaviours[1].colorA.colors = [colors.greenPFX]
                } else if (this.play == "AOE") {
                    a.behaviours[1].colorA.colors = [colors.purplePFX]
                } 
            })
        }
    }
    
    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }
}


    // private bullets : bullet[]  = new Array(100).fill({
    //     shape: new THREE.Mesh( new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x005ce6 })),
    //     body: new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.2)}),
    // })