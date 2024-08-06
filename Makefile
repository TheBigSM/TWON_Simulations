install_network:
	@echo "Installing Python dependencies..."
	cd Networks && pip install -r requirements.txt

# Target to install Node.js dependencies
install_node:
	@echo "Installing Node.js dependencies..."
	cd Schedular && npm install

# Target to run networks.py 
generate_networks:
	@echo "Running networks.py..."
	python Networks/Generate_Networks.py > networks.log 2>&1

# Target to run recommender.js and schedular.js together
run_recommender_schedular:
	#@node Ranker/recommender.js > Ranker.log 2>&1 &
	@echo "Running recommender.js and schedular.js..."
	
	@node Schedular/Schedular.js > Schedular.log 2>&1 &
	@wait 

# Target to install all dependencies
install: install_network install_node

all: install   run_recommender_schedular
#all: install generate_networks run_recommender_schedular
