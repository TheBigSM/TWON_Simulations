import pymongo
import igraph as ig
from datetime import datetime
from bson.objectid import ObjectId
import random
import math
import os
from dotenv import load_dotenv
load_dotenv()
database_url = os.getenv('DB_URL')


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
    """Gathers ids, usernames and profilePicture names from MongoDB repository. 
    Returns: (ids, usernames, profile_picture, passwords)
    """

    agentArray = ["Blaue Blume", "Dunkelschiefergrauer Löwe", "Orangefarbene Biene", "Grauer Adler", "Dunkelschiefergrauer Tiger", "Rosabraunes Lamm", "Grüne Seekuh", "Dunkelschiefergraue Kuh", "Orangefarbener Truthahn", "Silberner Blauhäher", "Grauer Koala", "Blauer Otter", "Lila Kaninchen", "Orangefarbener Feuerwehrmann", "Goldene Katze" ];


    myclient = pymongo.MongoClient(database_url)
    db = myclient.hack1
    print(database_url)

    # Get list of IDs for users in agentArray
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"_id": 1})
    ids = [doc["_id"] for doc in cursor]
    print("IDS:", len(ids))

    # Get list of usernames for users in agentArray
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"username": 1, "profilePicture": 1})
    usernames = [doc["username"] for doc in cursor]
    print("Usernames:", len(usernames))

    # Get list of profile pictures for users in agentArray
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"profilePicture": 1})
    pics = [doc["profilePicture"] for doc in cursor]
    print("Profile Pictures:", len(pics))

    # Get passwords for users in agentArray
    cursor = db["selectedusers"].find({"username": {"$in": agentArray}}, {"password": 1})
    passwords = [doc['password'] for doc in cursor]
    print("Passwords:", len(passwords))
    
    return (ids, usernames, pics, passwords)


def generate_network(model, num_of_vertices, m):
    """ We generate a directed graph with specified model type, number of nodes and m(this argument controls the number of connections, For example 1 is badly connected graph, while 6 is strongly connected graph).
    We label vertices of a graph with 'user_number'
    return: graph object
    """
    if model == "Barabasi":
        ba_graph = ig.Graph.Barabasi(n=num_of_vertices, m=3, directed=True) # Generate a Barabási-Albert Graph
        ba_graph.vs['user_number'] = list(range(num_of_vertices))
        return ba_graph
    elif model == "StohasticBlockModel":
        
        import numpy as np
        sizes = [math.floor(num_of_vertices/2), math.ceil(num_of_vertices/2) ]
        prob_matrix = np.array([[0.1 * m, 0.02 * m], [0.02 * m, 0.1 * m]])
        graph = ig.Graph.SBM(sum(sizes), prob_matrix, sizes, directed=True)
        graph.vs['user_number'] = list(range(num_of_vertices))

        return graph

    elif model == "ErdosRenyi":

        graph = ig.Graph.Erdos_Renyi(n=num_of_vertices, p=math.atan(m/15)/(math.pi/2), directed=True)
        graph.vs['user_number'] = list(range(num_of_vertices))

        return graph
    else:
        raise ValueError("Network model name is not valid.")
        

def send_data(ids, usernames, pics, passwords, graph):
    """
    Here we upload users to MongoDB database. We use input information about users and generated graph. 
    Input:  -lists of users ids, 
            -list of usernames,
            -list of picture labels,
            -list of  passwords and  
            -graph object from python library igraph.
    """

    myclient = pymongo.MongoClient(database_url)
    db = myclient.hack1

    #Randomly choose users to fill in network vertices
    LIST  = list(range(len(ids))) #This is list that counts all the users
    DOC_NAME = 'users'  #Name of file
    num_of_vertices  = len(graph.vs['user_number'])
    choose_users = random.sample(LIST, num_of_vertices)

    #We additionaly label vertices of generated graph
    graph.vs['username'] = choose_users 

    ####### Add user information onto MongoDB ---------------------------------------------------------------

    for  i, vertex in enumerate(graph.vs):
        list_of_properties = LIST_OF_PROPERTIES.copy()

        #Set aditional properties of users
        list_of_properties['username'] = usernames[int(vertex['username'])]
        list_of_properties['profilePicture'] = pics[int(vertex['username'])]
        list_of_properties['uniqueId'] = ids[int(vertex['username'])]
        list_of_properties['_id'] = ObjectId()
        list_of_properties['password'] = passwords[int(vertex['username'])]
        list_of_properties['user_number'] = vertex['user_number']

        #Set time variables
        current_time = datetime.utcnow()
        list_of_properties['createdAt'] = current_time
        list_of_properties['updatedAt'] = current_time

        #Add information about that user to database
        db[DOC_NAME].insert_one(list_of_properties)

    
    #######Here we calculate followers and followings ------------------------------------------------------

    for user in db[DOC_NAME].find(): #We go through all users in database.

        for vertex in graph.vs: #We go through all nodes of graph.
            if vertex['user_number'] == user['user_number']: #If graph node matches with user (this happens for unique vertex).

                followings = []
                #Fill the followings list
                for followed in vertex.incident(mode="OUT"):
                    filter = {'user_number': followed.target}

                    doc_to_update = db[DOC_NAME].find_one(filter)
                    followings.append(doc_to_update['_id'])

                followers = []
                #Fill the followers list
                for follow in vertex.incident(mode="IN"):
                    filter = {'user_number': follow.source}

                    doc_to_update = db[DOC_NAME].find_one(filter)
                    followers.append(doc_to_update['_id'])

        user['followings'] = followings
        user['followers'] = followers

        #Add followers and followings to database
        filter = {'user_number': user['user_number']}
        type_of_action = {'$set': user}
        db[DOC_NAME].update_one(filter, type_of_action)


main('StohasticBlockModel', 15, 2)

#.env 