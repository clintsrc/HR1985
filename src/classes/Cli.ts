/*
 * CLI
 *
 * This class drives the command line prompt interaction to interface
 * with the PostgreSQL employee tracking database. It is responsible for 
 * managing the lifecycle of connecting to and disconnecting from the database. 
 * When connected the CLI interacts with the user through command line prompts 
 * via the inquirer npm package. It uses the queryservice module in order to 
 * load dynamically changing menu choice options where needed, and makes the
 * calls to the SQL transactions.
 * 
 */

import Table from 'cli-table3'; // a little help with the console table output here
import inquirer from "inquirer";
import { connectToDb, disconnectFromDb } from '../connection.js';

import { 
    addEmployeeSQL,
    deleteEmployeeSQL, // bonus
    updateEmployeeRoleSQL,
    viewAllEmployeesSQL, 
    addRoleSQL, 
    deleteRoleSQL, // bonus
    viewAllDepartmentsSQL,
    addDepartmentSQL, 
    deleteDepartmentSQL, //bonus
    viewRolesSQL,
    getAllManagers
} from '../queryservice.js';

// define the Cli class
class Cli {
    exit: boolean = false;

    constructor() {
        // connect to the database first
        this.startDbConnection();
    }

    /*
     *
     * The CLI is s responsible for requesting the database connection
     * before any SQL requests can be made
     * 
     */
    async startDbConnection() {
        try {
            await connectToDb();
        } catch (error) {
            console.error("Failed to connect to the database:", error.message);
            process.exit(1); // Exit immediately if the connection fails
        }
    }

    /*
     *
     * The CLI is responsible for requesting the database disconnect when
     * the user is finished
     * 
     */
    async disconnectDb() {
        try {
            await disconnectFromDb();
            console.log("Have a nice day 🙂");
        } catch (error) {
            console.error("Error disconnecting from the database:", error.message);
        }
    }

    // Make sure to close the connection cleanly when user selects Quit
    async quitApp() {
        // disconnect from the database
        await this.disconnectDb();
        // exit the application itself
        process.exit(0);
    }
    
    // TODO
    async addDepartment() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the name of the department?',
            },
        ]);

        try {
            const roles = await addDepartmentSQL(answers.departmentName);
            console.log(`Added ${answers.departmentName} to the database.`);
        } catch (error) {
            console.error('Error adding department:', error.message);
        }
        
        // return to the main menu
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
            console.error('Error retrieving departments:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    // TODO
    async addRole() {
        // Get data to populate the prompt info
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

        try {
            const roles = await addRoleSQL(answers.roleTitle, answers.roleSalary, answers.departmentName);
            console.log(`Added ${answers.roleTitle} to the database.`);
        } catch (error) {
            console.error('Error adding role:', error.message);
        }

        // return to the main menu
        this.startCli();
    }


    // TODO
    async deleteRole() {
        // Get data to populate the prompt info
        const roles = await viewRolesSQL();
    
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'roleTitle',
                message: "Which role would you like to delete?",
                choices: roles.map(role => role.title),
            },
        ]);
    
        try {
            const result = await deleteRoleSQL(answers.roleTitle);
    
            if (result) {
                console.log(`Deleted role "${answers.roleTitle}" from the database.`);
            } else {
                console.error(`Error deleting role "${answers.roleTitle}".`);
            }
        } catch (error) {
            console.error('Unexpected error while deleting role:', error.message);
        }
    
        // return to the main menu
        this.startCli();
    }    
    

    // TODO
    async deleteDepartment() {
        // Get data to populate the prompt info
        const departments = await viewAllDepartmentsSQL();
   
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentName',
                message: "Which department would you like to delete?",
                choices: departments.map(department => department.department),
            },
        ]);
    
        try {
            const result = await deleteDepartmentSQL(answers.departmentName);
    
            if (result) {
                console.log(`Deleted department "${answers.departmentName}" from the database.`);
            } else {
                console.error(`Error deleting department "${answers.departmentName}".`);
            }
        } catch (error) {
            console.error('Unexpected error while deleting department:', error.message);
        }
    
        // return to the main menu
        this.startCli();
    }

    // TODO
    async viewAllRoles() {
    
        try {
            const roles = await viewRolesSQL();
    
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
            console.error('Error retrieving roles:', error.message);
        }
    
        // return to the main menu
        this.startCli();
    }

    // TODO
    async updateEmployeeRole() {
        // Get data to populate the prompt info
        const employees = await viewAllEmployeesSQL();
        const roles = await viewRolesSQL();

        const answers = await inquirer.prompt([
            {
            type: 'list',
            name: 'employee',
            message: "Which employee's role would you like to update?",
            choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`),
            },
            {
            type: 'list',
            name: 'newRole',
            message: 'Which role do you want to assign to the selected employee?',
            choices: roles.map(role => role.title),
            },
        ]);

        try {
            await updateEmployeeRoleSQL(answers.newRole, answers.employee);
            console.log(`Updated ${answers.employee}'s role to ${answers.newRole}.`);
        } catch (error) {
            console.error('Error updating role:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    // TODO
    async addEmployee() {   
        // Get data to populate the prompt info
        const roles = await viewRolesSQL();
        const managers = await getAllManagers();
    
        // Prompt user for input
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
                choices: roles.map(role => role.title),
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: ['None', ...managers.map(manager => `${manager.manager}`)],
            },
        ]);
    
        try {
            await addEmployeeSQL(
                answers.firstName,
                answers.lastName,
                answers.role,
                answers.manager
            );
            console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`);
        } catch (error) {
            console.error('Error adding employee:', error.message);
        }
    
        // return to the main menu
        this.startCli();
    }
    
    // TODO
    async deleteEmployee() {
        // Get data to populate the prompt info
        const employees = await viewAllEmployeesSQL();
    
        // Prompt user for input
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: "Which employee would you like to delete?",
                choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`),
            },
        ]);
    
        try {
            const [employeeFirstName, employeeLastName] = answers.employeeName.split(' ');
            await deleteEmployeeSQL(
                employeeFirstName, 
                employeeLastName
            );
            console.log(`Deleted ${employeeFirstName} ${employeeLastName} from the database.`);
        } catch (error) {
            console.error('Error deleting employee:', error.message);
        }
    
        // return to the main menu
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
            console.error('Error retrieving employees:', error.message);
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
                    'Delete Employee',
                    'Update Employee Role',
                    'View All Roles',
                    'Add Role',
                    'Delete Role',
                    'View All Departments',
                    'Add Department',
                    'Delete Department',
                    'Quit',
                ],
            },
        ]);

        // Handle the main menu answers
        if (answers.MainMenu === 'View All Employees') {
            await this.viewAllEmployees();
        } else if (answers.MainMenu === 'Add Employee') {
            await this.addEmployee();
        } else if (answers.MainMenu === 'Delete Employee') {
            await this.deleteEmployee();
        } else if (answers.MainMenu === 'Update Employee Role') {
            await this.updateEmployeeRole();
        } else if (answers.MainMenu === 'View All Roles') {
            await this.viewAllRoles();
        } else if (answers.MainMenu === 'Add Role') {
            await this.addRole();
        } else if (answers.MainMenu === 'Delete Role') {
            await this.deleteRole();
        } else if (answers.MainMenu === 'View All Departments') {
            await this.viewAllDepartments();            
        } else if (answers.MainMenu === 'Add Department') {
            await this.addDepartment();
        } else if (answers.MainMenu === 'Delete Department') {
            await this.deleteDepartment();
        } else if (answers.MainMenu === 'Quit') {
            // Exit the app when the user selects Quit
            await this.quitApp();
        }
    }
}

// export the Cli class
export default Cli;
