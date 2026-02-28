// connection to mongoDb -------------------------------------------------
const { setServers } = require('node:dns/promises');
setServers(["1.1.1.1", "8.8.8.8"]);

const { MongoClient } = require("mongodb");
const uri =
"mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/infs3201_winter2026?appName=Cluster0";

const client = new MongoClient(uri);


async function getDb(){
    await client.connect();
    let dbInstance = client.db("infs3201_winter2026");
    return dbInstance;
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

/**
 * Get all assignments from database
 * @returns {Promise<Array>} list of assignments
 */
async function readAssignmentsData() {
    const db = await getDb();
    return await db.collection("assignments").find().toArray();
}


/**
 * Synchronize employees collection with the provided list.
 * Upserts each employee in the list (replaceOne + upsert)
 * Deletes only employees that are not in the list anymore
 *
 * @param {Array} data Updated list of employees.
 * @returns {Promise<void>}
 */
async function updateEmployeesData(data) {
  const db = await getDb();
  const col = db.collection("employees");

  // Collect employeeIds from incoming data
  const ids = [];
  for (let i = 0; i < data.length; i++) {
    ids.push(data[i].employeeId);
  }


  await col.deleteMany({ employeeId: { $nin: ids } });

  for (let i = 0; i < data.length; i++) {
    const emp = data[i];

    if (emp._id) delete emp._id;

    await col.replaceOne(
      { employeeId: emp.employeeId },
      emp,
      { upsert: true }
    );
  }
}

/**
 * Update shift date, startTime, and endTime by ID.
 * @param {String} shiftId
 * @param {String} date
 * @param {String} startTime
 * @param {String} endTime
 */
async function updateShiftsData(shiftId,date,startTime,endTime) {
    const db = await getDb();
    await db.collection("shifts").updateOne(
        { shiftId: shiftId },
        { $set: { date: date, startTime: startTime, endTime: endTime } }
    );
}

/**
 * Update assignment shiftId by employeeId.
 * @param {String} shiftId
 */
async function updateAssignmentsData(employeeId,shiftId) {
    const db = await getDb();
    await db.collection("assignments").updateOne(
        { employeeId: employeeId },
        { $set: { shiftId: shiftId } }
    );
}


// operational functions -----------------------------------------------------

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
    { employeeId: employeeId },
    { $set: { name: name, phone: phone } }
  );
}
 


module.exports={readEmployeesData,readShiftsData,readAssignmentsData,
    updateEmployeesData,updateShiftsData,updateAssignmentsData
    ,listEmployees,addEmployee,viewEmployeeSchedule,updateEmployee
}
