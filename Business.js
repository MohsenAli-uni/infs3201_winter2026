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
    let config = await persistence.readConfigData()

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
    let newShift = null
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftID) {
            shiftFound = true
            newShift = shifts[i]
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


    let totalHours=0

    for(let j = 0 ; j< assignments.length; j++){
        if(assignments[j].employeeId === employeeID ){
            let assignShift =null
            for(let i=0;i<shifts.length; i++){
                if(shifts[i].shiftId===assignments[j].shiftId){
                    assignShift=shifts[i]
                    break

                }
            }
        }
        if(assignShift.date === newShift.date ){
        totalHours += computeShiftDuration(assignShift.startTime, assignShift.endTime)
    }
    }

    totalHours += computeShiftDuration(newShift.startTime,newShift.endTime)

    if(totalHours > config.maxDailyHours){
        return "Cannot assign shift because it exceeds max daily Hours "+ config.maxDailyHours
    }  



    

    await persistence.assignShift(employeeID, shiftID)

    return "Shift Recorded"
    
}


/**
 * computeShiftDuration(startTime, endTime)
 *
 * LLM used: GPT-5.2 Thinking (ChatGPT)
 * Prompt used:
 * "Write a JavaScript function computeShiftDuration(startTime, endTime)
 * that takes times in 'HH:MM' 24-hour format and returns the difference
 * in hours as a decimal number. Example: 11:00 to 13:30 returns 2.5"
 *
 * @param {String} startTime
 * @param {String} endTime
 * @returns {Number} duration in hours
 */
function computeShiftDuration(startTime, endTime) {

    let start = startTime.split(":")
    let end = endTime.split(":")

    let startMinutes = Number(start[0]) * 60 + Number(start[1])
    let endMinutes = Number(end[0]) * 60 + Number(end[1])

    return (endMinutes - startMinutes) / 60
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


module.exports={listEmployees,addEmployee,assignShift,viewEmployeeSchedule}
