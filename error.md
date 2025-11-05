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
/usr/bin/docker run --name f6583f478ca6ec94024253ae50fa1577a35fdb_8d7ec9 --label f6583f --workdir /github/workspace --rm -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_SCRIPT" -e "INPUT_PORT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "INPUT_REQUEST_PTY" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION
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
err: + echo '=== Starting ***ment ==='
out: === Starting ***ment ===
err: ++ whoami
err: + echo 'Current user: ***'
out: Current user: ***
err: ++ pwd
err: + echo 'Current directory: /home/***'
err: + sudo mkdir -p /srv/savedgenesis
out: Current directory: /home/***
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
out: CONTAINER ID   IMAGE                               COMMAND                  CREATED             STATUS             PORTS                                                                                                                        NAMES
out: 754c1cec93c0   ghcr.io/pterodactyl/yolks:java_21   "/__cacert_entrypoin…"   About an hour ago   Up About an hour   ***:25566->25566/tcp, ***:25566->25566/udp                                                                 19bc5adf-90db-4fc9-87ad-be566ef39e0d
out: 5110ca77ccd4   ghcr.io/pterodactyl/yolks:java_21   "/__cacert_entrypoin…"   About an hour ago   Up About an hour   ***:25569->25569/tcp, ***:25569->25569/udp, ***:25571->25571/tcp, ***:25571->25571/udp   b03b2629-743b-4760-8388-a16c9a889055
out: c918a458f189   ghcr.io/pterodactyl/yolks:java_21   "/__cacert_entrypoin…"   2 days ago          Up 2 days          ***:25565->25565/tcp, ***:25565->25565/udp                                                                 5286dd99-0dfd-48e6-b00b-7697aa450e4d
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
err: + ls -la docker-compose.yml
out: docker-compose.yml created
out: -rw-rw-r-- 1 *** *** 430 Nov  5 22:24 docker-compose.yml
err: + echo '=== Creating Caddyfile ==='
err: + cat
out: === Creating Caddyfile ===
err: + echo 'Caddyfile created'
err: + ls -la Caddyfile
out: Caddyfile created
out: -rw-rw-r-- 1 *** *** 286 Nov  5 22:24 Caddyfile
err: + echo '=== Verifying files ==='
err: + ls -la /srv/savedgenesis/
out: === Verifying files ===
out: total 16
out: drwxr-xr-x 2 *** *** 4096 Nov  5 22:24 .
out: drwxr-xr-x 3 root   root   4096 Nov  5 20:36 ..
out: -rw-rw-r-- 1 *** ***  286 Nov  5 22:24 Caddyfile
out: -rw-rw-r-- 1 *** ***  430 Nov  5 22:24 docker-compose.yml
err: + echo '=== Determining docker compose command ==='
err: + command -v docker
err: + docker compose version
out: === Determining docker compose command ===
out: Using: docker compose
out: === Pulling images ===
err: + DOCKER_COMPOSE='docker compose'
err: + echo 'Using: docker compose'
err: + echo '=== Pulling images ==='
err: + docker compose pull
err: time="2025-11-05T22:24:07+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err:  web Pulling 
err:  caddy Pulling 
err:  2d35ebdb57d9 Pulling fs layer 
err:  60e45a9660cf Pulling fs layer 
err:  e74e4ed823e9 Pulling fs layer 
err:  da04d522c98f Pulling fs layer 
err:  cbf3cc6d261c Pulling fs layer 
err:  e35ef68e6635 Pulling fs layer 
err:  b76d13baabec Pulling fs layer 
err:  2fbb5229a454 Pulling fs layer 
err:  7c20e60e921d Pulling fs layer 
err:  da04d522c98f Waiting 
err:  cbf3cc6d261c Waiting 
err:  e35ef68e6635 Waiting 
err:  b76d13baabec Waiting 
err:  7c20e60e921d Waiting 
err:  2fbb5229a454 Waiting 
err:  e74e4ed823e9 Downloading [>                                                  ]  13.78kB/1.261MB
err:  2d35ebdb57d9 Downloading [>                                                  ]  39.38kB/3.802MB
err:  60e45a9660cf Downloading [>                                                  ]  439.8kB/42.75MB
err:  e74e4ed823e9 Verifying Checksum 
err:  e74e4ed823e9 Download complete 
err:  2d35ebdb57d9 Downloading [===============>                                   ]  1.158MB/3.802MB
err:  60e45a9660cf Downloading [==>                                                ]  2.209MB/42.75MB
err:  2d35ebdb57d9 Downloading [======================================>            ]  2.915MB/3.802MB
err:  60e45a9660cf Downloading [=====>                                             ]  4.416MB/42.75MB
err:  2d35ebdb57d9 Download complete 
err:  da04d522c98f Downloading [==================================================>]     444B/444B
err:  da04d522c98f Verifying Checksum 
err:  2d35ebdb57d9 Extracting [>                                                  ]  65.54kB/3.802MB
err:  60e45a9660cf Downloading [=========>                                         ]  7.949MB/42.75MB
err:  2d35ebdb57d9 Extracting [===============>                                   ]   1.18MB/3.802MB
err:  60e45a9660cf Downloading [=============>                                     ]  11.92MB/42.75MB
err:  2d35ebdb57d9 Extracting [================================================>  ]   3.67MB/3.802MB
err:  2d35ebdb57d9 Extracting [==================================================>]  3.802MB/3.802MB
err:  cbf3cc6d261c Downloading [==================================================>]      92B/92B
err:  cbf3cc6d261c Download complete 
err:  2d35ebdb57d9 Pull complete 
err:  63b69af3dc55 Pulling fs layer 
err:  60177795cab3 Pulling fs layer 
err:  6ccef1045412 Pulling fs layer 
err:  63b69af3dc55 Waiting 
err:  60177795cab3 Waiting 
err:  b44c500748de Pulling fs layer 
err:  6ccef1045412 Waiting 
err:  4f4fb700ef54 Pulling fs layer 
err:  b44c500748de Waiting 
err:  4f4fb700ef54 Waiting 
err:  60e45a9660cf Downloading [==================>                                ]   15.9MB/42.75MB
err:  e35ef68e6635 Downloading [>                                                  ]   20.5kB/1.926MB
err:  60e45a9660cf Downloading [=======================>                           ]  19.88MB/42.75MB
err:  e35ef68e6635 Downloading [====>                                              ]    179kB/1.926MB
err:  60e45a9660cf Downloading [===========================>                       ]  23.41MB/42.75MB
err:  e35ef68e6635 Downloading [==========>                                        ]  408.4kB/1.926MB
err:  60e45a9660cf Downloading [===============================>                   ]  26.94MB/42.75MB
err:  e35ef68e6635 Downloading [================>                                  ]  637.8kB/1.926MB
err:  b76d13baabec Downloading [=========================================>         ]  1.378kB/1.654kB
err:  b76d13baabec Downloading [==================================================>]  1.654kB/1.654kB
err:  b76d13baabec Download complete 
err:  60e45a9660cf Downloading [===================================>               ]  30.48MB/42.75MB
err:  e35ef68e6635 Downloading [======================>                            ]  867.1kB/1.926MB
err:  60e45a9660cf Downloading [=======================================>           ]     34MB/42.75MB
err:  e35ef68e6635 Downloading [============================>                      ]  1.097MB/1.926MB
err:  60e45a9660cf Downloading [===========================================>       ]  37.54MB/42.75MB
err:  e35ef68e6635 Downloading [==================================>                ]  1.326MB/1.926MB
err:  60e45a9660cf Downloading [================================================>  ]  41.07MB/42.75MB
err:  60e45a9660cf Verifying Checksum 
err:  60e45a9660cf Download complete 
err:  e35ef68e6635 Download complete 
err:  60e45a9660cf Extracting [>                                                  ]  458.8kB/42.75MB
err:  2fbb5229a454 Downloading [==================================================>]     402B/402B
err:  2fbb5229a454 Verifying Checksum 
err:  2fbb5229a454 Download complete 
err:  60e45a9660cf Extracting [===>                                               ]  3.211MB/42.75MB
err:  60e45a9660cf Extracting [======>                                            ]  5.505MB/42.75MB
err:  60e45a9660cf Extracting [=========>                                         ]  8.258MB/42.75MB
err:  7c20e60e921d Downloading [>                                                  ]  539.5kB/171.2MB
err:  63b69af3dc55 Downloading [>                                                  ]  36.54kB/3.614MB
err:  60e45a9660cf Extracting [=============>                                     ]  11.93MB/42.75MB
err:  60177795cab3 Downloading [>                                                  ]  3.689kB/343.6kB
err:  7c20e60e921d Downloading [>                                                  ]  3.243MB/171.2MB
err:  63b69af3dc55 Downloading [=================>                                 ]  1.257MB/3.614MB
err:  60e45a9660cf Extracting [=================>                                 ]  15.14MB/42.75MB
err:  60177795cab3 Downloading [==================================================>]  343.6kB/343.6kB
err:  60177795cab3 Verifying Checksum 
err:  60177795cab3 Download complete 
err:  7c20e60e921d Downloading [=>                                                 ]  5.406MB/171.2MB
err:  63b69af3dc55 Downloading [====================================>              ]  2.621MB/3.614MB
err:  60e45a9660cf Extracting [====================>                              ]  17.89MB/42.75MB
err:  63b69af3dc55 Verifying Checksum 
err:  63b69af3dc55 Download complete 
err:  7c20e60e921d Downloading [==>                                                ]  8.094MB/171.2MB
err:  63b69af3dc55 Extracting [>                                                  ]  65.54kB/3.614MB
err:  60e45a9660cf Extracting [=======================>                           ]  20.19MB/42.75MB
err:  7c20e60e921d Downloading [===>                                               ]  11.88MB/171.2MB
err:  63b69af3dc55 Extracting [===========================>                       ]  1.966MB/3.614MB
err:  60e45a9660cf Extracting [===========================>                       ]   23.4MB/42.75MB
err:  7c20e60e921d Downloading [====>                                              ]  15.66MB/171.2MB
err:  63b69af3dc55 Extracting [=================================================> ]  3.604MB/3.614MB
err:  63b69af3dc55 Extracting [==================================================>]  3.614MB/3.614MB
err:  63b69af3dc55 Pull complete 
err:  60177795cab3 Extracting [====>                                              ]  32.77kB/343.6kB
err:  60e45a9660cf Extracting [==============================>                    ]  26.15MB/42.75MB
err:  7c20e60e921d Downloading [=====>                                             ]  19.44MB/171.2MB
err:  60177795cab3 Extracting [===============================================>   ]  327.7kB/343.6kB
err:  6ccef1045412 Downloading [======>                                            ]     953B/7.451kB
err:  6ccef1045412 Downloading [==================================================>]  7.451kB/7.451kB
err:  6ccef1045412 Verifying Checksum 
err:  6ccef1045412 Download complete 
err:  60177795cab3 Extracting [==================================================>]  343.6kB/343.6kB
err:  60e45a9660cf Extracting [==================================>                ]  29.82MB/42.75MB
err:  60177795cab3 Extracting [==================================================>]  343.6kB/343.6kB
err:  7c20e60e921d Downloading [======>                                            ]  23.22MB/171.2MB
err:  60177795cab3 Pull complete 
err:  6ccef1045412 Extracting [==================================================>]  7.451kB/7.451kB
err:  6ccef1045412 Extracting [==================================================>]  7.451kB/7.451kB
err:  6ccef1045412 Pull complete 
err:  60e45a9660cf Extracting [=====================================>             ]  31.65MB/42.75MB
err:  7c20e60e921d Downloading [=======>                                           ]     27MB/171.2MB
err:  b44c500748de Downloading [>                                                  ]  150.1kB/14.64MB
err:  60e45a9660cf Extracting [========================================>          ]  34.41MB/42.75MB
err:  7c20e60e921d Downloading [========>                                          ]  30.77MB/171.2MB
err:  7c20e60e921d Downloading [=========>                                         ]  34.01MB/171.2MB
err:  b44c500748de Downloading [==>                                                ]  606.2kB/14.64MB
err:  60e45a9660cf Extracting [===========================================>       ]  37.16MB/42.75MB
err:  7c20e60e921d Downloading [==========>                                        ]  37.24MB/171.2MB
err:  b44c500748de Downloading [=====>                                             ]  1.655MB/14.64MB
err:  60e45a9660cf Extracting [==============================================>    ]  39.45MB/42.75MB
err:  7c20e60e921d Downloading [===========>                                       ]  39.92MB/171.2MB
err:  b44c500748de Downloading [==========>                                        ]  2.982MB/14.64MB
err:  60e45a9660cf Extracting [==============================================>    ]  39.91MB/42.75MB
err:  7c20e60e921d Downloading [============>                                      ]  42.62MB/171.2MB
err:  b44c500748de Downloading [===============>                                   ]  4.473MB/14.64MB
err:  4f4fb700ef54 Downloading [==================================================>]      32B/32B
err:  4f4fb700ef54 Verifying Checksum 
err:  4f4fb700ef54 Download complete 
err:  60e45a9660cf Extracting [===============================================>   ]  40.37MB/42.75MB
err:  7c20e60e921d Downloading [=============>                                     ]  45.32MB/171.2MB
err:  b44c500748de Downloading [====================>                              ]  5.964MB/14.64MB
err:  7c20e60e921d Downloading [=============>                                     ]  47.47MB/171.2MB
err:  b44c500748de Downloading [==========================>                        ]  7.619MB/14.64MB
err:  60e45a9660cf Extracting [===============================================>   ]  40.83MB/42.75MB
err:  7c20e60e921d Downloading [==============>                                    ]  49.63MB/171.2MB
err:  b44c500748de Downloading [===============================>                   ]  9.298MB/14.64MB
err:  b44c500748de Downloading [=====================================>             ]  10.93MB/14.64MB
err:  7c20e60e921d Downloading [===============>                                   ]  52.33MB/171.2MB
err:  60e45a9660cf Extracting [================================================>  ]  41.29MB/42.75MB
err:  b44c500748de Downloading [==========================================>        ]  12.57MB/14.64MB
err:  7c20e60e921d Downloading [===============>                                   ]  54.48MB/171.2MB
err:  60e45a9660cf Extracting [================================================>  ]  41.75MB/42.75MB
err:  b44c500748de Downloading [=================================================> ]  14.35MB/14.64MB
err:  7c20e60e921d Downloading [================>                                  ]  56.64MB/171.2MB
err:  b44c500748de Download complete 
err:  b44c500748de Extracting [>                                                  ]  163.8kB/14.64MB
err:  60e45a9660cf Extracting [=================================================> ]  42.21MB/42.75MB
err:  7c20e60e921d Downloading [=================>                                 ]  60.42MB/171.2MB
err:  b44c500748de Extracting [==========>                                        ]  3.113MB/14.64MB
err:  60e45a9660cf Extracting [=================================================> ]  42.66MB/42.75MB
err:  7c20e60e921d Downloading [==================>                                ]  64.19MB/171.2MB
err:  b44c500748de Extracting [=====================>                             ]  6.226MB/14.64MB
err:  60e45a9660cf Extracting [==================================================>]  42.75MB/42.75MB
err:  60e45a9660cf Pull complete 
err:  e74e4ed823e9 Extracting [=>                                                 ]  32.77kB/1.261MB
err:  7c20e60e921d Downloading [===================>                               ]  67.98MB/171.2MB
err:  b44c500748de Extracting [=============================>                     ]  8.684MB/14.64MB
err:  e74e4ed823e9 Extracting [==================================================>]  1.261MB/1.261MB
err:  e74e4ed823e9 Extracting [==================================================>]  1.261MB/1.261MB
err:  e74e4ed823e9 Pull complete 
err:  da04d522c98f Extracting [==================================================>]     444B/444B
err:  da04d522c98f Extracting [==================================================>]     444B/444B
err:  da04d522c98f Pull complete 
err:  cbf3cc6d261c Extracting [==================================================>]      92B/92B
err:  cbf3cc6d261c Extracting [==================================================>]      92B/92B
err:  cbf3cc6d261c Pull complete 
err:  e35ef68e6635 Extracting [>                                                  ]  32.77kB/1.926MB
err:  7c20e60e921d Downloading [====================>                              ]  71.75MB/171.2MB
err:  b44c500748de Extracting [=======================================>           ]  11.47MB/14.64MB
err:  e35ef68e6635 Extracting [=================>                                 ]  655.4kB/1.926MB
err:  7c20e60e921d Downloading [======================>                            ]  75.52MB/171.2MB
err:  b44c500748de Extracting [=================================================> ]  14.58MB/14.64MB
err:  b44c500748de Extracting [==================================================>]  14.64MB/14.64MB
err:  b44c500748de Pull complete 
err:  4f4fb700ef54 Extracting [==================================================>]      32B/32B
err:  4f4fb700ef54 Extracting [==================================================>]      32B/32B
err:  4f4fb700ef54 Pull complete 
err:  e35ef68e6635 Extracting [===========================================>       ]  1.671MB/1.926MB
err:  caddy Pulled 
err:  7c20e60e921d Downloading [=======================>                           ]   79.3MB/171.2MB
err:  e35ef68e6635 Extracting [==================================================>]  1.926MB/1.926MB
err:  e35ef68e6635 Extracting [==================================================>]  1.926MB/1.926MB
err:  e35ef68e6635 Pull complete 
err:  b76d13baabec Extracting [==================================================>]  1.654kB/1.654kB
err:  b76d13baabec Extracting [==================================================>]  1.654kB/1.654kB
err:  b76d13baabec Pull complete 
err:  2fbb5229a454 Extracting [==================================================>]     402B/402B
err:  2fbb5229a454 Extracting [==================================================>]     402B/402B
err:  2fbb5229a454 Pull complete 
err:  7c20e60e921d Downloading [========================>                          ]  83.06MB/171.2MB
err:  7c20e60e921d Downloading [=========================>                         ]  86.83MB/171.2MB
err:  7c20e60e921d Downloading [==========================>                        ]  90.61MB/171.2MB
err:  7c20e60e921d Downloading [===========================>                       ]  94.38MB/171.2MB
err:  7c20e60e921d Downloading [============================>                      ]  98.16MB/171.2MB
err:  7c20e60e921d Downloading [=============================>                     ]  101.9MB/171.2MB
err:  7c20e60e921d Downloading [==============================>                    ]  105.7MB/171.2MB
err:  7c20e60e921d Downloading [===============================>                   ]  109.5MB/171.2MB
err:  7c20e60e921d Downloading [=================================>                 ]  113.3MB/171.2MB
err:  7c20e60e921d Downloading [==================================>                ]    117MB/171.2MB
err:  7c20e60e921d Downloading [===================================>               ]  120.8MB/171.2MB
err:  7c20e60e921d Downloading [====================================>              ]  124.6MB/171.2MB
err:  7c20e60e921d Downloading [=====================================>             ]  128.4MB/171.2MB
err:  7c20e60e921d Downloading [======================================>            ]  132.2MB/171.2MB
err:  7c20e60e921d Downloading [=======================================>           ]  136.5MB/171.2MB
err:  7c20e60e921d Downloading [========================================>          ]  140.3MB/171.2MB
err:  7c20e60e921d Downloading [==========================================>        ]    144MB/171.2MB
err:  7c20e60e921d Downloading [===========================================>       ]  147.8MB/171.2MB
err:  7c20e60e921d Downloading [============================================>      ]  151.6MB/171.2MB
err:  7c20e60e921d Downloading [=============================================>     ]  155.4MB/171.2MB
err:  7c20e60e921d Downloading [==============================================>    ]  159.1MB/171.2MB
err:  7c20e60e921d Downloading [===============================================>   ]  162.9MB/171.2MB
err:  7c20e60e921d Downloading [================================================>  ]  166.7MB/171.2MB
err:  7c20e60e921d Downloading [=================================================> ]  170.5MB/171.2MB
err:  7c20e60e921d Verifying Checksum 
err:  7c20e60e921d Download complete 
err:  7c20e60e921d Extracting [>                                                  ]  557.1kB/171.2MB
err:  7c20e60e921d Extracting [>                                                  ]  1.114MB/171.2MB
err:  7c20e60e921d Extracting [>                                                  ]  1.671MB/171.2MB
err:  7c20e60e921d Extracting [>                                                  ]  2.785MB/171.2MB
err:  7c20e60e921d Extracting [=>                                                 ]  6.128MB/171.2MB
err:  7c20e60e921d Extracting [==>                                                ]   9.47MB/171.2MB
err:  7c20e60e921d Extracting [===>                                               ]   11.7MB/171.2MB
err:  7c20e60e921d Extracting [====>                                              ]  15.04MB/171.2MB
err:  7c20e60e921d Extracting [=====>                                             ]  18.38MB/171.2MB
err:  7c20e60e921d Extracting [=====>                                             ]  20.05MB/171.2MB
err:  7c20e60e921d Extracting [======>                                            ]  22.84MB/171.2MB
err:  7c20e60e921d Extracting [=======>                                           ]  25.62MB/171.2MB
err:  7c20e60e921d Extracting [========>                                          ]  28.41MB/171.2MB
err:  7c20e60e921d Extracting [=========>                                         ]   31.2MB/171.2MB
err:  7c20e60e921d Extracting [==========>                                        ]  34.54MB/171.2MB
err:  7c20e60e921d Extracting [===========>                                       ]  37.88MB/171.2MB
err:  7c20e60e921d Extracting [===========>                                       ]  40.67MB/171.2MB
err:  7c20e60e921d Extracting [============>                                      ]  43.45MB/171.2MB
err:  7c20e60e921d Extracting [=============>                                     ]  46.24MB/171.2MB
err:  7c20e60e921d Extracting [==============>                                    ]  49.02MB/171.2MB
err:  7c20e60e921d Extracting [===============>                                   ]  51.81MB/171.2MB
err:  7c20e60e921d Extracting [================>                                  ]  55.15MB/171.2MB
err:  7c20e60e921d Extracting [=================>                                 ]  58.49MB/171.2MB
err:  7c20e60e921d Extracting [=================>                                 ]  61.28MB/171.2MB
err:  7c20e60e921d Extracting [==================>                                ]  64.62MB/171.2MB
err:  7c20e60e921d Extracting [===================>                               ]  66.29MB/171.2MB
err:  7c20e60e921d Extracting [====================>                              ]  68.52MB/171.2MB
err:  7c20e60e921d Extracting [====================>                              ]   71.3MB/171.2MB
err:  7c20e60e921d Extracting [=====================>                             ]  73.53MB/171.2MB
err:  7c20e60e921d Extracting [======================>                            ]  76.87MB/171.2MB
err:  7c20e60e921d Extracting [=======================>                           ]  80.22MB/171.2MB
err:  7c20e60e921d Extracting [========================>                          ]     83MB/171.2MB
err:  7c20e60e921d Extracting [=========================>                         ]  85.79MB/171.2MB
err:  7c20e60e921d Extracting [=========================>                         ]  88.01MB/171.2MB
err:  7c20e60e921d Extracting [==========================>                        ]   90.8MB/171.2MB
err:  7c20e60e921d Extracting [===========================>                       ]  94.14MB/171.2MB
err:  7c20e60e921d Extracting [============================>                      ]  97.48MB/171.2MB
err:  7c20e60e921d Extracting [=============================>                     ]  101.4MB/171.2MB
err:  7c20e60e921d Extracting [==============================>                    ]  104.7MB/171.2MB
err:  7c20e60e921d Extracting [===============================>                   ]  107.5MB/171.2MB
err:  7c20e60e921d Extracting [================================>                  ]  110.9MB/171.2MB
err:  7c20e60e921d Extracting [================================>                  ]    112MB/171.2MB
err:  7c20e60e921d Extracting [=================================>                 ]  114.8MB/171.2MB
err:  7c20e60e921d Extracting [=================================>                 ]  115.3MB/171.2MB
err:  7c20e60e921d Extracting [=================================>                 ]  116.4MB/171.2MB
err:  7c20e60e921d Extracting [==================================>                ]  118.1MB/171.2MB
err:  7c20e60e921d Extracting [==================================>                ]  119.2MB/171.2MB
err:  7c20e60e921d Extracting [==================================>                ]  119.8MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]  120.3MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]  120.9MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]  121.4MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]    122MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]  122.6MB/171.2MB
err:  7c20e60e921d Extracting [===================================>               ]  123.1MB/171.2MB
err:  7c20e60e921d Extracting [====================================>              ]  123.7MB/171.2MB
err:  7c20e60e921d Extracting [====================================>              ]  124.2MB/171.2MB
err:  7c20e60e921d Extracting [=====================================>             ]  127.6MB/171.2MB
err:  7c20e60e921d Extracting [======================================>            ]  130.9MB/171.2MB
err:  7c20e60e921d Extracting [======================================>            ]    132MB/171.2MB
err:  7c20e60e921d Extracting [======================================>            ]  132.6MB/171.2MB
err:  7c20e60e921d Extracting [======================================>            ]  133.1MB/171.2MB
err:  7c20e60e921d Extracting [=======================================>           ]  133.7MB/171.2MB
err:  7c20e60e921d Extracting [=======================================>           ]  135.4MB/171.2MB
err:  7c20e60e921d Extracting [========================================>          ]    137MB/171.2MB
err:  7c20e60e921d Extracting [========================================>          ]  139.3MB/171.2MB
err:  7c20e60e921d Extracting [=========================================>         ]    142MB/171.2MB
err:  7c20e60e921d Extracting [==========================================>        ]  144.3MB/171.2MB
err:  7c20e60e921d Extracting [==========================================>        ]  146.5MB/171.2MB
err:  7c20e60e921d Extracting [===========================================>       ]  148.7MB/171.2MB
err:  7c20e60e921d Extracting [============================================>      ]    151MB/171.2MB
err:  7c20e60e921d Extracting [============================================>      ]  153.2MB/171.2MB
err:  7c20e60e921d Extracting [=============================================>     ]  154.9MB/171.2MB
err:  7c20e60e921d Extracting [=============================================>     ]    156MB/171.2MB
err:  7c20e60e921d Extracting [=============================================>     ]  157.1MB/171.2MB
err:  7c20e60e921d Extracting [==============================================>    ]  157.6MB/171.2MB
err:  7c20e60e921d Extracting [==============================================>    ]  158.2MB/171.2MB
err:  7c20e60e921d Extracting [==============================================>    ]  158.8MB/171.2MB
err:  7c20e60e921d Extracting [==============================================>    ]  159.9MB/171.2MB
err:  7c20e60e921d Extracting [==============================================>    ]  160.4MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]    161MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]  161.5MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]  162.1MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]  162.7MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]  163.2MB/171.2MB
err:  7c20e60e921d Extracting [===============================================>   ]  163.8MB/171.2MB
err:  7c20e60e921d Extracting [================================================>  ]  165.4MB/171.2MB
err:  7c20e60e921d Extracting [================================================>  ]    166MB/171.2MB
err:  7c20e60e921d Extracting [================================================>  ]  167.7MB/171.2MB
err:  7c20e60e921d Extracting [=================================================> ]  169.3MB/171.2MB
err:  7c20e60e921d Extracting [=================================================> ]    171MB/171.2MB
err:  7c20e60e921d Extracting [==================================================>]  171.2MB/171.2MB
err:  7c20e60e921d Pull complete 
err:  web Pulled 
err: + echo '=== Stopping existing containers ==='
err: + docker compose down
out: === Stopping existing containers ===
err: time="2025-11-05T22:24:29+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err: + echo '=== Starting containers ==='
out: === Starting containers ===
err: + docker compose up -d
err: time="2025-11-05T22:24:29+01:00" level=warning msg="/srv/savedgenesis/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
err:  Network savedgenesis_default  Creating
err:  Network savedgenesis_default  Created
err:  Volume savedgenesis_caddy_config  Creating
err:  Volume savedgenesis_caddy_config  Created
err:  Volume savedgenesis_caddy_data  Creating
err:  Volume savedgenesis_caddy_data  Created
err:  Container savedgenesis-web-1  Creating
err:  Container savedgenesis-web-1  Created
err:  Container savedgenesis-caddy-1  Creating
err:  Container savedgenesis-caddy-1  Created
err:  Container savedgenesis-web-1  Starting
err:  Container savedgenesis-web-1  Started
err:  Container savedgenesis-caddy-1  Starting
err: Error response from daemon: driver failed programming external connectivity on endpoint savedgenesis-caddy-1 (bb0b678dbc019da63a041f0f4253b756e225456c47e0d6cd1dc0c8dcec27827e): Error starting userland proxy: listen tcp4 0.0.0.0:443: bind: address already in use
err: + echo 'ERROR: Failed to start containers'
err: + exit 1
out: ERROR: Failed to start containers
2025/11/05 21:24:30 Process exited with status 1