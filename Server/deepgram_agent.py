import ast
from dotenv import load_dotenv
import os
import logging
from deepgram.utils import verboselogs
from datetime import datetime, timedelta
from io import BufferedReader
from deepgram import DeepgramClientOptions
import logging

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    StreamSource,
    PrerecordedOptions,
)
from fastapi.middleware.cors import CORSMiddleware
import base64
from pydub import AudioSegment
from pydub.playback import play
from fastapi import FastAPI
from pydantic import BaseModel

# Load environment variables
load_dotenv()

class Message(BaseModel):
    message: str




def decode_blob_to_wav(blob_data, output_file):
    base64_audio = blob_data

    # Decode the base64 string
    audio_data = base64.b64decode(base64_audio)

    # Save the decoded data to a .wav file

    with open(output_file, "wb") as f:
        f.write(audio_data)
        f.close()

    print(f"Audio saved to {output_file}")

    


# Example usage:


def get_data():
    try:
        config = DeepgramClientOptions(
            verbose=verboselogs.SPAM,
        )
        deepgram = DeepgramClient(os.getenv('DEEPGRAM_API_KEY'), config)


        with open("output.wav", "rb") as stream:
            payload: StreamSource = {
                "stream": stream,
            }
            options = PrerecordedOptions(
                model="nova-2",
            )
            response = deepgram.listen.rest.v("1").transcribe_file(payload, options)


            print("Response received:")
            
            data = ast.literal_eval(response.to_json(indent=4))

            
            if isinstance(data, dict):
                transcript = data.get('results', {}).get('channels', [{}])[0].get('alternatives', [{}])[0].get('transcript', '')
                if transcript:
                    return str(transcript) 
                else:
                    print("No transcription available.")
            else:
                print("Unexpected response format.")

    except Exception as e:
        return -1

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # React default port
    "http://localhost:3003",  # Alternative React port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3003",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)










async def speech_to_text(msg: Message):
    blobObj = msg.message
    print(blobObj)
    decode_blob_to_wav(blobObj, "output.wav")
    data = get_data()
    
    return data
    

if __name__ == "__main__":
    import uvicorn
    print("......DeepGram Server")
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('DEEPGRAM_SERVER_PORT', 3002)))

    
    



    
    







