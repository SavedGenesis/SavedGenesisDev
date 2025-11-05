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
      image: ghcr.io/savedgenesis/savedgenesisde
    port: 22
    timeout: 30s
    command_timeout: 10m
    proxy_port: 22
    proxy_timeout: 30s
/usr/bin/docker run --name c327d918f53f60e4754c5aad6c30e630486aa4_a790da --label c327d9 --workdir /github/workspace --rm -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_SCRIPT" -e "INPUT_PORT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "INPUT_REQUEST_PTY" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION
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
      - "8080:80"
      - "8443:443"
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
savedgenesis.com:8443, www.savedgenesis.com:8443 {
  encode zstd gzip
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    Referrer-Policy no-referrer-when-downgrade
  }
  reverse_proxy web:3000
}
savedgenesis.com:8080, www.savedgenesis.com:8080 {
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
# Check what's using ports 80, 443, 8080, and 8443
echo "=== Checking port usage ==="
sudo lsof -i :80 || echo "Port 80 is free"
sudo lsof -i :443 || echo "Port 443 is free"
sudo lsof -i :8080 || echo "Port 8080 is free"
sudo lsof -i :8443 || echo "Port 8443 is free"
sudo netstat -tulpn | grep -E ':(80|443|8080|8443)' || echo "No processes found on ports 80/443/8080/8443"
# Stop existing containers if any
echo "=== Stopping existing containers ==="
$DOCKER_COMPOSE down || echo "No existing containers to stop"
# Start containers
echo "=== Starting containers ==="
$DOCKER_COMPOSE up -d || {
  echo "ERROR: Failed to start containers"
  echo "Checking what's using ports 80/443:"
  sudo lsof -i :80 || true
  sudo lsof -i :443 || true
  echo "Checking if containers started:"
  $DOCKER_COMPOSE ps || true
  exit 1
}
# Verify containers are running
echo "=== Verifying containers ==="
$DOCKER_COMPOSE ps
echo "=== Deployment complete ==="
======END======
err: + echo '=== Starting ***ment ==='
out: === Starting ***ment ===
err: ++ whoami
err: + echo 'Current user: ***'
out: Current user: ***
err: ++ pwd
err: + echo 'Current directory: /home/***'
out: Current directory: /home/***
err: + sudo mkdir -p /srv/savedgenesis
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + sudo chown -R ***:*** /srv/savedgenesis
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + cd /srv/savedgenesis
err: ++ pwd
err: + echo 'Working directory: /srv/savedgenesis'
err: + echo '=== Checking Docker ==='
err: + docker --version
out: Working directory: /srv/savedgenesis
out: === Checking Docker ===
out: Docker version 26.1.5+dfsg1, build a72d7cd
err: + docker ps
out: CONTAINER ID   IMAGE                                         COMMAND                  CREATED             STATUS             PORTS                                                                                                                        NAMES
out: a842ae91cd47   ghcr.io/savedgenesis/savedgenesisdev:latest   "docker-entrypoint.s…"   15 minutes ago      Up 15 minutes      3000/tcp                                                                                                                     savedgenesis-web-1
out: 754c1cec93c0   ghcr.io/pterodactyl/yolks:java_21             "/__cacert_entrypoin…"   About an hour ago   Up About an hour   ***:25566->25566/tcp, ***:25566->25566/udp                                                                 19bc5adf-90db-4fc9-87ad-be566ef39e0d
out: 5110ca77ccd4   ghcr.io/pterodactyl/yolks:java_21             "/__cacert_entrypoin…"   2 hours ago         Up 2 hours         ***:25569->25569/tcp, ***:25569->25569/udp, ***:25571->25571/tcp, ***:25571->25571/udp   b03b2629-743b-4760-8388-a16c9a889055
out: c918a458f189   ghcr.io/pterodactyl/yolks:java_21             "/__cacert_entrypoin…"   2 days ago          Up 2 days          ***:25565->25565/tcp, ***:25565->25565/udp                                                                 5286dd99-0dfd-48e6-b00b-7697aa450e4d
err: + echo '=== Checking Docker Compose ==='
out: === Checking Docker Compose ===
err: + docker compose version
out: Docker Compose version v2.40.3
err: + echo '=== Logging in to GHCR ==='
out: === Logging in to GHCR ===
err: + echo ***
err: + docker login ghcr.io -u SavedGenesis --password-stdin
err: WARNING! Your password will be stored unencrypted in /home/***/.docker/config.json.
err: Configure a credential helper to remove this warning. See
err: https://docs.docker.com/engine/reference/commandline/login/#credentials-store
out: Login Succeeded
err: + echo '=== Creating docker-compose.yml ==='
err: + cat
out: === Creating docker-compose.yml ===
err: + echo 'docker-compose.yml created'
out: docker-compose.yml created
err: + ls -la docker-compose.yml
out: -rw-rw-r-- 1 *** *** 433 Nov  5 22:39 docker-compose.yml
err: + echo '=== Creating Caddyfile ==='
err: + cat
out: === Creating Caddyfile ===
err: + echo 'Caddyfile created'
err: + ls -la Caddyfile
out: Caddyfile created
out: -rw-rw-r-- 1 *** *** 592 Nov  5 22:39 Caddyfile
err: + echo '=== Verifying files ==='
out: === Verifying files ===
err: + ls -la /srv/savedgenesis/
out: total 16
out: drwxr-xr-x 2 *** *** 4096 Nov  5 22:24 .
out: drwxr-xr-x 3 root   root   4096 Nov  5 20:36 ..
out: -rw-rw-r-- 1 *** ***  592 Nov  5 22:39 Caddyfile
out: -rw-rw-r-- 1 *** ***  433 Nov  5 22:39 docker-compose.yml
err: + echo '=== Determining docker compose command ==='
out: === Determining docker compose command ===
err: + command -v docker
err: + docker compose version
out: Using: docker compose
out: === Pulling images ===
err: + DOCKER_COMPOSE='docker compose'
err: + echo 'Using: docker compose'
err: + echo '=== Pulling images ==='
err: + docker compose pull
err: time="2025-11-05T22:39:45+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err:  caddy Pulling 
err:  web Pulling 
err:  2d35ebdb57d9 Already exists 
err:  60e45a9660cf Already exists 
err:  e74e4ed823e9 Already exists 
err:  da04d522c98f Already exists 
err:  cc7edd42c75d Pulling fs layer 
err:  636f206270f2 Pulling fs layer 
err:  fd4c18cc87aa Pulling fs layer 
err:  99f3c4d2a589 Pulling fs layer 
err:  6fd946b4ebd3 Pulling fs layer 
err:  99f3c4d2a589 Waiting 
err:  6fd946b4ebd3 Waiting 
err:  caddy Pulled 
err:  cc7edd42c75d Downloading [==================================================>]      93B/93B
err:  cc7edd42c75d Verifying Checksum 
err:  cc7edd42c75d Download complete 
err:  cc7edd42c75d Extracting [==================================================>]      93B/93B
err:  cc7edd42c75d Extracting [==================================================>]      93B/93B
err:  cc7edd42c75d Pull complete 
err:  fd4c18cc87aa Downloading [=========================================>         ]  1.378kB/1.654kB
err:  fd4c18cc87aa Downloading [==================================================>]  1.654kB/1.654kB
err:  fd4c18cc87aa Verifying Checksum 
err:  fd4c18cc87aa Download complete 
err:  636f206270f2 Downloading [>                                                  ]  19.29kB/1.926MB
err:  636f206270f2 Download complete 
err:  636f206270f2 Extracting [>                                                  ]  32.77kB/1.926MB
err:  636f206270f2 Extracting [====================>                              ]  786.4kB/1.926MB
err:  99f3c4d2a589 Downloading [==================================================>]     404B/404B
err:  99f3c4d2a589 Verifying Checksum 
err:  99f3c4d2a589 Download complete 
err:  636f206270f2 Extracting [==================================================>]  1.926MB/1.926MB
err:  636f206270f2 Extracting [==================================================>]  1.926MB/1.926MB
err:  636f206270f2 Pull complete 
err:  fd4c18cc87aa Extracting [==================================================>]  1.654kB/1.654kB
err:  fd4c18cc87aa Extracting [==================================================>]  1.654kB/1.654kB
err:  fd4c18cc87aa Pull complete 
err:  99f3c4d2a589 Extracting [==================================================>]     404B/404B
err:  99f3c4d2a589 Extracting [==================================================>]     404B/404B
err:  99f3c4d2a589 Pull complete 
err:  6fd946b4ebd3 Downloading [>                                                  ]  539.5kB/171.2MB
err:  6fd946b4ebd3 Downloading [=>                                                 ]  4.324MB/171.2MB
err:  6fd946b4ebd3 Downloading [==>                                                ]   8.65MB/171.2MB
err:  6fd946b4ebd3 Downloading [===>                                               ]  12.41MB/171.2MB
err:  6fd946b4ebd3 Downloading [====>                                              ]  16.19MB/171.2MB
err:  6fd946b4ebd3 Downloading [=====>                                             ]  19.97MB/171.2MB
err:  6fd946b4ebd3 Downloading [======>                                            ]  23.74MB/171.2MB
err:  6fd946b4ebd3 Downloading [========>                                          ]  27.52MB/171.2MB
err:  6fd946b4ebd3 Downloading [=========>                                         ]   31.3MB/171.2MB
err:  6fd946b4ebd3 Downloading [==========>                                        ]  35.08MB/171.2MB
err:  6fd946b4ebd3 Downloading [===========>                                       ]  38.86MB/171.2MB
err:  6fd946b4ebd3 Downloading [============>                                      ]  42.64MB/171.2MB
err:  6fd946b4ebd3 Downloading [=============>                                     ]  46.42MB/171.2MB
err:  6fd946b4ebd3 Downloading [==============>                                    ]  50.19MB/171.2MB
err:  6fd946b4ebd3 Downloading [===============>                                   ]  53.96MB/171.2MB
err:  6fd946b4ebd3 Downloading [================>                                  ]  57.74MB/171.2MB
err:  6fd946b4ebd3 Downloading [=================>                                 ]  61.52MB/171.2MB
err:  6fd946b4ebd3 Downloading [===================>                               ]   65.3MB/171.2MB
err:  6fd946b4ebd3 Downloading [====================>                              ]  69.07MB/171.2MB
err:  6fd946b4ebd3 Downloading [=====================>                             ]  72.85MB/171.2MB
err:  6fd946b4ebd3 Downloading [======================>                            ]  76.63MB/171.2MB
err:  6fd946b4ebd3 Downloading [=======================>                           ]   80.4MB/171.2MB
err:  6fd946b4ebd3 Downloading [========================>                          ]  84.18MB/171.2MB
err:  6fd946b4ebd3 Downloading [=========================>                         ]  87.96MB/171.2MB
err:  6fd946b4ebd3 Downloading [==========================>                        ]  91.75MB/171.2MB
err:  6fd946b4ebd3 Downloading [===========================>                       ]  95.52MB/171.2MB
err:  6fd946b4ebd3 Downloading [============================>                      ]  99.29MB/171.2MB
err:  6fd946b4ebd3 Downloading [==============================>                    ]  103.1MB/171.2MB
err:  6fd946b4ebd3 Downloading [===============================>                   ]  106.9MB/171.2MB
err:  6fd946b4ebd3 Downloading [================================>                  ]  110.6MB/171.2MB
err:  6fd946b4ebd3 Downloading [=================================>                 ]  114.4MB/171.2MB
err:  6fd946b4ebd3 Downloading [==================================>                ]  118.2MB/171.2MB
err:  6fd946b4ebd3 Downloading [===================================>               ]    122MB/171.2MB
err:  6fd946b4ebd3 Downloading [====================================>              ]  125.7MB/171.2MB
err:  6fd946b4ebd3 Downloading [=====================================>             ]  129.5MB/171.2MB
err:  6fd946b4ebd3 Downloading [======================================>            ]  133.3MB/171.2MB
err:  6fd946b4ebd3 Downloading [========================================>          ]  137.1MB/171.2MB
err:  6fd946b4ebd3 Downloading [=========================================>         ]  140.9MB/171.2MB
err:  6fd946b4ebd3 Downloading [==========================================>        ]  144.6MB/171.2MB
err:  6fd946b4ebd3 Downloading [===========================================>       ]  148.4MB/171.2MB
err:  6fd946b4ebd3 Downloading [============================================>      ]  152.2MB/171.2MB
err:  6fd946b4ebd3 Downloading [=============================================>     ]    156MB/171.2MB
err:  6fd946b4ebd3 Downloading [==============================================>    ]  159.8MB/171.2MB
err:  6fd946b4ebd3 Downloading [===============================================>   ]  163.5MB/171.2MB
err:  6fd946b4ebd3 Downloading [================================================>  ]  167.3MB/171.2MB
err:  6fd946b4ebd3 Downloading [=================================================> ]  171.1MB/171.2MB
err:  6fd946b4ebd3 Verifying Checksum 
err:  6fd946b4ebd3 Download complete 
err:  6fd946b4ebd3 Extracting [>                                                  ]  557.1kB/171.2MB
err:  6fd946b4ebd3 Extracting [>                                                  ]  1.114MB/171.2MB
err:  6fd946b4ebd3 Extracting [>                                                  ]  1.671MB/171.2MB
err:  6fd946b4ebd3 Extracting [>                                                  ]  2.785MB/171.2MB
err:  6fd946b4ebd3 Extracting [=>                                                 ]  6.128MB/171.2MB
err:  6fd946b4ebd3 Extracting [==>                                                ]   9.47MB/171.2MB
err:  6fd946b4ebd3 Extracting [===>                                               ]  12.81MB/171.2MB
err:  6fd946b4ebd3 Extracting [====>                                              ]  16.15MB/171.2MB
err:  6fd946b4ebd3 Extracting [=====>                                             ]  18.38MB/171.2MB
err:  6fd946b4ebd3 Extracting [=====>                                             ]  20.05MB/171.2MB
err:  6fd946b4ebd3 Extracting [======>                                            ]  22.28MB/171.2MB
err:  6fd946b4ebd3 Extracting [=======>                                           ]  25.62MB/171.2MB
err:  6fd946b4ebd3 Extracting [========>                                          ]  28.41MB/171.2MB
err:  6fd946b4ebd3 Extracting [=========>                                         ]  31.75MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========>                                        ]  34.54MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========>                                        ]  37.32MB/171.2MB
err:  6fd946b4ebd3 Extracting [===========>                                       ]  40.11MB/171.2MB
err:  6fd946b4ebd3 Extracting [============>                                      ]  43.45MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============>                                     ]  46.79MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============>                                    ]  50.14MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============>                                   ]  52.92MB/171.2MB
err:  6fd946b4ebd3 Extracting [================>                                  ]  55.71MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================>                                 ]  59.05MB/171.2MB
err:  6fd946b4ebd3 Extracting [==================>                                ]  61.83MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================>                               ]  65.18MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================>                               ]   67.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [====================>                              ]  70.19MB/171.2MB
err:  6fd946b4ebd3 Extracting [=====================>                             ]  73.53MB/171.2MB
err:  6fd946b4ebd3 Extracting [======================>                            ]  76.87MB/171.2MB
err:  6fd946b4ebd3 Extracting [=======================>                           ]  79.66MB/171.2MB
err:  6fd946b4ebd3 Extracting [========================>                          ]     83MB/171.2MB
err:  6fd946b4ebd3 Extracting [=========================>                         ]  85.79MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========================>                        ]  89.13MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========================>                        ]  91.91MB/171.2MB
err:  6fd946b4ebd3 Extracting [===========================>                       ]   94.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [============================>                      ]  98.04MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============================>                     ]  101.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================>                    ]  104.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================>                   ]  107.5MB/171.2MB
err:  6fd946b4ebd3 Extracting [================================>                  ]  110.9MB/171.2MB
err:  6fd946b4ebd3 Extracting [================================>                  ]    112MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================>                 ]  114.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================>                 ]  115.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================>                 ]  116.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [==================================>                ]  118.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [==================================>                ]  119.2MB/171.2MB
err:  6fd946b4ebd3 Extracting [==================================>                ]  119.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]  120.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]  120.9MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]  121.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]    122MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]  122.6MB/171.2MB
err:  6fd946b4ebd3 Extracting [===================================>               ]  123.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [====================================>              ]  123.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [====================================>              ]  124.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [=====================================>             ]  128.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [======================================>            ]  131.5MB/171.2MB
err:  6fd946b4ebd3 Extracting [======================================>            ]    132MB/171.2MB
err:  6fd946b4ebd3 Extracting [======================================>            ]  132.6MB/171.2MB
err:  6fd946b4ebd3 Extracting [======================================>            ]  133.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [=======================================>           ]  133.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [=======================================>           ]  135.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [========================================>          ]    137MB/171.2MB
err:  6fd946b4ebd3 Extracting [========================================>          ]  139.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [=========================================>         ]    142MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========================================>        ]  144.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [==========================================>        ]  147.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [===========================================>       ]  149.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [============================================>      ]    151MB/171.2MB
err:  6fd946b4ebd3 Extracting [============================================>      ]  152.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [============================================>      ]  153.2MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============================================>     ]  154.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============================================>     ]  155.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============================================>     ]    156MB/171.2MB
err:  6fd946b4ebd3 Extracting [=============================================>     ]  157.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  157.6MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  158.2MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  158.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  159.3MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  159.9MB/171.2MB
err:  6fd946b4ebd3 Extracting [==============================================>    ]  160.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]    161MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]  161.5MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]  162.1MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]  162.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]  163.2MB/171.2MB
err:  6fd946b4ebd3 Extracting [===============================================>   ]  163.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [================================================>  ]  165.4MB/171.2MB
err:  6fd946b4ebd3 Extracting [================================================>  ]    166MB/171.2MB
err:  6fd946b4ebd3 Extracting [================================================>  ]  167.7MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================================> ]  168.8MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================================> ]  170.5MB/171.2MB
err:  6fd946b4ebd3 Extracting [=================================================> ]    171MB/171.2MB
err:  6fd946b4ebd3 Extracting [==================================================>]  171.2MB/171.2MB
err:  6fd946b4ebd3 Pull complete 
err:  web Pulled 
err: + echo '=== Checking port usage ==='
err: + sudo lsof -i :80
out: === Checking port usage ===
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + echo 'Port 80 is free'
err: + sudo lsof -i :443
out: Port 80 is free
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + echo 'Port 443 is free'
err: + sudo lsof -i :8080
out: Port 443 is free
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + echo 'Port 8080 is free'
err: + sudo lsof -i :8443
out: Port 8080 is free
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + echo 'Port 8443 is free'
out: Port 8443 is free
err: + sudo netstat -tulpn
err: + grep -E ':(80|443|8080|8443)'
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + echo 'No processes found on ports 80/443/8080/8443'
err: + echo '=== Stopping existing containers ==='
out: No processes found on ports 80/443/8080/8443
out: === Stopping existing containers ===
err: + docker compose down
err: time="2025-11-05T22:40:06+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err:  Container savedgenesis-caddy-1  Stopping
err:  Container savedgenesis-caddy-1  Stopped
err:  Container savedgenesis-caddy-1  Removing
err:  Container savedgenesis-caddy-1  Removed
err:  Container savedgenesis-web-1  Stopping
err:  Container savedgenesis-web-1  Stopped
err:  Container savedgenesis-web-1  Removing
err:  Container savedgenesis-web-1  Removed
err:  Network savedgenesis_default  Removing
err:  Network savedgenesis_default  Removed
err: + echo '=== Starting containers ==='
err: + docker compose up -d
out: === Starting containers ===
err: time="2025-11-05T22:40:08+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err:  Network savedgenesis_default  Creating
err:  Network savedgenesis_default  Created
err:  Container savedgenesis-web-1  Creating
err:  Container savedgenesis-web-1  Created
err:  Container savedgenesis-caddy-1  Creating
err:  Container savedgenesis-caddy-1  Created
err:  Container savedgenesis-web-1  Starting
err:  Container savedgenesis-web-1  Started
err:  Container savedgenesis-caddy-1  Starting
err: Error response from daemon: driver failed programming external connectivity on endpoint savedgenesis-caddy-1 (3d384ba5dbce3936557aa78d38e80f8057e0885e3d86320a04a70a2adf8868f4): Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use
err: + echo 'ERROR: Failed to start containers'
out: ERROR: Failed to start containers
err: + echo 'Checking what'\''s using ports 80/443:'
err: + sudo lsof -i :80
out: Checking what's using ports 80/443:
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + true
err: + sudo lsof -i :443
err: sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
err: sudo: a password is required
err: + true
err: + echo 'Checking if containers started:'
out: Checking if containers started:
err: + docker compose ps
err: time="2025-11-05T22:40:09+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
out: NAME                 IMAGE                                         COMMAND                  SERVICE   CREATED        STATUS                  PORTS
out: savedgenesis-web-1   ghcr.io/savedgenesis/savedgenesisdev:latest   "docker-entrypoint.s…"   web       1 second ago   Up Less than a second   3000/tcp
err: + exit 1
2025/11/05 21:40:09 Process exited with status 1