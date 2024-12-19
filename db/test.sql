-- ensure you're not connected to employees_db in caes it needs to be dropped
\c employees_db
-- helpful for troubleshooting your current connection
\conninfo

-- Add Department
-- e.g. What is the name of the department? Service
/* INSERT INTO
    department (name)
VALUES
    ('Techpubs'); */



/*  Add Role
    (2) What is the name of the role? Customer Service
    What is the salary of the role? 80000
    Which department does the role belong to? (use arrow keys)
        Engineering
        Finance
        ...
        Service *
    Added Customer Service to the database */
/* DO $$
DECLARE
    dept_id INT;  -- Declare a variable to hold the department ID
BEGIN
    SELECT id INTO dept_id FROM department WHERE department.name = 'Techpubs';
    
    -- You can now use dept_id for further processing
    RAISE NOTICE 'Department ID: %', dept_id;  -- This will print the captured ID
    INSERT INTO 
        role (title, salary, department_id)
    VALUES
        ('Technical Writer', 60000, dept_id);
END $$; */



/*  Add Employee
    (3) What is the employee's first name? Sam
    What is the employee's last name? Kash
    What is the employee's role? (use arrow keys)
        Salesperson
        Lead Engineer
        ...
        Customer Service *
    Who is the employee's manager? (use arrow keys)
        None
        John Doe
        ...
        Ashley Rodriguez * (though not likely!!!)
    Added Sam Kash to the database */

/* 
DO $$
DECLARE
    role_id_value INT;        -- Variable to hold the role ID
    manager_id_value INT;    -- Variable to hold the manager ID (can be NULL)
BEGIN
    -- Get the role ID for 'Technical Writer'
    SELECT id INTO role_id_value FROM role WHERE role.title = 'Technical Writer';

    -- Determine if a manager is specified or not
    IF TRUE THEN  -- Replace FALSE with your condition for when manager is not NULL
        -- Lookup manager ID for 'Kevin Tupik'
        SELECT id INTO manager_id_value
        FROM employee
        WHERE first_name = 'Kevin' AND last_name = 'Tupik'
        LIMIT 1;
    ELSE
        -- No manager specified, set manager_id_value to NULL directly
        manager_id_value := NULL;
    END IF;

    -- Log the captured role_id_value and manager_id_value for debugging
    RAISE NOTICE 'Role ID: %, Manager ID: %', role_id_value, manager_id_value;

    -- Insert a new employee using the captured IDs
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ('Paul', 'McCartney', role_id_value, manager_id_value);
END $$; */


/* Update Employee Role
    (4) Which employee's role would you like to update? (use arrow keys)
        John Doe
        Mike Chan
        ...
        Sam Kash *
    Which role do you want to assign the selected employee? (use arrow keys)
        Sales Lead *
        Salesperson
        ...
    Updated employee's role */

UPDATE employee
SET role_id = 5
WHERE first_name = 'John' AND last_name = 'Lennon';



