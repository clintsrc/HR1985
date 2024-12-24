/* -------------------------
 * Index
 *
 * This is the main startup script for the HR 1985 Employee
 * tracking database application. It's responsible for displaying
 * the welcome screen and slogan then initializing the CLI
 * interface class to connect to the database begin prompting the 
 * user for input.
 * 
 * Before running the application you need to:
 * 1. Configure environment variables by adding them to an .env file located
 *    in the project root.
 *    Example:
 *      DB_NAME=employees_db
 *      DB_USER=postgres
 *      DB_PASSWORD=password
 * 2. Create the database by running these commands from the project root:
 *    $ psql -U <username> -f db/schema.sql
 * 3. Optionally seed the database with test data:
 *    $ psql -U <username> -f db/seeds.sql
 * 4. Build the application from the project root using:
 *    npm run build
 * 5. Run the application from the project root using:
 *    npm run start
 * 
 * ------------------------- */

import figlet from "figlet";
import Cli from "./classes/Cli.js";

// create a new instance of the Cli class
const cli = new Cli();

// ascii art welcome screen
console.log(
    figlet.textSync('HR 1985', {
        font: 'Alligator2',
        horizontalLayout: 'default',
        verticalLayout: 'default',
    })
);
console.log('\nThe Power of the Menu at Your Fingertips!\n');

// start the cli
cli.startCli();