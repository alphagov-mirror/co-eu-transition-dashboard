const Entity = require('models/entity');
const RoleEntity = require('models/roleEntity');

class EntityHelper {
  constructor() {
    this.entities = this.constructEntityMap();
  }

  constructEntityMap() {
    return Entity.findAll({
      attributes: ['publicId', 'id'],
      include: [
        {
          // separate: true,
          attributes: ['id'],
          model: Entity,
          as: 'children'
        }, {
          // separate: true,
          attributes: ['id'],
          model: Entity,
          as: 'parents'
        }, {
          attributes: ['roleId'],
          model: RoleEntity
        }
      ]
    }).then(entities => {
      return entities.reduce((entities, entity) => {
        entity.roles = entity.roleEntities.reduce((roles, role) => {
          roles[role.roleId] = role;
          return roles;
        }, {});
        delete entity.roleEntities;

        entities[entity.id] = entity;

        return entities;
      }, {});
    });
  }

  async getAllEntities() {
    return Object.values(await this.entities);
  }

  async entitiesWithRoles(roles) {
    return Object.values(await this.entities)
      .reduce((entitiesWithRoles, entity) => {
        const entityHasRole = roles.find(role => entity.roles[String(role.id)]);
        if(entityHasRole) {
          entitiesWithRoles[entity.id] = entity;
        }
        return entitiesWithRoles;
      }, {});
  }
}

module.exports = EntityHelper;
