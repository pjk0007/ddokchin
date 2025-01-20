import { useEffect, useState, useCallback, Dispatch } from 'react';
import { fns, configureData } from './fns';

export default function useConnection() {
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [totalInputTextTokens, setTotalInputTextTokens] = useState(0);
  const [totalInputAudioTokens, setTotalInputAudioTokens] = useState(0);
  const [totalCacheTokens, setTotalCacheTokens] = useState(0);
  const [totalOutputTextTokens, setTotalOutputTextTokens] = useState(0);
  const [totalOutputAudioTokens, setTotalOutputAudioTokens] = useState(0);

  const [recentInputTextTokens, setRecentInputTextTokens] = useState(0);
  const [recentInputAudioTokens, setRecentInputAudioTokens] = useState(0);
  const [recentCacheTokens, setRecentCacheTokens] = useState(0);
  const [recentOutputTextTokens, setRecentOutputTextTokens] = useState(0);
  const [recentOutputAudioTokens, setRecentOutputAudioTokens] = useState(0);

  const on = useCallback(
    (setLoading: Dispatch<React.SetStateAction<boolean>>) => {
      if (isActive) return; // Prevent multiple activations
      setLoading(true);
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

        if (msg.type === 'response.done') {
          const { input_token_details, output_token_details } =
            msg.response.usage;
          setTotalInputTextTokens(
            (prev) => prev + input_token_details.text_tokens
          );
          setTotalInputAudioTokens(
            (prev) => prev + input_token_details.audio_tokens
          );
          setTotalCacheTokens(
            (prev) => prev + input_token_details.cached_tokens
          );
          setTotalOutputTextTokens(
            (prev) => prev + output_token_details.text_tokens
          );
          setTotalOutputAudioTokens(
            (prev) => prev + output_token_details.audio_tokens
          );

          setRecentInputTextTokens(input_token_details.text_tokens);
          setRecentInputAudioTokens(input_token_details.audio_tokens);
          setRecentCacheTokens(input_token_details.cached_tokens);
          setRecentOutputTextTokens(output_token_details.text_tokens);
          setRecentOutputAudioTokens(output_token_details.audio_tokens);
        }

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
                peer
                  .setRemoteDescription({
                    sdp: answer,
                    type: 'answer',
                  })
                  .then(() => {
                    setIsLoading(false);
                    setIsActive(true);
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
    },
    [isActive]
  );

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

  return {
    isLoading,
    setIsLoading,
    dataChannel,
    isActive,
    on,
    off,
    totalInputTextTokens,
    totalInputAudioTokens,
    totalCacheTokens,
    totalOutputTextTokens,
    totalOutputAudioTokens,
    recentInputTextTokens,
    recentInputAudioTokens,
    recentCacheTokens,
    recentOutputTextTokens,
    recentOutputAudioTokens,
  };
}
