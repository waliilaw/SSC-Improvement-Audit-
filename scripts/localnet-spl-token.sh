#!/bin/bash

# Set error handling
set -e

# Function to log messages with timestamps
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check command success
check_command() {
    if [ $? -eq 0 ]; then
        log_message "SUCCESS: $1"
    else
        log_message "ERROR: $1 failed"
        exit 1
    fi
}

# Create token
log_message "Creating new SPL token..."
TOKEN_OUTPUT=$(spl-token create-token)
TOKEN_ADDRESS=$(echo "$TOKEN_OUTPUT" | grep "Address:" | awk '{print $2}')
check_command "Token creation"
log_message "Token address: $TOKEN_ADDRESS"

# Create account for the token
log_message "Creating token account..."
spl-token create-account "$TOKEN_ADDRESS"
check_command "Account creation"

# Mint tokens
log_message "Minting 1000000000 tokens..."
spl-token mint "$TOKEN_ADDRESS" 1000000000
check_command "Token minting"

# Define recipients as space-separated strings
RECIPIENT_ADDRESSES="7yU6pTGmtBvkiLxCZLeCd4dzGiodEvmtbo7GpUJzgyE9 \
    EXiwP66Nbqsm6BcJsYRKJ5Gw1kmo5NLQCJGJQ3at9qCw \
    H95gQFGFkpeJzDhXjxJUV5Uf2earZSY3rYDpWzPnguPG \
    4o5URYVF5htFF9ZuAPaDDN4iYUr44HGEaRsHwYSJzYXu \
    F5XQYxHDuBSRsxJkiTn24DdPvxXscayAX2d4URJzmgt6 \
    1ctqtd67cVR7oX7YL9T8aTeyq3czRKyV1nETJD8F36V \
    MthG4gnGVFizEGWV2dAfD4NotHa4rZoncDx85ohi4dC \
    8sxjei7FFrfY8nWfNJv9zYq98rRtYAf47LBjfiiSsZMo \
    HN6mrdfcQSQH7QYySYACiXia6M1zwXEcfyagYHG7p4TL \
    J3C4xrQ75V3VhvPyUnhiwNpe4KKTcW5L3819hcaRwdoT \
    FHA17DbJG1Cetp6uvTitQiTdwnKf3aAGPNrvnMUbnV9X \
    6zFixtN11ZJP7gM8rm8rhYiFsnDh8ayFxCXV75WaGneE \
    BMx353Tg9bh2uX84stGd86iUBtjThexf7QobWo33vLVe \
    CuTW8uQywHUECyra4SoTeSzxRomRJGQVYhRUSwca3eos"

# Transfer tokens to recipients
for RECIPIENT_ADDRESS in $RECIPIENT_ADDRESSES; do
    AMOUNT=100
    log_message "Transferring $AMOUNT tokens to $RECIPIENT_ADDRESS..."
    solana airdrop 1 "$RECIPIENT_ADDRESS"
    spl-token transfer --fund-recipient "$TOKEN_ADDRESS" "$AMOUNT" "$RECIPIENT_ADDRESS"
    check_command "Token transfer to $RECIPIENT_ADDRESS"
done

log_message "All operations completed successfully"
