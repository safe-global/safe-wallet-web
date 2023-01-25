# Minirunbook

## Requirements

- docker + docker-compose
- or
  - python + virtualenv
  - node + yarn
  - rust + cargo
  - postgresql
  - redis
  - rabbitmq
- a celo-node

## Structure

### [web-core](https://github.com/5afe/web-core)

- typescript
- basically the UI people interact with to create or add existing safes, and interact with them

### [safe-client-gateway](https://github.com/safe-global/safe-client-gateway)

- rust
- a "clever" gateway caching every successfull response from the two other services, think of it as nginx
- unless I'm missing an important point

### [safe-config-service](https://github.com/safe-global/safe-config-service)

- python
- a basic web2 backend, has a couple tables in postgres to keep track of apps and different available chains

### [safe-transaction-service](https://github.com/safe-global/safe-transaction-service)

- python
- the meat of the services, it tries to index relevant transactions and uses a task infrastructure to stay up to date
- this is also the place where safe-related transactions get stored (in a pending or completed state)

## Setup

### web-core

- `yarn`
- `yarn start`

This should start the deployment server, pointing at whatever you specified in `<root>/src/config/constants.ts`
There `GATEWAY_URL` needs to be replaced.

### safe-client-gateway

`docker-compose up`

This should expose the gateway service on the default port (8080 but changeable in .env file)

### safe-config-service

`docker-compose up`

This should expose the config-service on the default port (8000 also changeable)

For now, the safe-config-service will be very confused, so you need to create an entry adding the chain information in the **config** database. The config will include the URL of the transaction service handling that chain.

The entry in the table `chains_chain` should look something like this:

```csv
42220,CELO,https://forno.celo.org,CELO,CELO,18,http://localhost:8001,#FBCC5C,#FFFFFF,1,chains/4220/currency_logo.png,0x0000000000000000000000000000000000000000,1.0.0,NO_AUTHENTICATION,NO_AUTHENTICATION,https://forno.celo.org,https://explorer.celo.org/address/{{address}},https://explorer.celo.org/tx/{{txHash}},TRUE,CELO?,http://localhost:8001,celo,https://explorer.celo.org/api,NO_AUTHENTICATION,https://forno.celo.org
```

Note that this is where you would change your node URL if you wanted to point to a local one. (Remember the bust the client-gateway cache if you change it! `redis-cli flushall` does the trick)

### safe-transaction-service

Since you'll be working on this service, I don't know if I would recommend running it via docker-compose. Here's how you'd run it outside of docker:

```
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
python manage.py runserver 0.0.0.0:8001
```

This will expose the transaction-service on port 8001. (Note that this needs to be the same port as the `chains_chain` entry above)

Now is when it gets dicey because I swam in unknown waters.

To my understanding, you now need to add the gnosis contract addresses to the transaction db. in `history_safemastercopy`

```sql
INSERT INTO history_safemastercopy VALUES(decode('fb1bffc9d739b8d520daf37df666da4c687191ea', 'hex'), 8944350, '8944350', '1.3.0+L2', 'Gnosis', FALSE) RETURNING "address", "initial_block_number", "tx_block_number", "version", "deployer", "l2";
INSERT INTO history_safemastercopy VALUES(decode('69f4d1788e39c87893c980c06edf4b7f686e2938', 'hex'), 8944351, '8944351', '1.3.0', 'Gnosis', TRUE) RETURNING "address", "initial_block_number", "tx_block_number", "version", "deployer", "l2";
```

Please note that these 2 addresses (`0xfb1bffc9d739b8d520daf37df666da4c687191ea` and `0x69f4d1788e39c87893c980c06edf4b7f686e2938`) are the deployed smart contracts addresses I grabbed from the safe deployed by Nam.

Now your DB is barebone, but should be working.

I recommend that you also start running the task scheduler via docker-compose (unless you have `celery` installed), you can apparently run redis as your message broker instead of rabbitmq, but I haven't been successfull doing so.

You should now be ready to test things out.

Bit ugly, but I figured how to run the indexer while being able to have a local db, but you can just run all infrastructure within docker too. Let me know if you need a docker-compose example.

Once you have the indexer running, it means you should be able to run the "helper" commands.

For example: `python manage.py setup_service` should backfill the table `history_safecontract` as well as `history_proxyfactory`. These should help you add back the known safes into your db so you can start experimenting.

## Production

There is a staging and a production environment deployed on google-cloud for the 3 backend services. Both of them are identical and used to test things before deploying.

- [staging](https://console.cloud.google.com/kubernetes/clusters/details/us-west1-a/celo-safe-staging?project=clabs-gnosis-safe&supportedpurview=project)
- [production](https://console.cloud.google.com/kubernetes/clusters/details/us-central1/celo-safe-prod?project=clabs-gnosis-safe&supportedpurview=project)

There is also a vercel deployment for the front-end here: https://vercel.com/c-labs/safe-celo-ui

- Preview deploys on push to any branch
- Production deploys on push/merge to the branch `dev` or `main` (we don't use `main` for now though)

### Production web-core debugging

This is mostly targeted to UI debugging, but you can run your local `web-core` repo pointing to any gateway by running the `yarn start` command with a specific env variable.

For example: `NEXT_PUBLIC_GATEWAY_URL_STAGING=https://client-gateway.celo-safe-prod.celo-networks-dev.org yarn start` would start a UI (in debug mode) using the production gateway.

### Production gateway/config debugging

TODO

### Production transaction-service debugging

As I'm not the most familiar with it, I can only point to the right team. The idetnity team owns this part of the safe and Martin Volpe more specifically should be able to help out.
