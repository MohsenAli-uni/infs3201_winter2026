
const persistence = require("./persistence")




/**
 * List all the registered employees(ID,Name,Phone).
 * @returns {Promise<Array>} returns a list of employees.
 */
async function listEmployees() {
  return await persistence.readEmployeesData()
}



/**
 * Adds a new unique employee to the list.
 * @param {String} name
 * @param {String} phone
 * @returns {Promise<void>}
 */
async function addEmployee(name, phone) {
    let employee = {name:name,phone:phone};
    await persistence.addEmployee(employee);
}


/**
 * Retrieves the work schedule of a specific employee.
 * Reads shifts and assignments data,
 * matches the employee with assigned shifts,
 * and returns the employee schedule.
 * @param {Number} employeeId - The ID of the employee.
 * @returns {Promise<Array>} List of employee shifts.
 */
async function viewEmployeeSchedule(employeeId) {
    return await persistence.viewEmployeeSchedule(employeeId);
}

/**
 * Updates employee information.
 * Calls the persistence layer to update
 * the employee record using the provided ID.
 * @param {String} employeeId - The employee ID.
 * @param {String} name - The updated employee name.
 * @param {String} phone - The updated employee phone number.
 * @returns {Promise<void>} Resolves after update is completed.
 */
async function updateEmployee(employeeId, name, phone) {
  await persistence.updateEmployee(employeeId, name, phone);
}


module.exports = { listEmployees, addEmployee, viewEmployeeSchedule, updateEmployee };
