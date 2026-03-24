
const persistence = require("./persistence")
const crypto = require("crypto");


/**
 * List all the registered employees(ID,Name,Phone).
 * @returns {Promise<Array>} returns a list of employees.
 */
async function listEmployees() {
  return await persistence.readEmployeesData()
}


/**
 * Adds a new unique employee to the list.
 * @param {String} name
 * @param {String} phone
 * @returns {Promise<void>}
 */
async function addEmployee(name, phone) {
    let employee = {name:name,phone:phone};
    await persistence.addEmployee(employee);
}


/**
 * Retrieves the work schedule of a specific employee.
 * Reads shifts and assignments data,
 * matches the employee with assigned shifts,
 * and returns the employee schedule.
 * @param {Number} employeeId  The ID of the employee.
 * @returns {Promise<Array>} List of employee shifts.
 */
async function viewEmployeeSchedule(employeeId) {
    return await persistence.viewEmployeeSchedule(employeeId);
}

/**
 * Updates employee information.
 * Calls the persistence layer to update
 * the employee record using the provided ID.
 * @param {String} employeeId The employee ID.
 * @param {String} name The updated employee name.
 * @param {String} phone  The updated employee phone number.
 * @returns {Promise<void>} Resolves after update is completed.
 */
async function updateEmployee(employeeId, name, phone, photo) {
    await persistence.updateEmployee(employeeId, name, phone, photo);
}

// login and session functions ------------------------------------------------------------------------------------------

/**
 * Checks if the login details are correct.
 * @param {string} username The user's username.
 * @param {string} password The user's plain-text password.
 * @returns {Promise<{ sessionId: string, expiresAt: Date, username: string } | undefined>}
 * If valid, creates a new session for the user..
 */
async function verifyLogin(username, password) {
    let hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    let user = await persistence.getUser(username, hashedPassword);

    if (!user) return undefined

    let sd = {
        sessionId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 *5),
        username: user.username   
    };
    await persistence.startSession(sd)
    return sd
}

/**
 * Checks if a session is still valid.
 * If valid, extends the session expiration time.
 * @param {string} sessionId  The session identifier.
 * @returns {Promise<{ sessionId: string, expiresAt: Date, username: string } | null>}
 * If expired, it deletes it. If valid, it extends its time.
 */
async function validateSession(sessionId) {
    let session = await persistence.getSession(sessionId);

    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
        await persistence.deleteSession(sessionId);
        return null;
    }

    let newExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await persistence.updateSession(sessionId, newExpiry);
    session.expiresAt = newExpiry;

    return session;
}

/**
 * Deletes a user's session when they log out.
 * @param {string} sessionId The session identifier.
 * @returns {Promise<void>} Resolves when the session is deleted.
 */
async function deleteSession(sessionId) {
    await persistence.deleteSession(sessionId);
}

/**
 * Logs what the user is doing in the system.
 * @param {string} username The username of the user.
 * @param {string} url The accessed URL.
 * @param {string} method The HTTP method (GET, POST).
 * @returns {Promise<void>} Resolves when the log is recorded.
 */
async function logAccess(username, url, method) {
    await persistence.addSecurityLog(username, url, method);
}


module.exports = { 
    listEmployees, 
    addEmployee, 
    viewEmployeeSchedule,
    updateEmployee,
    verifyLogin
    ,validateSession,
    deleteSession,
    logAccess
 };
