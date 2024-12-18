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


-- View All Employees
SELECT
    employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    department.name AS department,
    role.salary,
    employee.manager_id
FROM
    employee
JOIN 
    role ON employee.role_id = role.id
JOIN department
    ON role.department_id = department.id
ORDER BY
    employee.id ASC;
