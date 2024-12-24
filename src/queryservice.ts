/* -------------------------
 * queryservice
 *
 * This module uses the pg module's connection pool to interface with a 
 * PostgreSQL database and manage employee data. The necessary SQL functions 
 * are exported to a command line class where the user can select which 
 * operations to perform on the employee data
 * 
 * ------------------------- */

import { pool } from './connection.js';

const DEBUG = false;

/* -------------------------
 * View / Read functions
 * ------------------------- */

/*
 * viewAllDepartmentsSQL()
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

        if (DEBUG) {
            console.info(`viewAllDepartmentsSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching departments:', error.message);
        throw error;
    }
};

/*
 * viewRolesSQL()
 * 
 * Query the employees_db to return all employee roles.
 * It joins on the department table.
 * 
 * Default select fields are specified, but the caller can optionally 
 * override it with specific fields to extract a subset of the role info
 * 
 * Return the result in an array of records
 * 
 */
const viewRolesSQL = async (
    columns = [
        'role.id',
        'role.title',
        'department.name AS department',
        'role.salary']
) => {
    const query = `
        SELECT
            ${columns.join(', ')}
        FROM
            role
        JOIN 
            department ON role.department_id = department.id
        ORDER BY
            role.id ASC;
    `;

    try {
        const result = await pool.query(query);

        if (DEBUG) {
            console.info(`viewRolesSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching roles:', error.message);
        throw error;
    }
};

/*
 * viewAllEmployeesSQL()
 * 
 * Retrieve all employee information
 * 
 * The query joins on the department and role tables. It also uses a self-join 
 * (LEFT JOIN) to get the manager's name by looking up the manager in the same 
 * employee table.
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
        if (DEBUG) {
            console.info(`viewAllEmployeesSQL: success\n${query}`);
        }
        return result.rows;
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        throw error;
    }
};

/* 
 * viewEmployeesByManagerSQL()
 *
 * Retrieves managers and all employees reporting to that manager.
 *
 * The query is a 1-to-many, it aggregates the employees for each manager.
 * It uses a self-join (LEFT JOIN) to get the manager's name by looking up 
 * the manager in the same employee table.
 * 
 * It returns 2 fields:
 * mangagers: the concatenated manager's first and last name
 * employees: a sorted array with each employee's concatenated first and 
 *  last name
 * 
 */
const viewEmployeesByManagerSQL = async () => {
    const query = `
        SELECT
            CONCAT(manager.first_name, ' ', manager.last_name) AS managers,
            ARRAY_AGG(
                CONCAT(employee.first_name, ' ', employee.last_name)
                ORDER BY employee.first_name, employee.last_name
            ) AS employees
        FROM
            employee
        LEFT JOIN employee AS manager
            ON employee.manager_id = manager.id
        JOIN role
            ON employee.role_id = role.id
        GROUP BY
            manager.first_name, manager.last_name
        ORDER BY
            manager.first_name, manager.last_name;
    `;

    try {
        const result = await pool.query(query);

        if (DEBUG) {
            console.info(`viewEmployeesByManagerSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching employees by manager:', error.message);
        throw error;
    }
};

/* 
 * viewEmployeesByDepartmentSQL()
 * 
 * Retrieves departments and all employees assigned to that department
 * 
 * The query is a 1-to-many. It aggregates the employees for each department.
 * 
 * It returns 2 fields:
 * department_name
 * employees: a sorted array with each employee's concatenated first and
 *  last name
 * 
 */
const viewEmployeesByDepartmentSQL = async () => {
    const query = `
        SELECT
            department.name AS department_name,
            ARRAY_AGG(
                CONCAT(employee.first_name, ' ', employee.last_name)
                ORDER BY employee.first_name, employee.last_name
            ) AS employees
        FROM
            department
        JOIN role ON department.id = role.department_id
        JOIN employee ON role.id = employee.role_id
        GROUP BY
            department.name
        ORDER BY
            department.name;
    `;

    try {
        const result = await pool.query(query);

        if (DEBUG) {
            console.info(`viewEmployeesByDepartmentSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching employees by department:', error.message);
        throw error;
    }
};

/* 
 * viewDepartmentByBudgetSQL()
 *
 * Queries the employee database to report the total utilized budget of a 
 * department (i.e. the combined salaries of all employees in that department).
 * 
 * The query uses the SUM function, along with the GROUP BY clause, to 
 * calculate the total salary budget for each department according to the roles 
 * assigned to employees in each department. The GROUP BY clause is what group 
 * the departments.
 * 
 * The query returns:
 *  department_name
 *  total_budget
 * 
 */
const viewDepartmentByBudgetSQL = async () => {
    const query = `
        SELECT
            department.name AS department_name,
            SUM(role.salary) AS total_budget
        FROM
            department
        JOIN role ON department.id = role.department_id
        JOIN employee ON role.id = employee.role_id
        GROUP BY
            department.name
        ORDER BY
            department.name;
    `;

    try {
        const result = await pool.query(query);

        if (DEBUG) {
            console.info(`viewDepartmentByBudgetSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching department by budget:', error.message);
        throw error;
    }
};

/* 
 * getAllManagers()
 *
 * Get the list of unique manager entries (currently only used for populating
 * the inquirer prompt choices)
 * 
 * To SELECT DISTINCT is used to filter out duplicate entries. It also uses 
 * a self-join (LEFT JOIN) to get the manager's name by looking up the manager
 * in the same employee table.
 * 
 * It returns an array of the manager's name (first and last name concatenated)
 * 
 */
const getAllManagers = async () => {
    const query = `
        SELECT DISTINCT
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM
            employee
        LEFT JOIN 
            employee AS manager ON employee.manager_id = manager.id
            where employee.manager_id is not null
        ORDER BY
            manager ASC;
    `;

    try {
        const result = await pool.query(query);
        if (DEBUG) {
            console.info(`getAllManagers: success\n${query}`);
        }
        return result.rows;
    } catch (error) {
        console.error('Error fetching managers:', error.message);
        throw error;
    }
};

/* -------------------------
 * Add functions
 * ------------------------- */

/* 
 * addDepartmentSQL()
 *
 * Updates the department table with the new department name
 * 
 * Raises an error if any issues occur
 * 
 */
const addDepartmentSQL = async (
    departmentName: string,
): Promise<void> => {
    const query = `
        INSERT INTO department (name) VALUES ($1)
    `;

    const params = [departmentName];

    try {
        await pool.query(query, params);

        if (DEBUG) {
            console.log(
                `addDepartmentSQL: Added "${departmentName}" to the database.\n
                ${query}`
            );
        }

    } catch (error) {
        console.error('Error adding department:', error.message);
        throw error;
    }
};

/* 
 * addRoleSQL()
 *
 * Adds a new record to the role table with the provided role title, salary,
 * and department id.
 * 
 * The department name is passed in. A subquery uses the name to lookup the 
 * department id.
 * 
 * Raises an error if any issues occur
 * 
 */
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

        if (DEBUG) {
            console.log(
                `addRoleSQL: Role "${roleTitle}" added successfully 
                 in the "${departmentName}" department.\n${query}`
            );
        }

    } catch (error) {
        console.error('Error adding role:', error.message);
        throw error;
    }
};

/* 
 * addEmployeeSQL()
 *
 * Adds a new employee record to  the database
 * 
 * A subquery determines the role title. A CASE statement is used to handle 
 * when the manager is not specified ('None' meaning NULL)
 * 
 * Raises an error if any issues occur
 * 
 */
const addEmployeeSQL = async (
    firstName: string,
    lastName: string,
    roleTitle: string,
    managerName: string | null
): Promise<void> => {
    const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (
            $1, 
            $2, 
            (SELECT id FROM role WHERE title = $3),
            CASE 
                WHEN $4 = 'None' THEN NULL 
                ELSE (SELECT id FROM employee WHERE CONCAT(
                   first_name, ' ', last_name) = $4
                )
            END
        );
    `;
    const params = [firstName, lastName, roleTitle, managerName];

    try {
        await pool.query(query, params);

        if (DEBUG) {
            console.log(
                `addEmployeeSQL: Employee successfully added: 
                 ${firstName} ${lastName}, 
                 ${roleTitle}, ${managerName}.\n${query}`
            );
        }
    } catch (error) {
        console.error('Error adding employee:', error.message);
        throw error;
    }
};

/* -------------------------
 * Update functions
 * ------------------------- */

/* 
 * updateEmployeeRoleSQL()
 * 
 * Updates an existing employee role
 * 
 * It uses a subquery to lookup the role id by the role title input and
 * checks if this concatenated employee first and last name matches the 
 * employee name input
 * 
 * Raises an error if any issues occur
 * 
 */
const updateEmployeeRoleSQL = async (
    newRole: string,
    employeeName: string
): Promise<void> => {
    const query = `
        UPDATE employee
        SET role_id = (SELECT id FROM role WHERE title = $1)
        WHERE CONCAT(first_name, ' ', last_name) = $2;
    `;

    try {
        const res = await pool.query(query, [newRole, employeeName]);

        if (DEBUG) {
            console.log(
                `updateEmployeeRoleSQL: 
                 ${newRole} ${employeeName}
                 \nRecords changed: 
                 ${res.rowCount}\n${query}\n${query}`
            );
        }

    } catch (error) {
        console.error('Error updating employee role:', error.message);
        throw error;
    }
}

/* 
 * updateEmployeeManagerSQL()
 *
 * Updates an employee's manager
 * 
 * The manager's first and last name are passed in and a subquery looks up
 * that manager's employee id. The employee's record is determined by their
 * first and last name in order to update that record's manager_id field with
 * the manager's manager_id
 * 
 * Raises an error if any issues occur
 * 
 */
const updateEmployeeManagerSQL = async (
    employeeFirstName: string,
    employeeLastName: string,
    managerFirstName: string,
    managerLastName: string
): Promise<void> => {
    const query = `
        UPDATE employee
        SET manager_id = (
            SELECT id FROM employee 
            WHERE first_name = $3 AND last_name = $4
        )
        WHERE first_name = $1 AND last_name = $2;
    `;
    const params = [
        employeeFirstName,
        employeeLastName,
        managerFirstName,
        managerLastName
    ];

    try {
        const result = await pool.query(query, params);

        console.log(
            `updateEmployeeManagerSQL: Updated manager for "${employeeFirstName} 
             ${employeeLastName}" to "${managerFirstName} ${managerLastName}".`
        );

        if (DEBUG) {
            console.log(`Records affected: ${result.rowCount}\nQuery: ${query}`);
        }
    } catch (error) {
        console.error('Error updating employee manager:', error.message);
        throw error;
    }
};

/* -------------------------
 * Delete functions
 * ------------------------- */

/* 
 * deleteDepartmentSQL()
 *
 * Deletes a department record
 * 
 * Uses a subquery to lookup the department id from the department name
 * specified by the user
 * 
 * The spec doesn't indicate how to handle deleting a department when any 
 * roles are assigned to it. In this case there will not be a deletion, 
 * which is reported to the user. It makes sense not to make assumptions 
 * about what dependent data should be destroyed in the chain
 * 
 * Raises an error if any issues occur
 * 
 */
const deleteDepartmentSQL = async (
    departmentName: string
): Promise<boolean> => {
    let bDeleteSuccess: boolean = false;

    try {
        // are any roles assigned to the department?
        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM role
             WHERE department_id = (
                 SELECT id FROM department WHERE name = $1
             )`, [departmentName]
        );

        if (result.rows[0].count == 0) {    // dept not in use, safe to delete
            await pool.query(`
                DELETE FROM department
                WHERE name = $1`, [departmentName]);

            console.log(
                `deleteDepartmentSQL: Department "${departmentName}" 
                 deleted successfully.`
            );

            bDeleteSuccess = true;
        } else {    // record is in use: don't delete it, inform the user
            console.log(
                `Department "${departmentName}" cannot be deleted while a role 
                 is assigned to it.`
            );

            bDeleteSuccess = false;
        }
    } catch (error) {
        console.error('Error deleting department:', error.message);
        throw error;
    }

    return bDeleteSuccess;
};

/* 
 * deleteRoleSQL()
 *
 * Uses a subquery to lookup the role id from the role title specified by 
 * the user
 * 
 * The spec doesn't indicate how to handle deleting a role when any 
 * employees are assigned to it. In this case there will not be a deletion, 
 * which is reported to the user. It makes sense not to make assumptions 
 * about what dependent data should be destroyed in the chain
 * 
 * Raises an error if any issues occur
 * 
 */
const deleteRoleSQL = async (
    roleTitle: string,
): Promise<boolean> => {
    let bDeleteSuccess: boolean = false;

    try {
        // Is the role assigned to an employee?
        const result = await pool.query(
            `SELECT COUNT(*) AS count 
            FROM employee 
            WHERE role_id = (
                SELECT id FROM role WHERE title = $1
            )`, [roleTitle]
        );

        if (result.rows[0].count == 0) { // role not in use, safe to delete
            await pool.query(`
                DELETE FROM role 
                WHERE title = $1`, [roleTitle]);

            if (DEBUG) {
                console.log(`deleteRoleSQL: Role "${roleTitle}" 
                    deleted successfully.\n`);
            }

            bDeleteSuccess = true;
        } else {    // record is in use: don't delete it, inform the user
            console.log(
                `Role "${roleTitle}" cannot be deleted while there are 
                 employees assigned to it.`
            );

            bDeleteSuccess = false;
        }
    } catch (error) {
        console.error('Error deleting role:', error.message);
        throw error;
    }

    return bDeleteSuccess;
}

/* 
 * deleteEmployeeSQL()
 *
 * Deletes an employee record by first and last name
 * 
 * Raises an error if any issues occur
 * 
 */
const deleteEmployeeSQL = async (
    employeeNameFirstName: string,
    employeeNameLastName: string
): Promise<void> => {
    const query = `
        DELETE FROM employee
        WHERE first_name = $1 AND last_name = $2;
    `;
    const params = [employeeNameFirstName, employeeNameLastName];

    try {
        await pool.query(query, params);

        if (DEBUG) {
            console.log(
                `deleteEmployeeSQL: Employee successfully deleted: 
                ${employeeNameFirstName} ${employeeNameLastName}.\n${query}`
            );
        }
    } catch (error) {
        console.error('Error deleting employee:', error.message);
        throw error;
    }
};

export {
    viewAllDepartmentsSQL,
    viewRolesSQL,
    viewAllEmployeesSQL,
    viewEmployeesByManagerSQL,
    viewEmployeesByDepartmentSQL,
    viewDepartmentByBudgetSQL,
    getAllManagers,
    addDepartmentSQL,
    addRoleSQL,
    addEmployeeSQL,
    updateEmployeeRoleSQL,
    updateEmployeeManagerSQL,
    deleteDepartmentSQL,
    deleteRoleSQL,
    deleteEmployeeSQL
};