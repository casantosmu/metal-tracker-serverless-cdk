# Metal Tracker

This repository contains code for deploying AWS CDK stacks to set up a serverless application that tracks metal music blog posts and sends email notifications for new album reviews.

## Prerequisites

Before deploying this application, you must have the following:

- AWS account
- AWS CLI installed and configured with appropriate credentials
- Node.js and npm installed

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/casantosmu/metal-tracker.git
   cd metal-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Deploy the AWS CDK stack:

   ```bash
   npm run deploy
   ```

## Architecture

The application consists of three AWS CDK stacks:

1. `DynamoDbStack`: Creates an Amazon DynamoDB table to store the tracked metal music blog posts.

2. `SendMailLambdaStack`: Deploys a Lambda function that subscribes to the DynamoDB table stream and sends email notifications for new album reviews.

3. `TrackerLambdaStack`: Sets up a Lambda function triggered by an EventBridge rule that fetches new metal music blog posts and adds them to the DynamoDB table.

## Configuration

The application uses environment variables for configuration. Make sure to set the following environment variables:

- `SEND_EMAIL_ADDRESS`: The email address to which new album review notifications will be sent.

## Usage

After deploying the AWS CDK stack, the application will automatically start tracking metal music blog posts and sending email notifications for new album reviews.

To stop the application, run:

```bash
npm run destroy
```
