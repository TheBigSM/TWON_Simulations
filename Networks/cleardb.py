from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()
# Replace with your MongoDB connection string
database_url = os.getenv('db_url_for_creating')

# Connect to the MongoDB server
client = MongoClient(database_url)

# Access the specific database
db_name = os.getenv('db_name')
db = client[db_name]

three_weeks_ago = datetime.now() - timedelta(days=10) #datetime.now() - timedelta(weeks=3)

now = datetime.now()

# Calculate start and end of today
start_of_today = datetime(now.year, now.month, now.day)  # 00:00:00 today
end_of_today = start_of_today + timedelta(days=3)  # 00:00:00 tomorrow

# Calculate start of yesterday
start_of_yesterday = start_of_today - timedelta(days=20)
print(start_of_yesterday)
print(end_of_today)

# Iterate over all collections in the database
for collection_name in db.list_collection_names():
    collection = db[collection_name]
    
    # Assuming the documents have a field named 'created_at' or similar which stores the date
    # Replace 'created_at' with the appropriate field name in your collections
    result = collection.delete_many({"createdAt": {'$gte': start_of_yesterday,'$lt': end_of_today}})
    
    print(f"Deleted {result.deleted_count} documents from {collection_name}")

print("Data deletion complete.")