const UserRole = require('models/userRole');
const Role = require('models/role');
const transitionReadinessData = require('helpers/transitionReadinessData');
const EntityHelper = require('helpers/entity');

async function entitiesUserCanAccess(user) {
  const entityHelper = new EntityHelper({ roles: true });

  let whitelist = [];
  if (user.canViewAllData) {
    whitelist = await entityHelper.getAllEntities();
  } else {
    let roles = await Role.findAll({
      include: {
        model: UserRole,
        where: { userId: user.id }
      }
    });
    
    whitelist = await entityHelper.entitiesWithViewPermission(roles);
  }
  return whitelist;
}

const assignEntityIdsUserCanAccessToLocals = async (req, res, next) => {
  res.locals.entitiesUserCanAccess = await entitiesUserCanAccess(req.user);
  res.locals.themesUserCanAccess = await transitionReadinessData.getThemeEntities(res.locals.entitiesUserCanAccess, req.user.roles);

  next();
};

module.exports = { assignEntityIdsUserCanAccessToLocals };
