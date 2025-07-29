# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "nettwin-dev"
  
  # Port forwarding
  config.vm.network "forwarded_port", guest: 3000, host: 3000    # UI
  config.vm.network "forwarded_port", guest: 5173, host: 5173    # Vite
  config.vm.network "forwarded_port", guest: 8001, host: 8001    # What-If Engine
  config.vm.network "forwarded_port", guest: 8002, host: 8002    # Topology Builder
  config.vm.network "forwarded_port", guest: 8003, host: 8003    # Config Generator
  config.vm.network "forwarded_port", guest: 8004, host: 8004    # Collector
  config.vm.network "forwarded_port", guest: 7474, host: 7474    # Neo4j Browser
  config.vm.network "forwarded_port", guest: 7687, host: 7687    # Neo4j Bolt
  config.vm.network "forwarded_port", guest: 6379, host: 6379    # Redis
  config.vm.network "forwarded_port", guest: 9000, host: 9000    # ClickHouse
  
  # VM resources
  config.vm.provider "virtualbox\" do |vb|
    vb.memory = "4096"
    vb.cpus = 2
    vb.name = "NetTwinSaaS-Dev"
  end
  
  # Provisioning script
  config.vm.provision "shell", inline: <<-SHELL
    set -e
    
    echo "🚀 Configurando NetTwinSaaS Development VM..."
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Python 3.11
    apt-get install -y software-properties-common
    add-apt-repository ppa:deadsnakes/ppa -y
    apt-get update
    apt-get install -y python3.11 python3.11-pip python3.11-venv python3.11-dev
    
    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker vagrant
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Install Redis
    apt-get install -y redis-server
    systemctl enable redis-server
    
    # Install Neo4j
    wget -O - https://debian.neo4j.com/neotechnology.gpg.key | apt-key add -
    echo 'deb https://debian.neo4j.com stable 5' | tee /etc/apt/sources.list.d/neo4j.list
    apt-get update
    apt-get install -y neo4j
    
    # Configure Neo4j
    sed -i 's/#dbms.default_listen_address=0.0.0.0/dbms.default_listen_address=0.0.0.0/' /etc/neo4j/neo4j.conf
    systemctl enable neo4j
    
    # Install ClickHouse
    curl https://clickhouse.com/ | sh
    ./clickhouse install --user clickhouse --group clickhouse
    systemctl enable clickhouse-server
    
    # Install development tools
    apt-get install -y git curl wget vim htop tree make
    npm install -g pnpm
    
    # Set up project directory
    mkdir -p /home/vagrant/nettwin
    chown vagrant:vagrant /home/vagrant/nettwin
    
    # Create startup script
    cat > /home/vagrant/start-nettwin.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting NetTwinSaaS services..."

# Start databases
sudo systemctl start redis-server
sudo systemctl start neo4j
sudo systemctl start clickhouse-server

# Wait for services
sleep 10

echo "✅ All services started!"
echo "🌐 Neo4j Browser: http://localhost:7474"
echo "📊 Project directory: /home/vagrant/nettwin"
echo ""
echo "Next steps:"
echo "1. cd /home/vagrant/nettwin"
echo "2. git clone <your-repo>"
echo "3. make dev"
EOF
    
    chmod +x /home/vagrant/start-nettwin.sh
    chown vagrant:vagrant /home/vagrant/start-nettwin.sh
    
    echo "✅ NetTwinSaaS VM setup completed!"
    echo "🔧 Run './start-nettwin.sh' to start all services"
    
  SHELL
  
  # Message after provisioning
  config.vm.post_up_message = <<-MSG
    🎉 NetTwinSaaS Development VM is ready!
    
    📋 Access the VM:
      vagrant ssh
    
    🚀 Start services:
      ./start-nettwin.sh
    
    🌐 Access points:
      - Neo4j Browser: http://localhost:7474
      - UI (when running): http://localhost:3000
      - API Docs: http://localhost:8001/docs
    
    📁 Project directory: /home/vagrant/nettwin
  MSG
end