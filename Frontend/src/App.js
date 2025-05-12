import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import './App.css';
import './css/homePage.css'
import { isVisible } from "@testing-library/user-event/dist/utils";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [storyText, setStoryText] = useState([]);
  const [storyParts, setStoryParts] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioSrc, setAudioSrc] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const [readyState, setreadyState] = useState(false)
  const [isMainVisible, setisMainVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const BASE_API = "http://localhost:8000"
  const CLIPDROP_API = "http://localhost:3004"

  useEffect(() => {
    if (generatedImages.length > 0 && storyParts.length > 0 && audioDuration > 0) {
      // Calculate total characters in all parts
      const totalChars = storyParts.reduce((acc, part) => acc + part.length, 0);
      let currentTime = 0;
      
      const intervals = storyParts.map((part, index) => {
        // Calculate characters in this part
        const partChars = part.length;
        // Calculate duration based on character proportion
        const duration = (partChars / totalChars) * audioDuration * 1000; // Convert to milliseconds
        currentTime += duration;
        
        return setTimeout(() => {
          setCurrentImage(index);
        }, currentTime);
      });

      // Set initial image
      setCurrentImage(0);

      return () => {
        intervals.forEach(clearTimeout);
      };
    }
  }, [generatedImages.length, storyParts, audioDuration]);

  const generateImagesForStory = async (parts) => {
    setIsLoading(true);
    const images = [];
    for (const part of parts) {
      try {
        const response = await axios.post(CLIPDROP_API + "/clipdrop", {
          message: part
        });
        if (response.data.image) {
          images.push(`data:image/png;base64,${response.data.image}`);
        }
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
    setGeneratedImages(images);
    setIsLoading(false);
  };

  const handleRecord = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunks.current = [];

        mediaRecorder.ondataavailable = (e) => {
          chunks.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: "audio/wav" });
          sendAudioToAPI(blob);
          setIsRecording(false)
          mediaRecorder.stop()
        };

        mediaRecorder.start();
        setIsRecording(true);
      });
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  const decodeBase64Audio = (base64String) => {
    if (!base64String) return null;
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const handleStory = (urls) => {
    setisMainVisible(false);
    let idx = 0;
    const playNext = () => {
      if (idx < urls.length) {
        const audio = new Audio(urls[idx]);
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration);
        });
        audio.onended = playNext;
        audio.play();
        idx++;
      }
    };
    playNext();
  };

  const submitRequest = async (textToSend) => {
    if (textToSend) {
      try {
        setIsGenerating(true);
        const resGemi = await axios.post(BASE_API + "/gemini", { "message": String(textToSend) });
        setStoryText(resGemi.data.full_text);
        setStoryParts(resGemi.data.story_parts);
        
        // Generate images for each story part
        await generateImagesForStory(resGemi.data.story_parts);

        const resLMNT = await axios.post(BASE_API + "/lmnt", { "message": [resGemi.data.full_text] });
        const urls = resLMNT.data
          .map(decodeBase64Audio)
          .filter(Boolean);
        setAudioSrc(urls);
        setreadyState(true);
        handleStory(urls);
        setIsGenerating(false);
        alert("Story Generated");
      } catch (e) {
        setIsGenerating(false);
        alert(e);
      }
    }
  };

  const sendAudioToAPI = async (audioBlob) => {
    try {
      setIsGenerating(true);
      const base64 = await convertBlobToBase64(audioBlob);
      const res = await axios.post(BASE_API + "/deepgram", { "message": base64 });
      const resGemi = await axios.post(BASE_API + "/gemini", { "message": res.data });
      
      setStoryText(resGemi.data.full_text);
      setStoryParts(resGemi.data.story_parts);
      
      // Generate images for each story part
      await generateImagesForStory(resGemi.data.story_parts);

      const resLMNT = await axios.post(BASE_API + "/lmnt", { "message": [resGemi.data.full_text] });
      const urls = resLMNT.data
        .map(decodeBase64Audio)
        .filter(Boolean);
      setAudioSrc(urls);
      setreadyState(true);
      handleStory(urls);
      setIsGenerating(false);
      alert("Story Generated");
    } catch (e) {
      setIsGenerating(false);
      alert(e);
    }
  };

  return (
    <div className="home-page">
      {isMainVisible && (
        <div className="home-first_page">
          <div className="typing-container">
            <h1 className="typing-text">Hi, Excited for Story</h1>
          </div>
          <div className="greeting-page-container">
            {isGenerating ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Generating your story...</p>
              </div>
            ) : (
              <>
                <button className="mic-button" onClick={handleRecord}>
                  {isRecording ? '🎤' : '🎙️'}
                </button>
                <input 
                  type="text" 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Enter the story description" 
                />
                <button onClick={() => submitRequest(inputText)}>Submit</button>
              </>
            )}
          </div>
        </div>
      )}
      {!isMainVisible && (
        <div className="story-container">
          <div className="story-partition">
            <div className="pictures-container">
              {isGenerating ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Generating your story...</p>
                </div>
              ) : isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Generating images...</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <img
                  src={generatedImages[currentImage]}
                  alt={`Story part ${currentImage + 1}`}
                  style={{
                    transition: 'opacity 1s ease-in-out',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div>No images available</div>
              )}
            </div>
            <div className="text-container">
              <p>{storyText}</p>
            </div>
          </div>
          <div className="input-section">
            <button className="mic-button" onClick={handleRecord}>
              {isRecording ? '🎤' : '🎙️'}
            </button>
            <input
              type="text"
              placeholder="Enter the Description for new Story"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button onClick={() => submitRequest(inputText)}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;