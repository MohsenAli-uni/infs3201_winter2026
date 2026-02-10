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