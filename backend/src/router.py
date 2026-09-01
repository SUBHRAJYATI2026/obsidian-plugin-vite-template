from typing import cast, AsyncGenerator
from fastapi.responses import StreamingResponse
from fastapi.routing import APIRouter
from langchain_core.messages import SystemMessage
from langchain_core.messages.base import BaseMessage

from src.ai_agent import agent
from pydantic import BaseModel

router = APIRouter()


class MessageModel(BaseModel):
    query: str


async def streaming(text: str) -> AsyncGenerator[str, None]:
    """
    Stream the response token by token from the LLM as it is generated.
    ### Args:
    - **`text`**: The input prompt to send to the LLM.
    ### Yields:
    - **`str`**: The next token in the generated response from the LLM.
    """
    async for chunk in agent.astream(
        {
            "messages": [
                SystemMessage(content="You are Obsidian Agent, built into Obsidian"),
                {"role": "user", "content": text},
            ]
        },
        config={"configurable": {"thread_id": "1"}},
        stream_mode="messages",
    ):
        message, _ = chunk
        latest = cast(BaseMessage, message)
        if latest.content:
            yield str(latest.content)


@router.post("/testing")
async def testing(body: MessageModel):
    return StreamingResponse(streaming(body.query), media_type="text/plain")
