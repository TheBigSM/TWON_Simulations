install_network:
	@echo "Installing Python dependencies..."
	cd TWON_networks && pip install -r requirements.txt

# Target to install Node.js dependencies
install_node:
	@echo "Installing Node.js dependencies..."
	cd Recommender && npm install
	cd ../Schedular && npm install

# Target to run networks.py 
generate_networks:
	@echo "Running networks.py..."
	python TWON_networks/Generate_Networks.py > networks.log 2>&1

# Target to run recommender.js and schedular.js together
run_recommender_schedular:
	@echo "Running recommender.js and schedular.js..."
	(cd Recommender && node recommender.js) &
	(cd Schedular && node Schedular.js) &

# Target to install all dependencies
install: install_network install_node

all: install generate_networks run_recommender_schedular