import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../websocket.service';
import {CustomUser} from '../user.service'
import { UserService } from '../user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthenticationService } from '../google-auth.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore } from '@angular/fire/compat/firestore';



declare var RTCPeerConnection: any;



const servers = {
  iceServers: [{
    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
  },
], 
iceCandidatePoolSize: 10,
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit{
  roomId: string;
  peerConnection: any;

  userName: string | null;
  user: CustomUser | null;

  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', {static: true}) remoteVideo!: ElementRef<HTMLVideoElement>;

  

  constructor(private route: ActivatedRoute, private webSocketService: WebSocketService, private userService: UserService, private afAuth: AngularFireAuth, public authService: GoogleAuthenticationService,private firestore: AngularFirestore   ) {
    this.roomId = ''; 
    // Initialize the RTCPeerConnection
    this.peerConnection = new RTCPeerConnection(servers);

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        // Pass the ICE candidate to the WebSocket service
        this.webSocketService.sendIceCandidate(event.candidate);
      }

  }
}

  /* handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      // Send the ICE candidate to the server
      this.webSocketService.sendIceCandidate(event.candidate);
    }
  }  */

  async createOffer() { //triggered by an html button
     /* this.peerConnection.onicecandidate = (event: any) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    } 
 */
    try {
      // generate the session description and Generate the offer 
      const offer = await this.peerConnection.createOffer();

      // Set the local description
      await this.peerConnection.setLocalDescription(offer); //this works 

      // Send the offer to the signaling server
      this.sendOffer(offer);
    } catch (error) {
      console.error('Error creating offer:', error);
    }




    
  }

  sendOffer(offer: RTCSessionDescription) {
    const signalingSocket = new WebSocket('ws://localhost:8080/ws');
  
    signalingSocket.onopen = () => {
      signalingSocket.send(JSON.stringify(offer));
    };
  
    signalingSocket.onmessage = (event) => {
      // Handle incoming messages from the signaling server if needed
      const message = JSON.parse(event.data);
      // Process the received message
      console.log(message)
    };
  
    signalingSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    signalingSocket.onclose = () => {
      // Handle the WebSocket connection close if needed
      console.log('closed')
    };
  }

 /*  async startCall(){
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection(offerDescription);

    const offer = {
      sdp: offerDescription.sdp, //sdp - session description protocol
      type: offerDescription.type
    }

    
  } */

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      this.userName = user?.displayName || null;
      this.user = user;
    });

    console.log(this.userName)

    



    this.route.params.subscribe(params => {
      this.roomId = params['id'];
      console.log(this.roomId);
      // Use the productId for further processing or data retrieval

      this.webSocketService.send('meow Hello from the client!');
      this.webSocketService.connect();
      this.sendMessage();
      console.log('works')
      this.createRoomInFirestore(this.roomId, this.getUserName()); 
    });

    

     

    this.webSocketService.connect();
    this.webSocketService.send('meow Hello from the client!');


    //WebRtc
    // Subscribe to incoming ICE candidates from the WebSocket service
    this.webSocketService.iceCandidate$.subscribe((candidate: RTCIceCandidate) => {
      // Add the received ICE candidate to the peer connection
      this.peerConnection.addIceCandidate(candidate);
    });

  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  public sendMessage() {
    console.log('sent the message from sendMEssage()')
    this.webSocketService.send("Hello from the client!");
  }

  public async startWebcam(){
    let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true}); //access to the webcam
    let remoteStream = new MediaStream();

    //push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, localStream)
    });

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      event.streams[0].getTracks().forEach((track : any)=> {
        remoteStream.addTrack(track);
      } )
    }
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoElement.srcObject = localStream;
    const remoteVideoElement:HTMLVideoElement = this.remoteVideo.nativeElement;
    remoteVideoElement.srcObject = remoteStream;
  }

  
  handleOffer(offer: RTCSessionDescriptionInit) {
    // Set the remote description (offer) on the RTCPeerConnection
    this.peerConnection.setRemoteDescription(offer)
      .then(() => {
        // Generate an answer
        return this.peerConnection.createAnswer();
      })
      .then((answer: RTCSessionDescriptionInit) => {
        // Set the local description (answer) on the RTCPeerConnection
        return this.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        // Send the answer to the Go backend
        this.webSocketService.sendAnswer(this.peerConnection.localDescription);
      })
      .catch((error: any) => {
        // Handle any errors
        console.error('Error generating or sending answer:', error);
      });
  }

  createRoomInFirestore(roomId: string, creatorUsername: string | null) {
    this.firestore.collection('rooms').doc(roomId).set({
      creator: creatorUsername,
      roomId: roomId, 
      roomName: 'createdInAFunction',
      joinedUsers: creatorUsername,
    })
    .then(() => {
      console.log('Room ID and username pushed to Firestore successfully.');
    })
    .catch((error) => {
      console.error('Error pushing room ID and username to Firestore: ', error);
    });
  }

  getUserName(): string | null {
    const user = this.authService.userService.getUser(); // Assuming you have a getUser() method in UserService
    return user ? user.displayName : '';
  }
  
}
