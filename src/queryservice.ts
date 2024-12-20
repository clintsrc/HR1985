import { pool } from './connection.js';


/*
 * getAllEmployees()
 * 
 * Query the employees_db to return all employee information.
 * It joins on the department and role tables. It also uses a self-join 
 * (LEFT JOIN) to get the manager's name by looking up the manager
 * in the same employee table.
 * 
 * Return the result in an array of records
 * 
 */
const viewAllEmployeesSQL = async () => {
    const query = `
        SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS department,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM
            employee
        JOIN 
            role ON employee.role_id = role.id
        JOIN department
            ON role.department_id = department.id
        LEFT JOIN 
            employee AS manager ON employee.manager_id = manager.id
        ORDER BY
            employee.id ASC;
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        throw error;
    }
};

// TODO
const addEmployeeSQL = async () => {
	console.error('TODO');
};

// TODO
const updateEmployeeRoleSQL = async () => {
	console.error('TODO');
};

/*
 * getAllRoles()
 * 
 * Query the employees_db to return all employee roles.
 * It joins on the department table.
 * 
 * Return the result in an array of records
 * 
 */
const viewAllRolesSQL = async () => {
    const query = `
        SELECT
            role.id,
            role.title,
            department.name AS department,
            role.salary
        FROM
            role
        JOIN 
            department ON role.department_id = department.id
        ORDER BY
            role.id ASC;
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching roles:', error.message);
        throw error;
    }
};
     
// TODO
const addRoleSQL = async (
    roleTitle: string,
    roleSalary: number,
    departmentName: string
): Promise<void> => {
    const query = `
        INSERT INTO role (title, salary, department_id)
        VALUES ($2, $3, (SELECT id FROM department WHERE name = $1));
    `;

    const params = [departmentName, roleTitle, roleSalary];

    try {
        await pool.query(query, params);
        console.log(`Role "${roleTitle}" added successfully in the "${departmentName}" department.`);
    } catch (error) {
        console.error('Error adding role:', error.message);
        throw error;
    }
};


/*
 * getAllDepartments()
 * 
 * Query the employees_db to return all departments
 * 
 * Return the result in an array of records
 * 
 */
const viewAllDepartmentsSQL = async () => {
    const query = `
        SELECT
            department.id,
            department.name AS department
        FROM
            department
        ORDER BY
            department.name ASC;
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching departments:', error.message);
        throw error;
    }
};

// TODO
const addDepartmentSQL = async () => {
	console.error('TODO');
};

export { 
    viewAllEmployeesSQL, 
    addEmployeeSQL, 
    updateEmployeeRoleSQL, 
    viewAllRolesSQL, 
    addRoleSQL, 
    viewAllDepartmentsSQL, 
    addDepartmentSQL
};