# Second seminar - NestJS app

Welcome to the second seminar. In this seminar we will focus on NestJS fundamentals and a little more advanced concepts.

## Description

It's time for you to code something yourself. This project will have guardrails for you to not get lost. Take notes from the template implementation.


## Key directories

`finance-manager` - The project has got only one app, written in NestJS, named `finance-manager`.

`finance-manager/test/` - The tests that are used to test the correctness of your app

`finance-manager/src/` - Main entrypoint the of the app with all of the modules

## Project Overview
You are tasked with developing a Personal Finance Manager API using NestJS. 
This application will help users track, manage, and analyze their personal 
finances across multiple accounts, set budgets, manage goals, and generate useful financial reports.

In this task, mainly focus on the Account Management

### Assignment Requirements

#### Account Management

Create a system to track multiple financial accounts (bank, investments, cash, assets, liability)
Implement balance tracking and reconciliation features
Support manual account entry for cash and offline instruments


#### Transaction System

Develop functionality to record income and expenses
Implement transaction categorization (both automatic and manual)
Build support for recurring transactions
Create storage for receipt images linked to transactions


#### Budgeting Features

Design a flexible budgeting system with customizable periods
Implement category-based spending limits
Create real-time budget tracking
Build an alert system for budget thresholds


#### Financial Goals

Develop a goal-setting system with target amounts and deadlines
Implement progress tracking
Create recommendation logic for goal achievement


#### Reports and Analysis

Build a reporting engine for income/expense summaries
Implement visualization endpoints for spending patterns
Create comparative analysis features
Develop data exports for tax preparation


#### Debt Management

Create tracking for loans and credit card debts
Implement interest calculation features
Design debt reduction strategy tools

## Seminar assignments

### 1. Install dependencies and create an env file

```bash
pnpm install

# then you need to create an env file for the auth module
cp .env.example .env
```
### 2. Discuss the setup with the tutor

Look through the app, look at the `Users` module. You can see an example of how a production-ready part of an MVC app could look like (minus Repository layer and DB, we will look into them in the next seminar).

### 3. Create a new Module for `Accounts`

Create a `Module`, a `Controller` and a `Service` and integrate them together.

Set the `AccountsController` path prefix to `accounts`.

Don't forget to add the `AccountsModule` to `AppModule` imports.

### 4. Create an endpoint for fetching `Accounts`

Create a simple `getAccounts()` handler and try fetching the request using swagger ui.

Just create a hash map inside of `AccountsService` to mock a DB for now.

You can verify if you have successfully completed this task by running:
```bash
pnpm run test:k6

```

You should have one successful test result.

### 5. Create an endpoint for creating `Accounts`

Create a handler for creating `Accounts`.

Again, test the correctness of your solution by running:
```bash
pnpm run test:k6

```


### 6. Now create an endpoint that returns all `Accounts` for one `User`

Now you should try to find a way to create an endpoint that returns all `Accounts` for a `User`.

Don't forget to test your solution again.


### 7. Bonus task

Add auth guard for the endpoint.


#### Notes

* If you get stuck, don't hesitate to ask for help.
* Mind the correct [naming conventions](https://martinfowler.com/articles/richardsonMaturityModel.html) for endpoints.
* If you have some trouble with dependencies/imports, try to take a look into the modules in the template again.
