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

import './Home.css';

const Home: React.FC = () => {
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
        <IonItem button>
          <IonIcon slot="start" icon={home} className="component-icon component-icon-dark"/>
          <IonLabel>
            Home
          </IonLabel>
        </IonItem>
        <IonItem button routerLink="/chart">
          <IonIcon slot="start" icon={newspaper} className="component-icon component-icon-dark"/>
          <IonLabel>
            Chart
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
        <IonTitle>GHA</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h1>Welcome to GHA</h1>
      <p>GHA let's you Interact with EHR</p>
    </IonContent>
    </IonPage>
    </>
  );
};

export default Home;
