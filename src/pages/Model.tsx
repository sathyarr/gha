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
import * as $ from 'jquery'
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

            console.log(scene.meshes)
            // let m = scene.getNodeByName("node12")
            // m.scaling = new BABYLON.Vector3(0.25, 2.25, 0.25);
    
            model.rotation = new BABYLON.Vector3(-0, Math.PI / 4, 0);

            var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            var bodypartToMeshMapping = JSON.parse('{ \
              "Head": ["node12", "node8"], \
              "Thigh": ["node14"], \
              "Hand": ["node18"], \
              "Spine": ["node6"] \
            }')

            var systemToBodyPartMapping = JSON.parse('{ \
              "Physical Exam": [ \
                { \
                  "bodyParts": ["Head", "Hand"], \
                  "neutrality": "positive" \
                }, \
                { \
                  "bodyParts": ["Thigh", "Spine"], \
                  "neutrality": "negative" \
                } \
              ], \
              "Chief Complaint": [ \
                { \
                  "bodyParts": ["Head"], \
                  "neutrality": "positive" \
                }, \
                { \
                  "bodyParts": ["Thigh", "Hand", "Spine"], \
                  "neutrality": "negative" \
                } \
              ] \
            }')
    
            function createButton(name: string[], text: string, width: string, height: string, color: string, cornerRadius: number, background: string, alignment: number) {
              console.log(name.join(), text, width, height, color, cornerRadius, background, alignment)
    
              var button = GUI.Button.CreateSimpleButton(name.join() + "btn", text);
              button.width = width
              button.height = height;
              button.color = color;
              button.cornerRadius = cornerRadius;
              button.background = background;
              button.horizontalAlignment = alignment;
    
              return button
            }
    
            var bodypartHL = new BABYLON.HighlightLayer("bodypartHL", scene);
    
            function highlight(target: string, color: BABYLON.Color3) {
              let targetMesh = scene.getMeshByName(target);
              bodypartHL.addMesh(targetMesh, color);
            }

            function highlightHelper(target: any, color: BABYLON.Color3) {
              $.each(target, function(index, val) {
                highlight(val, color);
              })
            }

            function setBodyPartHighlight(bodyPart: string) {
              bodypartHL.removeAllMeshes();
              highlightHelper(bodypartToMeshMapping[bodyPart], BABYLON.Color3.Green());
            }
    
            function createBodyPartPanel() {
              var bodyPartPanel = new GUI.StackPanel();
              advancedTexture.addControl(bodyPartPanel);

              $.each(bodypartToMeshMapping, function(key: string, val){
                  var button = createButton(val, key, "150px", "40px", "white", 20, "green", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
                  bodyPartPanel.addControl(button);
                  button.onPointerUpObservable.add(function() {
                    setBodyPartHighlight(key);
                  });
              });
            }
            createBodyPartPanel();
    

            function setSystemHighlight(targets: any) {
              bodypartHL.removeAllMeshes();

              var neutralityToColorMapping = new Map()
              neutralityToColorMapping.set("positive", BABYLON.Color3.Green())
              neutralityToColorMapping.set("negative", BABYLON.Color3.Red())

              $.each(targets, function(index, val){
                // Transform bodypart name to meshname, neutrality key to color
                var neutralityValue = val['neutrality']
                var meshItems = $.map(val['bodyParts'], function(i) {
                  return bodypartToMeshMapping[i];
                });
                highlightHelper(meshItems, neutralityToColorMapping.get(neutralityValue));
              });
            }
    
            function createSystemPanel() {
              var panel = new GUI.StackPanel();
              advancedTexture.addControl(panel);
              panel.verticalAlignment = 1;

              $.each(systemToBodyPartMapping, function(key: string, val){
                var button = createButton([key], key, "150px", "40px", "white", 20, "green", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
                panel.addControl(button);
                button.onPointerUpObservable.add(function() {
                  setSystemHighlight(val);
                });
              });
            }
            createSystemPanel();


            scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false
            });
            scene.createDefaultCameraOrLight(true, true, true);
        });

        // BABYLON.SceneLoader.ImportMesh("","assets/models/muscular", "scene.gltf", scene, function(meshes) {
        // });

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