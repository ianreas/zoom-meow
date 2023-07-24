import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {DocumentSnapshot} from 'firebase/firestore';
import {ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-roomfire',
  templateUrl: './roomfire.component.html',
  styleUrls: ['./roomfire.component.css']
})
export class RoomfireComponent  implements OnInit{
  private peerConnection: RTCPeerConnection;
  private callDoc: AngularFirestoreDocument<any>;
  private offerCandidates: AngularFirestoreCollection<any>;
  private answerCandidates: AngularFirestoreCollection<any>;
  roomId: string;

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
      icreServers: [
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

  async call(){
    this.peerConnection.onicecandidate = (event: any) => {
      event.candidate && this.offerCandidates.add(event.candidate.toJSON())
    }

    const offerDescription = await this.peerConnection.createOffer(); 
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    }

      //references
      //const callDoc = this.firestore.collection('calls').doc();
      


      await this.callDoc.set({offer}) //callDoc.set({offer}) 


      //listen for remote answer
      this.callDoc.ref.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!this.peerConnection.currentRemoteDescription && data?.answer){
          const answerDescription = new RTCSessionDescription(data.answer);
          this.peerConnection.setRemoteDescription(answerDescription) //when the answer is received we update the peer connection
        }
      })

      //when answered, add candidate to the peer connection
      this.answerCandidates.ref.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added'){
            const candidate = new RTCIceCandidate(change.doc.data());
            this.peerConnection.addIceCandidate(candidate);
          }
        })
      })
      
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


