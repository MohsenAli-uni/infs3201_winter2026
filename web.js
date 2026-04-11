// Connection and Setup -----------------------------------------------------------------------------------------------

const business = require("./business");
const persistence = require("./persistence");
const express = require("express");
const app = new express();
const { engine } = require("express-handlebars");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "employee_documents");
  },
  filename: function (req, file, cb) {
    let uniqueName =
      Date.now() + "-" + crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

app.engine("handlebars", engine({ layoutsDir: "./templates/layouts"}));
app.use(express.static("photos"));
app.set("view engine", "handlebars");
app.set("views", "./templates");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


persistence.createSessionTTLIndex();
persistence.createTwoFactorTTLIndex();

// login and session functions ------------------------------------------------------------------------------------------

/**
 * Checks if the user has a valid session from cookies.
 * If yes, keeps them logged in and refreshes the session.
 * Also logs every request.
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
app.use(async (req, res, next) => {
  let username = null;
  let sessionId = req.cookies.sessionId;

  if (sessionId) {
    let session = await business.validateSession(sessionId);

    if (session) {
      req.username = session.username;
      username = session.username;

      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000
      });
    } else {
      res.clearCookie("sessionId");
    }
  }
  await business.logAccess(username, req.originalUrl, req.method);
  next();
});


/**
 * Shows the login page.
 * Displays a message if one is provided.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @returns {void}
 */
app.get("/login", (req, res) => {
  let message = req.query.message || "";
  res.render("login", { title: "Login", message: message });
});


/**
 * Handles login.
 * Validates input, checks user, and creates a session if successful.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 */
app.post("/login", async (req, res) => {
  let username = (req.body.username || "").trim();
  let password = (req.body.password || "").trim();

  if (!username || !password) {
        return res.render("login", {
            title: "Login",
            message: "Please login first"
        });
    }

  let attempt = await business.beginLogin(username, password);

  if (!attempt) {
    return res.redirect("/login?message=Invalid username or password");
  }

 res.render("twoFactor", {
    title: "Two-Factor Authentication",
    username: username,
    message: "A verification code has been sent to your email."
  });
});

/**
 * Shows the 2FA page.
 */
app.get("/twoFactor", (req, res) => {
  let username = req.query.username || "";
  let message = req.query.message || "";

  res.render("twoFactor", {
    title: "Two-Factor Authentication",
    username: username,
    message: message
  });
});


/**
 * Handles submitted 2FA code.
 */
app.post("/twoFactor", async (req, res) => {
  let username = (req.body.username || "").trim();
  let code = (req.body.code || "").trim();

  if (!username || !code) {
    return res.render("twoFactor", {
      title: "Two-Factor Authentication",
      username: username,
      message: "Please enter the code"
    });
  }

  let session = await business.completeLoginWith2FA(username, code);

  if (!session) {
    return res.render("twoFactor", {
      title: "Two-Factor Authentication",
      username: username,
      message: "Invalid or expired code"
    });
  }

  res.cookie("sessionId", session.sessionId, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000
  });

  res.redirect("/");
});




/**
 * Handles login.
 * Validates input, checks user, and creates a session if successful.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 */
app.get("/logout", async (req, res) => {
  let sessionId = req.cookies.sessionId;

  if (sessionId) {
    await business.deleteSession(sessionId);
  }

  res.clearCookie("sessionId");
  res.redirect("/login?message=Logged out successfully");
});


/**
 * Protects routes.
 * If the user is not logged in, redirects them to login.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
app.use((req, res, next) => {
    if (req.path === "/login" || req.path === "/logout" || req.path === "/twoFactor") {
        return next();
    }

    if (!req.username) {
        return res.redirect("/login");
    }

    next();
});


// home page ----------------------------------------------------------------------------------

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

  res.render("home", {title:"Employees",employees});
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
    if (String(e._id) === String(id)) {
      employee = e;
      break;
    }
  }

  if (!employee)
    return res.render("notFound", {title: "Not Found",message: "Employee not found"});

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

  for (let s of shifts) {
    let cls = "";
    if (s.startTime < "12:00"){
      cls = "morning";
    } 
    s.cls = cls;
  }

  res.render("employeeDetails", {title: "Employee Details",employee,shifts});
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
    if (String(employees[i]._id) === String(id)) {
        employee = employees[i];
        break;
    }
}

  if (!employee)
    return res.render("notFound", {title: "Not Found",message: "Employee not found"});

  res.render("editEmployee", {title: "Edit Employee",employee});
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
  let photo = (req.body.photo || "").trim();

  if (name.length === 0)
    return res.render("notFound", {title: "Invalid Input", message: "Invalid name"});

  if (!/^\d{4}-\d{4}$/.test(phone))
    return res.render("notFound", {title: "Invalid Input", message: "Invalid name"});

  await business.updateEmployee(id, name, phone,photo);

  res.redirect(`/employee/${id}`);
});



/**
 * Shows employee documents page.
 * @route GET /employee/:id/documents
 */
app.get("/employee/:id/documents", async (req, res) => {
  let id = req.params.id;
  let message = req.query.message || "";

  let employees = await business.listEmployees();
  let employee = null;

  for (let i = 0; i < employees.length; i++) {
    if (String(employees[i]._id) === String(id)) {
      employee = employees[i];
      break;
    }
  }

  if (!employee)
    return res.render("notFound", {
      title: "Not Found",
      message: "Employee not found"
    });

  let documents = await business.listEmployeeDocuments(id);

  res.render("employeeDocuments", {
    title: "Employee Documents",
    employee: employee,
    documents: documents,
    message: message
  });
});

/**
 * Handles employee document upload.
 * @route POST /employee/:id/documents
 */
app.post("/employee/:id/documents", upload.single("document"), async (req, res) => {
  let id = req.params.id;

  let employees = await business.listEmployees();
  let employee = null;

  for (let i = 0; i < employees.length; i++) {
    if (String(employees[i]._id) === String(id)) {
      employee = employees[i];
      break;
    }
  }

  if (!employee)
    return res.render("notFound", {
      title: "Not Found",
      message: "Employee not found"
    });

  let message = await business.saveEmployeeDocument(id, req.file);

  if (message) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    let documents = await business.listEmployeeDocuments(id);

    return res.render("employeeDocuments", {
      title: "Employee Documents",
      employee: employee,
      documents: documents,
      message: message
    });
  }

  res.redirect(`/employee/${id}/documents`);
});


/**
 * Downloads/view an employee document securely.
 * @route GET /documents/:documentId
 */
app.get("/documents/:documentId", async (req, res) => {
  let documentId = req.params.documentId;

  let document = await business.getEmployeeDocument(documentId);

  if (!document)
    return res.render("notFound", {
      title: "Not Found",
      message: "Document not found"
    });

  let fullPath = path.join(__dirname, "employee_documents", document.storedName);

  if (!fs.existsSync(fullPath))
    return res.render("notFound", {
      title: "Not Found",
      message: "File not found"
    });

  res.sendFile(fullPath);
});


app.use("/employee/:id/documents", async (err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    let id = req.params.id;
    return res.redirect(`/employee/${id}/documents?message=File size must not be more than 2MB`);
  }

  next(err);
});


app.listen(8000, () => console.log("server is up http://127.0.0.1:8000/"));