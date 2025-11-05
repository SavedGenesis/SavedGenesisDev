Run appleboy/ssh-action@v1.0.3
  with:
    host: ***
    username: ***
    key: ***
    script: set -x  # Enable debug output
  echo "=== Starting ***ment ==="
  echo "Current user: $(whoami)"
  echo "Current directory: $(pwd)"
  
  # Create directory and set permissions
  sudo mkdir -p /srv/savedgenesis
  sudo chown -R $USER:$USER /srv/savedgenesis
  cd /srv/savedgenesis
  echo "Working directory: $(pwd)"
  
  # Check Docker access
  echo "=== Checking Docker ==="
  docker --version || echo "Docker not found or not accessible"
  docker ps || echo "Cannot run docker ps"
  
  # Check Docker Compose
  echo "=== Checking Docker Compose ==="
  docker compose version || docker-compose version || echo "Docker Compose not found"
  
  # Log in to GHCR (public images might not need this, but try anyway)
  echo "=== Logging in to GHCR ==="
  echo "***" | docker login ghcr.io -u SavedGenesis --password-stdin || echo "GHCR login failed (might be OK for public images)"
  
  # Create docker-compose.yml
  echo "=== Creating docker-compose.yml ==="
  cat > docker-compose.yml <<'EOF'
  version: "3.9"
  services:
    web:
      image: ghcr.io/savedgenesis/savedgenesisdev:latest
      restart: unless-stopped
      expose:
        - "3000"
    caddy:
      image: caddy:2.8-alpine
      restart: unless-stopped
      ports:
        - "80:80"
        - "443:443"
      volumes:
        - caddy_data:/data
        - caddy_config:/config
        - ./Caddyfile:/etc/caddy/Caddyfile:ro
      depends_on:
        - web
  volumes:
    caddy_data:
    caddy_config:
  EOF
  echo "docker-compose.yml created"
  ls -la docker-compose.yml
  
  # Create Caddyfile
  echo "=== Creating Caddyfile ==="
  cat > Caddyfile <<'EOF'
  savedgenesis.com, www.savedgenesis.com {
    encode zstd gzip
    header {
      Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
      X-Content-Type-Options nosniff
      X-Frame-Options DENY
      Referrer-Policy no-referrer-when-downgrade
    }
    reverse_proxy web:3000
  }
  EOF
  echo "Caddyfile created"
  ls -la Caddyfile
  
  # Verify files exist
  echo "=== Verifying files ==="
  ls -la /srv/savedgenesis/
  
  # Determine docker compose command
  echo "=== Determining docker compose command ==="
  if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
  elif sudo docker compose version &> /dev/null; then
    DOCKER_COMPOSE="sudo docker compose"
  elif sudo docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="sudo docker-compose"
  else
    echo "ERROR: Docker Compose not found!"
    exit 1
  fi
  echo "Using: $DOCKER_COMPOSE"
  
  # Pull images
  echo "=== Pulling images ==="
  $DOCKER_COMPOSE pull || {
    echo "ERROR: Failed to pull images"
    exit 1
  }
  
  # Stop existing containers if any
  echo "=== Stopping existing containers ==="
  $DOCKER_COMPOSE down || echo "No existing containers to stop"
  
  # Start containers
  echo "=== Starting containers ==="
  $DOCKER_COMPOSE up -d || {
    echo "ERROR: Failed to start containers"
    exit 1
  }
  
  # Verify containers are running
  echo "=== Verifying containers ==="
  $DOCKER_COMPOSE ps
  
  echo "=== Deployment complete ==="
  
    port: 22
    timeout: 30s
    command_timeout: 10m
    proxy_port: 22
    proxy_timeout: 30s
/usr/bin/docker run --name fe5bff60d1e8ac03c94470a835ce4fbcd71a0e_f79bee --label fe5bff --workdir /github/workspace --rm -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_SCRIPT" -e "INPUT_PORT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "INPUT_REQUEST_PTY" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION_DAYS" -e "GITHUB_RUN_ATTEMPT" -e "GITHUB_ACTOR_ID" -e "GITHUB_ACTOR" -e "GITHUB_WORKFLOW" -e "GITHUB_HEAD_REF" -e "GITHUB_BASE_REF" -e "GITHUB_EVENT_NAME" -e "GITHUB_SERVER_URL" -e "GITHUB_API_URL" -e "GITHUB_GRAPHQL_URL" -e "GITHUB_REF_NAME" -e "GITHUB_REF_PROTECTED" -e "GITHUB_REF_TYPE" -e "GITHUB_WORKFLOW_REF" -e "GITHUB_WORKFLOW_SHA" -e "GITHUB_REPOSITORY_ID" -e "GITHUB_TRIGGERING_ACTOR" -e "GITHUB_WORKSPACE" -e "GITHUB_ACTION" -e "GITHUB_EVENT_PATH" -e "GITHUB_ACTION_REPOSITORY" -e "GITHUB_ACTION_REF" -e "GITHUB_PATH" -e "GITHUB_ENV" -e "GITHUB_STEP_SUMMARY" -e "GITHUB_STATE" -e "GITHUB_OUTPUT" -e "RUNNER_OS" -e "RUNNER_ARCH" -e "RUNNER_NAME" -e "RUNNER_ENVIRONMENT" -e "RUNNER_TOOL_CACHE" -e "RUNNER_TEMP" -e "RUNNER_WORKSPACE" -e "ACTIONS_RUNTIME_URL" -e "ACTIONS_RUNTIME_TOKEN" -e "ACTIONS_CACHE_URL" -e "ACTIONS_RESULTS_URL" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" -v "/home/runner/work/_temp/_runner_file_commands":"/github/file_commands" -v "/home/runner/work/SavedGenesisDev/SavedGenesisDev":"/github/workspace" fe5bff:60d1e8ac03c94470a835ce4fbcd71a0e
2025/11/05 20:53:00 ssh.ParsePrivateKey: ssh: no key found
======CMD======
set -x  # Enable debug output
echo "=== Starting ***ment ==="
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"

# Create directory and set permissions
sudo mkdir -p /srv/savedgenesis
sudo chown -R $USER:$USER /srv/savedgenesis
cd /srv/savedgenesis
echo "Working directory: $(pwd)"

# Check Docker access
echo "=== Checking Docker ==="
docker --version || echo "Docker not found or not accessible"
docker ps || echo "Cannot run docker ps"

# Check Docker Compose
echo "=== Checking Docker Compose ==="
docker compose version || docker-compose version || echo "Docker Compose not found"

# Log in to GHCR (public images might not need this, but try anyway)
echo "=== Logging in to GHCR ==="
echo "***" | docker login ghcr.io -u SavedGenesis --password-stdin || echo "GHCR login failed (might be OK for public images)"

# Create docker-compose.yml
echo "=== Creating docker-compose.yml ==="
cat > docker-compose.yml <<'EOF'
version: "3.9"
services:
  web:
    image: ghcr.io/savedgenesis/savedgenesisdev:latest
    restart: unless-stopped
    expose:
      - "3000"
  caddy:
    image: caddy:2.8-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - caddy_data:/data
      - caddy_config:/config
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
    depends_on:
      - web
volumes:
  caddy_data:
  caddy_config:
EOF
echo "docker-compose.yml created"
ls -la docker-compose.yml

# Create Caddyfile
echo "=== Creating Caddyfile ==="
cat > Caddyfile <<'EOF'
savedgenesis.com, www.savedgenesis.com {
  encode zstd gzip
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    Referrer-Policy no-referrer-when-downgrade
  }
  reverse_proxy web:3000
}
EOF
echo "Caddyfile created"
ls -la Caddyfile

# Verify files exist
echo "=== Verifying files ==="
ls -la /srv/savedgenesis/

# Determine docker compose command
echo "=== Determining docker compose command ==="
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif sudo docker compose version &> /dev/null; then
  DOCKER_COMPOSE="sudo docker compose"
elif sudo docker-compose version &> /dev/null; then
  DOCKER_COMPOSE="sudo docker-compose"
else
  echo "ERROR: Docker Compose not found!"
  exit 1
fi
echo "Using: $DOCKER_COMPOSE"

# Pull images
echo "=== Pulling images ==="
$DOCKER_COMPOSE pull || {
  echo "ERROR: Failed to pull images"
  exit 1
}

# Stop existing containers if any
echo "=== Stopping existing containers ==="
$DOCKER_COMPOSE down || echo "No existing containers to stop"

# Start containers
echo "=== Starting containers ==="
$DOCKER_COMPOSE up -d || {
  echo "ERROR: Failed to start containers"
  exit 1
}

# Verify containers are running
echo "=== Verifying containers ==="
$DOCKER_COMPOSE ps

echo "=== Deployment complete ==="

======END======
2025/11/05 20:53:00 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none], no supported methods remain