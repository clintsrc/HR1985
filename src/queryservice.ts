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
const getAllEmployees = async () => {
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

/*
 * getAllDepartments()
 * 
 * Query the employees_db to return all departments
 * 
 * Return the result in an array of records
 * 
 */
const getAllDepartments = async () => {
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

/*
 * getAllRoles()
 * 
 * Query the employees_db to return all employee roles.
 * It joins on the department table.
 * 
 * Return the result in an array of records
 * 
 */
const getAllRoles = async () => {
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

export { getAllEmployees, getAllDepartments, getAllRoles };
