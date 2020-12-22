const UserRole = require('models/userRole');
const Role = require('models/role');
const transitionReadinessData = require('helpers/transitionReadinessData');
const EntityHelper = require('helpers/entity.js');

async function entitiesUserCanAccess(user) {
  const entityHelper = new EntityHelper();

  let whitelist = [];
  if (user.canViewAllData) {
    //console.log("Allowing user to view all data");
    whitelist = await entityHelper.getAllEntities();
  } else {
    let roles = await Role.findAll({
      include: {
        model: UserRole,
        where: { userId: user.id }
      }
    });

    whitelist = await entityHelper.entitiesWithRoles(roles);
  }

  return Object.values(whitelist);
}

const assignEntityIdsUserCanAccessToLocals = async (req, res, next) => {
  res.locals.entitiesUserCanAccess = await entitiesUserCanAccess(req.user);
  res.locals.themesUserCanAccess = await transitionReadinessData.getThemeEntities(res.locals.entitiesUserCanAccess);

  next();
};

module.exports = { assignEntityIdsUserCanAccessToLocals };
