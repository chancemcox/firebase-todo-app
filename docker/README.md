# Docker Setup for Firebase Todo App

This directory contains all Docker-related files for testing and development of the Firebase Todo App.

## Files

### Docker Configuration
- **`Dockerfile.test`** - Docker image definition for running tests in a containerized environment
- **`docker-compose.test.yml`** - Docker Compose configuration for setting up the test environment

### Test Scripts
- **`test-docker.sh`** - Main Docker test script for running tests in a container
- **`test-docker-mac.sh`** - Docker test script optimized for macOS
- **`test-docker-simple.sh` - Simplified Docker test script for basic testing
- **`quick-test-docker.sh`** - Quick Docker test script for fast iteration

## Usage

### Running Tests with Docker

#### Basic Test Run
```bash
cd docker
./test-docker.sh
```

#### macOS Optimized
```bash
cd docker
./test-docker-mac.sh
```

#### Simple Test Run
```bash
cd docker
./test-docker-simple.sh
```

#### Quick Test Run
```bash
cd docker
./quick-test-docker.sh
```

### Docker Compose
```bash
cd docker
docker-compose -f docker-compose.test.yml up --build
```

## Benefits of Docker Testing

1. **Consistent Environment** - Tests run in the same environment regardless of local setup
2. **Isolation** - Tests don't interfere with local development environment
3. **Reproducibility** - Same results across different machines
4. **CI/CD Ready** - Easy to integrate with continuous integration systems

## Requirements

- Docker installed and running
- Docker Compose (usually included with Docker Desktop)
- Appropriate permissions to run Docker commands

## Troubleshooting

If you encounter permission issues:
```bash
chmod +x *.sh
```

If Docker isn't running:
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```
