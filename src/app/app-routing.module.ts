import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AuthorizeComponent } from './authorize/authorize.component';
import { RoomComponent } from './room/room.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { RoomfireComponent } from './roomfire/roomfire.component';
import { RoomprodComponent } from './roomprod/roomprod.component';
import {AnswerroomComponent} from './answerroom/answerroom.component'

const routes: Routes = [
  { path: '', redirectTo: '/home', component: HomeComponent, pathMatch: 'full' },
  { path: 'authorize', component: AuthorizeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'room/:id', component: RoomComponent },
  {path: 'roomf/:id', component: RoomfireComponent},
  {path: 'roomprod/:id', component: RoomprodComponent},
  {path: 'answerroom/:id', component: AnswerroomComponent},
  // Add more route configurations as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
