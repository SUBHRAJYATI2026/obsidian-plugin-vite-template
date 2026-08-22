from pydantic import SecretStr
from langchain.agents import create_agent
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="openai/gpt-oss-120b"
)

agent = create_agent(model=llm)
