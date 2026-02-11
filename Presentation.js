//Mohsen Ali
//60305864
const business = require("./business")
const prompt = require("prompt-sync")()



/**
 * List all the registered employees(ID,Name,Phone).
 *
 * 
 * @returns {Array} returns a list of employees.
 */
async function listEmployees() {
    let data = await business.listEmployees()
    console.log("Employee ID".padEnd(12),"Name".padEnd(20),"Phone".padEnd(12))
     for (let d of data){
        
        console.log("-----------".padEnd(12),"-------------------".padEnd(20),"---------".padEnd(12))
        console.log(d.employeeId.padEnd(12),d.name.padEnd(20),d.phone.padEnd(12));
    }
  
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

    let message  = await business.addEmployee(name, phone)

    console.log(message )
}


/**
 * Assign an employee to specific shift.
 *
 * @param {String} employeeID employee ID.
 * @param {String} shiftID shift ID.
 * 
 * @returns {void} employee will be assigned to shift.
 */
async function assignShift(employeeID, shiftID) {

    let message = await business.assignShift(employeeID, shiftID)

    console.log(message)
}


/**
 * display employee shift schedule timings.
 *
 * @param {String} employeeID employee ID.
 * 
 * @returns {String} returns a shift schedule of the chosen employee.
 */
async function viewEmployeeSchedule(employeeID) {

    let schedule = await business.viewEmployeeSchedule(employeeID)

    console.log("date,startTime,endTime")

    for (let i = 0; i < schedule.length; i++) {

        console.log(schedule[i].date + "," + schedule[i].startTime + "," + schedule[i].endTime)
    }
}

 

async function showMenu() {
    while(true){
        console.log("1. Show all employees")
        console.log("2. Add new employee")
        console.log("3. Assign employee to shift")
        console.log("4. View employee schedule")
        console.log("5.Exit")
        let choice = Number(prompt("What is your Choice >? "))
        if(choice == 1){
            await listEmployees()
        }
        else if(choice == 2){
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
