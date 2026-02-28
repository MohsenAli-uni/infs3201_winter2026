const {MongoClient} = require("mongodb");
const uri =
"mongodb+srv://60305864:55482521m@cluster0.lpd1p.mongodb.net/infs3201_winter2026?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);


async function getDb(){
    await client.connect();
    return client.db("infs3201_winter2026");
}


async function readEmployeesData() {
    const db = await getDb();
    return await db.collection("employees").find().toArray(); 
}

async function readShiftsData() {
    const db = await getDb();
    return await db.collection("shifts").find().toArray();
}

async function readAssignmentsData() {
    const db = await getDb();
    return await db.collection("assignments").find().toArray();
}


async function updateEmployeesData(employeeId,name,phone) {
    const db = await getDb();
    await db.collection("employees").updateOne(
        { employeeId: employeeId },
        { $set: { name: name, phone: phone } }
    );
}


async function updateShiftsData(shiftId,date,startTime,endTime) {
    const db = await getDb();
    await db.collection("shifts").updateOne(
        { shiftId: shiftId },
        { $set: { date: date, startTime: startTime, endTime: endTime } }
    );
}


async function updateAssignmentsData(employeeId,shiftId) {
    const db = await getDb();
    await db.collection("assignments").updateOne(
        { employeeId: employeeId },
        { $set: { shiftId: shiftId } }
    );
}


async function listEmployees() {
    return await readEmployeesData()
}


async function addEmployee(employee) {
    let data= await readEmployeesData()
    data.push(employee)
    await updateEmployeesData(data)     
}



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
