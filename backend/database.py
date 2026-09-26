import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URL)

database = client[DATABASE_NAME]

tasks_collection = database["tasks"]