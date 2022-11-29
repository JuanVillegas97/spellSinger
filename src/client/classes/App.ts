import { Scene, PerspectiveCamera, WebGLRenderer, Color } from 'three';
import { World } from 'cannon-es'

export let scene : THREE.Scene
export let camera : THREE.PerspectiveCamera
export let renderer : THREE.WebGLRenderer
export let world : World
export default () => {
    camera = new PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,2000)
    camera.position.set(0, 4, 15)

    scene = new Scene()

    
    renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)
    renderer.shadowMap.enabled = true
    // renderer.setClearColor( 0xffffff, 0);
    world = new World()
    world.gravity.set(0, -9.82, 0)

    return { scene, camera, renderer, world }
}
