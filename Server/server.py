# Importing necessary libraries
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepgram_agent import speech_to_text, Message as DeepGramMessage
from gemini_agent import handle_message, Message as GeminiMessage
from lmnt_agent import handle_text_to_speech, Message as LMNTMessage



app = FastAPI()
origins = [
    "http://localhost:3000",
    # Add your frontend origins here
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
    print("......DeepGram Server")
    uvicorn.run(app, host="0.0.0.0", port=8000)