import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';


export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(BrowserAnimationsModule),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),


// ✅ Firebase Initialization


  ]
  };



// Add other Firebase services here if needed, e.g.:
// provideFirestore(() => getFirestore()),
// provideDatabase(() => getDatabase()),
