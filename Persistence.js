// connection to mongoDb ---------------------------------------------------------------------------------------


const { setServers } = require('node:dns/promises');
setServers(["1.1.1.1", "8.8.8.8"]);

const mongodb = require("mongodb");
const { MongoClient } = mongodb;
const url ="mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/infs3201_winter2026?appName=Cluster0";
const client = new MongoClient(url);

async function getDb(){
    await client.connect();
    return client.db("infs3201_winter2026");
}

// Read functions ------------------------------------------------------------------------------------


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
            for (let m = 0; m < shifts[i].employees.length; m++) {
                if (String(shifts[i].employees[m]) === String(employeeObjectId)) {
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
async function updateEmployee(employeeId, name, phone, photo) {
  const db = await getDb();

  let updatedFields = {
        name: name,
        phone: phone
    };

    if (photo && photo.trim() !== "") {
        updatedFields.photo = photo;
    }


  await db.collection("employees").updateOne(
    { _id: new mongodb.ObjectId(employeeId) },
    { $set:updatedFields }
  );
}
 
// login and session functions --------------------------------------------------------------------------

/**
 * Looks for a user in the database using username and password.
 * @param {string} username The user's username.
 * @param {string} hashedPassword  The user's hashed password.
 * @returns {Promise<Object|null>} Returns the user if found, otherwise null.
 */
async function getUser(username, hashedPassword) {
    const db = await getDb();
    return await db.collection("users").findOne({username: username,password: hashedPassword});
}

/**
 * Creates a new session and stores it in the database.
 * @param {Object} sd The session data object.
 * @returns {Promise<void>} Resolves when the session is stored.
 */
async function startSession(sd) {
    const db = await getDb();
    await db.collection("sessions").insertOne(sd);
}

/**
 * Gets a session from the database using its ID.
 * @param {string} sessionId The unique session ID.
 * @returns {Promise<Object|null>} The session object if found, otherwise null.
 */
async function getSession(sessionId) {
    const db = await getDb();
    return await db.collection("sessions").findOne({ sessionId: sessionId });
}

/**
 * Updates the expiration time of a session.
 * @param {string} sessionId The unique session ID.
 * @param {Date} expiresAt The new expiration date/time.
 * @returns {Promise<void>} Resolves when the session is updated.
 */
async function updateSession(sessionId, expiresAt) {
    const db = await getDb();
    await db.collection("sessions").updateOne(
        { sessionId: sessionId },
        { $set: { expiresAt: expiresAt } }
    );
}

/**
 * Deletes a session from the database.
 * @param {string} sessionId  The unique session ID.
 * @returns {Promise<void>} Resolves when the session is deleted.
 */
async function deleteSession(sessionId) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ sessionId: sessionId });
}


/**
 * Saves a log of user activity (like page visits and actions).
 * @param {string} username The username associated with the action.
 * @param {string} url  The requested URL.
 * @param {string} method The HTTP method used (GET, POST).
 * @returns {Promise<void>} Resolves when the log entry is stored.
 */
async function addSecurityLog(username, url, method) {
    const db = await getDb();
    await db.collection("security_log").insertOne({
        timestamp: new Date(),
        username: username,
        url: url,
        method: method
    });
}

async function createSessionTTLIndex() {
    const db = await getDb();

    await db.collection("sessions").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );
}

//-------------------------------------------------------------------------------------------
async function getUserByUsername(username) {
    const db = await getDb();
    return await db.collection("users").findOne({ username: username });
}

async function saveTwoFactorToken(tokenData) {
    const db = await getDb();
    await db.collection("two_factor_tokens").insertOne(tokenData);
}

async function getTwoFactorToken(username, code) {
    const db = await getDb();
    return await db.collection("two_factor_tokens").findOne({
        username: username,
        code: code
    });
}

async function deleteTwoFactorTokens(username) {
    const db = await getDb();
    await db.collection("two_factor_tokens").deleteMany({ username: username });
}


async function incrementFailedLoginAttempts(username) {
    const db = await getDb();
    await db.collection("users").updateOne(
        { username: username },
        { $inc: { failedLoginAttempts: 1 } }
    );
}

async function resetFailedLoginAttempts(username) {
    const db = await getDb();
    await db.collection("users").updateOne(
        { username: username },
        { $set: { failedLoginAttempts: 0 } }
    );
}


async function lockAccount(username) {
    const db = await getDb();
    await db.collection("users").updateOne(
        { username: username },
        { $set: { locked: true } }
    );
}


async function createTwoFactorTTLIndex() {
    const db = await getDb();

    await db.collection("two_factor_tokens").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );
}
module.exports={
    
    readEmployeesData,
    readShiftsData,
    listEmployees,
    addEmployee,
    viewEmployeeSchedule,
    updateEmployee,
    getUser,
    startSession,
    getSession,
    updateSession,
    deleteSession,
    addSecurityLog,
    createSessionTTLIndex,
    getUserByUsername,
    saveTwoFactorToken,
    getTwoFactorToken,
    deleteTwoFactorTokens,
    incrementFailedLoginAttempts,
    resetFailedLoginAttempts,
    lockAccount,
    createTwoFactorTTLIndex
}
