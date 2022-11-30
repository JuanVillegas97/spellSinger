import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader } from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
export const textureLoader = new TextureLoader()
export const fontLoader = new FontLoader()
export const loader = new GLTFLoader()
