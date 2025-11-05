# VPS Setup Guide for savedgenesis.com

This guide walks you through setting up your Debian 12 VPS for the savedgenesis.com website.

## Prerequisites

- Debian 12 VPS with root/root access
- Your public SSH key (usually `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`)
- Access to GoDaddy DNS management

## Step 1: Connect to Your VPS

SSH into your VPS as root:

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP address you set in `VPS_HOST`.

## Step 2: Create Deploy User

Run these commands on your VPS:

```bash
# Create the deploy user
adduser deploy
# When prompted, set a strong password (you won't use it often, but good for sudo)

# Add deploy to sudo group
usermod -aG sudo deploy

# Create .ssh directory
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Add your SSH public key
nano /home/deploy/.ssh/authorized_keys
```

Paste your public SSH key (from your Mac: `cat ~/.ssh/id_ed25519.pub` or `cat ~/.ssh/id_rsa.pub`) into the file, save and exit (Ctrl+X, then Y, then Enter).

```bash
# Set correct permissions
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Disable password authentication for SSH (optional but recommended)
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl reload sshd
```

## Step 3: Configure Firewall

```bash
# Install UFW if not already installed
apt-get update
apt-get install -y ufw

# Allow SSH (important - do this first!)
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 4: Install Docker and Docker Compose

**Note for Pterodactyl users**: If you're using Pterodactyl, Docker is already installed and working. You only need to install the `docker-compose-plugin` package. Your existing Docker installation and containers will not be affected.

First, check if Docker and Docker Compose are already installed:

```bash
# Check if Docker is installed
docker --version

# Check if Docker Compose plugin is installed
docker compose version
```

### If Docker is NOT installed:

```bash
# Install prerequisites
apt-get update
apt-get install -y ca-certificates curl gnupg

# Create directory for Docker keyring
install -m 0755 -d /etc/apt/keyrings

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
apt-get update

# Install Docker Engine
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

# Verify Docker installation
docker --version
```

### If Docker Compose plugin is NOT installed:

If `docker --version` works but `docker compose version` fails, Docker Compose plugin is missing. **Important**: Since you're using Pterodactyl (which uses Docker), your Docker Engine is already installed and working. We're ONLY adding the `docker-compose-plugin` package - we won't touch your existing Docker installation.

**What we're doing**: Adding the Docker repository configuration so APT knows where to find the `docker-compose-plugin` package. This doesn't affect your running Docker containers or Pterodactyl setup.

```bash
# Check if Docker repository is configured
cat /etc/apt/sources.list.d/docker.list 2>/dev/null || echo "Docker repository not found"

# If the repository doesn't exist or is empty, install prerequisites first
apt-get update
apt-get install -y ca-certificates curl gnupg

# Create directory for Docker keyring
install -m 0755 -d /etc/apt/keyrings

# Add Docker's GPG key (gnupg must be installed first!)
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository configuration (this only updates the repo config file, NOT your Docker installation)
# This tells APT where to find Docker packages, but doesn't change anything that's already installed
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# CRITICAL: Update package index after adding repository
apt-get update

# Install ONLY the docker-compose-plugin package (Docker Engine stays untouched)
apt-get install -y docker-compose-plugin

# Verify Docker Compose installation
docker compose version

# Verify your existing Docker installation still works (Pterodactyl containers should still be running)
docker ps
```

**Safety notes**:
- The `tee` command only updates the repository configuration file (`/etc/apt/sources.list.d/docker.list`)
- It does NOT reinstall or modify your existing Docker Engine installation
- Your Pterodactyl containers and Minecraft servers will continue running normally
- We're only installing the `docker-compose-plugin` package, which is a separate tool that works alongside Docker

**Important**: Always run `apt-get update` after adding or modifying repositories. The directory you're in doesn't matter - these commands work from anywhere.

### After installation (or if already installed):

```bash
# Add deploy user to docker group (so they can run docker without sudo)
# This is safe to run even if the user is already in the group
usermod -aG docker deploy

# Verify both are working
docker --version
docker compose version

# Test Docker (optional - you may need to log out and back in for group changes to take effect)
# docker run hello-world
```

**Note**: If you just added the `deploy` user to the docker group, they may need to log out and back in (or restart their SSH session) for the group membership to take effect. You can test this by running `docker ps` as the deploy user.

## Step 5: Create Directory Structure

```bash
# Create the deployment directory
mkdir -p /srv/savedgenesis
chown -R deploy:deploy /srv/savedgenesis
```

## Step 6: Test SSH Access as Deploy User

**From your Mac**, test that you can SSH as the deploy user:

```bash
ssh deploy@YOUR_VPS_IP
```

**Expected behavior**: You should NOT be prompted for a password. If you're not prompted, that's correct - it means SSH key authentication is working properly.

If it works, exit (`exit`) and you're ready to proceed.

### SSH Security Explained

**Question**: Can anyone type `ssh deploy@YOUR_VPS_IP` and get in?

**Answer**: No! Here's why your VPS is secure:

**What happens when someone tries to connect**:
1. They can attempt to connect (your IP is public, so anyone can try)
2. They'll be immediately rejected with "Permission denied (publickey)" 
3. They cannot use passwords (password authentication is disabled)
4. They cannot use SSH keys (they don't have your private key)
5. They'll be blocked after multiple failed attempts (if you set up fail2ban)

**Your security layers**:
- ✅ **SSH key authentication only**: Only your private key can authenticate
- ✅ **Password authentication disabled**: Configured in Step 2, so even if someone guesses a password, it won't work
- ✅ **Firewall (UFW)**: Only allows SSH (port 22), HTTP (80), and HTTPS (443) - everything else is blocked
- ✅ **No root login via SSH**: Best practice (you're using a non-root user)

**What you might see** (normal and expected):
- Failed login attempts in `/var/log/auth.log` from bots trying to brute force
- These are harmless - they'll all fail because passwords are disabled
- Your VPS is secure as long as you keep your private SSH key safe

**Best practices you're already following**:
- Using SSH keys instead of passwords (more secure)
- Disabled password authentication for SSH
- Using a non-root user with sudo
- Firewall configured to only allow necessary ports

**Optional additional security** (not required):
- Change SSH port from 22 to a custom port (reduces bot noise, but not necessary)
- Install `fail2ban` to automatically ban IPs after repeated failed attempts

### Optional: Set a password for the deploy user

**Question**: Should you set a password for the deploy user, especially since it has sudo permissions?

**Answer**: It's optional but recommended for security. Here's why:

- **SSH access**: Uses SSH keys (more secure than passwords), so you won't use the password for SSH
- **Console/emergency access**: If you lose SSH key access, a password lets you log in via console/remote access
- **Sudo operations**: Depending on your sudoers configuration, some operations might require a password

**To set a password** (optional but recommended):

```bash
# From your VPS, as root or deploy user:
sudo passwd deploy
```

Enter a strong password when prompted. Store it securely (password manager). This password is primarily for:
- Console/emergency access if SSH keys are lost
- Sudo operations that might require password verification
- NOT for regular SSH login (SSH keys are used instead)

**Security note**: Even with a password set, SSH password authentication is disabled (configured in Step 2), so the password cannot be used for SSH login. This is the most secure setup.

## Step 7: Configure DNS at GoDaddy

1. Log in to your GoDaddy account
2. Go to **My Products** → **DNS** (or **Domain Settings** → **DNS**)
3. Find your `savedgenesis.com` domain

4. **Handle existing CNAME for `www`**:
   
   If you have a CNAME record for `www` pointing to `savedgenesis.com.` (common for GitHub Pages), you need to:
   
   - **Delete the existing CNAME record** for `www` (CNAME and A records can't coexist for the same name)
   - This CNAME was likely pointing `www` to your GitHub Pages site
   - Since you're now hosting on your VPS, you need an A record instead
   
   **Why?** CNAME records point one domain to another domain, but A records point directly to an IP address. Since you're hosting on your VPS, you need an A record pointing directly to your VPS IP.

5. Add/Edit these A records:

   - **Type**: A
   - **Name**: `@` (or leave blank, or `savedgenesis.com`)
   - **Value**: YOUR_VPS_IP
   - **TTL**: 600 (or default)
   - **Action**: Add or Edit (if it already exists, update it to point to your VPS IP)

   - **Type**: A
   - **Name**: `www`
   - **Value**: YOUR_VPS_IP
   - **TTL**: 600 (or default)
   - **Action**: Add (after deleting the CNAME)

6. Save changes

**Note**: If you had other DNS records (like MX for email, TXT for verification, etc.), leave those alone. Only change the A record for `@` and replace the CNAME for `www` with an A record.

**Important**: DNS propagation can take 5 minutes to 48 hours. You can check propagation with:
```bash
dig savedgenesis.com +short
dig www.savedgenesis.com +short
```

Both should return your VPS IP.

## Step 8: Prepare Your Code for Deployment

On your Mac, make sure your code is in the `savedgenesis` directory and ready to push:

```bash
cd /Users/gabriel/CursorProjects/GenesisDev/savedgenesis

# If you haven't initialized git yet, do:
git init
git add .
git commit -m "Initial commit - savedgenesis.com site"

# Check if remote already exists
git remote -v

# If the remote doesn't exist, add it:
# git remote add origin https://github.com/SavedGenesis/SavedGenesisDev.git

# If the remote exists but points to wrong URL, update it:
# git remote set-url origin https://github.com/SavedGenesis/SavedGenesisDev.git

# If the remote exists and is correct, you're good to go
```

**Handle the remote** (choose one based on your situation):

**Option A: Remote doesn't exist** - Add it:
```bash
git remote add origin https://github.com/SavedGenesis/SavedGenesisDev.git
```

**Option B: Remote exists but points to wrong URL** - Update it:
```bash
git remote set-url origin https://github.com/SavedGenesis/SavedGenesisDev.git
```

**Option C: Remote exists and is correct** - Skip remote setup

**Push to main branch**:

```bash
# Rename current branch to main (if needed)
git branch -M main

# Try to push (if branch doesn't exist on remote)
git push -u origin main

# If you get an error about existing branch, you can:
# Option 1: Force push (overwrites remote - use with caution!)
# git push -u origin main --force

# Option 2: Pull first, then push (preserves remote history)
# git pull origin main --allow-unrelated-histories
# git push -u origin main
```

**If you get "refusing to merge unrelated histories"**:
```bash
# Pull with allow-unrelated-histories flag
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if they occur, then:
git add .
git commit -m "Merge with existing remote branch"
git push -u origin main
```

**If you want to force push** (overwrites remote branch - only do this if you're sure):
```bash
git push -u origin main --force
```

**Warning**: Force push will overwrite the remote branch. Only use this if:
- You're sure you want to replace what's on the remote
- You've backed up anything important from the remote
- You're okay with losing the remote branch's history

## Step 9: Verify GitHub Secrets

Go to your GitHub repo: https://github.com/SavedGenesis/SavedGenesisDev

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Verify these secrets exist:
   - `VPS_HOST` (your VPS IP)
   - `VPS_USER` (should be `deploy`)
   - `VPS_SSH_KEY` (your private SSH key - paste the contents of `~/.ssh/id_ed25519` or `~/.ssh/id_rsa`)

**Note**: You don't need `GHCR_TOKEN` - the workflow uses `GITHUB_TOKEN` automatically.

## Step 10: Trigger Deployment

After pushing to `main`, the GitHub Action will:
1. Build the Docker image
2. Push it to GitHub Container Registry
3. SSH to your VPS
4. Pull the image and start the containers

You can watch the progress at:
https://github.com/SavedGenesis/SavedGenesisDev/actions

## Step 11: Verify Deployment

Once the GitHub Action completes successfully:

1. Wait for DNS to propagate (check with `dig savedgenesis.com +short`)
2. Visit https://savedgenesis.com
3. Caddy should automatically obtain Let's Encrypt certificates

## Troubleshooting

### If you get "Unable to locate package docker-compose-plugin":

This error means the Docker repository isn't configured or `apt-get update` wasn't run after adding it. Follow these steps:

```bash
# 1. Check if Docker repository exists
cat /etc/apt/sources.list.d/docker.list 2>/dev/null || echo "Repository not found"

# 2. Install prerequisites (gnupg is needed for gpg command!)
apt-get update
apt-get install -y ca-certificates curl gnupg

# 3. If repository doesn't exist or is empty, add it:
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Add the repository (this is safe to run even if it exists)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. CRITICAL: Update package index (this is what makes the package available)
apt-get update

# 6. Now try installing again
apt-get install -y docker-compose-plugin

# 7. Verify it works
docker compose version
```

**Common mistakes:**
- Forgetting to install `gnupg` before using `gpg` command (you'll get "gpg: command not found")
- Forgetting to run `apt-get update` after adding the repository
- Running commands from the wrong directory (doesn't matter - these work from anywhere)
- Docker repository not properly configured (the above steps fix this)

### If you get "gpg: command not found":

This error means `gnupg` isn't installed. The `gpg` command is required to process Docker's GPG key. Install it first:

```bash
# Install gnupg (which provides the gpg command)
apt-get update
apt-get install -y gnupg

# Now you can proceed with adding the Docker GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
```

**Note**: Some systems may also need `ca-certificates` and `curl` if they're not already installed:
```bash
apt-get install -y ca-certificates curl gnupg 
```

### If you get "ssh: no key found" or "unable to authenticate":

This error means the SSH private key in your GitHub secret `VPS_SSH_KEY` is invalid or incorrectly formatted.

**How to fix:**

1. **Get your private key from your Mac**:
   ```bash
   cat ~/.ssh/id_ed25519
   # OR if you used RSA:
   # cat ~/.ssh/id_rsa
   ```

2. **Copy the ENTIRE key** (including header and footer):
   - Must start with `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`
   - Must end with `-----END OPENSSH PRIVATE KEY-----` or `-----END RSA PRIVATE KEY-----`
   - Include ALL lines between header and footer
   - No extra spaces or newlines at the start/end

3. **Update the GitHub secret**:
   - Go to: https://github.com/SavedGenesis/SavedGenesisDev/settings/secrets/actions
   - Find `VPS_SSH_KEY` and click "Update"
   - Delete the old value
   - Paste the entire private key exactly as it appears
   - Click "Update secret"

4. **Verify the key works manually**:
   ```bash
   # On your Mac, test SSH to your VPS
   ssh -i ~/.ssh/id_ed25519 deploy@YOUR_VPS_IP
   # If this works, the key is correct
   ```

**Important**: Make sure you're using the **private key** (not the `.pub` public key file)!

### If deployment fails: 

```bash
# SSH to your VPS as deploy user
ssh deploy@YOUR_VPS_IP

# Check if containers are running
cd /srv/savedgenesis
docker compose ps

# Check logs
docker compose logs

# Check Caddy logs specifically
docker compose logs caddy
```

### If DNS isn't working:

- Wait longer (up to 48 hours)
- Verify the A records in GoDaddy match your VPS IP
- Check propagation: https://dnschecker.org/

### If Caddy can't get certificates:

- Ensure DNS has propagated (both `@` and `www` point to your VPS)
- Check that ports 80 and 443 are open (`ufw status`)
- Verify Caddy can reach Let's Encrypt (check logs)

### Manual deployment (if needed):

```bash
ssh deploy@YOUR_VPS_IP
cd /srv/savedgenesis
docker compose pull
docker compose up -d
```

## Next Steps

- Monitor logs: `docker compose logs -f`
- Update the site: just push to `main`, GitHub Actions handles the rest
- Add more servers to the Network page as needed

