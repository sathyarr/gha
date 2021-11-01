import { IonButton, IonButtons, IonCol, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonPage, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { home, newspaper, body, moon, menu } from 'ionicons/icons';
//Added import statements
import { Link, useHistory } from 'react-router-dom';

const  endpoint  =  `http://localhost:9001/parse`;

const  demoEndpoint  =  `http://localhost:9001/synthetic`;

let responseText = ""
let doneLoading = false

const Chart: React.FC = () => {

    const [articleId, setArticleId] = useState(null);
    const [charttext, setChartText] = useState<string>();

    // useEffect(() => {
    //     // POST request using axios inside useEffect React hook
    //     const article = { title: 'Getting Knowledge Graph' };
    //     axios.post(endpoint, "leg pain in my hand")
    //         .then(response => console.log(response.data));

    // // empty dependency array means this effect will only run once (like componentDidMount in classes)
    // }, []);
    let history = useHistory();

    async function getGraph() {
      const article = { title: 'Getting Knowledge Graph' };
      await axios.post(endpoint, charttext)
          .then(response => {
              responseText = response.data
              doneLoading = true
              console.log(responseText);
          })

      if(doneLoading) {
          doneLoading = false;
          history.push({
              pathname: "/model",
              state: responseText 
          });
    }
  }

  async function demoRun() {
      const article = { title: 'Getting Knowledge Graph' };
      await axios.post(demoEndpoint, charttext)
          .then(response => {
              responseText = response.data
              doneLoading = true
              console.log(responseText);
          })

      if(doneLoading) {
          doneLoading = false;
          history.push({
              pathname: "/model",
              state: responseText
          });
    }
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
        <IonTitle>Chart Upload</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h1>Give your Chart text</h1>
      <IonItem>
    <IonLabel position="stacked">Charttext</IonLabel> 
      <IonTextarea rows={16} cols={20} value={charttext} placeholder="Chart text here..." onIonChange={e => setChartText(e.detail.value!)}></IonTextarea>
      </IonItem>
      <IonButton
            expand='full'
            // eslint-disable-next-line no-loop-func
            onClick={getGraph}
        >
                        <IonLabel><h1>Process</h1></IonLabel>
        </IonButton>
        <IonLabel><div style={{ textAlign: "center"}}>OR</div></IonLabel>
        <IonButton
            expand='full'
            // eslint-disable-next-line no-loop-func
            onClick={demoRun}
        >
            <IonLabel><h1>Try Demo Data</h1></IonLabel>
        </IonButton>
        
    </IonContent>
        
    </IonPage>
    </>
  );
};

export default Chart;