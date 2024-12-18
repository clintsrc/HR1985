-- ensure you're not connected to employees_db in caes it needs to be dropped
\c employees_db
-- helpful for troubleshooting your current connection
\conninfo

-- SELECT * FROM department;
-- SELECT * FROM role;
-- SELECT * FROM employee;


-- View All Departments
SELECT
    department.id,
    department.name AS department
FROM
    department
ORDER BY
    department.name ASC;


-- View All Roles
SELECT
    role.id,
    role.title,
    department.name,
    role.salary
FROM
    role
JOIN 
    department ON role.department_id = department.id
ORDER BY
    role.id ASC;


/*
 * View All Employees
 *
 * Uses a self-join for the manager's first and last name  
 * Concatenates first and last name into a single alias for the output
 *
 */
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
-- using a self-join here to get the manager's name
LEFT JOIN 
    employee AS manager ON employee.manager_id = manager.id
ORDER BY
    employee.id ASC;


-- Employee ID lookup
SELECT
    employee.id
FROM
    employee
WHERE
    (employee.first_name = 'Kevin') AND (employee.last_name = 'Tupik')
ORDER BY
    employee.id ASC
LIMIT 1;