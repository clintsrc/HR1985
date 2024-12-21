/*
 * Bonus
 * Try to add some additional functionality to your application, such as the ability to do the following
 */

-- Update employee managers.
-- TODO

-- View employees by manager.
/* 
SELECT
    manager.first_name AS manager_first_name,
    manager.last_name AS manager_last_name,
    STRING_AGG(
        CONCAT(employee.first_name, ' ', employee.last_name),
        ', ' ORDER BY employee.first_name, employee.last_name
    ) AS employees
FROM
    employee AS employee
LEFT JOIN employee AS manager ON employee.manager_id = manager.id
JOIN role ON employee.role_id = role.id
GROUP BY
    manager.first_name, manager.last_name
ORDER BY
    manager.first_name, manager.last_name;
*/


-- View employees by department.
/*
SELECT
    department.name AS department_name,
    STRING_AGG(
        CONCAT(employee.first_name, ' ', employee.last_name),
        ', ' ORDER BY employee.id
    ) AS employees
FROM
    department
JOIN role ON department.id = role.department_id
JOIN employee ON role.id = employee.role_id
GROUP BY
    department.name
ORDER BY
    department.name;
*/

-- Delete departments, roles, and employees.
-- TODO

-- View the total utilized budget of a department—in other words, the combined salaries of all employees in that department.
/* 
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
*/



