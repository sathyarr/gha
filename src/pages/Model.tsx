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
    IonModal,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle} from '@ionic/react';

import SplitPane, { Pane } from 'react-split-pane';
  
import { moon,menu,home, newspaper, sunny, camera, body, woman, calendar, information } from "ionicons/icons";
import BabylonScene from '../components/SceneComponent';

import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import * as $ from 'jquery'
import 'babylonjs-loaders'
import { useEffect, useRef, useState } from 'react';
import { Scene } from 'babylonjs/scene';
import { ArcRotateCamera, Vector3 } from 'babylonjs';
import { useSelector } from 'react-redux';
import {RouteComponentProps, useHistory, useLocation, useParams } from 'react-router-dom'
import { StaticContext } from 'react-router';
import { data } from 'jquery';

let procedures = [
    { title: "Overall Analysis", procedure: "CT", condition: "Tumor is detected", mainMeshName: '__root__', highlight: false , cameraPosition: { x: -0.126, y: 0.776, z: -1.365 }},
    { title: "High-Level Report", procedure: "Xray", condition: "Fracture is detected", mainMeshName: '__root__', highlight: false, cameraPosition: { x: -0.126, y: 1.776, z: -1.365 } }
]

let sampleJSON = []

let mainSceneEngine: BABYLON.Engine | null = null

let mainScene: BABYLON.Scene | null = null

async function addHighlight(procedure: any, scene: any) {
    if (procedure.highlight) {
        animateCamera(scene, procedure.cameraPosition)
        procedure.highlight=!procedure.highlight
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
    scene.beginAnimation(scene.activeCamera, 0, 100, true)
  }

  function createLabel (mesh: any, advancedTexture: any, text: any) {
    var label = new GUI.Rectangle('label for ' + mesh.name)
    label.background = 'black'
    label.height = '30px'
    label.alpha = 0.5
    label.width = '100px'
    label.cornerRadius = 20
    label.thickness = 1
    label.linkOffsetY = 30
    advancedTexture.addControl(label)
    label.linkWithMesh(mesh)

    var text1 = new GUI.TextBlock()
    text1.text = text
    text1.color = 'white'
    label.addControl(text1)
  }

let hl: any = null
const render = true
let rerender = true
let showMuscular = false
let componentToRerender = ''

let procedureContainer: any = null

let uniqueKey = 0


const Model: React.FC = () => {

  let location = useLocation()
  var responseData = JSON.stringify(location.state)
  console.log("Response Data:")
  console.log(responseData)
  
  const [modalContentDimensions, setModalContentDimensions] = useState({ width:600, height:400})
  const modelPaneRef = useRef<any>(null)
  const [reactRender, setReactRender] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [sceneRestart, setSceneRestart] = useState(false)
  const [showMain3dModel, setShowMain3dModel] = useState(false)
  const [show3dModel, setShow3dModel] = useState(false)
  const modalContentRef = useRef<any>(null)
  const procedureListHtml: any[] = []

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


            /**
             * Sathya Changes: Highlighter Start
             */
             var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

             var lowLevelDetailRect = new GUI.Rectangle();
             lowLevelDetailRect.width = 0.2;
             lowLevelDetailRect.height = "100px";
             lowLevelDetailRect.cornerRadius = 20;
             lowLevelDetailRect.color = "Orange";
             lowLevelDetailRect.thickness = 4;
             lowLevelDetailRect.background = "green";
             lowLevelDetailRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
             lowLevelDetailRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            //  lowLevelDetailRect.adaptHeightToChildren = true;
            //  lowLevelDetailRect.adaptWidthToChildren = true;
            lowLevelDetailRect.paddingRight = 20
            lowLevelDetailRect.paddingBottom = 20
             advancedTexture.addControl(lowLevelDetailRect);  

             var lowDetailsTB = new GUI.TextBlock();
             lowDetailsTB.text = "Info Box";
             lowDetailsTB.color = "white";
             lowDetailsTB.fontSize = 15;
             lowDetailsTB.outlineWidth = 0;
             lowDetailsTB.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
             lowDetailsTB.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
             lowLevelDetailRect.addControl(lowDetailsTB);
             
             var highLevelDetailRect = new GUI.Rectangle();
             highLevelDetailRect.width = 0.2;
             highLevelDetailRect.height = "150px";
             highLevelDetailRect.cornerRadius = 20;
             highLevelDetailRect.color = "Orange";
             highLevelDetailRect.thickness = 4;
             highLevelDetailRect.background = "green";
             highLevelDetailRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
             highLevelDetailRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            //  highLevelDetailRect.adaptHeightToChildren = true;
            //  highLevelDetailRect.adaptWidthToChildren = true;
            highLevelDetailRect.paddingRight = 20
            highLevelDetailRect.paddingBottom = 20
             advancedTexture.addControl(highLevelDetailRect); 

             var highDetailsTB = new GUI.TextBlock();
             highDetailsTB.text = "Info Box";
             highDetailsTB.color = "white";
             highDetailsTB.fontSize = 15;
             highDetailsTB.outlineWidth = 0;
             highDetailsTB.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
             highDetailsTB.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
             highLevelDetailRect.addControl(highDetailsTB);

            //  var responseData = JSON.stringify(location.state)
            //  console.log("Response Data:")
            //  console.log(responseData)

            var serverResponse = JSON.parse(responseData)
            console.log("serverResponse Data:")
            console.log(serverResponse)


             var bodypartToMeshMapping = serverResponse['topkbpmmapping']
             var allBodypartToMeshMapping = serverResponse['allbpmmapping']
             var systemToBodyPartMapping = serverResponse['system-data']
             var lowDetailsData = serverResponse['low-data']
             var highDetailsData = serverResponse['high-data']

             console.log(bodypartToMeshMapping)
             console.log(allBodypartToMeshMapping)
             console.log(systemToBodyPartMapping)
     
             function createButton(name: string[], text: string, width: string, height: string, color: string, cornerRadius: number, background: string, alignment: number) {
               console.log(name.join(), text, width, height, color, cornerRadius, background, alignment)
     
               var button = GUI.Button.CreateSimpleButton(name.join() + "btn", text);
               button.width = width
               button.height = height;
               button.color = color;
               button.cornerRadius = cornerRadius;
               button.background = background;
               button.paddingBottom = 3;
               button.fontSize = 15;
               button.horizontalAlignment = alignment;
     
               return button
             }
     
             var bodypartHL = new BABYLON.HighlightLayer("bodypartHL", scene);
     
             function highlight(target: string, color: BABYLON.Color3) {
               let targetMesh = scene.getMeshByName(target);
               bodypartHL.addMesh(targetMesh, color);
               targetMesh.computeWorldMatrix();
               var matrix = targetMesh.getWorldMatrix();
               var global_position = BABYLON.Vector3.TransformCoordinates(targetMesh.getPositionExpressedInLocalSpace(), matrix);
              //  targetMesh.position.x = 2;
               console.log(global_position);
             }
 
             function highlightHelper(target: any, color: BABYLON.Color3) {
               $.each(target, function(index, val) {
                 highlight(val, color);
               })
             }
 
             function setBodyPartHighlight(bodyPart: string) {
               bodypartHL.removeAllMeshes();
               highlightHelper(bodypartToMeshMapping[bodyPart], BABYLON.Color3.Yellow());

               console.log(lowDetailsData)
               console.log(lowDetailsData[bodyPart])
               highLevelDetailRect.isVisible = false;
               lowLevelDetailRect.isVisible = true;
               lowDetailsTB.text = 'Confidence Score:\n' + lowDetailsData[bodyPart]
             }
     
             function createBodyPartPanel() {
               var bodyPartPanel = new GUI.StackPanel();
               bodyPartPanel.paddingLeft = 20;
               advancedTexture.addControl(bodyPartPanel);
 
               $.each(bodypartToMeshMapping, function(key: string, val){
                   var button = createButton(val, key, "150px", "40px", "white", 10, "green", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
                   bodyPartPanel.addControl(button);
                   button.onPointerUpObservable.add(function() {
                     setBodyPartHighlight(key);
                   });
               });

            console.log(procedureListHtml)

             }
             createBodyPartPanel();
 
             function setSystemHighlight(targets: any) {
               bodypartHL.removeAllMeshes();
 
               var neutralityToColorMapping = new Map()
               neutralityToColorMapping.set("positive", BABYLON.Color3.Green())
               neutralityToColorMapping.set("negative", BABYLON.Color3.Red())

               var hData = "";

               $.each(targets, function(index, val){
                 // Transform bodypart name to meshname, neutrality key to color
                 var neutralityValue = val['neutrality']
                 var meshItems = $.map(val['bodyParts'], function(i) {
                   if(highDetailsData[i] != "") {
                     hData += i + " " + highDetailsData[i] + "\n"
                   }
                   return allBodypartToMeshMapping[i];
                 });
                 highlightHelper(meshItems, neutralityToColorMapping.get(neutralityValue));
               });

               lowLevelDetailRect.isVisible = false;
               highLevelDetailRect.isVisible = true;
               highDetailsTB.text = 'Section Information:\n' + hData;
             }
     
             function createSystemPanel() {
               var panel = new GUI.StackPanel();
               panel.paddingLeft = 20;
               panel.paddingBottom = 20;

               advancedTexture.addControl(panel);
               panel.verticalAlignment = 1;
 
               $.each(systemToBodyPartMapping, function(key: string, val){
                 var button = createButton([key], key, "150px", "40px", "white", 10, "green", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
                 panel.addControl(button);
                 button.onPointerUpObservable.add(function() {
                   setSystemHighlight(val);
                 });
               });
             }
             createSystemPanel();
            /**
             * Sathya Changes: Highlighter End
             */

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

    function onSubSceneMount(e: any){
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


            /**
             * Sathya Changes: Highlighter Start
             */
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
               targetMesh.computeWorldMatrix();
               var matrix = targetMesh.getWorldMatrix();
               var global_position = BABYLON.Vector3.TransformCoordinates(targetMesh.getPositionExpressedInLocalSpace(), matrix);
               console.log(global_position);
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
            /**
             * Sathya Changes: Highlighter End
             */

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
    
    const toggleDarkModeHandler = () => {
        document.body.classList.toggle("dark");
      };

    return (
        <>
        <IonMenu content-id="main-content">
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>Menu</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
    <IonList>
      <IonListHeader>
        Navigate
      </IonListHeader>
      <IonMenuToggle auto-hide="true">
        <IonItem button routerLink="/">
          <IonIcon slot="start" icon={home} className="component-icon component-icon-dark"/>
          <IonLabel>
            Home
          </IonLabel>
        </IonItem>
        <IonItem button >
          <IonIcon slot="start" icon={newspaper} className="component-icon component-icon-dark"/>
          <IonLabel>
            Chart
          </IonLabel>
        </IonItem>
        <IonItem button routerLink="/model">
          <IonIcon slot="start" icon={body} className="component-icon component-icon-dark"/>
          <IonLabel>
            Visualize
          </IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonItem>
            <IonIcon
              slot="start" icon={moon} className="component-icon component-icon-dark" />
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle slot="end" name="darkMode" onIonChange={toggleDarkModeHandler} />
          </IonItem>
    </IonList>
    </IonContent>
    </IonMenu>

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
        <SplitPane split='vertical' defaultSize="70%" onResizerClick = {() => mainSceneEngine!.resize()}>
        <div ref={modelPaneRef} style={{ width:'100%', height: '100%'}}>
            { 
                    !showLoading &&
                    <BabylonScene style={{ width:`{$modelContentDimensions.width}px`, height: `{$modelContentDimensions.height}px`}} 
                    width={modalContentDimensions.width}
                    height={modalContentDimensions.height}
                    onSceneMount={onMainSceneMount}/>
            }
        </div>
        <IonContent>
            <IonList>
            <IonListHeader><IonLabel>Analysis Report</IonLabel></IonListHeader>
                {procedureListHtml}
                <IonCol size='3'>
                <IonButton
                  expand='full'
                  // eslint-disable-next-line no-loop-func
                  onClick={() => {
                    showMuscular = !showMuscular
                  }}
                >
                  <IonLabel>Change View</IonLabel>
                </IonButton>
            </IonCol>
            </IonList>
            <IonCard>
                <IonCardHeader>
                    <IonCardSubtitle>Patient's Name: John Doe</IonCardSubtitle>
                    <IonCardTitle>PHI Information</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                <IonItem href="#" className="ion-activated">
                        <IonIcon icon={information} slot="start" />
                        <IonLabel>Patient's MRN: M00022</IonLabel>
                    </IonItem>

                    <IonItem href="#">
                        <IonIcon icon={woman} slot="start" />
                        <IonLabel>Patient Gender: Male</IonLabel>
                    </IonItem>

                    <IonItem className="ion-activated">
                        <IonIcon icon={calendar} slot="start" />
                        <IonLabel>Patient DOS: 06/05/2021</IonLabel>
                    </IonItem>
                </IonCardContent>
            </IonCard>
        </IonContent>
        </SplitPane>
        <IonLoading
          isOpen={showLoading}
          onDidDismiss={() => setShowLoading(false)}
          message='Loading 3D Model...'
        />
        </IonContent>
        </IonPage>
        </>
    );
};

export default Model;