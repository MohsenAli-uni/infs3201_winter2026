// connection to mongoDb -------------------------------------------------


const { setServers } = require('node:dns/promises');
setServers(["1.1.1.1", "8.8.8.8"]);

const { MongoClient } = require("mongodb");
const url ="mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/infs3201_winter2026?appName=Cluster0";
const client = new MongoClient(url);

async function getDb(){
    await client.connect();
    return client.db("infs3201_winter2026");
}

// Read and update functions -----------------------------------------------


/**
 * Get all employees from database
 * @returns {Promise<Array>} list of employees
 */
async function readEmployeesData() {
    const db = await getDb();
    return await db.collection("employees").find().toArray(); 
}


/**
 * Get all shifts from database
 * @returns {Promise<Array>} list of shifts
 */
async function readShiftsData() {
    const db = await getDb();
    return await db.collection("shifts").find().toArray();
}



// operational functions ----------------------------------------------------------------------------

/**
 * Retrieves and returns all employees.
 * This function calls readEmployeesData()
 * to fetch employee records from the database.
 * @returns {Promise<Array>} List of employees.
 */
async function listEmployees() {
    return await readEmployeesData()
}



/**
 * Insert a new employee into the database.
 * @param {Object} employee
 * @returns {Promise<void>}
 */
async function addEmployee(employee) {
    const db = await getDb();
    await db.collection("employees").insertOne(employee);
}


/**
 * Retrieves the work schedule for a specific employee.
 * This function reads shifts and assignments data,
 * matches the employee with assigned shifts,
 * and builds a schedule containing date and time details.
 * @param {String} employeeId - The ID of the employee.
 * @returns {Promise<Array>} Employee schedule containing shift details.
 */
async function viewEmployeeSchedule(employeeId) {
    const db= await getDb();

    let employeeObjectId = new mongodb.ObjectId(employeeId);
    let shifts = await db.collection("shifts").find().toArray();
    
    let employeeSchedule = [];
    for (let i = 0; i < shifts.length; i++) {

        let found = false;

        if (shifts[i].employees) {
            for (let m = 0; m < shifts.employees.length; m++) {
                if (String(shifts[m].employees[j]) === String(employeeObjectId)) {
                    found = true;
                    break;
                }
            }
        }
        if(found){
            employeeSchedule.push({
                date: shifts[i].date,
                startTime: shifts[i].startTime,
                endTime: shifts[i].endTime
            });
        }
    } 
    return employeeSchedule
}


/**
 * Updates an employee's name and phone number.
 * This function connects to the MongoDB database
 * and updates the employee document that matches
 * the given employeeId.
 * @param {String} employeeId - The unique ID of the employee.
 * @param {String} name - The updated name of the employee.
 * @param {String} phone - The updated phone number.
 * @returns {Promise<void>} Resolves when update is completed.
 */
async function updateEmployee(employeeId, name, phone) {
  const db = await getDb();
  await db.collection("employees").updateOne(
    { _id: new mongodb.ObjectId(employeeId) },
    { $set: { name: name, phone: phone } }
  );
}
 


module.exports={
    
    readEmployeesData,
    readShiftsData,
    listEmployees,
    addEmployee,
    viewEmployeeSchedule,
    updateEmployee
}
