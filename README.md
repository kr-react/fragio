# Fragio Client

Front-end code to the open source kanban app. 

## Dependencies

- [NodeJS](https://nodejs.org/)
- [Go](https://golang.org/)
- [Yarn](https://yarnpkg.com/)

## Setup

```bash
# Clone repository
git clone https://github.com/happotato/fragio.git

# Change directory
cd fragio

# Install dependencies
yarn install

# Build
yarn run build --mode=production

# Start the application
yarn start
```

## Environment

You might want to setup environment variables creating the ".env" file.

```
API_URL=API endpoint
SOURCE_CODE_URL=Optional url to the source code
ROADMAP_URL=Optional url to the application roadmap
```

## License

[GPLv3](LICENSE.txt)
