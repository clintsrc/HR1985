import inquirer from "inquirer";

// define the Cli class
class Cli {
    exit: boolean = false;

    // TODO
    /*     
    (1) What is the name of the department? Service
    Added Service to the database
    */
    async addDepartment() {
        console.log("addDepartment");

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the name of the department?',
            },
        ]);

        // TODO
        console.log(`Added ${answers.departmentName} to the database.`);
        
        this.startCli();
    }
    
    // TODO
    /*     
    View All Departments:
    id  name
    --  ----
    1   Engineering
    2   Finance
    3   Legal
    4   Sales 
    */
    async viewAllDepartments() {
        console.log("viewAllDepartments");

        // TODO
        console.log(`id  name
    --  ----
    1   Engineering
    2   Finance
    3   Legal
    4   Sales`);

        this.startCli();
    }

    // TODO
    /*     
    Add Role
    (2) What is the name of the role? Customer Service
    What is the salary of the role? 80000
    Which department does the role belong to? (use arrow keys)
        Engineering
        Finance
        ...
        Service *
    Added Customer Service to the database
    */
    async addRole() {
        console.log("addRole");

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'What is the name of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
                validate: function (input) {
                    if (isNaN(input)) {
                        return 'Please enter a valid number.';
                    }
                    return true;
                },
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: ['Engineering', 'Finance', 'Legal', 'Sales'],
            },
        ]);

        // TODO
        console.log(`Added ${answers.roleName} to the database.`);

        this.startCli();
    }

    // TODO
    /*     
    View All Roles:
    id  title               department      salary
    --  ----                ----------      ------
    1   Sales Lead          Sales           100000
    2   Salesperson         Sales           80000
    3   Lead Engineer       Engineering     150000
    4   Software Engineer   Engineering     120000
    5   Account Manager     Finance         160000
    6   Accountant          Finance         125000
    7   Legal Team Lead     Legal           250000
    8   Lawyer              Legal           190000
     */
    async viewAllRoles() {
        console.log("viewAllRoles");

        // TODO
        console.log(`
        id  title               department      salary
        --  ----                ----------      ------
        1   Sales Lead          Sales           100000
        2   Salesperson         Sales           80000
        3   Lead Engineer       Engineering     150000
        `);

        this.startCli();
    }

    // TODO
    /*     
    (4) Which employee's role would you like to update? (use arrow keys)
        John Doe
        Mike Chan
        ...
        Sam Kash *
    Which role do you want to assign the selected employee? (use arrow keys)
        Sales Lead *
        Salesperson
        ...
    Updated employee's role
    */
    async updateEmployeeRole() {
        console.log("updateEmployeeRole");

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee's role would you like to update?",
                choices: ['John Doe', 'Mike Chan', 'Sarah Lourd'],
            },
            {
                type: 'list',
                name: 'newRole',
                message: 'Which role do you want to assign to the selected employee?',
                choices: ['Sales Lead', 'Salesperson', 'Lead Engineer'],
            },
        ]);

        // TODO
        console.log(`Updated ${answers.employee}'s role to ${answers.newRole}.`);

        this.startCli();
    }

    // TODO
    /*  
    (3) What is the employee's first name? Sam
    What is the employee's last name? Kash
    What is the employee's role? (use arrow keys)
        Salesperson
        Lead Engineer
        ...
        Customer Service *
    Who is the employee's manager? (use arrow keys)
        None
        John Doe
        ...
        Ashley Rodriguez * (though not likely!!!)
    Added Sam Kash to the database
    */
    async addEmployee() {
        console.log("addEmployee");

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?",
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is the employee's last name?",
            },
            {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: ['Sales Lead', 'Salesperson', 'Lead Engineer', 'Software Engineer'],
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: ['None', 'John Doe', 'Ashley Rodriguez'],
            },
        ]);

        // TODO
        console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`);

        this.startCli();
    }

    // TODO
    /*
    View All Employees
    id  first_name  last_name   title               department  salary  manager
    --  ----------  ---------   -----               ----------  ------  -------
    1   John        Doe         Sales Lead          Sales       100000  null
    2   Mike        Chan        Salesperson         Sales       80000   John Doe
    3   Ashley      Rodriguez   Lead Engineer       Engineering 150000  null
    4   Kevin       Tupik       Software Engineer   Engineering 120000  Ashley Rodriguez
    5   Kunal       Singh       Account Manager     Finance     160000  null
    6   Malia       Brown       Accountant          Finance     125000  Kunal Singh
    7   Sarah       Lourd       Legal Team Lead     Legal       250000  null
    8   Tom         Allen       Lawyer              Legal       190000  Sarah Lourd

    Custom:
    9   Sam         Kash        Sales Lead          Sales       100000  Ashley Rodriguez
    */
    async viewAllEmployees() {
        console.log("viewAllEmployees");
        
        // TODO
        console.log(`
        id  first_name  last_name   title               department  salary  manager
        --  ----------  ---------   -----               ----------  ------  -------
        1   John        Doe         Sales Lead          Sales       100000  null
        2   Mike        Chan        Salesperson         Sales       80000   John Doe
        `);

        this.startCli();
    }

    // TODO
    async startCli(): Promise<void> {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'MainMenu',
                message: 'What would you like to do?',
                choices: [
                    'View All Employees',
                    'Add Employee',
                    'Update Employee Role',
                    'View All Roles',
                    'Add Role',
                    'View All Departments',
                    'Add Department',
                    'Quit',
                ],
            },
        ]);

        // Handle the main menu answers
        if (answers.MainMenu === 'View All Employees') {
            await this.viewAllEmployees();
        } else if (answers.MainMenu === 'Add Employee') {
            await this.addEmployee();
        } else if (answers.MainMenu === 'Update Employee Role') {
            await this.updateEmployeeRole();
        } else if (answers.MainMenu === 'View All Roles') {
            await this.viewAllRoles();
        } else if (answers.MainMenu === 'Add Role') {
            await this.addRole();
        } else if (answers.MainMenu === 'View All Departments') {
            await this.viewAllDepartments();            
        } else if (answers.MainMenu === 'Add Department') {
            await this.addDepartment();
        } else if (answers.MainMenu === 'Quit') {
            // Exit the CLI if the user selects Quit
            this.exit = true;
        }
    }
}

// export the Cli class
export default Cli;
