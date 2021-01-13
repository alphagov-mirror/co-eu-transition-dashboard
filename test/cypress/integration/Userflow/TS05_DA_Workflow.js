import Navigation from '../../Pages/Navigation';
import Login from '../../Pages/Login';
//const logger = require('middleware/logger');
const nav = new Navigation(); 
const login = new Login();

const department = Cypress.config().department.split(',')[0];

beforeEach(() => {
  // Preserve session across the entire test.
  Cypress.Cookies.preserveOnce('jwt');
});

describe("TS05_DA_Workflow - DA' with 'Viewer' User role - Verify accessible Menus", () => {
  before(() => { 
  });

  //Log into Dashboard 
  it("Can Login into Dashboard as an 'DA & Viewer' User", function () {
    //Add all role to user
    cy.addroles("devolved_administrations");
    //Add departments to user
    cy.addDepartments(department);
    //Login
    login.login();
  });

  //Verify that I am allowed to access 'Tranistion Readiness' menu and all DA only submenus underneath
  it("Can see and access 'Tranistion Readiness' menu and only DA relevant submenus underneath", function () {
    nav.selectMainmenu(nav.menuTranistionReadiness);
    nav.verifySubmenu(nav.subMenuOverview);
    nav.verifyDAThemes();
    nav.verifyNonDAThemes();
  });

  //Verify that I am allowed to access 'HMG delivery management information' menu and all submenus underneath
  it("Can NOT see and access 'HMG delivery management information' menu and all submenus underneath", function () {
    nav.verifyMainmenuNotExist(nav.menuHMGdeliverymegmtinfo);
    nav.verifyMainmenuNotExist(nav.subMenuReportingOverview);
    nav.verifyMainmenuNotExist(nav.subMenuAlldata);
    nav.verifyMainmenuNotExist(nav.subMenuMissedMilestones);
    nav.verifyMainmenuNotExist(nav.subMenuUpcomingMilestones);
  });

  //Verify that I am allowed to access 'Add data' menu and all submenus underneath
  it("Can NOT see and access 'Add data' menu and all submenus underneath", function () {
    nav.verifyMainmenuNotExist(nav.menuAdddata);
    nav.verifyMainmenuNotExist(nav.subMenuManagementInformation);
    nav.verifyMainmenuNotExist(nav.SubMenu_Measures);
  });

  //Verify that I am allowed to access 'Admin' mneu and all submenus underneath
  it("Can NOT see and access 'Admin' menu and all submenus underneath", function () {
    nav.verifyMainmenuNotExist(nav.menuAdmin);
    nav.verifyMainmenuNotExist(nav.subMenuMIDataStructure);
    nav.verifyMainmenuNotExist(nav.subMenuManageCategories);
    nav.verifyMainmenuNotExist(nav.subMenuManageHeadlineMeasures);
    nav.verifyMainmenuNotExist(nav.subMenuManageUsers);
    nav.verifyMainmenuNotExist(nav.subMenuEntitydataimport);
    nav.verifyMainmenuNotExist(nav.subMenuStaticExport);
    nav.verifyMainmenuNotExist(nav.subMenuRAYGValues);
    nav.verifyMainmenuNotExist(nav.subMenuManageTags);
    nav.verifyMainmenuNotExist(nav.subMenuPermissions);
    nav.verifyMainmenuNotExist(nav.subMenuManageEntities);
  });
});