# E-Wallets Application

## Brief About the App

The E-Wallets application is a simple yet efficient server-side application built using the NestJS framework. It's designed to handle various aspects of digital wallet management, including user accounts, transactions, security features, and data integrity by using two Factors Authentication for ensuring security and pessimistic write approach to ensure no error in balances calculations. **YOU CAN USE [THIS](https://base64.guru/converter/decode/image/png) WEBSITE TO VIEW THE QR CODES SINCE IT'S BEING RETURNED AS BASE64**

## Documentation

For detailed documentation of the API endpoints and their usage, you can visit the /api endpoint once the application is running. This will provide you with a Swagger UI interface where you can view and interact with the API's endpoints.

## Installation

### Using Code Base

To install the application using the code base, follow these steps:

1. Clone the repository:

```bash
  git clone https://github.com/AmrMonier/e-wallets.git
```

2. Navigate to the project directory:

```bash
  cd e-wallets
```

3. add your development environment variable to **/env** directory by cloning the **example.env.example** (note that files goes like this `/env/${NODE_ENV}.env` `/env/development.env`)

4. Install the dependencies:

```bash
  yarn install
```

5. tart the application:

For development:

```bash
  yarn run start
```

For watch mode:

```bash
  yarn run start:dev
```

For production mode:

```bash
  yarn run start:prod
```

### Using Docker

Alternatively, you can use Docker to install and run the application. The repository includes a Dockerfile for easy setup. Here's how you can do it:

1. Build the Docker image:

```bash
  docker build -t e-wallets .
```

2. Run the Docker container:

```bash
  docker run -p 3000:3000 e-wallets
```
