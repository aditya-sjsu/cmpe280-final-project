# Importing necessary libraries
from fastapi import FastAPI
from pydantic import BaseModel

import google.generativeai as genai

import time

# gemini = agent.Agent(
#     name="Gemini",
#     endpoint="localhost",
#     port="8000"
# )

class Message(BaseModel):
    message: str



 

app = FastAPI()
genai.configure(api_key="AIzaSyAcl7_u9rWvhyKgO7dTRula5470WRhick0") 


model = genai.GenerativeModel("gemini-2.0-flash")


chat = model.start_chat(history=[])

inappropriate_words = [
    "violence", "kill", "murder", "blood", "gore", "death", 
    "drugs", "alcohol", "intoxicated", "gambling", 
    "sex", "nude", "porn", "prostitute", "abuse", "slavery", 
    "bomb", "terrorist", "gun", "knife", "suicide",
    "racism", "hate", "discrimination", "slur", 
    "curse", "swear", "damn", "hell", 
    "f***", "s***", "b****", "a**", "c***",
    "homophobic", "transphobic", "xenophobia", "misogyny"
]

print("Chat session has started. Type 'quit' to exit.")

def filter_inappropriate(text, inappropriate_words):
    words = text.split()
    for word in words:
        if word in inappropriate_words:
            return True



@app.post('/gemini')
async def handle_message(message: Message):
    while True:

        user_message = message.message


        if user_message.lower() == "quit":
            return -1


        response = chat.send_message(user_message, stream=True)


        full_response_text = []


        for chunk in response:
            full_response_text.append(str(chunk.text))

        return full_response_text



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

# @Gemini_agent.on_event("startup")
# async def address(ctx: Context):

#     ctx.logger.info(Gemini_agent.address)



# @Gemini_agent.on_message(model=Message)
# async def handle_query_response(ctx: Context, sender: str, msg: Message):

#     # message = await handle_message(msg.message)
#     print(ctx)
#     print(msg.message)
#     print("Bellow is type in gemini")
#     # print(type(message))
#     # ctx.logger.info(message)
#     # await ctx.send(LMNT_API_KEY, Message(message=str(message)))

# # @Gemini_agent.on_query(model=Message, replies={Response})
# # async def handle_query_api_response(ctx: Context, sender: str, msg: Message):

# #     try: 
# #         response = await handle_message(msg.message)
# #         print("Bellow is type in gemini")
# #         print(type(response))
# #         ctx.logger.info(response)
# #         await ctx.send(sender, Response(text=str(response)))
# #     except Exception:
# #         await ctx.send(sender, Response(text="fail"))


# @Gemini_agent.on_rest_post("/rest/post", Message, Response)
# async def handle_post(ctx: Context, req: Message) -> Response:
#     ctx.logger.info("Received POST request")
#     return Response(
#         text=f"Received: {req.message}",
#         agent_address=ctx.Gemini_agent.address,
#         timestamp=int(time.time()),
#     )
