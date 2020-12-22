const Page = require('core/pages/page');
const { paths } = require('config');
const authentication = require('services/authentication');
const config = require('config');
const transitionReadinessData = require('helpers/transitionReadinessData');
const { ipWhiteList } = require('middleware/ipWhitelist');
const entityUserPermissions = require('middleware/entityUserPermissions');
const DAO = require('services/dao');
const sequelize = require('services/sequelize');

class Theme extends Page {
  static get isEnabled() {
    return config.features.transitionReadinessTheme;
  }

  get url() {
    return paths.transitionReadinessThemeDetail;
  }

  get searchUrl(){
    return paths.searchTransitionReadiness;
  }

  get pathToBind() {
    return `${this.url}/:theme/:statement?/:selectedPublicId?`;
  }

  get themeUrl() {
    return `${this.url}/${this.req.params.theme}`;
  }

  get middleware() {
    return [
      ipWhiteList,
      ...authentication.protect(['viewer', 'static', 'devolved_administrations']),
      entityUserPermissions.assignEntityIdsUserCanAccessToLocals
    ];
  }

  async data() {
    const data = await transitionReadinessData.themeDetail(this.res.locals.entitiesUserCanAccess,this.url, this.req);
    if (!data) {
      throw `Cannot fetch data for ${this.req.params.theme}`;
    }
    return data;
  }

  async canAccessProject(projectUid) {
    const dao = new DAO({
      sequelize: sequelize
    });

    const projects = await dao.getAllData(this.req.user.id, {
      uid: [ projectUid ]
    });

    return projects.length;
  }
}

module.exports = Theme;
