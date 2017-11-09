# octoblu

## Installation

```bash
yarn global add octoblu
```

or

```bash
npm install --global octoblu
```

## Usage

```bash
octoblu-stack-generator --help
```

### Initialize

Generate the default environment file for the stack.

```bash
mkdir -p ./test-stack
octoblu-stack-generator --init \
  --stacks meshblu-core \
  --output ./test-stack
```

The result of running this should create a `defaults.env` file in the output directory `./test-stack`.

**NOTE:** This will override any existing defaults. Make sure to either run this in an empty project, or make sure you've committed and synced your changes in git.

### Bootstrap

Setup databases indexes and create meshblu devices for the services.

```bash
mkdir -p ./test-stack
cd ./test-stack
```


Init the bootstrap stack

```bash
octoblu-stack-generator --init \
  --stacks bootstrap \
  --output .
```

Update the `defaults.env` and then create the bootstrap stack

```bash
octoblu-stack-generator \
  --stacks bootstrap \
  --output .
```


Run the stack

```bash
docker stack deploy \
  --compose-file ./docker-compose.yml \
  --with-registry-auth octoblu
```

Once the `bootstrap-octoblu-stack` service is running, execute `curl -X POST http://{docker ip address}/bootstrap`. Add the results to the `defaults.env` file.


### Create a swarm
```bash
docker-machine create --driver virtualbox manager
eval (docker-machine env manager)
docker swarm init --advertise-addr eth1
# copy the join command
docker-machine create --driver virtualbox worker
eval (docker-machine env worker)
# paste the join command
eval (docker-machine env manager)
docker stack deploy -c docker-compose.yml octoblu
```

### Generate a stack

Generate a stack and all of the required docker and environment files.

```bash
octoblu-stack-generator \
  --stacks meshblu-core \
  --output ./test-stack
```

The result of running this should create the following files.

```txt
.
├── defaults.env
├── docker-compose.yml
└── env.d
    ├── meshblu-core-dispatcher.env
    └── meshblu-core-worker-webhook.env

1 directory, 4 files
```

## Available Stacks

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
