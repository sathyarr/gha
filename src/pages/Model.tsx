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
    IonItem } from '@ionic/react';
  
import { moon,menu,home, newspaper } from "ionicons/icons";
import BabylonScene from '../components/SceneComponent';

import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import 'babylonjs-loaders'

function onMainSceneMount(e: any){
    const { canvas, scene, engine } = e;

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

    engine.runRenderLoop(() => {
        if (scene && scene.activeCamera) {
            scene.render();
        }
    });
}

const Model: React.FC = () => {
  
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
    <IonContent className="ion-padding">
      <h1>EHR Data in Action</h1>
      <div style={{ width:'100%', height: '100%'}}>
          {
                    <BabylonScene style={{ width:'100%', height: '100%'}} onSceneMount={onMainSceneMount}/>
          }
      </div>
    </IonContent>
    {/* <IonContent fullscreen>
      </IonContent> */}
    </IonPage>
  );
};

export default Model;