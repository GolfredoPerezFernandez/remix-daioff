import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { FaTrash, FaPaperclip, FaMicrophoneSlash, FaMicrophone } from 'react-icons/fa';
import DID_API from './api.json';
import { LoaderFunction } from "@remix-run/node";
import { getUserProfile } from "~/utils/queries.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userProfile = await getUserProfile(request);
  return json({
    userProfile,
    ENV: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    },
  });
};

export default function Assistant() {
  const { userProfile, ENV } = useLoaderData();
  const API_BASE_URL = ENV.API_BASE_URL;

  const fetcher = useFetcher();
  let peerConnection: any;
  let sessionClientAnswer: any;
  let statsIntervalId: any;
  let videoIsPlaying: any;
  let lastBytesReceived: any;
  let streamId = '';
  let sessionId = '';

  const [connected, setConnected] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState([{ role: 'assistant', content: 'Bienvenido al asistente legal laboral de España.' }]);
  const [userInput, setUserInput] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('convenios');
  const [vectorID, setVectorID] = useState('');
  const [newStreamId, setNewStream] = useState("");
  const [newSessionId, setNewSessionId] = useState("");
  const [muteVideo, setMuteVideo] = useState(false);

  const experts = [
    { value: 'seguridadSocial', label: 'Seguridad Social' },
    { value: 'trabajoAutonomo', label: 'Trabajo Autónomo' },
    { value: 'convenios', label: 'Convenios' },
    { value: 'jubilacion', label: 'Jubilación' },
    { value: 'salarios', label: 'Salarios' },
    { value: 'deberesDerechos', label: 'Derechos y Deberes' },
    { value: 'constitucionEspanola', label: 'Constitución Española' },
    { value: 'suspensionesDespidos', label: 'Suspensiones y Despidos' },
    { value: 'derechoTributario', label: 'Derecho Tributario' },
    { value: 'representacionTrabajadores', label: 'Representación de Trabajadores' }
  ];

  const expertIds = {
    seguridadSocial: "asst_TQVFirGoqMQIvaAjHgZDqDPK",
    trabajoAutonomo: "asst_APiNNWRn8V9Rl6GS4UJCujna",
    convenios: "asst_DoBIPo3N64BoPC63Ms6TNaU2",
    jubilacion: "asst_L20k2Jv4k6OEtHW3n5EyckRb",
    salarios: "asst_chEufrNqQdRMxXaZteXTuzb6",
    deberesDerechos: "asst_Wr2AjzojUjhRRSKHgcvV5q4i",
    constitucionEspanola: "asst_2sWQtH5LsP0pNloixbWIxxRA",
    derechoTributario: "asst_kLPnMxHhKxYkh2zAGuly10GL",
    suspensionesDespidos: "asst_UVEVnc4duCVpoGq0pp3V2kG7",
    representacionTrabajadores: "asst_8pQq8XTbKv7LURqXqmvCFEDB"
  };

  const handleExpertChange = async (event: any) => {
    const value = event.target.value;
    setSelectedExpert(value);

    const userCommunity = userProfile.community;
    let newVectorID = "vs_ESSFTv5fLrkhlceR9srzKVI3";

    if (value === "convenios") {
      switch (userCommunity) {
        case "Aragón":
          newVectorID = "asst_SzWrRCaCC7woGYrWLhtbReAL";
          break;
        case "Extremadura":
          newVectorID = "vs_ESSFTv5fLrkhlceR9srzKVI3";
          break;
        case "Comunidad de Madrid":
          newVectorID = "asst_RHpDTvU7VbdfGdS2papFOKcG";
          break;
        case "La Rioja":
          newVectorID = "vs_qrUs690uDfjvCUobt7sq2ebg";
          break;
        case "Canarias":
          newVectorID = "vs_epziJroUC8KeP2KAR7DglcP0";
          break;
        case "Comunidad Valenciana":
          newVectorID = "vs_UdX9eRcu7ugzZMzMBqICDUfR";
          break;
        case "Islas Baleares":
          newVectorID = "vs_ODXtxEZ5A3hOxpuQRjTnt0po";
          break;
        case "Cantabria":
          newVectorID = "vs_mIjY5Z4U6jBE5V1k9t9Q9mBR";
          break;
        case "Castilla La Mancha":
          newVectorID = "vs_VgQFQ2ioUtLcpuy7h5ZfUI3Q";
          break;
        default:
          newVectorID = "vs_ESSFTv5fLrkhlceR9srzKVI3";
          break;
      }
    }

    setVectorID(newVectorID);
  };

  const maxRetryCount = 3;
  const maxDelaySec = 4;

  async function fetchWithRetries(url: string, options: RequestInit, retries = 3): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status === 429) {
        throw new Error(`Too Many Requests: ${response.status}`);
      }
      return response;
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error: ${err}`);
        return fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. Error: ${err}`);
      }
    }
  }

  const liveResponse = useEventSource(`${API_BASE_URL}/subscribe`, { event: "new-message" });

  function stopAllStreams() {
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement && videoElement.srcObject) {
      (videoElement.srcObject as MediaStream).getTracks().forEach((track: any) => track.stop());
      videoElement.srcObject = null;
    }
  }

  function closePC(pc = peerConnection) {
    if (!pc) return;
    pc.close();
    pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    pc.removeEventListener('icecandidate', onIceCandidate, true);
    pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
    pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
    pc.removeEventListener('track', onTrack, true);
    clearInterval(statsIntervalId);
    console.log('stopped peer connection');
    if (pc === peerConnection) {
      peerConnection = null;
    }
  }

  function onIceGatheringStateChange() {
    // Implementar lógica si es necesario
  }

  function onIceCandidate(event: any) {
    console.log('onIceCandidate', event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: sessionId,
        }),
      });
    }
  }

  function setVideoElement(stream: any) {
    if (!stream) return;
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = stream;
      videoElement.loop = false;
      videoElement.muted = muteVideo;
      videoElement.play().catch(e => {
        console.error('Error auto-playing video:', e);
      });
    }
  }

  function playIdleVideo() {
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.src = 'https://res.cloudinary.com/dug5cohaj/video/upload/v1715359344/uuhctl9z96dea222j08b.mp4';
      videoElement.loop = true;
      videoElement.muted = muteVideo;
      videoElement.play().catch(e => {
        console.error('Error playing idle video:', e);
      });
    }
  }

  function onIceConnectionStateChange() {
    if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
      stopAllStreams();
      closePC();
    }
  }

  function onConnectionStateChange() {
    // Implementar lógica si es necesario
  }

  function onSignalingStateChange() {
    // Implementar lógica si es necesario
  }

  function onVideoStatusChange(videoIsPlaying: any, stream: any) {
    let status;
    if (videoIsPlaying) {
      status = 'streaming';
      console.log("streaming");
      const remoteStream = stream;
      setVideoElement(remoteStream);
    } else {
      status = 'empty';
      playIdleVideo();
    }
  }

  function onTrack(event: any) {
    if (!event.track) return;

    statsIntervalId = setInterval(async () => {
      const stats = await peerConnection.getStats(event.track);
      let videoIsPlayingUpdated = false;
      stats.forEach((report: any) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          if (videoIsPlaying !== (report.bytesReceived > lastBytesReceived)) {
            videoIsPlaying = report.bytesReceived > lastBytesReceived;
            videoIsPlayingUpdated = true;
          }
          lastBytesReceived = report.bytesReceived;
        }
      });
      if (videoIsPlayingUpdated) {
        onVideoStatusChange(videoIsPlaying, event.streams[0]);
      }
    }, 500);
  }

  async function createPeerConnection(offer: any, iceServers: any) {
    if (!peerConnection) {
      const RTCPeerConnection: any = (
        window.RTCPeerConnection ||
        window.RTCPeerConnection
      ).bind(window);

      peerConnection = new RTCPeerConnection({ iceServers });
      peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
      peerConnection.addEventListener('icecandidate', onIceCandidate, true);
      peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
      peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
      peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
      peerConnection.addEventListener('track', onTrack, true);
    }

    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');

    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log('create local sdp OK');

    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');

    return sessionClientAnswer;
  }

  useEffect(() => {
    async function connectionInit() {
      if (peerConnection && peerConnection.connectionState === 'connected') {
        setConnected(true);
        return;
      }
      setIniciando(true);

      stopAllStreams();
      closePC();

      try {
        const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_url: "https://i.postimg.cc/fLdQq0DW/thumbnail.jpg",
          }),
        });

        const { id: newStreamId, offer, ice_servers: iceServers, session_id: newsessionId } = await sessionResponse.json();
        streamId = newStreamId;
        sessionId = newsessionId;
        setNewStream(newStreamId);
        setNewSessionId(newsessionId);
        sessionClientAnswer = await createPeerConnection(offer, iceServers);
        setConnected(true);
        setIniciando(false);

      } catch (e) {
        console.log('error during streaming setup', e);
        stopAllStreams();
        closePC();
        setConnected(false);
        setIniciando(false);
        return;
      }

      await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`, {
        method: 'POST',
        headers: { Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: sessionClientAnswer, session_id: sessionId })
      });
    }

    connectionInit();
  }, []);

  useEffect(() => {
    if (liveResponse) {
      const message = JSON.parse(liveResponse);
      setHistory((prev) => {
        if (prev[prev.length - 1]?.role === 'assistant') {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = message;
          return updatedHistory;
        } else {
          return [...prev, message];
        }
      });
    }
  }, [liveResponse]);

  const handleUserMessage = (event: any) => {
    setUserInput(event.target.value);
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data.response) {
      const responseText = fetcher.data.response || "Respuesta no disponible";
      sendResponseToDID(responseText);
      setLoading(false);
    }

    async function sendResponseToDID(responseText: string) {
      let providerList = { type: 'microsoft', voice_id: 'es-ES-AbrilNeural' };
      try {
        const talkResponse = await fetch(`${DID_API.url}/talks/streams/${newStreamId}`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${DID_API.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: newSessionId,
            script: {
              type: 'text',
              subtitles: 'false',
              provider: providerList,
              ssml: false,
              input: responseText
            },
            config: {
              fluent: true,
              pad_audio: 0,
              driver_expressions: {
                expressions: [{ expression: 'neutral', start_frame: 0, intensity: 0 }],
                transition_frames: 0
              },
              align_driver: true,
              align_expand_factor: 0,
              auto_match: true,
              motion_factor: 0,
              normalization_factor: 0,
              sharpen: true,
              stitch: true,
              result_format: 'mp4'
            },
            'driver_url': 'bank://lively/',
            'config': {
              'stitch': true,
            }
          })
        });
        console.log("talkResponse ", await talkResponse.json());
      } catch (error) {
        console.error("Error while sending response to DID API: ", error);
        setLoading(false);
      }
    }
  }, [fetcher.data]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (trimmedInput !== '') {
      setHistory((prev) => [...prev, { role: 'user', content: trimmedInput }]);
      setLoading(true);

      const formData = new FormData();
      formData.append('messages', trimmedInput);
      formData.append('assistantID', expertIds[selectedExpert] || expertIds['convenios']);
      formData.append('vectorID', vectorID || "vs_ESSFTv5fLrkhlceR9srzKVI3");
      if (file) {
        formData.append('file', file);
      }

      fetcher.submit(formData, { method: "post", encType: "multipart/form-data", action: `/api/chatgpt` });

      setFile(null);
      setUserInput('');
      setFilePreview(null);
      setFileName('');
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFilePreview(URL.createObjectURL(file));
      setFileName(file.name);
    }
  };

  const handleKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDeleteThread = async () => {
    try {
      const response = await fetch("/api/delete-thread", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        setHistory([{ role: 'assistant', content: 'Bienvenido al asistente legal laboral de España.' }]);
      } else {
        console.error('Failed to delete thread:', result.error);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const toggleMuteVideo = () => {
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setMuteVideo(videoElement.muted);
    }
  };

  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="py-10 lg:py-14">
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl dark:text-white">
            Bienvenido a DAIOFF
          </h1>
          <p className="mt-3 text-black dark:text-neutral-400">
            Tu asesor laboral
          </p>
        </div>
        <ul className="mt-16 space-y-5 pl-10 pr-10 pb-32">
          {history.map((message, index) => (
            <li key={index} className={`max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4 ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-100'} rounded-lg`}>
              <svg className="flex-shrink-0 w-[2.375rem] h-[2.375rem] rounded-full" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="38" height="38" rx="6" fill="#2563EB" />
                <path d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25" stroke="white" strokeWidth="1.5" />
                <path d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25" stroke="white" strokeWidth="1.5" />
                <ellipse cx="19" cy="18.6554" rx="3.75" ry="3.6" fill="white" />
              </svg>
              <div className="grow mt-2 space-y-3">
                <p className={`text-${message.role === 'assistant' ? 'blue' : 'gray'}-800 dark:text-neutral-200`}>{message.content.split('\n').map((line, idx) => (
                  <span key={idx} className="block">{line}</span>
                ))}</p>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>
      <footer className="max-w-4xl mx-auto fixed bottom-0 left-0 right-0 z-10 p-0 sm:py-6">
        <div className="relative flex justify-end items-end gap-4 lg:pl-48">
          <video id="talk-video" width="150px" height="150px" autoPlay={true} muted={muteVideo} className="flex-shrink-0 bg-gray-200 rounded-md dark:bg-neutral-700"></video>
        
          <div className="flex-1 flex flex-col">
            <textarea
              value={userInput}
              onChange={handleUserMessage}
              onKeyUp={handleKeyUp}
              className="p-4 pb-12 block w-full bg-gray-100 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              placeholder="Ask me anything..."
              disabled={isLoading}
            ></textarea>
            <div className="flex justify-between mt-1 gap-2">
              {filePreview && fileName === "code.txt" && (
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                  <FaPaperclip className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-700">{fileName}</span>
                  <button
                    onClick={() => {
                      setFilePreview(null);
                      setFileName('');
                      setFile(null);
                    }}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}
        <label htmlFor="file-input" className="inline-flex items-center justify-center p-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-200 focus:outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 cursor-pointer" style={{width: "200px", height: "50px", overflow: "hidden"}}>
  <span className="mr-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  </span>
  {file ? (file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name) : 'Adjuntar archivo'}
</label>
<input
  id="file-input"
  type="file"
  onChange={handleFileChange}
  className="hidden" 
  disabled={isLoading}
/>

           
              <button onClick={toggleMuteVideo}                 className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
            {muteVideo ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
              <button
                onClick={handleDeleteThread}
                type="button"
                id="delete-thread-button"
                className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-white bg-red-600 hover:bg-red-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isLoading}
              >
                <FaTrash className="w-5 h-5" />
              </button>
              <div className="flex justify-end mb-0 sm:mb-3 max-w-xs mx-auto">
                
                <select
                  id="expert-select"
                  value={selectedExpert}
                  onChange={handleExpertChange}
                  className="py-0 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  disabled={isLoading}
                >
                  <option value="" disabled>Experto en</option>
                  {experts.map(expert => (
                    <option key={expert.value} value={expert.value}>{expert.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSendMessage}
                type="button"
                id="talk-button"
                className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a7 7 0 1 1-6.995 6.783L1 8h1a6 6 0 1 0 .217-4.434l.896.896L3.5 2.5 1.354.354l-.708.708 1.646 1.646-.896-.896A7.002 7.002 0 0 1 8 1z" />
                  </svg>
                ) : (
                  <svg
                    className="flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                  </svg>
                )}
              </button>
             
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
