/*
 * queryservice
 *
 * This module uses the pg module's connection pool to interface with a 
 * PostgreSQL database and manage employee data. The necessary SQL functions 
 * are exported to a command line class where the user can select which 
 * operations to perform on the employee data
 * 
 */
import { pool } from './connection.js';

const DEBUG = true; // TODO - change for final checkin

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
        if (DEBUG) {
            console.info(`viewAllEmployeesSQL: success\n${query}`);
        }
        return result.rows;
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        throw error;
    }
};

// TODO
/*
 * addEmployeeSQL()
 *
 * Query notes:
 * - A subquery determines the role title
 * - A CASE statement is used to handle when the manager is not specified ('None'
 *   meaning NULL)
 * - revisit for better error handling
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
                ELSE (SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = $4)
            END
        );
    `;
    const params = [firstName, lastName, roleTitle, managerName];

    try {
        await pool.query(query, params);

        if (DEBUG) {
            console.log(`addEmployeeSQL: Employee successfully added: ${firstName} ${lastName}, ${roleTitle}, ${managerName}.\n${query}`);
        }
    } catch (error) {
        console.error('Error adding employee:', error.message);
        throw error;
    }
};


// TODO
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
            console.log(`deleteEmployeeSQL: Employee successfully deleted: ${employeeNameFirstName} ${employeeNameLastName}.\n${query}`);
        }
    } catch (error) {
        console.error('Error deleting employee:', error.message);
        throw error;
    }
};

// TODO
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
            console.log(`updateEmployeeRoleSQL: ${newRole} ${employeeName}\nRecords changed: ${res.rowCount}\n${query}\n${query}`);
        }
        
    } catch (error) {
        console.error('Error updating employee role:', error.message);
        throw error;
    }
}


/*
 * getAllRoles()
 * 
 * Query the employees_db to return all employee roles.
 * It joins on the department table.
 * 
 * Return the result in an array of records
 * 
 */
const viewRolesSQL = async (columns = ['role.id', 'role.title', 'department.name AS department', 'role.salary']) => {
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
        
        if (DEBUG) {
            console.log(`addRoleSQL: Role "${roleTitle}" added successfully in the "${departmentName}" department.\n${query}`);
        }

    } catch (error) {
        console.error('Error adding role:', error.message);
        throw error;
    }
};


// TODO
// Delete the role only if there are no employees assigned to it:
//    we don't want to make assumptions about what dependent data to
//    destroy in the chain
//
const deleteRoleSQL = async (
    roleTitle: string,
): Promise<boolean> => {
    let bDeleteSuccess: boolean = false;

    try {
        // Is the role assigned to an employee
        const result = await pool.query(
            `SELECT COUNT(*) AS count 
            FROM employee 
            WHERE role_id = (
                SELECT id FROM role WHERE title = $1
            )`, [roleTitle]
        );

        if (result.rows[0].count == 0) { // not in use, safe to delete
            await pool.query(`
                DELETE FROM role 
                WHERE title = $1`, [roleTitle]);
            
            if (DEBUG) {
                console.log(`deleteRoleSQL: Role "${roleTitle}" deleted successfully.\n`);
            }

            bDeleteSuccess =  true;
        } else {    // don't delete when the record is in use, inform the user
            console.log(`Role "${roleTitle}" cannot be deleted while there are employees assigned to it.`);

            bDeleteSuccess = false;
        }
    } catch (error) {
        console.error('Error deleting role:', error.message);
        throw error;
    }

    return bDeleteSuccess;
}


// TODO
// Delete the department only if there are no roles assigned to it:
//    we don't want to make assumptions about what dependent data to
//    destroy in the chain
//
const deleteDepartmentSQL = async (
    departmentName: string
): Promise<boolean> => {
    let  bDeleteSuccess: boolean = false;

    try {
        // are any roles assigned to the department?
        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM role
             WHERE department_id = (
                 SELECT id FROM department WHERE name = $1
             )`, [departmentName]
        );

        if (result.rows[0].count == 0) {    // not in use, safe to delete
            await pool.query(`
                DELETE FROM department
                WHERE name = $1`, [departmentName]);

            console.log(`deleteDepartmentSQL: Department "${departmentName}" deleted successfully.`);

            bDeleteSuccess = true;
        } else {    // don't delete when the record is in use, inform the user
            console.log(`Department "${departmentName}" cannot be deleted while a role is assigned to it.`);
            
            bDeleteSuccess = false;
        }
    } catch (error) {
        console.error('Error deleting department:', error.message);
        throw error;
    }

    return bDeleteSuccess;
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
        
        if (DEBUG) {
            console.info(`viewAllDepartmentsSQL: success\n${query}`);
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching departments:', error.message);
        throw error;
    }
};

// TODO
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
            console.log(`addDepartmentSQL: Added "${departmentName}" to the database.\n${query}`);
        }
        
    } catch (error) {
        console.error('Error adding department:', error.message);
        throw error;
    }
};


/*
 * Get the list of unique manager entries
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

/*
// TODO
// The query is a 1-to-many, it aggregates the employees for each manager.
// It uses a self-join (LEFT JOIN) to get the manager's name by looking up 
// the manager in the same employee table.

// It returns 2 fields:
//  mangagers: the concatenated manager's first and last name
//  employees: a sorted array with each employee's concatenated first and 
//      last name
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
// TODO
// viewDepartmentByBudgetSQL()
// This function provides a view oof the total utilized budget of a department
// (i.e. the combined salaries of all employees in that department).
// The query uses the SUM function, along with the GROUP BY clause, to 
// calculate the total salary budget for each department according to the roles 
// assigned to employees in each department.
// The GROUP BY clause is what group the departments.
// The query returns:
//  department_name
//  total_budget
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
// TODO
// The query is a 1-to-many. It aggregates the employees for each department.

// It returns 2 fields:
//  department_name
//  employees: a sorted array with each employee's concatenated first and 
//      last name
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
    deleteDepartmentSQL, 
    deleteRoleSQL, 
    deleteEmployeeSQL
};