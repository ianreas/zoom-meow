import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import  {GoogleAuthProvider}  from 'firebase/auth';
import { UserService } from './user.service';
import { User } from '@firebase/auth-types';

@Injectable({
    providedIn: 'root',
  })
  export class GoogleAuthenticationService {
    constructor(public afAuth: AngularFireAuth, public userService: UserService) {
        this.afAuth.authState.subscribe((user) => {
            this.userService.setUser(user);
          });
    } //inject firebase auth service
  
    signInWithGoogle() {
      return this.AuthLogin(new GoogleAuthProvider())
    }

    //Auth logic to run auth providers
    AuthLogin(provider:any){
        return this.afAuth
        .signInWithPopup(provider)
        .then((result) => {
            console.log('you have been logged in')
        })
        .catch((error) => {
            console.log(error)
        })
    }
  
    signOut() {
      return this.afAuth.signOut();
    }
  }