import { Component, OnInit } from '@angular/core';
import {GoogleAuthenticationService} from '../google-auth.service'
import { CustomUser } from '../user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit{
  user: CustomUser | null;
  userName: string | null;

  constructor(public authService: GoogleAuthenticationService, private afAuth: AngularFireAuth){

  }

  ngOnInit(){
    this.afAuth.authState.subscribe((user) => {
      this.userName = user?.displayName || null;
      this.user = user;
    });
  }
}
