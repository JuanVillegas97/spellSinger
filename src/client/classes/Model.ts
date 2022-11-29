import * as THREE from 'three'

export interface body {shape: THREE.Mesh, skeleton: THREE.Box3}
export class Model{
    protected readonly fadeDuration : number = .2
    protected lifeBar = new THREE.Mesh(new THREE.PlaneGeometry(2,.2), new THREE.MeshBasicMaterial({color: 0x00ff00}))
    protected model: THREE.Group
    protected mixer: THREE.AnimationMixer
    protected animationsMap: Map<string, THREE.AnimationAction> = new Map()
    protected currentAction: string
    protected body : body
    protected play = ''
    protected isCollading = false
    constructor(
        model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        currentAction: string,
        body: body
        ){
        this.body=body
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.animationsMap.forEach((value, key) => {if(key == currentAction) value.play()})
    }

    protected updateAnimations(delta:number) : void {
        if (this.currentAction != this.play) {
            const toPlay= this.animationsMap.get(this.play)
            const current = this.animationsMap.get(this.currentAction)
            current?.fadeOut(this.fadeDuration)
            toPlay?.reset().fadeIn(this.fadeDuration).play().setLoop(THREE.LoopOnce,1)
            this.currentAction = this.play
        }
        this.mixer.update(delta)
    }
    
    public getModel(): THREE.Group{
        return this.model
    }

    public checkCollision(a:THREE.Box3, b: THREE.Box3) : boolean{
        if(a.intersectsBox(b)||a.containsBox(b)){
            return true
        }
        return false
    }
    public getSkeleton() : THREE.Box3{
        return this.body.skeleton
    }

    public setCollading(value:boolean) : void {
        this.isCollading = value
    }

    protected lifeAction(){
        const lifeBar = this.lifeBar
        if(this.isCollading){
            lifeBar.scale.sub(new THREE.Vector3(0.005,0,0));
            lifeBar.scale.clampScalar(0,1);
            if (lifeBar.scale.x <= 0) {
                this.play ="die"
            } else{
              //animate recoil to dmg
              //this.play='recoil'
            }
        } else {
            this.play='idle'
        } 
    }
}