from lmnt.api import Speech
import base64
from pydub import AudioSegment
import playsound
from pydub.playback import play
import ast
from fastapi import FastAPI
from pydantic import BaseModel
import os

LMNT_API_KEY = '0b1e2b895ece4fc8a3a70c1bc2d574b2'  


class Message(BaseModel):
    message: list[str]



def play_output(subfile):
    song = AudioSegment.from_wav(subfile)
    play(song)

def encode_wav_to_base64(wav_file_path):
    with open(wav_file_path, "rb") as wav_file:
        wav_data = wav_file.read()
        return base64.b64encode(wav_data).decode('utf-8')


app = FastAPI()



@app.post('/lmnt')
async def handle_text_to_speech(msg: Message):
    count = 0
    baseList = []
    async with Speech('0b1e2b895ece4fc8a3a70c1bc2d574b2') as speech:
        for sentences in msg.message:
            if not sentences.strip():
                continue  # Skip empty or whitespace-only strings
            synthesis = await speech.synthesize(sentences, voice='lily', format='wav')
            with open(f'output{count}.wav', 'wb') as f:
                f.write(synthesis['audio'])
                baseList.append(encode_wav_to_base64(f'output{count}.wav'))
                f.close()
                os.remove(f'output{count}.wav')
                count += 1
    return baseList
        




if __name__ == "__main__":
    import uvicorn
    print("......LMNT Server")
    uvicorn.run(app, host="0.0.0.0", port=3001)
