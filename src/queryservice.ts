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


export { 
    viewAllEmployeesSQL, 
    addEmployeeSQL, 
    updateEmployeeRoleSQL, 
    viewRolesSQL, 
    addRoleSQL, 
    viewAllDepartmentsSQL, 
    addDepartmentSQL,
    getAllManagers
};