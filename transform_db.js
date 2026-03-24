const { setServers } = require('node:dns/promises');
setServers(["1.1.1.1", "8.8.8.8"]);

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const url ="mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/infs3201_winter2026?appName=Cluster0";

const dbName = "infs3201_winter2026"; 

async function getDb() {
    const client = await MongoClient.connect(url);
    return client.db(dbName);
}

async function createEmptyEmployeesArray() {
    const db = await getDb();

    await db.collection("shifts").updateMany(
        {},
        { $set: { employees: [] } }
    );

    console.log("Empty employees array added to all shifts.");
}

async function embedEmployeesInShifts() {
    const db = await getDb();

    
    const assignments = await db.collection("assignments").find().toArray();

    for (let i = 0; i < assignments.length; i++) {

        let assignment = assignments[i];

        
        let employee = await db.collection("employees").findOne({
            employeeId: assignment.employeeId
        });

        
        if (employee) {

             
            await db.collection("shifts").updateOne(
                { shiftId: assignment.shiftId },
                { $push: { employees: employee._id } }
            );
        }
    }

    console.log("Employees embedded into shifts");
}


async function removeEmployeeIdField() {
    const db = await getDb();

    await db.collection("employees").updateMany(
        {},
        { $unset: { employeeId: "" } }
    );

    console.log("employeeId removed from employees");
}

async function removeShiftIdField() {
    const db = await getDb();

    await db.collection("shifts").updateMany(
        {},
        { $unset: { shiftId: "" } }
    );

    console.log("shiftId removed from shifts");
}



async function dropAssignmentsCollection() {
    const db = await getDb();

    await db.collection("assignments").drop();

    console.log("assignments collection deleted");
}


async function addPhotoFieldToEmployees() {
    const db = await getDb();

    await db.collection("employees").updateMany(
        {},
        { $set: { photo: "default.jpg" } }
    );

    console.log("Photo field added to all employees.");
}

async function createSessionTTLIndex() {
    const db = await getDb();

    await db.collection("sessions").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );

    console.log("TTL index created on sessions.expiresAt");
}

