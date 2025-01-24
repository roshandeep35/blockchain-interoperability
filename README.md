# Cross-Chain Transaction Demo

This project demonstrates cross-chain transactions between two Ethereum-based chains using a Chainlink node for interoperability. The setup involves two Geth chains, a Chainlink node, and smart contracts deployed on both chains.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up Geth Chains](#setting-up-geth-chains)
3. [Deploying Smart Contracts](#deploying-smart-contracts)
4. [Setting Up the Chainlink Node](#setting-up-the-chainlink-node)
5. [Deploying and Testing Contracts](#deploying-and-testing-contracts)
6. [Running the Demo](#running-the-demo)

---

## Prerequisites

Before starting, ensure you have the following installed:
- **Docker**: For running the Chainlink node and PostgreSQL.
- **Geth (v1.13.15)**: For setting up the Ethereum chains.
- **Metamask**: For interacting with the chains.
- **Remix IDE**: For deploying smart contracts.
- **EC2 Instances**: Two instances (medium recommended) for running the chains.

---

## Setting Up Geth Chains

### Step 1: Install Geth
On both EC2 instances, install Geth v1.13.15:
```bash
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.13.15-c5ba367e.tar.gz
tar -xvzf geth-linux-amd64-1.13.15-c5ba367e.tar.gz
mv geth-linux-amd64-1.13.15-c5ba367e/geth /usr/bin/geth
```

### Step 2: Create Genesis File
Generate a genesis file for each chain:
```bash
geth --dev dumpgenesis > genesis.json
```

### Step 3: Create Accounts
Create an account for each chain and store the password:
```bash
mkdir -p ~/ethereum/chain1337
echo "your_secure_password" > ~/ethereum/chain1337/pass.txt
geth account new --datadir ~/ethereum/chain1337 --password ~/ethereum/chain1337/pass.txt
```

Repeat the above steps for the second chain (e.g., `chain1338`).

### Step 4: Initialize Chains
Initialize the chains with the genesis file:
```bash
geth --datadir ~/ethereum/chain1337 init ~/ethereum/chain1337/genesis.json
geth --datadir ~/ethereum/chain1338 init ~/ethereum/chain1338/genesis.json
```

### Step 5: Start the Chains
Start the first chain:
```bash
geth --datadir ~/ethereum/chain1337 --networkid 1337 --http --http.api eth,net,web3,personal --http.corsdomain "" --http.addr "0.0.0.0" --http.port 8545 --ws --ws.addr "0.0.0.0" --ws.api eth,net,web3,personal --ws.origins "" --mine --miner.etherbase=NEWACCOUNT --allow-insecure-unlock --nodiscover --dev --syncmode "full" --unlock "NEWACCOUNT" --password ~/ethereum/chain1337/pass.txt --nat "any"
```

Start the second chain (replace `1337` with `1338` and update paths accordingly).

---

## Deploying Smart Contracts

### Step 1: Deploy LINK Token
1. Open **Remix IDE**.
2. Connect Metamask to both chains (use separate browsers or profiles).
3. Deploy the `DummyLINK` token contract on both chains and note the contract addresses.

### Step 2: Deploy Other Contracts
Deploy the following contracts on both chains:
- **Sender Contracts**: For sending messages, tokens, and NFTs.
- **Receiver Contracts**: For receiving messages, tokens, and NFTs.
- **Operator Contracts**: For interacting with the Chainlink node.

---

## Setting Up the Chainlink Node

### Step 1: Run PostgreSQL Container
Start a PostgreSQL container:
```bash
docker run --name cl-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

### Step 2: Configure Chainlink Node
Create the following files in a directory:
- **config.toml**: Configure the chains and node settings. Modify the following according to the IP of your EC2 instance and Contract Address
  ```toml
  [[EVM]]
  ChainID = '1337'
  LinkContractAddress = 'LINKContractAddress'

  [[EVM.Nodes]]
  Name = 'test'
  WSURL = 'ws://<CHAIN1_IP>:8546'
  HTTPURL = 'http://<CHAIN1_IP>:8545/'

  [[EVM]]
  ChainID = '1338'
  LinkContractAddress = 'LINKContractAddress'

  [[EVM.Nodes]]
  Name = 'test2'
  WSURL = 'ws://<CHAIN2_IP>:8546'
  HTTPURL = 'http://<CHAIN2_IP>:8545/'
  ```
- **secrets.toml**: Store sensitive information (e.g., API keys).
- **.api**: Store API credentials for the Chainlink node. [available in chainlink-node folder]

### Step 3: Run Chainlink Node
Start the Chainlink node:
```bash
docker run --name chainlink -it -p 6688:6688 --add-host=host.docker.internal:host-gateway -v "%cd%:/chainlink" smartcontract/chainlink:2.18.0 node -config /chainlink/config.toml -secrets /chainlink/secrets.toml start -a /chainlink/.api
```

Access the Chainlink node dashboard at `http://localhost:6688`.

---

## Deploying and Testing Contracts

### Step 1: Deploy Contracts
Deploy the contracts using Remix IDE or Hardhat. Ensure all dependencies (e.g., ERC20, ERC721) are available.

### Step 2: Fund Accounts
Transfer ETH and LINK tokens to the required accounts for testing.

### Step 3: Test Transactions
Manually test cross-chain transactions using Remix or Hardhat.

---

## Running the Demo


---




This README provides a comprehensive guide to setting up and running your cross-chain transaction demo. Let me know if you need further refinements!
