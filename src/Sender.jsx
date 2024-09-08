// Sender.jsx
import React, { useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5173');

const Sender = () => {
  const [username, setUsername] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const startCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;

      const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

      peer.on('signal', (data) => {
        socket.emit('callUser', { userToCall: username, signalData: data, from: socket.id });
      });

      peer.on('stream', (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });

      socket.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    });
  };

  const stopCall = () => {
    connectionRef.current.destroy();
    setCallAccepted(false);
  };

  return (
    <div>
      <input type="text" placeholder="Enter username to call" onChange={(e) => setUsername(e.target.value)} />
      <button onClick={startCall} style={{ backgroundColor: 'green', borderRadius: '50%' }}>Start Call</button>
      <button onClick={stopCall} style={{ backgroundColor: 'red', borderRadius: '50%' }}>Stop Call</button>
      <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
      <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
    </div>
  );
};

export default Sender;