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


module.exports={listEmployees,addEmployee,viewEmployeeSchedule}
