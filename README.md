# project-base

It's a project base that is written in Node.js(Express). The aim of this project is to establish the standard infrastructure in new projects and to provide development for the main purpose.

## 🚀 To Do

- [ ] Postman Collection and documentation will be prepared
- [ ] TFA will be added.
- [ ] MongoDB Database Models will be added.
- [ ] SQL Indexing & column adder will be automated.
- [ ] HTTPS option will be added.
- [ ] Security Checks & Updates.

## ⚡️ Features

- All CRUD operations for Users
- All CRUD operations for Roles
- All CRUD operations for Categories
- Basic Audit Log mechanism
- MSSQL DB Connection and table relationships
- SSE Integration
- Winston Logger
- Multi Language Support

## Installation

You can run this project in your local with the following steps:

1. Clone or download the project-base to your local machine.
2. Run the following commands:

    ```shell
    cd project-base/
    npm install
    ```

3. Set up the environment variables.

    This project uses the `dotenv` module to get environment variables. So you can create a `.env` file to set the environment variables.

    Here is an example of the .env file.

    ```shell
    DB_HOST=localhost
    DB_NAME=project_base
    DB_PASS=MyPass@word
    DB_PORT=1433
    DB_USER=sa
    JWT_SECRET=8cgVcskCpM8FxGf8N8Zx3r8waXU79xK2FkaQZWVZNfBPS3Qy6RG3ZHEnzcDFKHk5Jp32UM87Ks6ES9FBcwBBV7ehhYXggsmNxxgF2eBHUaUJhg3gPZtDR2EgUnwKUcyI
    TZ=Europe/Istanbul
    ```

    If you want to see the other environments that using in the project, look at the config/index.js file.

4. And you can run the project with the following command:

    ```shell
    npm start
    ```

5. Finally, the project-base listens to '3000' port.

## Author

**Ender CAN**

- <https://github.com/endrcn>
- <https://twitter.com/endrcn>

## License

No License. Be comfortable while using it.
