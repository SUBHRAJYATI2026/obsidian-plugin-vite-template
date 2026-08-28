import psycopg
from sqlalchemy import create_engine, inspect
from pydantic import SecretStr
from langchain.agents import create_agent
from langchain_groq import ChatGroq
import os
from typing import Any
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool
from psycopg import Connection
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DB_URI = os.getenv("DB_URI")
tables = {
    "checkpoint_migrations",
    "checkpoints",
    "checkpoint_blobs",
    "checkpoint_writes",
}

if DB_URI is None:
    raise RuntimeError("Please set GROQ_API_KEY environment variable")

llm = ChatGroq(
    api_key=SecretStr(GROQ_API_KEY) if GROQ_API_KEY else None,
    model="openai/gpt-oss-120b",
)

pool = ConnectionPool[Connection[dict[str, Any]]](
    conninfo=DB_URI, open=True, kwargs={"autocommit": True}
)

checkpointer = PostgresSaver(conn=pool)

engine = create_engine(url=str(os.getenv("DB_URI_2")))
inspector = inspect(engine)

existing = {name for name in inspector.get_table_names(schema="public")}

if not tables.issubset(existing):
    checkpointer.setup()

agent = create_agent(model=llm, checkpointer=checkpointer)
