//Mohsen Ali
//60305864
const fs = require("fs/promises")
const prompt = require("prompt-sync")()
const business = require("./business")


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


async function writeEmployeesData(employeesList) {
    await fs.writeFile("employees.json",JSON.stringify(employeesList),'utf-8');

}


async function writeShiftsData(shiftsList) {
    await fs.writeFile("shifts.json",JSON.stringify(shiftsList),'utf-8');

}


async function writeAssignmentsData(assignmentsList) {
    await fs.writeFile("assignments.json",JSON.stringify(assignmentsList),'utf-8');

}

/**
 * List all the registered employees(ID,Name,Phone).
 *
 * 
 * @returns {Array} returns a list of employees.
 */
async function listEmployees() {
    let data= await readEmployeesData()
    //console.log("Employee ID".padEnd(12),"Name".padEnd(20),"Phone".padEnd(12))
    // for (let d of data){
        
    //    console.log("-----------".padEnd(12),"-------------------".padEnd(20),"---------".padEnd(12))
    //    console.log(d.employeeId.padEnd(12),d.name.padEnd(20),d.phone.padEnd(12));
    //}

    return data
  
}



/**
 * Add a unique new employee to the list of employees.
 *
 * @param {String} name Name of the new employee.
 * @param {String} phone phone number of the new employee.
 * 
 * @returns {void} Adds the new employee to the list.
 */
async function addEmployee(employee) {
    let data= await readEmployeesData()
    //let lastEmployee = data[data.length - 1]
    //let lastNumber = Number(lastEmployee.employeeId.substring(1))
    //let newId = "E" + String(lastNumber + 1).padStart(3, "0")
    //data.push({
    //    employeeId: newId,
    //    name: name,
   //     phone: phone
    //})
    data.push(employee)
    await writeEmployeesData(data)
    //console.log("Employee added...")  
}

/**
 * Assign an employee to specific shift.
 *
 * @param {String} employeeID employee ID.
 * @param {String} shiftID shift ID.
 * 
 * @returns {void} employee will be assigned to shift.
 */
async function assignShift(employeeID,shiftID) {
    let employees = await readEmployeesData()
    let shifts = await readShiftsData()
    let assignments = await readAssignmentsData()

    let employeeFound = false
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeID) {
            employeeFound = true
        }
    }
    if (employeeFound === false) {
        console.log("Employee does not exist")
        return
    }

    let shiftFound = false
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftID) {
            shiftFound = true
        }
    }
    if (shiftFound === false) {
        console.log("Shift does not exist")
        return
    }

    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeID && assignments[i].shiftId === shiftID) {
            console.log("Employee already assigned to shift")
            return
        }
    }

    assignments.push({ employeeId: employeeID, shiftId: shiftID })
    await writeAssignmentsData(assignments)

    console.log("Shift Recorded")
    
}

/**
 * display employee shift schedule timings.
 *
 * @param {String} employeeID employee ID.
 * 
 * @returns {String} returns a shift schedule of the chosen employee.
 */
async function viewEmployeeSchedule(employeeId) {
    let shifts = await readShiftsData()
    let assignments = await readAssignmentsData()

    console.log("date,startTime,endTime")

    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId) {
            let shiftId = assignments[i].shiftId

            for (let m = 0; m < shifts.length; m++) {
                if (shifts[m].shiftId === shiftId) {
                    console.log(shifts[m].date + "," + shifts[m].startTime + "," + shifts[m].endTime)
                }

            }


        }
    }
}
 

async function showMenu() {
    while(true){
        console.log("1. Show all employees")
        console.log("2. Add new employee")
        console.log("3. Assign employee to shift")
        console.log("4. View employee schedule")
        console.log("5.Exit")
        let choice = Number(prompt("What is your Choice>"))
        if(choice == 1){
            await listEmployees()
        }
        if(choice == 2){
            let name = prompt("Enter employee name: ")
            let phone = prompt("Enter phone number: ")
            await addEmployee(name,phone)
        }
        else if(choice == 3){
            let employeeID = prompt("Enter employee ID: ")
            let shiftID = prompt("Enter shift ID: ")
            await assignShift(employeeID,shiftID)
        }
        else if(choice == 4){
            let employeeID = prompt("Enter employee ID: ")
            await viewEmployeeSchedule(employeeID)
        }
        else if(choice == 5){
            break
        }
        else{
            console.log("ERROR : Please pick a number between 1 and 5")
        }

    }
    
}

showMenu()
