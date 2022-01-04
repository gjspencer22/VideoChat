import './style.css'

console.log('aye')
import firebase from 'firebase/app';
import 'firebase/firestore';
console.log("ELLO")

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyAI41IeCY1yLDWkZvEabSfsesuIgMILjjE",

  authDomain: "video-chat-46631.firebaseapp.com",

  projectId: "video-chat-46631",

  storageBucket: "video-chat-46631.appspot.com",

  messagingSenderId: "466173515901",

  appId: "1:466173515901:web:6fc67238329461292b3914",

  measurementId: "G-C1NXKJSM8D"

};

if (!firebase.getApps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const webcamButton = document.getElementById('webcamButton')
const createCallButton = document.getElementById('createCallButton')
const answerCallButton = document.getElementById('answerCallButton')
const webcamVideo = document.getElementById('webcamVideo')
const remoteVideo = document.getElementById('remoteVideo')





webcamButton.onclick = async() => {
  console.log('oy')
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  createCallButton.disabled = false;
  answerCallButton.disabled = false;
  webcamButton.disabled = true;
};


createCallButton.onclick = async () => {
  const callDoc = firestore.collection('calls').doc();
  const offerCadidates = callDoc.collection('offerCadidates');
  const answerCadidates = callDoc.collection('answerCandidates')

  callInput.value = callDoc.id;

  pc.onicecandidate = event => {
    event.canidate && offerCadidates.add(event.canidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await callDoc.set({ offer });

  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  answerCandidates.onSnapshot(snapshot => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};


answerCallButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  pc.onicecandidate = event => {
    event.candidate && answerCandidates.add(event.canidate.toJSON());
  };
  const callData = (await callDoc.get()).data();

  const offerDesctiption = callData.offer;
  await pc.setRemoteDescription(new TRCSessionDescription(offerDesctiption));

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change) 
      if(change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new TRCIceCandidate(data));
      }
    });
  });
};


