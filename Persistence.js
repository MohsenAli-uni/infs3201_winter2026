// connection to mongoDb -------------------------------------------------
const {MongoClient} = require("mongodb");
const uri =
"mongodb+srv://60305864:55482521m@cluster0.lpd1p.mongodb.net/infs3201_winter2026?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);


async function getDb(){
    await client.connect();
    return client.db("infs3201_winter2026");
}

/**
 * Get all employees from database
 * @returns {Array} list of employees
 */
async function readEmployeesData() {
    const db = await getDb();
    return await db.collection("employees").find().toArray(); 
}

/**
 * Get all shifts from database
 * @returns {Array} list of shifts
 */
async function readShiftsData() {
    const db = await getDb();
    return await db.collection("shifts").find().toArray();
}

/**
 * Get all assignments from database
 * @returns {Array} list of assignments
 */
async function readAssignmentsData() {
    const db = await getDb();
    return await db.collection("assignments").find().toArray();
}


/**
 * Update employee name and phone by ID.
 * @param {String} employeeId
 * @param {String} name
 * @param {String} phone
 */
async function updateEmployeesData(data) {

    const db = await getDb();

    await db.collection("employees").deleteMany({});

    if (data.length > 0) {
        await db.collection("employees").insertMany(data);
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
 * Adds a new employee to the employees list.
 * This function retrieves the existing employees,
 * adds the new employee object to the array,
 * then updates the database.
 * @param {Object} employee - The employee object to add.
 * @returns {Promise<void>}
 */
async function addEmployee(employee) {
    let data= await readEmployeesData()
    data.push(employee)
    await updateEmployeesData(data)     
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
