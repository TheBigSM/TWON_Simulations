import pymongo
import igraph as ig
from igraph import plot
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

    agentArray = [
    'Dunkelschieferblaue Biene', 
    'Sienna-Kuh', 
    'Darkslategray Wissenschaftler',
    'Dunkelschiefergraue Katze', 
    'Silberner Bär',
    'Seegrüner Papagei', 
    'Kadettenblaues Siegel', 
    'Dunkelschieferblaue Giraffe',
    'Hellschiefergrauer Löwe', 
    'Dunkelkhakifarbenes Rentier',
    'Siena Biene', 
    'Peru-Büffel',
    'Peruanisches Erdmännchen', 
    'Düsterer Professor', 
    'Rosabraunes Zebra',
    'Dunkelschiefergraue Kuh', 
    'Grauer Koala', 
    'Dunkelgrauer Orca', 
    'Darkslategray-Wissenschaftler', 
    'Silberner Blauhäher']
    # , 'Graues Huhn', 'Dunkelschiefergrauer Frosch', 'Silberner Waschbär', 'Rosabraunes Lamm', 'Blaugrüne Blume', 'Schwarzer Biker', 'Dunkelschiefergrauer Fuchs', 'Dunkelgrauer Igel', 'Schiefergraue Eule', 'Dunkelschiefergrauer Hund', 'Rosabrauner Fuchs', 'Himmelblauer Delphin', 'Dunkellachs-Warzenschwein', 'Rosabrauner Vogel', 'Dunkelschiefergraues Schwein', 'Schwarzer Tiger', 'Indigo-Truthahn', 'Schwarzer Astronaut', 'Nachtblauer Cowboy', 'Hellstahlblaue Krabbe', 'Dunkelschiefergraues Siegel', 'Dunkelschiefergrauer Wolf', 'Indianerhund', 'Schwarzer Außerirdischer', 'Schwarzer Löwe', 'Dunkelkhakifarbenes Erdmännchen', 'Silberner Adler', 'Dunkelschieferblauer Papagei', 'Mitteltürkisfarbener Wal', 'Dunkelseegrüner Biber', 'Peru Cowboy', 'Siena Gans', 'Schwarzes Krokodil', 'Dunkelschieferblauer Pinguin', 'Dunkelgrauer Esel', 'Dunkelschiefergrauer Alien', 'Dunkelschiefergrauer Igel', 'Peruanisches Frettchen', 'Dunkelschiefergraues Kaninchen', 'Dunkelgraues Eichhörnchen', 'Dunkelschieferblaue Gans', 'Dunkelschiefergrauer Wolf', 'Stahlblaue Giraffe', 'Sienna-Hai', 'Graue Biene', 'Hellgrauer Professor', 'Darkslategray-Wissenschaftler', 'Rosabraunes Walross', 'Stahlblauer Bison', 'Kadettenblauer Wolf', 'Dunkelgraue Kuh', 'Dunkelschiefergraues Kaninchen', 'Dunkelgrauer Koala', 'Dunkelgrauer Papagei', 'Mittelgroßer Aquamarin-Truthahn', 'Gainsboro-Faultier', 'Stahlblaues Nilpferd', 'Burlywood-Leopard', 'Graue Eule', 'Hellstahlblaue Möwe', 'Blassviolettes Warzenschwein', 'Kadettenblaues Huhn', 'Dunkelschiefergrauer Frosch', 'Stahlblaufuchs', 'Hellstahlblaues Eichhörnchen', 'Dunkelschiefergraues Faultier', 'Dunkelschieferblauer Otter', 'Dunkelschiefergrauer Igel', 'Dunkelgraue Kuh', 'Weizenvogel', 'Rosigbraunes Rotkehlchen', 'Dunkelschieferblaue Blume', 'Silberner Hund', 'Dunkelgraues Zebra', 'Dunkelseegrünes Zebra', 'Kadettenblauer Oktopus', 'Burlywood-Adler', 'Dunkelgraue Seekuh', 'Grauer Panda', 'Dunkelschieferblaue Krabbe', 'Schwarzer Frosch', 'Peruanisches Erdmännchen', 'Kadettenblauer Adler', 'Dunkelgrauer Waschbär', 'Mitteltürkiser Hai', 'Schokoladen-Eichhörnchen', 'Dunkelgraues Frettchen', 'Dunkelgrauer Pinguin', 'Dunkelgrauer Cowboy', 'Silberner Cowboy', 'Dunkelschiefergrauer Hund', 'Silberne Feuerwehrfrau', 'Dunkelschiefergrauer Astronaut', 'Dunkelgrauer Biker', 'Blaugrüner Bär', 'Schwarze Ziege', 'Weizenflusspferd', 'Kadettenblaue Katze', 'Rosabraunes Huhn', 'Dunkelschiefergraues Krokodil', 'Kadettenblaues Schwein', 'Dunkelschiefergrauer Hirsch', 'Dunkelschiefergrauer Elefant', 'Dunkelgraues Pferd', 'Dunkelschiefergrauer Tiger', 'Feuerwehrmann Aus Schokolade', 'Indianred-Katze', 'Stahlblaue Giraffe', 'Blaue Giraffe', 'Dunkelschiefergraue Seekuh', 'Dunkelschiefergrauer Löwe', 'Burlywood-Samurai', 'Blauer Wissenschaftler', 'Blaue Seekuh', 'Dunkelschiefergrauer Otter', 'Dunkelgrauer Pinguin', 'Dunkelschiefergrauer Biker', 'Black Samurai', 'Schieferblaue Blume', 'Blaue Kuh', 'Blauer Wal', 'Dunkelgrauer Feuerwehrmann', 'Blauer Esel', 'Blauer Koch', 'Blauer Ritter', 'Blauer Adler', 'Blauer Außerirdischer', 'Blauer Astronaut', 'Blauer Waschbär', 'Schwarze Ziege', 'Indisches Walross', 'Dunkelschieferblauer Hai', 'Rosabraunes Nashorn', 'Blaue Eule', 'Rosabraunes Erdmännchen', 'Schwarzer Tiger', 'Dunkelschiefergrauer Astronaut', 'Anthrazitgraue Ziege', 'Blauer Pinguin', 'Blauer Tiger', 'Blaue Krabbe', 'Blauer Hai', 'Blauer Otter', 'Blauer Schwan', 'Dunkelschiefergrauer Astronaut', 'Blauer Bison', 'Blauer Cowboy', 'Blauer Frosch', 'Blauer Oktopus', 'Dunkelschieferblaue Möwe', 'Dunkelkhakifarbener Truthahn', 'Schiefergraues Schaf', 'Biskuit-Samurai', 'Blaue Blume', 'Blauer Delphin', 'Dunkelschiefergraues Schwein', 'Blauer Hund', 'Dunkelschieferblauer Schwan', 'Lichtschiefergraue Gans', 'Dunkelschiefergraues Kaninchen', 'Blaue Gans', 'Blaue Möwe', 'Blauer Hirsch', 'Serene swan', 'Blauer Soldat', 'Stahlblaue Eule', 'Black Samurai', 'Schwarze Blume', 'Blaue Katze', 'Blaue Schafe', 'Blauer Bär', 'Blauer Fuchs', 'Friendly Crocodile', 'Blaues Siegel', 'Blauer Wrestler', 'Graue Feuerwehrfrau', 'Gelber Adler', 'Gelbes Erdmännchen', 'Grauer Vogel', 'Grüner Cowboy', 'Gelber Vogel', 'Goldene Katze', 'Friendly Wolf', 'Grünes Huhn', 'Dunkelgrauer Igel', 'Gelbes Nilpferd', 'Gelber Truthahn', 'Graue Wissenschaftlerin', 'Grauer Astronaut', 'Grauer Professor', 'Graues Zebra', 'Grüne Eule', 'Grüner Papagei', 'Brauner Soldat', 'Brauner Cowboy', 'Gelber Samurai', 'Blaues Huhn', 'Grüne Seekuh', 'Grauer Orca', 'Graue Pansa', 'Grauer Fuchs', 'Grauer Koala', 'Goldener Leopard', 'Goldenes Erdmännchen', 'Grauer Adler', 'Grauer Biker', 'Grauer Löwe', 'Blaues Schwein', 'Blaugrüner Panda', 'Goldene Giraffe', 'Grüner Pirat', 'Grünes Erdmännchen', 'Graues Faultier', 'Graues Kaninchen', 'Grüner Biber', 'Grüner Pinguin', 'Grüner Bär', 'Graue Kuh', 'Dunkelblauer Otter', 'Brauner Koch', 'Blauer Wolf', 'Friendly Turkey', 'Dunkelblauer Pinguin', 'Grüner Koala', 'Grüner Wissenschaftler', 'Grauer Cowboy', 'Graues Huhn', 'Graues Eichhörnchen', 'Graues Frettchen', 'Graues Schwein', 'Graue Professorin', 'Graues Pferd', 'Grauer Papagei', 'Grüner Frosch', 'Grüner Hai', 'Grüner Tiger', 'Grünes Siegel', 'Lila Giraffe', 'Lila Samurai', 'Lila Biene', 'Schwarze Kuh', 'Weiße Blume', 'Weiße Samurai', 'Lila Krabbe', 'Lila Biker', 'Hellblaue Gans', 'Orangefarbenes Eichhörnchen', 'Weißer Astronaut', 'Orangefarbene Biene', 'Pinke Blume', 'Rosa Fuchs', 'Hellblaue Eule', 'Orangefarbenes Erdmännchen', 'Orangefarbenes Rentier', 'Rosa Pirat', 'Rosa Walross', 'Schwarzer Elefant', 'Lila Kaninchen', 'Orangefarbene Kuh', 'Orangefarbener Feuerwehrmann', 'Rosa Biene', 'Schwarzer Igel', 'Weißes Faultier', 'Rosa Zebra', 'Grünes Zebra', 'Rosa Lamm', 'Rosa Nashorn', 'Schwarzer Biker', 'Schwarzer Tiger', 'Weißer Koch', 'Hellblaue Giraffe', 'Lila Nilpferd', 'Orangefarbenes Frettchen', 'Rosa Vogel', 'Rotes Krokodil', 'Schwarzer Löwe', 'Weißer Hund', 'Weißer Igel', 'Schwarzer Frosch', 'Schwarzer Hase', 'Schwarzes Schwein', 'Orangefarbener Büffel', 'Schwarze Ziege', 'Weißer Feuerwehrmann', 'Oranger Ritter', 'Orangefarbenes Walross', 'Lila Blume', 'Proud Seagull', 'Rote Gans', 'Roter Astronaut', 'Roter Hund', 'Schwarzer Hund', 'Smaragdgrün Wolf', 'Lila Schwan', 'Roter Hai', 'Orangefarbener Truthahn', 'Lila Papagei', 'Orangefarbenes Warzenschwein', 'Orangene Katze', 'Rosa Warzenschwein', 'Weißer Löwe', 'Lila Waschbär', 'Lila Wrestler', 'Rosa Rotkehlchen', 'Roter Samurai', 'Stahlblaues Eichhörnchen', 'Weißer Wrestler', 'Schwarzer Außerirdischer', 'Schwarzer Ritter', 'Weißer Ritter']
    myclient = pymongo.MongoClient(database_url)
    db = myclient[os.getenv('db_name')]
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
    Here we upload users to MongoDB database. We use input information about users and generated graph. 
    Input:  -lists of users ids, 
            -list of usernames,
            -list of picture labels,
            -list of  passwords and  
            -graph object from python library igraph.
    """

    myclient = pymongo.MongoClient(database_url)
    db = myclient[os.getenv('db_name')]

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


main('StohasticBlockModel', 20, 2)

#.env 