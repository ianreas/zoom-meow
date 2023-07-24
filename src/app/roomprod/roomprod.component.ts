import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {DocumentSnapshot} from 'firebase/firestore';
import {ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-roomprod',
  templateUrl: './roomprod.component.html',
  styleUrls: ['./roomprod.component.scss']
})
export class RoomprodComponent implements OnInit{
  private peerConnection: RTCPeerConnection;
  private callDoc: AngularFirestoreDocument<any>;
  private offerCandidates: AngularFirestoreCollection<any>;
  private answerCandidates: AngularFirestoreCollection<any>;
  roomId: string;
  remoteStreams: MediaStream[];
  remoteVideos: HTMLVideoElement[];

  constructor(private firestore: AngularFirestore, private route: ActivatedRoute){
    this.roomId = '';
  }


  @ViewChild('webcamVideo', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', {static: true}) remoteVideo!: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    //grab the url
    this.route.params.subscribe(params => {
      this.roomId = params['id'];
      console.log(this.roomId);
    })

    this.initializePeerConnection();
  }

  private initializePeerConnection(){
    const servers = {
      iceServers: [
        {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
      ],
      iceCandidatePoolSize: 10,
    }

    this.peerConnection = new RTCPeerConnection(servers);

    this.callDoc = this.firestore.collection('calls').doc(this.roomId); //create a new document reference
    this.offerCandidates = this.callDoc.collection('offerCandidates'); //offerCandidates is a subcollection
    this.answerCandidates = this.callDoc.collection('answerCandidates');
  }

  async startWebcam(){
    let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    let remoteStream = new MediaStream();

    //push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, localStream) //each track to this.peerConnection
    })

    //remoteStream will be updated by the peerConnection itself
    this.peerConnection.ontrack = (event: RTCTrackEvent) => { //we listen to the ontrack event in the peer connection and then we add those tracks to the remoteStream
      event.streams[0].getTracks().forEach((track: any) => {
        remoteStream.addTrack(track);
      })
    }

    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoElement.srcObject = localStream;
    const remoteVideoElement:HTMLVideoElement = this.remoteVideo.nativeElement;
    remoteVideoElement.srcObject = remoteStream;
  }

  //Assuming remoteStreams and remoteVideos are class properties initialized as empty arrays
/* async startWebcam(){
  let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

  //push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    this.peerConnection.addTrack(track, localStream)
  })

  //remoteStream will be updated by the peerConnection itself
  this.peerConnection.ontrack = (event: RTCTrackEvent) => { 
    let remoteStream = new MediaStream();
    
    event.streams[0].getTracks().forEach((track: any) => {
      remoteStream.addTrack(track);
    })

    // Store remoteStream to the array
    this.remoteStreams.push(remoteStream);

    // Create new video element
    let remoteVideoElement = document.createElement('video');
    remoteVideoElement.srcObject = remoteStream;
    remoteVideoElement.autoplay = true;

    const container = document.querySelector('.videos');

    if(container!==null){
      // Append the video element to your page's DOM (let's say to a div with id "remoteVideos")
      container.appendChild(remoteVideoElement);
    }
    
    

    
    

    // Store remoteVideoElement to the array
    this.remoteVideos.push(remoteVideoElement);
  }

  const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
  videoElement.srcObject = localStream;
} 
 */
async call() {
  this.peerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
          this.offerCandidates.add(event.candidate.toJSON());
      }
  }

  const offerDescription = await this.peerConnection.createOffer();
  await this.peerConnection.setLocalDescription(offerDescription);

  const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
  }

  await this.callDoc.set({ offer });

  const dataPromise = new Promise<any>((resolve) => {
      const unsubscribe = this.callDoc.ref.onSnapshot((snapshot) => {
          const data = snapshot.data();
          if (!this.peerConnection.currentRemoteDescription && data?.answer) {
              unsubscribe();
              resolve(data);
          }
      });
  });

  const data = await dataPromise;

  const answerDescription = new RTCSessionDescription(data.answer);
  await this.peerConnection.setRemoteDescription(answerDescription);

  this.answerCandidates.ref.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              this.peerConnection.addIceCandidate(candidate);
          }
      });
  });
}

    async answer(){
      this.peerConnection.onicecandidate = (event: any) => {
        event.candidate && this.answerCandidates.add(event.candidate.toJSON())
      }

      let callData: any = {};

      this.callDoc.valueChanges().subscribe(async (data) => {
        callData = data;

        const offerDescription = callData.offer;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
      })

      

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      }

      await this.callDoc.update({answer});

      this.offerCandidates.ref.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          console.log(change)
          if (change.type === 'added'){
            let data = change.doc.data();
            this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    }
}
