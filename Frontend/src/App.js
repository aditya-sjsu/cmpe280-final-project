import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import './App.css';
import './css/homePage.css'
import { isVisible } from "@testing-library/user-event/dist/utils";


const App = () => {
  const [inputText, setInputText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [storyText, setStoryText] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioSrc, setAudioSrc] = useState([]); // Store decoded audio URL
  const [isRecording, setIsRecording] = useState(false); // Track if the mic is recording
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]); // To store audio data
  const [readyState, setreadyState] = useState(false)
  const [isMainVisible, setisMainVisible] = useState(true)


  const images = [
    '/images/7.png',
    '/images/8.png',
    '/images/9.png',
  ];

  useEffect(() => {
    // Set up the interval to switch the image every 5 seconds (5000 ms)
    const intervalId = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [images.length]);

  const BASE_API = "http://localhost:8000"



  // const handleNext = () => {
  //   if (!isAnimating) {
  //     setIsAnimating(true);
  //     setTimeout(() => {
  //       setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  //       setIsAnimating(false);
  //     }, 500); // Duration of the animation
  //   }
  // };

  // const handlePrevious = () => {
  //   if (!isAnimating) {
  //     setIsAnimating(true);
  //     setTimeout(() => {
  //       setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  //       setIsAnimating(false);
  //     }, 500); // Duration of the animation
  //   }
  // };

  const handleRecord = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop(); // Stop recording
      setIsRecording(false);
    } else {
      // Request audio access from the user
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunks.current = [];

        // Store the data in chunks
        mediaRecorder.ondataavailable = (e) => {
          chunks.current.push(e.data);
        };

        // When the recording stops
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: "audio/wav" });
          sendAudioToAPI(blob);
          setIsRecording(false)
          mediaRecorder.stop()
        };

        mediaRecorder.start();
        setIsRecording(true); // Update state to show that we are recording
      });
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Extract Base64 string without MIME type
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
        audio.onended = playNext;
        audio.play();
        idx++;
      }
    };
    playNext();
  };

  const submitRequest = (textToSend) => {
    if (textToSend) {
      axios.post(BASE_API + "/gemini", { "message": String(textToSend) }).then((resGemi) => {
        setStoryText(resGemi.data);
        axios.post(BASE_API + "/lmnt", { "message": resGemi.data }).then((resLMNT) => {
          const urls = resLMNT.data
            .map(decodeBase64Audio)
            .filter(Boolean); // Only valid URLs
          setAudioSrc(urls);
          setreadyState(true);
          handleStory(urls);
          alert("Story Generated");
        }).catch(e => alert(e));
      });
    }
  };

  // Function to send the recorded audio blob to an API endpoint
  const sendAudioToAPI = (audioBlob) => {
    convertBlobToBase64(audioBlob).then((base64) => {
      axios.post(BASE_API + "/deepgram", {
        "message": base64
      }).then((res) => {
        axios.post(BASE_API + "/gemini", { "message": res.data }).then((resGemi) => {
          setStoryText(resGemi.data);
          axios.post(BASE_API + "/lmnt", { "message": resGemi.data }).then((resLMNT) => {
            const urls = resLMNT.data
              .map(decodeBase64Audio)
              .filter(Boolean); // Only valid URLs
            setAudioSrc(urls);
            setreadyState(true);
            handleStory(urls);
            alert("Story Generated");
          }).catch(e => alert(e));
        });
      });
    });
  };
  const [text, setText] = useState('');
  const fullText = 'Hi, Excited for Story'; // The full text to be typed
  const typingSpeed = 100; // Speed in milliseconds

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, [images.length]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < fullText.length) {
        setText((prevText) => prevText + fullText.charAt(index)); // Add one character at a time
        index++;
      } else {
        clearInterval(intervalId); // Clear interval when done
      }
    }, []);

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  return (

    <div className="home-page">
      {
        isMainVisible &&
        <div className="home-first_page">
          <div className="typing-container">
            <h1 className="typing-text">{text}</h1>
          </div>
          <div className="greeting-page-container">
            <button className="mic-button" onClick={handleRecord}>
              {isRecording ? '🎤' : '🎙️'} {/* Show different icon when recording */} </button>
            <input type="text" onChange={(e) => setInputText(e.target.value)} placeholder="Enter the story description" />
            <button onClick={() => submitRequest(inputText)}>Submit</button>
          </div>
        </div>
      }
      {!isMainVisible &&
        <div className="story-container">
          <div className="story-partition">
            <div className="pictures-container">
              <img
                src={images[currentImageIndex]}
                alt={`Slide ${currentImageIndex}`}
                style={{
                  transition: 'opacity 1s ease-in-out',
                }}
              />
            </div>
            <div className="text-container">
              <p>{storyText}</p>
            </div>
          </div>
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter the Description for new Story"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={() => submitRequest(inputValue)}>Submit</button>
          </div>
        </div>
      }

    </div>
  );
};

export default App;




{/* <div className="app-container">
<header className="app-header">
  <h1>Welcome To Story World</h1>
  <div className="input-container">
    <input
      type="text"
      placeholder="Input text"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
    />
    <button className="mic-button" onClick={handleRecord}>
      {isRecording ? '🎙️' : '🎤'} {/* Show different icon when recording */}
//     </button>
//     <button onClick={submitRequest}>Submit</button>
//   </div>
// </header>
// <main className="app-main">
//   <div className="image-display-box">




//     <div className="main-page">
//       <div className={`image-display ${isAnimating ? 'animating' : ''}`}>
//         <img
//           className={`image ${isAnimating ? 'animating' : ''}`}
//           src={images[currentImage]}
//           alt="Carousel"
//         />
//       </div>
//       <div className="story-class">
//         {storyText}
//       </div>
//       <button className="prev-button" onClick={handlePrevious}>
//         &#10094;
//       </button>
//       <button className="next-button" onClick={handleNext}>
//         &#10095;
//       </button>
//     </div>
//   </div>
// </main>
