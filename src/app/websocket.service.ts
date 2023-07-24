import { Injectable } from '@angular/core';
import {WebSocketSubject} from 'rxjs/webSocket'
import {Subject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private iceCandidateSubject: Subject<RTCIceCandidate>;
  public iceCandidate$: Observable<RTCIceCandidate>;
  private messageSubject: Subject<any>;
  public message$: Observable<any>;
  private offerSubject: Subject<RTCSessionDescriptionInit>;
  

  constructor() {
    this.messageSubject = new Subject<any>();
    this.message$ = this.messageSubject.asObservable();
    this.offerSubject = new Subject<RTCSessionDescriptionInit>();
   }

  public connect() {
    this.socket = new WebSocket('ws://127.0.0.1:8080/ws'); // Replace with your Go backend WebSocket URL

    this.iceCandidateSubject = new Subject<RTCIceCandidate>();
    this.iceCandidate$ = this.iceCandidateSubject.asObservable();

    // Register the message event listener for ICE candidates
    this.socket.addEventListener('message', (event: MessageEvent) => {
      const candidate = JSON.parse(event.data) as RTCIceCandidate;
      this.iceCandidateSubject.next(candidate);
    });

    this.socket.addEventListener('message', (event: MessageEvent) => {

      const message = JSON.parse(event.data);
      console.log(message)
      this.messageSubject.next(message);
    });

    this.socket.addEventListener('message', (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'offer') {
        console.log('offer')
        this.offerSubject.next(message);
      } else if (message.type === 'iceCandidate') {
        const iceCandidate = new RTCIceCandidate(message.candidate);
        this.iceCandidateSubject.next(iceCandidate);
      }
    });


    this.socket.onopen = () => {
      console.log('WebSocket connected');
      // Perform any initialization or signaling handshake here
      this.socket.send('Hi from the client!!')
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      // Handle incoming messages from the server
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      // Perform any cleanup or reconnection logic here
      this.socket.send('Client Closed')
    };

    this.socket.onerror = (error) => {
      console.log('WebSocket error:', error);
      // Handle any WebSocket errors here
    };

    
}

sendIceCandidate(candidate: RTCIceCandidate) {
  // Send the ICE candidate to the server via WebSocket
  this.socket.send(JSON.stringify(candidate));
}

handleIceCandidate(event: RTCPeerConnectionIceEvent) {
  if (event.candidate) {
    // Send the ICE candidate through the WebSocket connection
    this.socket.send(JSON.stringify(event.candidate));
  }
}

  public send(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log('sent');
    } else {
      console.log('WebSocket connection not open');
    }
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    const message = { type: 'answer', answer: answer };
    this.socket.send(JSON.stringify(message));
  }



  public disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}