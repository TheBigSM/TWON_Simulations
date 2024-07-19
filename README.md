# Twon-Simulations - Large Scale Simulations

The repository contains a three modules recommender, schedular, and networks. The first module recommender run the ranking service and update the ranking of the feed. The second module schedular run the service to get response from different LLMs. The third module is network generation that is to create a graph of users in mongodb.

Note: Currently, the work is an alpha version and will undergo breaking changes during the development.

## Project Setup

```
# install Python requirements
make install_network:
	@echo "Installing Python dependencies..."
	cd TWON_networks && pip install -r requirements.txt

# install Node.js dependencies
make install_node:
	@echo "Installing Node.js dependencies..."
	cd Recommender && npm install
	cd ../Schedular && npm install

# Run networks.py 
make generate_networks:
	@echo "Running networks.py..."
	python TWON_networks/Generate_Networks.py > networks.log 2>&1

# Run recommender.js and schedular.js together
make run_recommender_schedular:
	@echo "Running recommender.js and schedular.js..."
	(cd Recommender && node recommender.js) &
	(cd Schedular && node Schedular.js) &

# Target to install all dependencies
make install: install_network install_node

make all: install generate_networks run_recommender_schedular
```
