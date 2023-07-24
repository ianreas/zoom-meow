// navbar.component.ts
import { Component, OnInit} from '@angular/core';
import { UserService } from '../user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CustomUser } from '../user.service';
import { GoogleAuthenticationService } from '../google-auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{
  userName: string | null;
  user: CustomUser | null;

  constructor(private userService: UserService, private afAuth: AngularFireAuth, private authService: GoogleAuthenticationService) {}

  signIn() {
    // Handle sign-in button click event
    console.log('Sign In button clicked');
    this.authService.signInWithGoogle()
    .then(() => {
      console.log('You have been signed in');
    })
    .catch((error) => {
      console.log(error);
    });
  }

  about() {
    // Handle about button click event
    console.log('About button clicked');
  }

  signOut(){
    console.log('sign out');
    this.authService.signOut()
    .then(() => {
      console.log('You have been signed out');
    })
    .catch((error) => {
      console.log(error);
    });
  }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      this.userName = user?.displayName || null;
      this.user = user;
    });
  }
}
