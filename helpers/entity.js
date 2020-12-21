const Entity = require('models/entity');
const RoleEntity = require('models/roleEntity');

class EntityHelper {
  constructor() {
    this.entityMap = {};
  }

  async init() {
    return this.constructEntityMap();
  }

  async constructEntityMap() {
    const entites = await Entity.findAll({
      include: [{
        model: Entity,
        as: 'children'
      },{
        model: Entity,
        as: 'parents'
      },
      {
        model: RoleEntity
      }]
    });

    const entityMap = entites.reduce((entityMap, entity) => {
      entityMap[entity.id] = {
        id: entity.id,
        publicId: entity.publicId,
        roles: entity.roleEntities.map(role => role.roleId),
        parents: entity.parents.map(parent => {
          return {
            id: parent.id,
            publicId: parent.publicId
          };
        }),
        children: entity.children.map(child => {
          return {
            id: child.id,
            publicId: child.publicId
          };
        })
      };
      return entityMap;
    }, {});

    this.entityMap = entityMap;
  }

  get allEntities() {
    return Object.values(this.entityMap);
  }

  entitiesWithRoles(roles) {
    return Object.values(this.entityMap).reduce((entitiesWithRoles, entity) => {
      const entityHasRole = roles.find(role => entity.roles.includes(role.id));
      if(entityHasRole) {
        entitiesWithRoles[entity.id] = entity;
      }
      return entitiesWithRoles;
    }, {});
  }
}

module.exports = EntityHelper;
