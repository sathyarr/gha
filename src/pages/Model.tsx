import { IonApp, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonFooter, 
    IonMenu,
    IonToggle,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonIcon,
    IonLabel,
    IonPage ,
    IonButtons,
    IonButton,
    IonItem, 
    IonSplitPane,
    IonCard,
    IonCardContent,
    IonCol,
    IonItemDivider,
    IonLoading,
    IonModal} from '@ionic/react';

import SplitPane from 'react-split-pane';
  
import { moon,menu,home, newspaper, sunny, camera } from "ionicons/icons";
import BabylonScene from '../components/SceneComponent';

import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import 'babylonjs-loaders'
import { useEffect, useRef, useState } from 'react';
import { Scene } from 'babylonjs/scene';
import { ArcRotateCamera, Vector3 } from 'babylonjs';

let procedures = [
    { title: "head", procedure: "CT", condition: "Tumor is detected", mainMeshName: '__root__', highlight: false , cameraPosition: { x: -0.126, y: 0.776, z: -1.365 }},
    { title: "leg", procedure: "Xray", condition: "Fracture is detected", mainMeshName: '__root__', highlight: false, cameraPosition: { x: -0.126, y: 1.776, z: -1.365 } }
]

let mainSceneEngine: BABYLON.Engine | null = null

let mainScene: BABYLON.Scene | null = null

async function addHighlight(procedure: any, scene: any) {
    if (procedure.highlight) {
        animateCamera(scene, procedure.cameraPosition)
    }
}

function stopCamera(procedure: any, scene: any) {
    const alpha =  Math.PI/4;
    const beta = Math.PI/3;
    const radius = 8;
    const target = new BABYLON.Vector3(0, 0, 0);
    
    scene.activeCamera.setTarget(BABYLON.Vector3.Zero());
}

function animateCamera (scene: any, position: any) {
    const animationcamera = new BABYLON.Animation('myAnimationcamera', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    const keys = []

    keys.push({
    frame: 0,
    value: scene.activeCamera.position.clone()
    })

    keys.push({
    frame: 50,
    value: new BABYLON.Vector3(scene.activeCamera.position.x, position.y, position.z)
    })
    animationcamera.setKeys(keys)

    const alphaAnimation = new BABYLON.Animation("camAlpha", "alpha", 7, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE)
    const keys2 = [{
        frame : 0,
        value : Math.PI
    }, {
      frame : 100,
      value :-Math.PI
    }]
    alphaAnimation.setKeys(keys2)
    
    scene.activeCamera.animations = []
    scene.activeCamera.animations.push(animationcamera)
    scene.activeCamera.animations.push(alphaAnimation)
    scene.beginAnimation(scene.activeCamera, 0, 100, false,1)
  }

let hl: any = null
const render = true
let rerender = true
let componentToRerender = ''

let procedureContainer: any = null

let uniqueKey = 0

const Model: React.FC = () => {
  
  const [modalContentDimensions, setModalContentDimensions] = useState({ width:600, height:400})
  const modelPaneRef = useRef<any>(null)
  const [reactRender, setReactRender] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [sceneRestart, setSceneRestart] = useState(false)
  const [showMain3dModel, setShowMain3dModel] = useState(false)
  const [show3dModel, setShow3dModel] = useState(false)
  const modalContentRef = useRef<any>(null)

    function onMainSceneMount(e: any){
        const { canvas, scene, engine } = e;
        mainSceneEngine = engine
        mainScene = scene

        var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);

        // Positions the camera overwriting alpha, beta, radius
            camera.setPosition(new BABYLON.Vector3(0, 0, 10));

        // This attaches the camera to the canvas
            camera.attachControl(canvas, true);
        
        // // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // // Default intensity is 1. Let's dim the light a small amount
        // light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // // Move the sphere upward 1/2 its height
        // sphere.position.y = 1;

        // // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

        const gl = new BABYLON.GlowLayer('glow', scene);

        var hl = new BABYLON.HighlightLayer("hl1", scene)

        // Promise.all([
        //     BABYLON.SceneLoader.LoadAssetContainerAsync('assets/models/',
        //       'scene.gltf', scene).then(function (container) {
        //       procedureContainer = container
        //     }),
        // ]).then(() => {
        //     scene.createDefaultCameraOrLight(true, true, true)
        
        //     scene.activeCamera.useAutoRotationBehavior = true
        //     scene.activeCamera.autoRotationBehavior.idleRotationSpeed = 0.1
        
        //     scene.activeCamera.lowerRadiusLimit = 1
        //     scene.activeCamera.upperRadiusLimit = 3
        
        //     setShowLoading(false)
        // })

        BABYLON.SceneLoader.ImportMesh("","assets/skeleton/", "scene.gltf", scene, function(meshes) {
            let model = scene.getMeshByName("__root__");
    
            model.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
            scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false
            });
            scene.createDefaultCameraOrLight(true, true, true);

            setShowLoading(false)
        });

        engine.runRenderLoop(async function() {
                if(canvas.height === 0 && canvas.height === 0){
                    if(modelPaneRef.current)
                    {
                        canvas.height = modelPaneRef.current.offsetHeight
                        canvas.width = modelPaneRef.current.offsetWidth
                    }
                    engine.resize()
                }

                if(render && scene && scene.activeCamera){
                    if(rerender){
                        rerender = false
                        for(let i = 0; i < procedures.length; i++) {
                            const procedure = procedures[i]
                            if(procedure.title === "head") {
                                addHighlight(procedure,scene)
                            }
                            else if(procedure.title === "leg") {
                                addHighlight(procedure,scene)
                            }
                        }
                    componentToRerender = ''
                    }
                }
            scene.render();
        });
    }

    useEffect(() => {
        if(!showLoading) {
            setShowMain3dModel(true)
          } else {
            setShowLoading(false)
          }
    }, [])

    useEffect(() =>{
        if(modelPaneRef.current) {
            setModalContentDimensions({
                width: modelPaneRef.current.offsetWidth,
                height: modelPaneRef.current.offsetHeight,
            })
        }    
    },[modalContentDimensions.width,modalContentDimensions.height])

    const procedureListHtml = []
    for (let index = 0; index < procedures.length; index++) {
        const procedure = procedures[index]
        procedureListHtml.push(
            <IonCol size='3'>
                <IonButton
                  expand='full'
                  // eslint-disable-next-line no-loop-func
                  onClick={() => {
                    procedure.highlight = !procedure.highlight
                    setReactRender(!reactRender)
                    componentToRerender = procedure.title
                    rerender = true
                  }}
                >
                  <IonLabel>{procedure.title}</IonLabel>
                </IonButton>
            </IonCol>
        )
        procedureListHtml.push(<IonItemDivider key={uniqueKey++} />)
    }
    

    return (
        <IonPage className="ion-page" id="main-content">
        <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
            <IonMenuToggle>
                <IonButton>
                <IonIcon slot="icon-only" icon={menu} className="component-icon component-icon-dark"></IonIcon>
                </IonButton>
            </IonMenuToggle>
            </IonButtons>
            <IonTitle>Visualize EHR</IonTitle>
        </IonToolbar>
        </IonHeader>
        <IonContent>
        <SplitPane split='vertical' defaultSize='70%' onResizerClick = {() => mainSceneEngine!.resize()}>
        <div ref={modelPaneRef} style={{ width:'100%', height: '100%'}}>
            {  !showLoading &&
                        <BabylonScene style={{ width:`{$modelContentDimensions.width}px`, height: `{$modelContentDimensions.height}px`}} 
                        width={modalContentDimensions.width}
                        height={modalContentDimensions.height}
                        onSceneMount={onMainSceneMount}/>
            }
        </div>
        <IonContent>
            <IonList>
            <IonListHeader><IonLabel>Bodypart</IonLabel></IonListHeader>
                {procedureListHtml}
            </IonList>
        </IonContent>
        </SplitPane>
        <IonLoading
          isOpen={showLoading}
          onDidDismiss={() => setShowLoading(false)}
          message='Loading 3D Model...'
        />
        </IonContent>
        </IonPage>
    );
};

export default Model;