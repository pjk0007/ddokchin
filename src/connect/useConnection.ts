import { useEffect, useState, useCallback } from 'react';
import { fns, configureData } from './fns';

export default function useConnection() {
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isActive, setIsActive] = useState(false);

  const on = useCallback(() => {
    if (isActive) return; // Prevent multiple activations
    const peer = new RTCPeerConnection();
    const channel = peer.createDataChannel('response');
    setPeerConnection(peer);
    setDataChannel(channel);

    peer.ontrack = (event) => {
      const el = document.createElement('audio');
      document.body.appendChild(el);
      el.style.display = 'none';
      el.srcObject = event.streams[0];
      el.autoplay = el.controls = true;
    };

    channel.addEventListener('open', () => {
      console.log('Data channel is open');
      configureData(channel);
    });

    channel.addEventListener('message', async (ev) => {
      const msg = JSON.parse(ev.data);
      console.log('Received message', msg);

      if (msg.type === 'response.function_call_arguments.done') {
        const fn = fns[msg.name];
        if (fn) {
          console.log(
            `Calling local function ${msg.name} with ${msg.arguments}`
          );
          const args = JSON.parse(msg.arguments);
          const result = await fn(args);

          // Send response back through the data channel
          const event = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result),
            },
          };
          channel.send(JSON.stringify(event));
        }
      }
    });

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      stream
        .getTracks()
        .forEach((track) =>
          peer.addTransceiver(track, { direction: 'sendrecv' })
        );

      peer
        .createOffer()
        .then((offer) => {
          peer.setLocalDescription(offer);

          fetch(`${process.env.REACT_APP_SERVER_URL}/rtc-connect`, {
            method: 'POST',
            body: offer.sdp,
            headers: {
              'Content-Type': 'application/sdp',
              'server-secret': process.env.REACT_APP_SERVER_SECRET ?? '',
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(res.statusText);
              }
              return res.text();
            })
            .then((answer) => {
              peer.setRemoteDescription({
                sdp: answer,
                type: 'answer',
              });
            })
            .catch((error) => {
              alert(error);
              setIsActive(false);
            });
        })
        .catch((error) => {
          alert(error);
          setIsActive(false);
        });
    });

    setIsActive(true);
  }, [isActive]);

  const off = useCallback(() => {
    if (!isActive) return; // Prevent multiple deactivations
    if (dataChannel) {
      dataChannel.close();
      setDataChannel(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsActive(false);
    console.log('Connection is closed');
  }, [isActive, dataChannel, peerConnection]);

  useEffect(() => {
    return () => {
      off(); // Clean up on component unmount
    };
  }, [off]);

  return { dataChannel, isActive, on, off };
}
