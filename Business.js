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
 * Add a unique new employee to the list of employees.
 *
 * @param {String} name Name of the new employee.
 * @param {String} phone phone number of the new employee.
 * 
 * @returns {void} Adds the new employee to the list.
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
 * display employee shift schedule timings.
 *
 * @param {String} employeeID employee ID.
 * 
 * @returns {String} returns a shift schedule of the chosen employee.
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
 * function for the update(edit) the employee information.
 *
 * @param {String} employeeID employee ID.
 * @param {String} name employee name.
 * @param {String} phone employee phone.
 * 
 * @returns {void} update by using updateOn in persistence layer.
 */
async function updateEmployee(employeeId, name, phone) {
  await persistence.updateEmployee(employeeId, name, phone);
}


module.exports = { listEmployees, addEmployee, viewEmployeeSchedule, updateEmployee };
