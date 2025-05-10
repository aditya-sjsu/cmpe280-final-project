# Importing necessary libraries
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepgram_agent import speech_to_text, Message as DeepGramMessage
from gemini_agent import handle_message, Message as GeminiMessage
from lmnt_agent import handle_text_to_speech, Message as LMNTMessage
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

@app.post('/deepgram')
async def run_deepGram(msg: DeepGramMessage):
    data = await speech_to_text(msg)
    return data

@app.post('/gemini')
async def run_gemini(msg: GeminiMessage):
    data = await handle_message(msg)
    return data

@app.post('/lmnt')
async def run_LMNT(msg: LMNTMessage):
    data = await handle_text_to_speech(msg)
    return data

if __name__ == "__main__":
    import uvicorn
    print("......Main Server")
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('MAIN_SERVER_PORT', 8000)))