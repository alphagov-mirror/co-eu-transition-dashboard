const { expect, sinon } = require('test/unit/util/chai');
const EntityHelper = require('helpers/entity');
const Entity = require('models/entity');
const RoleEntity = require('models/roleEntity');

let entityHelper;

const entities = [{
  id: 1,
  publicId: 'bottom entity',
  children: [],
  parents:  [{ id: 2, publicId: 'middle entity' }],
  roles: [1]
},{
  id: 2,
  publicId: 'middle entity',
  children: [{ id: 1, publicId: 'bottom entity' }],
  parents:  [{ id: 3, publicId: 'top entity' }],
  roles: [2]
},{
  id: 3,
  publicId: 'top entity',
  children: [{ id: 2, publicId: 'middle entity' }],
  parents:  [],
  roles: [2]
}];

const entityMap = {
  1: {
    id: 1,
    publicId: 'bottom entity',
    children: [],
    parents:  [{ id: 2, publicId: 'middle entity' }],
    roles: [1]
  },
  2: {
    id: 2,
    publicId: 'middle entity',
    children: [{ id: 1, publicId: 'bottom entity' }],
    parents:  [{ id: 3, publicId: 'top entity' }],
    roles: [2]
  },
  3: {
    id: 3,
    publicId: 'top entity',
    children: [{ id: 2, publicId: 'middle entity' }],
    parents:  [],
    roles: [2]
  }
};

describe.skip('helpers/entityHelper', () => {
  beforeEach(async () => {
    Entity.findAll.returns(entities);
    entityHelper = new EntityHelper();
  });

  describe('#allEntities', () => {
    it('returns all entities', async () => {
      await entityHelper.getAllEntities();
      // console.log(await entityHelper.getAllEntities())
      // expect(await entityHelper.getAllEntities()).to.eql(Object.values(entityMap));
    });
  });

  describe('#entitiesWithRoles', () => {
    it('returns all entities which have role', async () => {
      const entitiesWithRole = await entityHelper.entitiesWithRoles([{ id: 2 }]);
      expect(entitiesWithRole).to.eql({ 2: entityMap[2], 3: entityMap[3] });
    });
  });
});
