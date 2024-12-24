/*
 * schema.sql
 *
 * This scripts creates the Employees database and sets up the schema
 *
 * Run it from the PostgreSQL console, or use:
 *    psql -U postgres -f db/schema.sql
 *
 */

-- helpful for troubleshooting your current connection
\conninfo

-- ensure you're not connected to employees_db in caes it needs to be dropped
\c postgres
DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

-- must be connected to employees_db to create the tables
-- CASCADE will also delete the foreign key constraints in other tables.
\c employees_db
DROP TABLE IF EXISTS department CASCADE;
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

-- CASCADE will also delete the foreign key constraints in other tables.
DROP TABLE IF EXISTS role CASCADE;
CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department(id)
    ON DELETE SET NULL
);

/*
 * manager_id references another employee that is the manager of the current 
 *    employee. The spec indicates it can be null if the employee has no 
 *    manager.
 */
DROP TABLE IF EXISTS employee CASCADE;
CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER, -- by design null indicates the employee has no manager
  FOREIGN KEY (role_id) REFERENCES role(id)
    ON DELETE SET NULL,
  -- manager_id references another employee who is this employee's manager
  FOREIGN KEY (manager_id) REFERENCES employee(id)
    -- Prevent deletion of role if employees are assigned
    ON DELETE RESTRICT
);