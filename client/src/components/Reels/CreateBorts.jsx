
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaMusic, FaMagic, FaVideo, FaStop, FaClock, FaTachometerAlt, FaColumns } from 'react-icons/fa';
import './createBorts.scss';

const CreateBorts = () => {
  const webcamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = () => {
    if (!webcamRef.current.stream) return;

    setIsRecording(true);
    const stream = webcamRef.current.stream;
    const newMediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    newMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    newMediaRecorder.onstop = () => {
      setVideoChunks(chunks);
    };

    newMediaRecorder.start();
    setMediaRecorder(newMediaRecorder);
  };
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (webcamRef.current) {
      webcamRef.current.audio = false; 
    }
  }, []);

  return (
    <div className="create-borts">
      {/* Camera Feed */}
      <div className="camera-feed">
        <Webcam
          ref={webcamRef}
          audio={false} // Mute audio
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'user',
          }}
          className="webcam-view"
        />
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <button className="option-button">
          <FaMusic /> <span>Audio</span>
        </button>
        <button className="option-button">
          <FaMagic /> <span>Effects</span>
        </button>
        <button className="option-button">
          <FaVideo /> <span>Green Screen</span>
        </button>
        <button className="option-button">
          <FaClock /> <span>Length</span>
        </button>
        <button className="option-button">
          <FaTachometerAlt /> <span>Speed</span>
        </button>
        <button className="option-button">
          <FaColumns /> <span>Video Layout</span>
        </button>
      </div>

      {/* Record Button */}
      <div className="record-controls">
        {isRecording ? (
          <button onClick={stopRecording} className="record-button stop">
            <FaStop />
          </button>
        ) : (
          <button onClick={startRecording} className="record-button start">
            Record
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateBorts;
