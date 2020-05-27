const config = require('config');
const authentication = require('services/authentication');
const readlineSync = require("readline-sync");
const User = require("models/user");
const Department = require("models/department");
const DepartmentUser = require("models/departmentUser");
const NotifyClient = require('notifications-node-client').NotifyClient;
const randomString = require('randomstring');
const getopts = require('getopts');

async function getDepartments(string) {
  let departments = string.split(",");
  return await Department.findAll({
    where: {
      name: departments
    }
  });
}

async function getAllDepartments() {
  return await Department.findAll();
}

async function createDepartmentUsers(user,departments) {
  for (let i=0;i<departments.length;i++) {
    await DepartmentUser.create({
      userId: user.id,
      departmentName: departments[i].name
    });
  }
}

const options = getopts(process.argv.slice(2), {
  default: {
    email: null,
    departments: null
  }
});

let email = options.email;
let departmentsString = options.departments;

if (!email || !departmentsString) {
  email = readlineSync.question("Enter email: ");
  departmentsString = readlineSync.question("Enter departments (seperated by ',', use 'all' for all departments): ");
}

let departments = [];
if (departmentsString == "all") {
  departments = getAllDepartments();
} else {
  departments = getDepartments(departmentsString);
}
departments.then( (departmentsArray) => {
  let passphrase = randomString.generate({
    readable: true
  });
  authentication.hashPassphrase(passphrase).then( (hashedPassphrase) => {
    User.create({
      role: "viewer",
      email: email,
      hashedPassphrase: hashedPassphrase
    }).then( (user) => {
      createDepartmentUsers(user,departmentsArray).then( () => {
        if (config.notify.apiKey) {
          let notifyClient = new NotifyClient(config.notify.apiKey);
          notifyClient.sendEmail(
            config.notify.createTemplateKey,
            email,
            {
              personalisation: {
                password: passphrase,
                email: email,
                link: config.serviceUrl,
                privacy_link: config.serviceUrl + "privacy-notice"
              },
              reference: `${user.id}`
            },
          );
          console.log(`User ${email} created with departments ${departmentsString} and sent with password`);
        } else {
          console.log(`User ${email} created with departments ${departmentsString} and password ${passphrase}`);
        }
      });
    }).catch( (err) => {
      console.log(`Could not create user [${err}]`);
    });
  });

  return;
});
