const persistence = require("./persistence")


/**
 * List all the registered employees(ID,Name,Phone).
 *
 * 
 * @returns {Array} returns a list of employees.
 */
async function listEmployees() {
  return await persistence.readEmployeesData()
}



/**
 * Adds a new unique employee to the list.
 * @param {String} name - Name of the new employee.
 * @param {String} phone - Phone number of the new employee.
 * @returns {Promise<void>} Resolves after employee is added.
 */
async function addEmployee(name, phone) {

  let data = await persistence.readEmployeesData()

    let lastEmployee = data[data.length - 1]
    let lastNumber = Number(lastEmployee.employeeId.substring(1))
    let newId = "E" + String(lastNumber + 1).padStart(3, "0")

    let employee = {
        employeeId: newId,
        name: name,
        phone: phone
    }
    
    data.push(employee)

    await persistence.writeEmployeesData(data)

    return "Employee added..."
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
    let shifts = await persistence.readShiftsData()
    let assignments = await persistence.readAssignmentsData()
    
    let employeeSchedule  = []

    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId) {
            let shiftId = assignments[i].shiftId

            for (let m = 0; m < shifts.length; m++) {
                if (shifts[m].shiftId === shiftId) {

                    employeeSchedule.push({
                        date: shifts[m].date,
                        startTime: shifts[m].startTime,
                        endTime: shifts[m].endTime
                    })
                }
            }
        }
    }
    return employeeSchedule
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
