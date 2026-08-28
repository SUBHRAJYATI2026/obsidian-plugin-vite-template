from typing import cast

from fastapi.routing import APIRouter
from langchain_core.messages import AIMessage, SystemMessage

from src.ai_agent import agent
from pydantic import BaseModel

router = APIRouter()


class MessageModel(BaseModel):
    query: str


@router.get("/testing")
def testing(body: MessageModel):
    result = agent.invoke(
        {
            "messages": [
                SystemMessage(content="You are Obsidian Agent, built into Obsidian"),
                {"role": "user", "content": body.query},
            ]
        },
        config={"configurable": {"thread_id": "1"}},
    )
    result = cast(AIMessage, result["messages"][-1])
    ai_response = result.content
    response = {"query": body.query, "response": ai_response}

    return response
