//Headers
const H1_OverviewPage_Header = "//h1[text()='Transition Readiness Overview";
const Link_RAYG_Definition = "//a[text()='View RAYG definitions and how they are calculated";
const Main_Menu = "li a[class='govuk-header__link nav']";
const Sub_Menu = "li a[class='govuk-header__link child-nav']";

//Main Menus
const Menu_Tranistion_Readiness = "Transition readiness";
const Menu_HMG_delivery_megmt_info = "HMG delivery management information";
const Menu_Adddata = "Add data";
const Menu_Admin = "Admin";

//Sub Menus Tranistion Readiness
const SubMenu_Overview = "Overview";

//Sub Menus HMG
const SubMenu_Reporting_overview = "Reporting overview";
const SubMenu_Alldata = "All data";
const SubMenu_Missedmilestones = "Missed milestones";
const SubMenu_Upcomingmilestones = "Upcoming milestones";

//Sub Menus Add data
const SubMenu_Managementinformation = "Management information";
const SubMenu_Measures = "Measures";

//Sub Menus Admin
const SubMenu_MIdatastructure = "MI data structure";
const SubMenu_Managecategories = "Manage categories";
const SubMenu_ManageHeadlineMeasures = "Manage Headline Measures";
const SubMenu_ManageUsers = "Manage Users";
const SubMenu_Entitydataimport = "Entity data import";
const SubMenu_StaticExport = "Static Export";
const SubMenu_RAYGValues = "RAYG Values";
const SubMenu_ManageTags = "Manage Tags";

class Navigation {
//Menus
  get Menu_Tranistion_Readiness() {
    return Menu_Tranistion_Readiness;
  }
  get Menu_HMG_delivery_megmt_info() {
    return Menu_HMG_delivery_megmt_info;
  }
  get Menu_Adddata() {
    return Menu_Adddata;
  }
  get Menu_Admin() {
    return Menu_Admin;
  }

  //Sub Menus Tranistion Readiness
  get SubMenu_Overview() {
    return SubMenu_Overview;
  }

  //Sub Menus HMG
  get SubMenu_Reporting_overview() {
    return SubMenu_Reporting_overview;
  }
  get SubMenu_Alldata() {
    return SubMenu_Alldata;
  }
  get SubMenu_Missedmilestones() {
    return SubMenu_Missedmilestones;
  }
  get SubMenu_Upcomingmilestones() {
    return SubMenu_Upcomingmilestones;
  }

  //Sub Menus Add data
  get SubMenu_Managementinformation() {
    return SubMenu_Managementinformation;
  }
  get SubMenu_Measures() {
    return SubMenu_Measures;
  }
  //Sub Menus Admin
  get SubMenu_MIdatastructure() {
    return SubMenu_MIdatastructure;
  }
  get SubMenu_Managecategories() {
    return SubMenu_Managecategories;
  }
  get SubMenu_ManageHeadlineMeasures() {
    return SubMenu_ManageHeadlineMeasures;
  }
  get SubMenu_ManageUsers() {
    return SubMenu_ManageUsers;
  }
  get SubMenu_Entitydataimport() {
    return SubMenu_Entitydataimport;
  }
  get SubMenu_StaticExport() {
    return SubMenu_StaticExport;
  }
  get SubMenu_RAYGValues() {
    return SubMenu_RAYGValues;
  }
  get SubMenu_ManageTags() {
    return SubMenu_ManageTags;
  }

  //Select Main menu
  selectMainmenu(menuname) {
    cy.get(Main_Menu).contains(menuname).click();
  }

  //Select sub meny
  selectSubmenu(submenuname) {
    cy.get(Sub_Menu).contains(submenuname).click();
  }

  //Select Main menu
  verifyMainmenu(menuname) {
    cy.get(Main_Menu).contains(menuname).should('exist');
  }

  //Select Main menu
  verifyMainmenuNotExist(menuname) {
    cy.get(Main_Menu).contains(menuname).should('not.exist');
  }

  //Select sub meny
  verifySubmenu(submenuname) {
    cy.get(Sub_Menu).contains(submenuname).should('exist');
  }

  verifyOverviewPage() {
    cy.xpath(H1_OverviewPage_Header).should('exist');
    cy.xpath(Link_RAYG_Definition).should('exist');
  }

  verifyAllThemes() {
    var allThemes = [];
    cy.getallThemes().as('dbResultAllThemes');
    cy.get('@dbResultAllThemes').then((res) => {
      allThemes = res
      allThemes.forEach(element => {
        cy.xpath("//li/a[normalize-space() = '" + element.value + "']").should('exist');
      });
    })
  }

  verifyDAThemes() {
    var daThemes = [];
    cy.getDAThemes().as('dbResultDAThemes');
    cy.get('@dbResultDAThemes').then((res) => {
      daThemes = res
      daThemes.forEach(element => {
        cy.xpath("//li/a[normalize-space() = '" + element.value + "']").should('exist');
      });
    })
  }

  verifyNonDAThemes() {
    var nondaThemes = [];
    cy.getNonDAThemes().as('dbResultNonDAThemes');
    cy.get('@dbResultNonDAThemes').then((res) => {
      nondaThemes = res
      nondaThemes.forEach(element => {
        cy.xpath("//li/a[normalize-space() = '" + element.value + "']").should('not.exist');
      });
    })
  }
}
export default Navigation;