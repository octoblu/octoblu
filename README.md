# octoblu

Run your own Octobu stack in Docker Swarm.

<!-- toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
  * [Bootstrap](#bootstrap)
- [Production Cluster](#production-cluster)
  * [Prequisites](#prequisites)
  * [Bootstrap](#bootstrap-1)
- [Stacks](#stacks)
  * [Available Stacks](#available-stacks)
- [Overrides](#overrides)
    + [Example Traefik Override](#example-traefik-override)

<!-- tocstop -->

## Prerequisites

- Docker >= 17.09.0-ce
- Node.js >= 8.0

## Installation

```bash
yarn global add octoblu
```

or

```bash
npm install --global octoblu
```

## Local Development

Runing a local development stack is similar to a production cluster, however there are some special considerations to make to enable a local stack.

These instructions assume you are developing on localhost. The domain `localtest.me` can be used to access services locally without setting up your own DNS or hosts (e.g. `meshblu-http.localtest.me`) .

### Bootstrap

Octoblu requires some devices to exist in Meshblu before certain services will run. Creating the bootstrap stack will help to create these devices and provide some defaults to add to your dev stack. Redis and Mongo will be started as part of this stack and will persist data using a docker volume. Removing this docker volume will erase all data and you will need to bootstrap again.

```bash
mkdir dev
cp examples/dev/defaults.env dev/defaults.env
octoblu-stack-generator --output dev --stack bootstrap-development --init --no-constraints
octoblu-stack-generator --output dev --stack bootstrap-development --no-constraints
cd dev
docker stack deploy --compose-file ./docker-compose.yml goctoblu
```

Once services are running, you'll need to curl the bootstrap service to generate the appropriate devices.

```bash
cd dev
curl -X POST http://bootstrap.localtest.me/bootstrap >> defaults.env
cd ..
octoblu-stack-generator --output dev --stack octoblu-development --init --no-constraints
octoblu-stack-generator --output dev --stack octoblu-development --no-constraints
cd dev
docker stack deploy -c ./docker-compose.yml goctoblu
```

## Production Cluster

### Prequisites

- Mongodb >= 3.0
- Redis >= 3.0

This step will create a small Octoblu production cluster. Setting up MongoDB and Redis is outide the scope of this document.

These instructions assume you have a domain available and will setup a wildcard DNS entry to point to your docker swarm. It also assumes you will use [let's encrypt](https://letsencrypt.org) for ssl certs. The examples provided are configured for Digital Ocean as a DNS provider, for alternatives see [traefik docs](https://docs.traefik.io/configuration/acme/#dnsprovider).

### Bootstrap

Octoblu requires some devices to exist in Meshblu before certain services will run. Creating the bootstrap stack will help to create these devices and provide some defaults to add to your dev stack. Redis and Mongo will be started as part of this stack and will persist data using a docker volume. Removing this docker volume will erase all data and you will need to bootstrap again.

```bash
mkdir prod 
cp examples/prod/defaults.env prod/defaults.env
cp -r examples/prod/overrides prod/overrides
# Edit prod/overrides/stacks/traefik.yml and add your domain
# Edit prod/overrides/templates/traefik/environment.json and add your Digital Ocean credentials
octoblu-stack-generator --output prod --stack bootstrap --init --overrides
# Edit prod/defaults.env and set MONGODB_URI and REDIS_URI to the correct URLs
octoblu-stack-generator --output prod --stack bootstrap --overrides
cd prod
docker stack deploy --compose-file ./docker-compose.yml goctoblu
```

Once services are running, you'll need to curl the bootstrap service to generate the appropriate devices.

```bash
cd prod
curl -X POST http://bootstrap.{your.domain}/bootstrap >> defaults.env
cd ..
octoblu-stack-generator --output prod --stack octoblu --init --overrides
octoblu-stack-generator --output prod --stack octoblu --overrides
cd dev
docker stack deploy --compose-file ./docker-compose.yml goctoblu
```

## Stacks

Stacks are mostly Docker Stacks with a hack using volume labels to compose multiple stacks together. A stack represents a group of services to be run in the cluster. Each service has an environment file that controls its settings.

In order to change variables in each service file, simply edit the defaults.env file in your ouput dir and run `octoblu-stack-generator` again with the appropriate options.

To run a subset of Octoblu, run `octoblu-stack-generator --stack {stackname}` and deploy the stack.

An example output dir:

```txt
.
├── defaults.env
├── docker-compose.yml
└── env.d
    ├── meshblu-core-dispatcher.env
    └── meshblu-core-worker-webhook.env

1 directory, 4 files
```

### Available Stacks

- `octoblu-development`
- `bootstrap-development`

- `bootstrap`
- `octoblu`
- `flows`
- `meshblu-core`
- `meshblu-firehose-socket.io`
- `meshblu-http`
- `traefik`


## Overrides
You can override the default structure of the stack, or include additional environment variables. This allows you to keep your own custom modifications yet stay in sync with the master of this project.

Create an `overrides` directory in your `outputDirectory`. You can create `overrides/stacks` or `overrides/templates/serviceName`.

This is especially useful for adding HTTP and Let's Encrypt support to traefik using your own domain.

#### Example Traefik Override
`overrides/stacks/traefik.yml`
```yaml
services:
  traefik:
    command: >
      traefik
        --docker
        --docker.swarmmode
        --docker.watch
        --web
        --entryPoints='Name:http Address::80 Redirect.EntryPoint:https'
        --entryPoints='Name:https Address::443 TLS'
        --defaultEntryPoints=http,https
        --acme
        --acme.onhostrule=true
        --acme.ondemand=true
        --acme.dnsprovider=digitalocean --acme.domains='your-domain.io'
        --acme.entrypoint=https
        --acme.acmelogging
        --acme.storage=/acme/acme.json --acme.email="acme@your-domain.io"

# Add this if you want to test lets encrypt without violating rate limits
# remove it to go back to production
#--acme.caServer="https://acme-staging.api.letsencrypt.org/directory"
```

`overrides/templates/traefik/environment.json`
```json
{
  "DO_ACCESS_TOKEN" : "my-digital-ocean-access-token"
}
```
