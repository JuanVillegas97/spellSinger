import * as THREE from 'three'

export interface body {shape: THREE.Mesh, skeleton: THREE.Box3}
export class Model{
    protected readonly fadeDuration : number = .2
    protected model: THREE.Group
    protected mixer: THREE.AnimationMixer
    protected animationsMap: Map<string, THREE.AnimationAction> = new Map()
    protected currentAction: string
    protected body : body
    protected play = ''
    
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

    public checkCollision(a:THREE.Box3, b: THREE.Box3) : Boolean{
        if(a.intersectsBox(b)||a.containsBox(b)){
            return true
        }
        return false
    }
    public getSkeleton() : THREE.Box3{
        return this.body.skeleton
    }
}