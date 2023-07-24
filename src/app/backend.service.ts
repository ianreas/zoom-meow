import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private baseUrl = 'http://localhost:8080'; // Replace with your Go backend URL

  constructor(private http: HttpClient) { }

  public getSomeData() {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  // Add other methods for different API endpoints
}