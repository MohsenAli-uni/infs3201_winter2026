// connection ----------------------------------------------
let express = require("express");
const business = require("./business");
let app = new express();


app.use(express.urlencoded({ extended: true }));

// home page ------------------------------------------------

/**
 * Home Page Route
 * Handles HTTP GET request for the root URL (/).
 * Retrieves employees data from the business layer
 * and dynamically generates an HTML page displaying
 * all employees.
 * @route GET /
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends HTML response to client.
 */
app.get("/", async (req, res) => {
  let employees = await business.listEmployees();

  let html = "<html><head><title>Employees</title>";


  html += "<style>";
  html += "table{border-collapse:collapse;}";
  html += "th,td{padding:6px;}";   
  html += ".morning{background-color:yellow;}";
  html += "</style></head><body>";


  html += "<h1>Employees</h1>";
  html += "<p><a href='/employee/add'>Add Employee</a></p>";


  html += "<ul>";
  for (let e of employees) {
    html += `<li><a href="/employee/${e.employeeId}">${e.name}</a></li>`;
  }
  html += "</ul>";

  html += "</body></html>";
  res.send(html);
});


// add employee (GET)--------------------------------------------------
/**
 * Add Employee Page Route
 * Handles HTTP GET request for "/employee/add".
 * Generates and displays an HTML form that allows
 * users to enter employee name and phone number.
 * The form submits data using POST method.
 * @route GET /employee/add
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends HTML form page to client.
 */
app.get("/employee/add", (req, res) => {

  let html = "<html><body>";
  html += "<h1>Add Employee</h1>";

  html += "<form method='POST' action='/employee/add'>";
  html += "<label for='name'>Name:</label>";
  html += "<input type='text' id='name' name='name'><br><br>";
  html += "<label for='phone'>Phone:</label>";
  html += "<input type='text' id='phone' name='phone'><br><br>";
  html += "<input type='submit' value='Add'>";
  html += "</form>";

  html += "</body></html>";

  res.send(html);
});


// add employee (POST) -----------------------------------------------------------
/**
 * Add Employee Submission Route
 * Handles HTTP POST request for "/employee/add".
 * Validates input data (name and phone format),
 * adds the employee through the business layer,
 * then redirects to the home page.
 * @route POST /employee/add
 * @param {Object} req - Express request object containing form data.
 * @param {Object} res - Express response object.
 * @returns {void} Redirects after successful insertion.
 */
app.post("/employee/add", async (req, res) => {

  let name = (req.body.name || "").trim();
  let phone = (req.body.phone || "").trim();

  if (name.length === 0)
    return res.send("<h1>Name required</h1>");

  if (!/^\d{4}-\d{4}$/.test(phone))
    return res.send("<h1>Phone format should be 0000-0000</h1>");

  await business.addEmployee(name, phone);

  res.redirect("/");
});


// employee details (GET) ----------------------------------------------
/**
 * Employee Details Route
 * Handles HTTP GET request for "/employee/:id".
 * Retrieves employee information and assigned shifts,
 * sorts shifts by date and start time,
 * and dynamically generates an HTML page displaying
 * employee details and schedule.
 * @route GET /employee/:id
 * @param {Object} req - Express request object containing employee ID.
 * @param {Object} res - Express response object.
 * @returns {void} Sends employee details page to client.
 */
app.get("/employee/:id", async (req, res) => {

  let id = req.params.id;

  let employees = await business.listEmployees();
  let employee = null;

  for (let e of employees) {
    if (e.employeeId === id) {
      employee = e;
      break;
    }
  }

  if (!employee)
    return res.send("<h1>Employee not found</h1>");

  let shifts = await business.viewEmployeeSchedule(id);

  // sort shifts (date + startTime) -------------------------------------
  for (let i = 0; i < shifts.length - 1; i++) {
    for (let j = 0; j < shifts.length - 1 - i; j++) {

      let a = shifts[j].date + shifts[j].startTime;
      let b = shifts[j + 1].date + shifts[j + 1].startTime;

      if (a > b) {
        let temp = shifts[j];
        shifts[j] = shifts[j + 1];
        shifts[j + 1] = temp;
      }
    }
  }

  let html = "<html><head><title>Employee Details</title></head>";
  html += "<style>";
  html += ".morning{background-color:yellow;}";
  html += "td{padding:6px;}";
  html += "</style></head><body>";

  html += "<h1>Employee Details</h1>";
  html += `<p><b>ID:</b> ${employee.employeeId}</p>`;
  html += `<p><b>Name:</b> ${employee.name}</p>`;
  html += `<p><b>Phone:</b> ${employee.phone}</p>`;

  html += `<p><a href="/employee/${id}/edit">Edit</a></p>`;

  html += "<h2>Shifts</h2>";

 
  html += "<table>";
  html += "<tr>";
  html += "<td><b>Date</b></td>";
  html += "<td><b>Start Time</b></td>";
  html += "<td><b>End Time</b></td>";
  html += "</tr>";

  for (let s of shifts) {
    let cls = "";
    if (s.startTime < "12:00"){
      cls = "morning";
    } 

    html += "<tr>";
    html += `<td>${s.date}</td>`;
    html += `<td class="${cls}">${s.startTime}</td>`;
    html += `<td>${s.endTime}</td>`;
    html += "</tr>";
  }

  html += "</table>";
  html += "</body></html>";

  res.send(html);
});


// Edit emploee page (GET) ----------------------------------------------------
/**
 * Edit Employee Page Route
 * Handles HTTP GET request for "/employee/:id/edit".
 * Retrieves employee data using the provided ID
 * and generates a pre-filled HTML form allowing
 * the user to edit employee information.
 * @route GET /employee/:id/edit
 * @param {Object} req - Express request object containing employee ID.
 * @param {Object} res - Express response object.
 * @returns {void} Sends edit employee form page.
 */
app.get("/employee/:id/edit", async (req, res) => {

  let id = req.params.id;

  let employees = await business.listEmployees();
  let employee = null;

for (let i = 0; i < employees.length; i++) {
    if (employees[i].employeeId === id) {
        employee = employees[i];
        break;
    }
}

  if (!employee)
    return res.send("<h1>Not found</h1>");

  let html = "<html><body>";
  html += "<h1>Edit Employee</h1>";

  html += `<form method="POST" action='/employee/${id}/edit'>`;
  html += "<label for='name'>Name:</label>"
  html += `<input type='text' id='name' name="name" value="${employee.name}"><br><br>`;
  html += "<label for='phone'>Phone:</label>"
  html += `<input type='text' id='phone' name="phone" value="${employee.phone}"><br><br>`;
  html += "<input type='submit' value='Save'>";
  html += "</form>";

  html += "</body></html>";

  res.send(html);
});


// Edit employee page (POST) ---------------------------------------------------
/**
 * Edit Employee Submission Route
 * Handles HTTP POST request for "/employee/:id/edit".
 * Validates updated employee data,
 * updates employee information in the database,
 * then redirects to the home page.
 * @route POST /employee/:id/edit
 * @param {Object} req - Express request object containing form data and employee ID.
 * @param {Object} res - Express response object.
 * @returns {void} Redirects after successful update.
 */
app.post("/employee/:id/edit", async (req, res) => {

  let id = req.params.id;

  let name = (req.body.name || "").trim();
  let phone = (req.body.phone || "").trim();

  if (name.length === 0)
    return res.send("Invalid name");

  if (!/^\d{4}-\d{4}$/.test(phone))
    return res.send("Invalid phone");

  await business.updateEmployee(id, name, phone);

  res.redirect("/");
});

app.listen(8000, () =>
  console.log("server is up http://127.0.0.1:8000/")
);