# Financial System - Frontend Technical Test

Welcome to the Financial System project, a responsive web application developed in response to the TechNation Junior Frontend Developer technical test.

## Project Overview

The Financial System is a user-friendly web page representing a company's financial system. It showcases crucial data derived from randomly generated invoices. These invoices adhere to specific business logic to emulate real-world scenarios and challenges faced by finance teams.

### Business Logic for Mocked Invoices

- **Payers Name:** Random real names are generated for the `payersName` field.
- **Identification Number:** Each entry has a unique `identificationNumber`.
- **Issue, Billing, and Payment Dates:** Dates are generated within reasonable date ranges, in UTC, with random times.
- **Amount (Value):** Random values are assigned to the `amount` field.
- **Invoice and Payment Documents:** Random `invoiceDocument` and `paymentDocument` values are assigned.
- **Status:** A status is randomly selected for each entry: "Issued," "Charge made," "Payment overdue," or "Payment made."

Conditions:

- If the status is "Issued," there is no `billingDate` or `paymentDate`, and no `invoiceDocument` or `paymentDocument`.
- If the status is "Charge made," the `paymentDate` is exactly 7 days after the `billingDate`, and no `invoiceDocument` or `paymentDocument`.
- If the status is "Payment overdue," the `paymentDate` is a date in the past (before February 13, GMT -3), and it has an `invoiceDocument` but not a `paymentDocument`.
- If the status is "Payment made," the `paymentDate` is a date in the past (before February 13, GMT -3), and the payment date is between `billingDate + 7 days`.

## Technologies Utilized

The Financial System leverages the following technologies:

- **Bootstrap v5.3.2**
- **JavaScript**
- **CSS**
- **HTML**
- **Express 4.17.1** (Primarily used for project execution)

## Running the Server Locally

Follow these steps to run the server and access the Financial System web page locally:

### Prerequisites

Ensure that you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed on your machine.

### Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/marcelosj3/financial-system.git
   ```

2. Navigate to the project's root directory:

   ```bash
   cd financial-system
   ```

3. Install the required dependencies using Yarn:

   ```bash
   yarn install
   ```

### Running the Server

1. Start the server with the following command:

   ```bash
   yarn start
   ```

   This will launch the server, typically at http://localhost:3000 (or another specified port).

### Accessing the Financial System

Open your web browser and navigate to http://localhost:3000 to access the Financial System web page.

### Stopping the Server

To stop the server, press `Ctrl + C` in the terminal where the server is running.

You're all set! Enjoy exploring the Financial System locally on your machine.

---

**Developer:** Marcelo Silveira Junior

**Contact:** marcelosj33@gmail.com
