const RoleEntity = require('models/roleEntity');

const getEntitiesForRoleId = async(roleId) => {
  const roleEntities = await RoleEntity.findAll({
    where: {
      roleId
    }
  });
  return roleEntities.reduce((ac, re) => {     
    ac[re.entityId] = {
      canEdit: re.canEdit,
      shouldCascade: re.shouldCascade
    };
    return ac;
  },{})
}

module.exports = {
  getEntitiesForRoleId
}