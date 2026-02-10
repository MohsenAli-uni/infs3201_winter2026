const persistence = require("./persistence")

async function listEmployees() {
  return await persistence.readEmployeesData()
}

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

async function assignShift(employeeID,shiftID) {
    let employees = await persistence.readEmployeesData()
    let shifts = await persistence.readShiftsData()
    let assignments = await persistence.readAssignmentsData()

    let employeeFound = false
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeID) {
            employeeFound = true
        }
    }
    if (employeeFound === false) {
        
        return "Employee does not exist"
    }

    let shiftFound = false
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftID) {
            shiftFound = true
        }
    }
    if (shiftFound === false) {
        
        return "Shift does not exist"
    }

    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeID && assignments[i].shiftId === shiftID) {
            
            return "Employee already assigned to shift"
        }
    }

    await persistence.assignShift(employeeID, shiftID)

    return "Shift Recorded"
    
}
