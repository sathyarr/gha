import { SceneComponentConstants } from "babylonjs";
import { useIonViewDidEnter,
    useIonViewDidLeave,
    useIonViewWillEnter,
    useIonViewWillLeave } from '@ionic/react';
import { useEffect } from "react";


export type SceneEventArgs = {
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement
  };
  
  export type SceneProps = {
    engineOptions?: BABYLON.EngineOptions,
    adaptToDeviceRatio?: boolean,
    onSceneMount?: (args: SceneEventArgs) => void,
    width?: number,
    height?: number
  };
  
  const BabylonScene : React.FC<SceneProps & React.HTMLAttributes<HTMLCanvasElement>>  = (props: SceneProps) => {
  
    let scene: BABYLON.Scene;
    let engine: BABYLON.Engine;
    let canvas: HTMLCanvasElement;

    function onResizeWindow() {
      if (engine) {
        engine.resize();
      }
    }

    const { width, height, ...rest } = props;
  
    let opts: any = {};
    

    useIonViewDidEnter(() => {
        engine = new BABYLON.Engine(
            canvas,
            true,
            props.engineOptions,
            props.adaptToDeviceRatio
        );
        
        let Scene = new BABYLON.Scene(engine);
        scene = Scene

        if (typeof props.onSceneMount === 'function') {
            props.onSceneMount({
              scene,
              engine: engine,
              canvas: canvas
            });
          } else {
            console.error('onSceneMount function not available');
        }
     
        

    // Resize the babylon engine when the window is resized
        window.addEventListener('resize', onResizeWindow);
    });

    function onCanvasLoaded (c : HTMLCanvasElement) {
        if (c !== null) {
          canvas = c;
        }
    }

    useIonViewDidEnter(() => {
        window.removeEventListener('resize', onResizeWindow);
    });
  
    
    if (width !== undefined && height !== undefined) {
        opts.width = width;
        opts.height = height;
    }
    else {
        opts.width =  "500%";
        opts.height = "500%";
    }
    
      return (
        <canvas
          {...opts}
          ref={onCanvasLoaded}
        />
      )
  };

  export default BabylonScene;