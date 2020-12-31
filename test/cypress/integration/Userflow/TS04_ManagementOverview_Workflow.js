import Navigation from '../../Pages/Navigation';
import Login from '../../Pages/Login';
//const logger = require('middleware/logger');
const nav = new Navigation(); 
const login = new Login();

const department = "BEIS";

beforeEach(() => {
  // Preserve session across the entire test.
  Cypress.Cookies.preserveOnce('jwt');
});

describe("Workflow for 'Management and Overview' with 'Viewer' User role - Verify accessible Menus", () => {
  before(() => {
    //Catch Exceptions 
    cy.on('uncaught:exception', () => {
      //logger.error("Error Caught");
      return false;
    });
  });

  //Log into Dashboard 
  it("Can Login into Dashboard as an 'Management and Overview & Viewer' User", function () {
    //Add all role to user
    cy.addroles("management,viewer,management_overview");
    //Add departments to user
    cy.addDepartments(department);
    //Login
    login.login();
    });

  //Verify that I am allowed to access 'Tranistion Readiness' menu and all submenus underneath
  it("Can see and access 'Tranistion Readiness' menu and all submenus underneath", function () {
    nav.selectMainmenu(nav.Menu_Tranistion_Readiness);
    nav.verifySubmenu(nav.SubMenu_Overview);
    nav.verifyAllThemes();
  });

  //Verify that I am allowed to access 'HMG delivery management information' menu and all submenus underneath
  it("Can see and access 'HMG delivery management information' menu and all submenus underneath", function () {
    nav.selectMainmenu(nav.Menu_HMG_delivery_megmt_info);
    nav.verifySubmenu(nav.SubMenu_Reporting_overview);
    nav.verifySubmenu(nav.SubMenu_Alldata);
    nav.verifySubmenu(nav.SubMenu_Missedmilestones);
    nav.verifySubmenu(nav.SubMenu_Upcomingmilestones);
  });

  //Verify that I am allowed to access 'Add data' menu and all submenus underneath
  it("Can NOT see and access 'Add data' menu and all submenus underneath", function () {
    nav.verifyMainmenuNotExist(nav.Menu_Adddata);
    nav.verifyMainmenuNotExist(nav.SubMenu_Managementinformation);
    nav.verifyMainmenuNotExist(nav.SubMenu_Measures);
  });

  //Verify that I am allowed to access 'Admin' mneu and all submenus underneath
  it("Can NOT see and access 'Admin' menu and all submenus underneath", function () {
    nav.verifyMainmenuNotExist(nav.Menu_Admin);
    nav.verifyMainmenuNotExist(nav.SubMenu_MIdatastructure);
    nav.verifyMainmenuNotExist(nav.SubMenu_Managecategories);
    nav.verifyMainmenuNotExist(nav.SubMenu_ManageHeadlineMeasures);
    nav.verifyMainmenuNotExist(nav.SubMenu_ManageUsers);
    nav.verifyMainmenuNotExist(nav.SubMenu_Entitydataimport);
    nav.verifyMainmenuNotExist(nav.SubMenu_StaticExport);
    nav.verifyMainmenuNotExist(nav.SubMenu_RAYGValues);
    nav.verifyMainmenuNotExist(nav.SubMenu_ManageTags);
  });

});