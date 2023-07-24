import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideStorage,getStorage } from '@angular/fire/storage';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import { SigninComponent } from './signin/signin.component';
import {HttpClientModule} from '@angular/common/http';
import { RoomfireComponent } from './roomfire/roomfire.component';
import { RoomprodComponent } from './roomprod/roomprod.component';
import { AnswerroomComponent } from './answerroom/answerroom.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



const routes: Routes = [
  { path: '', component: HomeComponent },
 
  { path: 'about', component: AboutComponent },
  {path: 'room/:id', component: RoomComponent}, //{path: 'room', component: RoomComponent}
  {path: 'roomf/:id', component: RoomfireComponent},
  {path: 'roomprod/:id', component: RoomprodComponent},
  {path: 'answerroom/:id', component: AnswerroomComponent},
  // Add more route configurations as needed
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    RoomComponent,
    SigninComponent,
    RoomfireComponent,
    RoomprodComponent,
    AnswerroomComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
