/* -------------------------
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
 * NOTE: an area for improvement would be to see if the inquirer prompts can 
 * include the table record IDs (without displaying them) instead of doing 
 * lookups by string values. That would prevent problems with duplicate names.
 * 
 * ------------------------- */

import Table from 'cli-table3'; // a little help with the console table output here
import inquirer from "inquirer";
import { connectToDb, disconnectFromDb } from '../connection.js';
import { capitalize, validateInput } from '../helperlib.js';

import {
    viewAllDepartmentsSQL,
    viewRolesSQL,
    viewAllEmployeesSQL,
    viewDepartmentByBudgetSQL,
    viewEmployeesByManagerSQL,
    viewEmployeesByDepartmentSQL,
    getAllManagers,
    addDepartmentSQL,
    addRoleSQL,
    addEmployeeSQL,
    updateEmployeeRoleSQL,
    updateEmployeeManagerSQL,
    deleteDepartmentSQL,
    deleteRoleSQL,
    deleteEmployeeSQL
} from '../queryservice.js';

// define the Cli class
class Cli {
    exit: boolean = false;

    /* -------------------------
     * Initialization / Connection Management / Exit methods
     * ------------------------- */

    constructor() {
        // connect to the database first thing
        this.startDbConnection();
    }

    /*
     * startDbConnection()
     *
     * The CLI is responsible for requesting the database connection
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
     * disconnectDb()
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
            console.error("Error disconnecting from the database:",
                error.message);
        }
    }

    /*
     * quitApp()
     *
     * Make sure to close the connection cleanly when user chooses to Quit
     * 
     */
    async quitApp() {
        // disconnect from the database
        await this.disconnectDb();
        // exit the application itself
        process.exit(0);
    }

    /* -------------------------
     * View / Read methods
     * ------------------------- */

    /* 
     * viewAllDepartments()
     * 
     * Displays detailed information about the current state of the 
     * department records
     * 
     * Returns to the main menu
     * 
     */
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

    /* 
     * viewAllRoles()
     *
     * Displays detailed information about the current state of the 
     * role records
     * 
     * Returns to the main menu
     * 
     */
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
                // add the row role info to the table
                table.push([role.id, role.title, role.department, role.salary]);
            });

            // show the table
            console.log(table.toString()); // Render the table to the console
        } catch (error) {
            console.error('Error retrieving roles:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * viewAllEmployees()
     *
     * Displays detailed information about the current state of the 
     * employee records
     * 
     * Returns to the main menu
     * 
     */
    async viewAllEmployees() {

        try {
            const employees = await viewAllEmployeesSQL();

            // prepare the header format
            const table = new Table({
                head: [
                    'ID',
                    'First Name',
                    'Last Name',
                    'Title',
                    'Department',
                    'Salary',
                    'Manager'
                ],
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

    /* 
     * viewDepartmentByBudget()
     *
     * Displays the combined salaries of all employees in each department
     * 
     * Returns to the main menu
     * 
     */
    async viewDepartmentByBudget() {

        try {
            const departments = await viewDepartmentByBudgetSQL();

            // prepare the header format
            const table = new Table({
                head: ['Department', 'Budget'],
                colWidths: [30, 9],
            });

            // update the table with each dapartment record that was returned
            departments.forEach(department => {
                table.push([department.department_name,
                department.total_budget]);
            });

            // show the table
            console.log(table.toString());

        } catch (error) {
            console.error('Error retrieving employees:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * viewEmployeesByManager()
     *
     * Displays a list of managers and all employees reporting to that manager.
     * 
     * Returns to the main menu
     * 
     */
    async viewEmployeesByManager() {

        try {
            const employees = await viewEmployeesByManagerSQL();

            // prepare the header format
            const table = new Table({
                head: ['Manager', 'Employees'],
                colWidths: [30, 50],
                // dynamically resizes the employees column to handle the array
                wordWrap: true
            });

            /*
             * Update the table with each record that was returned.
             * The join, creates a single string of comma-separated employees 
             * to make the record more readable
             */
            employees.forEach(manager => {
                table.push([manager.managers, manager.employees.join(', ')]);
            });

            // show the table
            console.log(table.toString());

        } catch (error) {
            console.error('Error retrieving employees:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * viewEmployeesByDepartment()
     *
     * Displays a list of departments and all employees assigned to that
     * department
     * 
     * Returns to the main menu
     * 
     */
    async viewEmployeesByDepartment() {

        try {
            const employees = await viewEmployeesByDepartmentSQL();

            // prepare the header format
            const table = new Table({
                head: ['Department', 'Employees'],
                colWidths: [30, 50],
                // dynamically resizes the employees column to handle the array
                wordWrap: true
            });

            /*
             * Update the table with each record that was returned.
             * The join, creates a single string of comma-separated employees 
             * to make the record more readable
             */
            employees.forEach(department => {
                table.push([
                    department.department_name, department.employees.join(', ')
                ]);
            });

            // show the table
            console.log(table.toString());

        } catch (error) {
            console.error('Error retrieving employees:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* -------------------------
     * Add methods
     * ------------------------- */

    /* 
     * addDepartment()
     *
     * Adds a new department to the department table
     * 
     * Returns to the main menu
     * 
     */
    async addDepartment() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the name of the department?',
                validate: input => validateInput(input),
            }
        ]);

        let departmentName: string = capitalize(answers.departmentName);

        try {
            const roles = await addDepartmentSQL(departmentName);
            console.log(`Added ${departmentName} to the database.`);
        } catch (error) {
            console.error('Error adding department:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * addRole()
     *
     * Adds a new role to the role table
     * 
     * Returns to the main menu
     * 
     */
    async addRole() {
        // Get data to populate the prompt choices
        const departments = await viewAllDepartmentsSQL();

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'What is the name of the role?',
                validate: input => validateInput(input),
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary of the role?',
                validate: input => validateInput(input, true),
            },
            {
                type: 'list',
                name: 'departmentName',
                message: 'Which department does the role belong to?',
                choices: departments.map(department => department.department),
            },
        ]);

        let roleTitle: string = capitalize(answers.roleTitle);

        try {
            const roles = await addRoleSQL(
                roleTitle,
                answers.roleSalary,
                answers.departmentName
            );
            console.log(`Added ${roleTitle} to the database.`);
        } catch (error) {
            console.error('Error adding role:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * addEmployee()
     *
     * Adds a new employee to the employee table
     * 
     * Returns to the main menu
     * 
     */
    async addEmployee() {
        // Get data to populate the prompt choices
        const roles = await viewRolesSQL();
        const managers = await getAllManagers();

        // Prompt user for input
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?",
                validate: input => validateInput(input),
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is the employee's last name?",
                validate: input => validateInput(input),
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
                choices: ['None', ...managers.map(
                    manager => `${manager.manager}`
                )],
            },
        ]);

        let firstName: string = capitalize(answers.firstName);
        let lastName: string = capitalize(answers.lastName);

        try {
            await addEmployeeSQL(
                firstName,
                lastName,
                answers.role,
                answers.manager
            );
            console.log(`Added ${firstName} ${lastName} to the database.`);
        } catch (error) {
            console.error('Error adding employee:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* -------------------------
     * Update methods
     * ------------------------- */

    /* 
     * updateEmployeeRole()
     *
     * Update an existing employee record to switch to a different role
     * 
     * Returns to the main menu
     * 
     */
    async updateEmployeeRole() {
        // Get data to populate the prompt choices
        const employees = await viewAllEmployeesSQL();
        const roles = await viewRolesSQL();

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee's role would you like to update?",
                choices: employees.map(
                    employee => `${employee.first_name} ${employee.last_name}`
                ),
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
            console.log(
                `Updated ${answers.employee}'s role to ${answers.newRole}.`
            );
        } catch (error) {
            console.error('Error updating role:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* 
     * updateEmployeeManager()
     *
     * Update an existing employee record to assign a manager
     * 
     * No option is provided to assign 'None' (NULL) because the spec is vague
     * but it doesn't make much sense to update someone's manager to not 
     * having one
     * 
     * Returns to the main menu
     * 
     */
    async updateEmployeeManager() {
        // Get data to populate the prompt choices
        const employees = await viewAllEmployeesSQL();
        let managers = await getAllManagers();

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee's manager would you like to update?",
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: {
                        first_name: employee.first_name,
                        last_name: employee.last_name
                    }
                })),
            },
        ]);

        // don't include the selected employee in the list of assignable managers
        managers = managers.filter(manager =>
            `${manager.manager}` !== `${answers.employee.first_name} ${answers.employee.last_name}`
        );

        const managerAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'newManager',
                message: "Which manager do you want to assign to the selected employee?",
                choices: managers.map(manager => ({
                    name: `${manager.manager}`,
                    value: {
                        first_name: manager.manager.split(' ')[0],
                        last_name: manager.manager.split(' ')[1]
                    }
                })),
            },
        ]);

        answers.newManager = managerAnswer.newManager;

        try {
            await updateEmployeeManagerSQL(
                answers.employee.first_name,
                answers.employee.last_name,
                answers.newManager.first_name,
                answers.newManager.last_name
            );
            console.log(
                `Updated ${answers.employee}'s manager to ${answers.newManager}.`
            );
        } catch (error) {
            console.error('Error updating employee\'s manager:', error.message);
        }

        // return to the main menu
        this.startCli();
    }

    /* -------------------------
     * Delete methods
     * ------------------------- */

    /* 
     * deleteDepartment()
     *
     * Remove an existing department specified by the user
     * 
     * The spec doesn't indicate how to handle deleting a department when any 
     * roles are assigned to it. In this case there will not be a deletion, 
     * which is reported to the user. It makes sense not to make assumptions 
     * about what dependent data should be destroyed in the chain
     * 
     * Returns to the main menu
     * 
     */
    async deleteDepartment() {
        // Get data to populate the prompt choices
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

    /* 
     * deleteRole()
     *
     * Remove an existing role specified by the user
     * 
     * The spec doesn't indicate how to handle deleting a role when any 
     * employees are assigned to it. In this case there will not be a deletion, 
     * which is reported to the user. It makes sense not to make assumptions 
     * about what dependent data should be destroyed in the chain
     * 
     * Returns to the main menu
     * 
     */
    async deleteRole() {
        // Get data to populate the prompt choices
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

    /* 
     * deleteEmployee()
     *
     * Remove an existing employee specified by the user
     * 
     * Returns to the main menu
     * 
     */
    async deleteEmployee() {
        // Get data to populate the prompt choices
        const employees = await viewAllEmployeesSQL();

        // Prompt user for input
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: "Which employee would you like to delete?",
                choices: employees.map(
                    employee => `${employee.first_name} ${employee.last_name}`
                ),
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

    /* 
     * startCli()
     *
     * Display the main menu on the command line for user input. 
     * 
     * Call the appropriate method to handle the option when the user selects
     * it. The application uses the inquirer package to handle the 
     * framework for the prompts.
     * 
     * Exits the application when the user chooses Quit
     * 
     */
    async startCli(): Promise<void> {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'MainMenu',
                message: 'What would you like to do?',
                choices: [
                    'View All Departments',
                    'View All Roles',
                    'View All Employees',
                    'View Department by Budget',
                    'View All Employees by Manager',
                    'View All Employees by Department',
                    'Add Department',
                    'Add Role',
                    'Add Employee',
                    'Update Employee Role',
                    'Update Employee Manager',
                    'Delete Department',
                    'Delete Role',
                    'Delete Employee',
                    'Quit',
                ],
            },
        ]);

        // Main menu
        switch (answers.MainMenu) {
            case 'View All Departments':
                await this.viewAllDepartments();
                break;
            case 'View All Roles':
                await this.viewAllRoles();
                break;
            case 'View All Employees':
                await this.viewAllEmployees();
                break;
            case 'View Department by Budget':
                await this.viewDepartmentByBudget();
                break;
            case 'View All Employees by Manager':
                await this.viewEmployeesByManager();
                break;
            case 'View All Employees by Department':
                await this.viewEmployeesByDepartment();
                break;
            case 'Add Department':
                await this.addDepartment();
                break;
            case 'Add Role':
                await this.addRole();
                break;
            case 'Add Employee':
                await this.addEmployee();
                break;
            case 'Update Employee Role':
                await this.updateEmployeeRole();
                break;
            case 'Update Employee Manager':
                await this.updateEmployeeManager();
                break;
            case 'Delete Department':
                await this.deleteDepartment();
                break;
            case 'Delete Role':
                await this.deleteRole();
                break;
            case 'Delete Employee':
                await this.deleteEmployee();
                break;
            case 'Quit':
                await this.quitApp();
                break;
            default:
                console.log('Invalid selection.');
                this.startCli();
                break;
        }   // end switch
    }   // end startCli()
}   // end Cli class

// export the Cli class
export default Cli;
