import pymongo
import igraph as ig
from igraph import plot
from datetime import datetime
from bson.objectid import ObjectId
import random
import json
import math
import os
from dotenv import load_dotenv
load_dotenv()
database_url = os.getenv('DB_URL')
db_name = "test_llm_1"#os.getenv('DB_NAME')
num_of_agents = int(os.getenv('num_of_agents', 5))

def main( model : str ,num_of_users : int , m: int):
    """
        Function takes data from MongoDB and creates new collection called users.
        Input: 
        - model - all models are directed:
            - 'Barabasi':  Directed Barabási-Albert Model
            - 'ErdosRenyi': Directed Erdős-Rényi Model
            - 'StohasticBlockModel':  Directed Stochastic Block Model
        - num_of_users ... number of users
        - m ... parameter determining the number of connections. Normally wu use numbers from 1 to 7.
        Return: None
    """
    ids, usernames, pics, passwords = get_data()
    print(len(ids))
    print(num_of_users)
    if num_of_users > min(len(ids), len(usernames), len(pics), len(passwords)): #If we want more users we can get.
        raise ValueError("Argument num_of_users is to big, we do not have that many users in the database.")
    
    graph = generate_network(model, num_of_users, m)
    send_data(ids, usernames, pics, passwords, graph)

    print('Successfully completed!')


LIST_OF_PROPERTIES = {
    "email": "0@gmaill.com",
    "password": "123456",
    "profilePicture": [],
    "coverPicture": "",
    "followers": [],
    "followings": [],
    "viewedPosts":[],
    "readPosts": [],
    "activity": [],
    "uniqueId":[],
    "isAdmin": "false",
    "pool": "",
    "feedValue": "",
    "desc": "",
    "city": "",
    "from": "",
    "relationship":""
}

def get_data():
    """Gathers exactly num_of_agents unique ids, usernames, and other data from the MongoDB repository.
    Returns: (ids, usernames, profile_picture, passwords)
    """
    script_dir = os.path.dirname(os.path.realpath(__file__))  # Get the directory of the current script
    agents_file_path = os.path.join(script_dir, 'agents.json')

    with open(agents_file_path, 'r', encoding='utf-8') as file:
        agents_data = json.load(file)

    # Function to fetch agents dynamically to meet required count
    def fetch_agents(needed_count, agents):
        fetched_agents = []
        already_used = set()  # To track already-used agents and avoid duplicates
        while len(fetched_agents) < needed_count:
            for agent in agents:
                if agent not in already_used:
                    fetched_agents.append(agent)
                    already_used.add(agent)
                    if len(fetched_agents) == needed_count:
                        break
        return fetched_agents

    agentArray = fetch_agents(num_of_agents+1, agents_data['agents'])

    myclient = pymongo.MongoClient(database_url)
    db = myclient[db_name]

    # Get list of IDs for selected users
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"_id": 1})
    ids = [doc["_id"] for doc in cursor]

    # Get list of usernames for selected users
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"username": 1, "profilePicture": 1})
    usernames = [doc["username"] for doc in cursor]

    # Get list of profile pictures for selected users
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"profilePicture": 1})
    pics = [doc["profilePicture"] for doc in cursor]

    # Get passwords for selected users
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"password": 1})
    passwords = [doc['password'] for doc in cursor]

    # Check if we still need more agents due to duplicate key issues
    if len(ids) < num_of_agents:
        needed_more = num_of_agents - len(ids)
        print(f"Fetching {needed_more} additional agents to meet the required count.")
        additional_agents = fetch_agents(needed_more, agents_data['agents'])
        # Recursively call this function to add more
        ids, usernames, pics, passwords = get_data(additional_agents)

    return ids, usernames, pics, passwords



def generate_network(model, num_of_vertices, m):
    """ We generate a directed graph with specified model type, number of nodes and m(this argument controls the number of connections, For example 1 is badly connected graph, while 6 is strongly connected graph).
    We label vertices of a graph with 'user_number'
    return: graph object
    """
    if model == "Barabasi":
        ba_graph = ig.Graph.Barabasi(n=num_of_vertices, m=3, directed=True) # Generate a Barabási-Albert Graph
        ba_graph.vs['user_number'] = list(range(num_of_vertices))
        output_directory = "./Networks/"  # Change to your desired directory
        output_file_name = "barabasi_albert_graph.png"

        # Make sure the directory exists, if not create it
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

    # Full output path
        output_image_path = os.path.join(output_directory, output_file_name)

        # Save the graph as an image
        plot(ba_graph, output_image_path, bbox=(800, 800))
        print(f"Graph saved as {output_image_path}")
        return ba_graph
    elif model == "StohasticBlockModel":
        
        import numpy as np
        sizes = [math.floor(num_of_vertices/2), math.ceil(num_of_vertices/2) ]
        prob_matrix = np.array([[0.1 * m, 0.02 * m], [0.02 * m, 0.1 * m]])
        # Convert prob_matrix to a list
        prob_matrix = prob_matrix.tolist()
        graph = ig.Graph.SBM(sum(sizes), prob_matrix, sizes, directed=True)
        graph.vs['user_number'] = list(range(num_of_vertices))
        output_directory = "home/adbuls/visulations/Twon-Simulations/Networks/"  # Change to your desired directory
        output_file_name = "barabasi_albert_graph.png"

        # Make sure the directory exists, if not create it
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

    # Full output path
        output_image_path = os.path.join(output_directory, output_file_name)

        # Save the graph as an image
        plot(graph, output_image_path, bbox=(800, 800))
        print(f"Graph saved as {output_image_path}")

        return graph

    elif model == "ErdosRenyi":

        graph = ig.Graph.Erdos_Renyi(n=num_of_vertices, p=math.atan(m/15)/(math.pi/2), directed=True)
        graph.vs['user_number'] = list(range(num_of_vertices))

        return graph
    else:
        raise ValueError("Network model name is not valid.")
        

def send_data(ids, usernames, pics, passwords, graph):
    """
    Inserts users into MongoDB database, ensuring we have exactly num_of_agents even if duplicates occur.
    """

    myclient = pymongo.MongoClient(database_url)
    db = myclient[db_name]
    DOC_NAME = 'users'

    inserted_count = 0  # Track how many were successfully inserted
    total_agents_needed = len(graph.vs)

    for i, vertex in enumerate(graph.vs):
        try:
            list_of_properties = LIST_OF_PROPERTIES.copy()

            # Set additional properties of users
            list_of_properties['username'] = usernames[i]
            list_of_properties['profilePicture'] = pics[i]
            list_of_properties['uniqueId'] = ids[i]
            list_of_properties['_id'] = ObjectId()
            list_of_properties['password'] = passwords[i]
            list_of_properties['user_number'] = vertex['user_number']

            # Set time variables
            current_time = datetime.utcnow()
            list_of_properties['createdAt'] = current_time
            list_of_properties['updatedAt'] = current_time

            # Add user information to the database
            db[DOC_NAME].insert_one(list_of_properties)
            inserted_count += 1

        except pymongo.errors.DuplicateKeyError as e:
            print(f"Duplicate key error for username {usernames[i]}. Fetching replacement.")
            # Fetch a replacement agent and retry insertion
            new_ids, new_usernames, new_pics, new_passwords = get_data()
            
            ids[i] = new_ids[0]
            usernames[i] = new_usernames[0]
            pics[i] = new_pics[0]
            passwords[i] = new_passwords[0]

            continue  # Retry current loop iteration with new data

    # Verify that the correct number of agents were inserted
    if inserted_count < total_agents_needed:
        needed_more = total_agents_needed - inserted_count
        print(f"Still need {needed_more} agents. Fetching replacements.")
        
        # Fetch more agents to meet the requirement
        new_ids, new_usernames, new_pics, new_passwords = get_data()

        # Insert remaining agents
        for i in range(needed_more):
            try:
                list_of_properties['username'] = new_usernames[i]
                list_of_properties['profilePicture'] = new_pics[i]
                list_of_properties['uniqueId'] = new_ids[i]
                list_of_properties['_id'] = ObjectId()
                list_of_properties['password'] = new_passwords[i]
                list_of_properties['user_number'] = inserted_count + i + 1

                db[DOC_NAME].insert_one(list_of_properties)
                inserted_count += 1
            except pymongo.errors.DuplicateKeyError:
                print(f"Replacement failed again for agent {new_usernames[i]}. Skipping.")

    print(f"Successfully inserted {inserted_count}/{total_agents_needed} agents.")


main('StohasticBlockModel', num_of_agents, 2)

#.env 