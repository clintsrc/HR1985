
# HR1985 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

__HR 1985__ is an application that tracks employee roles and department information in a [PostgreSQL](https://www.postgresql.org/) database. Database access is driven through command line input using the node [pg](https://www.npmjs.com/package/pg) and [inquirer](https://www.npmjs.com/package/inquirer/v/8.2.4) packages

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Tests](#tests)
- [Questions](#questions)


## Installation

1. Change the project's root directory  
2. Install the dependency modules: npm install  
3. Build using: npm run build  
4. Set your postgres credentials in the .env file (see the .env.EXAMPLE FILE)  
5. Install the schema: pgsql -U postgres -f db/schema.sql  
6. __Optional__ seed the database with test data: pgsql -U postgres -f db/seeds.sql

## Usage

See the walkthrough video [here](https://drive.google.com/file/d/1cJHOSW0YCQAJmIs3dNgBczkvHlMfWcpE/view?usp=drive_link)!  
1. Build and run the application from the project root directory: npm start.  
2. Follow the menu prompts.

## License

This application is covered under the [MIT](https://opensource.org/licenses/MIT) license

## Contributing

Guidelines:  
Ensure your code follows the project's coding standards.  
Write clear and concise commit messages.  
If your changes include new features, please update the documentation accordingly.  
If you are fixing a bug, please include a test to verify the fix.  
  
Thank you for your contributions!

## Tests

Test instructions:  
1. Try each of the menu items.  
2. Make sure that any data you add is correctly reflected in all relevant screens that display the current data

## Questions

If you have any questions, feel free to reach out: 
- GitHub: [clintsrc](https://github.com/clintsrc)  
- Email: clinton.alan.jones@gmail.com

