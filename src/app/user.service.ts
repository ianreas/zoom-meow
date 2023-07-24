import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';

export interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    // Add additional properties as needed
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class UserService {
    private user: CustomUser | null;
  
    setUser(user: CustomUser | null) {
      this.user = user;
    }
  
    getUser(): CustomUser | null {
      return this.user;
    }
  }