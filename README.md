# User's Manual for running of TWON simulations

TWON-SIMULATIONS repository runs large scale simulations of behaviou of llm agents on social media. In this repository we can choose topics, numbers of agents, llm models agents are based on and choose the number of times we will ask the agents to produce some type of response(e.g. cooment, like, post).

## The format of .env file:

All the variables of simulations are written in a .env file that you will have to add yourself. It is a file that doesn't show up on GitHub, because there is private data in it. The format of .env file needed for running TWON_SIMULATIONS is as follows:
DB_URL=""               //link to the mongodb you are going to store your data in
AGENTS_URL=""           //link to the API on which the response generation is being executed
POST_RANKING_URL=""     /
network_port=           //ports on which the simulations will be ran
network_port_2=         //ports on which the simulations will be ran
db_name=''              //name of the db you are creating to store your data in
db_url_for_creating=""  //link to your mongodb cluster, where you will be creating a database to store the data from your simulation
model=""                //llm you want to use to give you llm responses
provider=""             //provider through which oyu are getting llm services
topic=""                //topic agents are supposed to create posts about
num_of_loops=           //number of times we will ask random agents to create a response
num_of_users=           //number of agents we will use for a simulation

## Running a simulation:

1. Database creation
In the TWON-SIMULATIONS repository, there is a notebooks folder, which has multiple jupyter notebooks, for database creation and for data analysis. First step of running a simulation is to create a database where we can stroe the simulation data. We do that in the notebook called "database.ipynb". The only thing you need to do is to run the cells for databse creation. Other cells in the notebook are for data removing, which is useful when you want to use the same database for other simulations, or when you make mistakes in running simulations, so you can delete specific posts or users.

2. Generating networks
Once we have created a database, we can now go on to creating a network of users. We do this simply by running a command: make generate_networks in our terminal, which will create a file networks.log, which will show us if we have code errors, or if our network of users has been successfully generated.

3. Running a simulation with our users
Similarly to the previous step, when we run a command: make run_schedular_experiment in our terminal, the schedular.log file will be created and it will start generating responses for the actions of agents. This part take a little bit more time, until the agents generate the requested number of responses. After this is finished, your simulation data will be stored in your database.

## Common mistakes and errors:

1. Lack of certain python modules that are used in our code. If you get an arror "no module named '..'", you should run a command "pip install '..'" in your terminal.

2. Ports are already in use. Sometimes, if you are running multiple simulations one after another, the ports where the simulation should be ran would already be taken from the previous simulation. For fixing this you can simply go to the explorer and find files which have numbers of your ports as names. Delete them permanently and run the make run_schedular_experiment command again.
Note: If this happens, the schedular part of the simulation will fail, but it will have nothing to do with generate_networks. Do not run generate_networks again after you fix the port issue.

3. Certain data in the .env file have been updated, but the simulations still ran with old data. You can check if this is the case by checking the links that were printed out in the networks.log and schedular.log files. If the simulations are still running on the old data, a simple fix is to just run the whole line you have changed in the .env file as a command in your terminal.

