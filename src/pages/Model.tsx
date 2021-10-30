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
    IonCardContent} from '@ionic/react';

import SplitPane from 'react-split-pane';
  
import { moon,menu,home, newspaper } from "ionicons/icons";
import BabylonScene from '../components/SceneComponent';

import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import 'babylonjs-loaders'
import { useEffect, useRef, useState } from 'react';

let mainSceneEngine: BABYLON.Engine | null = null

const Model: React.FC = () => {
  
  const [ModelContentDimensions,setModalContentDimensions] = useState({ width:600, height:400})
  const modelPaneRef = useRef<any>(null)

    function onMainSceneMount(e: any){
        const { canvas, scene, engine } = e;
        mainSceneEngine = engine

        // // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // // This attaches the camera to the canvas
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

        BABYLON.SceneLoader.ImportMesh("","assets/models/", "scene.gltf", scene, function(meshes) {
            let model = scene.getMeshByName("__root__");
    
            model.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
            scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false
            });
            scene.createDefaultCameraOrLight(true, true, true);
        });

        engine.runRenderLoop(async function() {
            if (scene) {
                if(canvas.height === 0 && canvas.height === 0){
                    if(modelPaneRef.current)
                    {
                        canvas.height = modelPaneRef.current.offsetHeight
                        canvas.width = modelPaneRef.current.offsetWidth
                    }
                    engine.resize()
                }
                scene.render();
            }
        });
    }

    useEffect(() =>{
        if(modelPaneRef.current) {
            setModalContentDimensions({
                width: modelPaneRef.current.offsetWidth,
                height: modelPaneRef.current.offsetHeight,
            })
        }    
    },[ModelContentDimensions.width,ModelContentDimensions.height])

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
            {
                        <BabylonScene style={{ width:`{$modelContentDimensions.width}px`, height: `{$modelContentDimensions.height}px`}} 
                        width={ModelContentDimensions.width}
                        height={ModelContentDimensions.height}
                        onSceneMount={onMainSceneMount}/>
            }
        </div>
        <IonContent>
            <IonList>
            <IonListHeader><IonLabel>Bodypart</IonLabel></IonListHeader>
            <IonItem>
                <IonButton style={{ width: '100%' }} onClick={()=>{ console.log("hello")}}>
                        <IonLabel>Hand</IonLabel>
                </IonButton>
            </IonItem>
            <IonItem>
            <IonButton style={{ width: '100%' }} onClick={()=>{ console.log("world")}}>
                        <IonLabel>Leg</IonLabel>
                </IonButton>
            </IonItem>
            </IonList>
        </IonContent>
        </SplitPane>
        </IonContent>
        {/* <IonContent style={{ width:'100%', height: '100%'}} fullscreen>
        </IonContent> */}
        </IonPage>
    );
};

export default Model;