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
