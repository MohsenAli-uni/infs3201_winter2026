async function sendEmail(to, subject, body) {
    console.log("--------------------------------------------------");
    console.log("EMAIL SENT");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:");
    console.log(body);
    console.log("--------------------------------------------------");
}

async function sendTwoFactorCodeEmail(to, code) {
    let subject = "Your 2FA Login Code";
    let body =
        "Your verification code is: " + code + "\n\n" +
        "This code will expire in 3 minutes.";

    await sendEmail(to, subject, body);
}

async function sendSuspiciousActivityEmail(to) {
    let subject = "Suspicious Activity Detected";
    let body =
        "We detected multiple invalid login attempts on your account.\n\n";

    await sendEmail(to, subject, body);
}

async function sendAccountLockedEmail(to) {
    let subject = "Account Locked";
    let body =
        "Your account locked after too many invalid login attempts.\n\n" ;

    await sendEmail(to, subject, body);
}


module.exports = {
    sendEmail,
    sendTwoFactorCodeEmail,
    sendSuspiciousActivityEmail,
    sendAccountLockedEmail
};