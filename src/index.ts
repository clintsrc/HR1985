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