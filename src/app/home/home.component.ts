import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user.service';
import { User } from 'firebase/auth';
import { CustomUser } from '../user.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  user: CustomUser | null;
  userInput: string;

  constructor(private router: Router, private userService: UserService) {
    this.user = this.userService.getUser();
    console.log(this.user)
  }

  navigateToRoomPage() {
    console.log('navigate')

    const roomId = uuidv4();

    this.router.navigate(['/room', roomId]); //this.router.navigate(['/room']);
  }

  navigateToRoomFirePage(){
  const roomId = uuidv4();

  this.router.navigate(['/roomf', roomId]); //this.router.navigate(['/room']);
  }

  navigateToRoomProdPage(){
    const roomId = uuidv4();

  this.router.navigate(['/roomprod', roomId]); //this.router.navigate(['/room']);
  }
  
  navigateToSpecificRoom(){
    const roomId = this.userInput;

    this.router.navigate(['/answerroom', roomId]);
  }
}
