import Table from 'cli-table3'; // a little help with the query output here
import inquirer from "inquirer";
import { pool } from './../connection.js';

import { 
    addEmployeeSQL,
    updateEmployeeRoleSQL,
    viewAllEmployeesSQL, 
    addRoleSQL, 
    viewAllDepartmentsSQL,
    addDepartmentSQL, 
    viewAllRolesSQL
} from '../queryservice.js';

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
        try {
            const roles = await addDepartmentSQL();
            console.log(`Added ${answers.departmentName} to the database.`);
        } catch (error) {
            console.error('Error fetching roles:', error.message);
        }
        
        this.startCli();
    }
    
    // TODO
    async viewAllDepartments() {

        try {
            const departments = await viewAllDepartmentsSQL();
    
            // prepare the header format
            const table = new Table({
                head: ['ID', 'Department Name'],
                colWidths: [10, 30]
            });
    
            // update the table with each dapartment record that was returned
            departments.forEach(department => {
                table.push([department.id, department.department]);
            });
    
            // show the table
            console.log(table.toString());
    
        } catch (error) {
            console.error('Error fetching departments:', error.message);
        }

        // return to the main menu
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

        const departments = await viewAllDepartmentsSQL();

        const answers = await inquirer.prompt([
            {
            type: 'input',
            name: 'roleTitle',
            message: 'What is the name of the role?',
            },
            {
            type: 'input',
            name: 'roleSalary',
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
            name: 'departmentName',
            message: 'Which department does the role belong to?',
            choices: departments.map(department => department.department),
            },
        ]);

        // TODO
        try {
            const roles = await addRoleSQL(answers.roleTitle, answers.roleSalary, answers.departmentName);
            console.log(`Added ${answers.roleTitle} to the database.`);
        } catch (error) {
            console.error('Error fetching roles:', error.message);
        }

        this.startCli();
    }

    // TODO
    async viewAllRoles() {
    
        try {
            const roles = await viewAllRolesSQL();
    
            // prepare the header format
            const table = new Table({
                head: ['ID', 'Title', 'Department', 'Salary'], // Table headers
                colWidths: [10, 20, 20, 10] // Adjust column widths as needed
            });
    
            // update the table with each role record that was returned
            roles.forEach(role => {
                table.push([role.id, role.title, role.department, role.salary]); // Add role info as a row
            });
    
            // show the table
            console.log(table.toString()); // Render the table to the console
        } catch (error) {
            console.error('Error fetching roles:', error.message);
        }
    
        // return to the main menu
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
        try {
            const roles = await updateEmployeeRoleSQL();
            console.log(`Updated ${answers.employee}'s role to ${answers.newRole}.`);
        } catch (error) {
            console.error('Error fetching roles:', error.message);
        }

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
        try {
            const roles = await addEmployeeSQL();
            console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`);
        } catch (error) {
            console.error('Error fetching roles:', error.message);
        }
    
        this.startCli();
    }

    // TODO
    async viewAllEmployees() {

        try {
            const employees = await viewAllEmployeesSQL();
        
            // prepare the header format
            const table = new Table({
                head: ['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'],
                colWidths: [10, 15, 15, 20, 20, 10, 30],
            });
        
            // update the table with each employee record that was returned
            employees.forEach(employee => {
                table.push([employee.id, 
                            employee.first_name, 
                            employee.last_name, 
                            employee.title, 
                            employee.department, 
                            employee.salary, 
                            employee.manager]);
            });
        
            // show the table
            console.log(table.toString());
        
        } catch (error) {
            console.error('Error fetching employees:', error.message);
        }

        // return to the main menu
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
            // Exit the app when the user selects Quit
            console.log("Have a nice day 🙂");
            pool.end();
        }
    }
}

// export the Cli class
export default Cli;
