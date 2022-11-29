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
    private ballposition = {x:0,y:0,z:0}
    private ballscale = 0;
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
        const ballGeometry = new THREE.SphereGeometry(0.2)
        const ballBody = new CANNON.Body({ mass: .0001 })
        ballBody.addShape(new CANNON.Sphere(0.2))
        const ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({ color: 0xdddddd }))
    
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


        let play = ''
        if (directionPressed && this.toggleRun) {
            play = 'walk'
        } else if (directionPressed) {
            play = 'run.001' //walking
        } else if(clickPressed){
            if(mouseButtonsPressed.left==true){
                play = '1H_attack' 
                this.ballposition={x:0,y:3,z:1}
                this.balldirection.y=0
                this.shootVelocity=10
            }
            if(mouseButtonsPressed.right==true){
                this.ballposition={x:0,y:3,z:1}
                this.balldirection.y=0

                play = '2H_attack' 
                this.shootVelocity=20
            }
            if(mouseButtonsPressed.middle==true){
                this.ballposition={x:0,y:6,z:1}
                this.balldirection.y=-1

                play = 'AOE' 
                this.shootVelocity=5
            }
            
            this.mixer.addEventListener( 'loop', this.boundCastAttack1)
        }else {
            play = 'idle'
        }
        if (this.currentAction != play) {
            const toPlay= this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)

            current?.fadeOut(this.fadeDuration)
            toPlay?.reset().fadeIn(this.fadeDuration).play()
            this.currentAction = play
        }
        this.mixer.update(delta)
        if (this.currentAction == 'run.001' || this.currentAction == 'walk') {
            const velocity = this.currentAction == 'run.001' ? this.runVelocity : this.walkVelocity
            if(keysPressed.d==true){
                this.balldirection.x=1
                this.balldirection.z=0
                this.body.position.x += velocity
                this.model.rotation.y = 1.5
            }
            if(keysPressed.a==true){
                this.balldirection.x=-1
                this.balldirection.z=0

                this.body.position.x -= velocity
                this.model.rotation.y = -1.5

            }
            if(keysPressed.s==true){
                this.balldirection.z=1
                this.balldirection.x=0

                this.body.position.z += velocity
                this.model.rotation.y = 0

            }
            if(keysPressed.w==true){
                this.balldirection.z=-1
                this.balldirection.x=0

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
            })
        }
    }
    
    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }
    
}