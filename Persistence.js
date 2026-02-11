//Mohsen Ali
//60305864
const fs = require("fs/promises")


async function readEmployeesData() {
    let data= await fs.readFile("employees.json","utf8")
    let employees = JSON.parse(data)

    return employees
    
}

async function readShiftsData() {
    let data= await fs.readFile("shifts.json","utf8")
    let shifts = JSON.parse(data)
    
    return shifts
}

async function readAssignmentsData() {
    let data= await fs.readFile("assignments.json","utf8")
    let assignments = JSON.parse(data)
    
    return assignments
}


async function readConfigData() {
    let data = await fs.readFile("config.json","utf-8")
    let config =JSON.parse(data)

    return config
    
}


async function writeEmployeesData(employeesList) {
    await fs.writeFile("employees.json",JSON.stringify(employeesList),'utf-8');

}


async function writeShiftsData(shiftsList) {
    await fs.writeFile("shifts.json",JSON.stringify(shiftsList),'utf-8');

}


async function writeAssignmentsData(assignmentsList) {
    await fs.writeFile("assignments.json",JSON.stringify(assignmentsList),'utf-8');

}


async function listEmployees() {
    let data= await readEmployeesData()
    
    return data
  
}




async function addEmployee(employee) {
    let data= await readEmployeesData()
    data.push(employee)
    await writeEmployeesData(data)
      
}


async function assignShift(employeeID,shiftID) {
    
    let assignments = await readAssignmentsData()

    assignments.push({ employeeId: employeeID, shiftId: shiftID })
    await writeAssignmentsData(assignments)
   
}




async function viewEmployeeSchedule(employeeId) {
    let shifts = await readShiftsData()
    let assignments = await readAssignmentsData()

    let employeeSchedule = []

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
 


module.exports={readEmployeesData,readShiftsData,readAssignmentsData,writeEmployeesData,writeShiftsData,writeAssignmentsData
    ,listEmployees,addEmployee,assignShift,viewEmployeeSchedule,readConfigData
}

