//Mohsen Ali
//60305864
const business = require("./business")
const prompt = require("prompt-sync")()




async function listEmployees() {
    let data = await business.listEmployees()
    console.log("Employee ID".padEnd(12),"Name".padEnd(20),"Phone".padEnd(12))
     for (let d of data){
        
        console.log("-----------".padEnd(12),"-------------------".padEnd(20),"---------".padEnd(12))
        console.log(d.employeeId.padEnd(12),d.name.padEnd(20),d.phone.padEnd(12));
    }
  
}




async function addEmployee(name, phone) {

    let message  = await business.addEmployee(name, phone)

    console.log(message )
}






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
        console.log("3. View employee schedule")
        console.log("4.Exit")
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
            await viewEmployeeSchedule(employeeID)
        }
        else if(choice == 4){
            break
        }
        else{
            console.log("ERROR : Please pick a number between 1 and 5")
        }

    }
    
}

showMenu()
