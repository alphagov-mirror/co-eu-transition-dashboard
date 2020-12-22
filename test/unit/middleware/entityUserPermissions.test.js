const Entity = require('models/entity');
const { expect, sinon } = require('test/unit/util/chai');
const entityUserPermissions = require('middleware/entityUserPermissions');
const Role = require('models/role');
const UserRole = require('models/userRole');
const transitionReadinessData = require('helpers/transitionReadinessData');

describe('middleware/entityUserPermissions', () => {
  describe('#assignEntityIdsUserCanAccessToLocals', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = { user: { id: 1 } };
      res = { locals: {} };
      next = sinon.stub();
    });

    it('sets locals.entitiesUserCanAccess with all entities user can access via whitelist', async () => {
      transitionReadinessData.getThemeEntities = sinon.stub();
      const entities = [{
        publicId: 'entity 01',
        id: 1,
        children: [],
        parents: [],
        roleEntities: [{ roleId: 1 }]
      },
      {
        publicId: 'entity 02',
        id: 2,
        children: [],
        parents: [],
        roleEntities: [{ roleId: 1 }]
      }];

      Entity.findAll.resolves(entities);

      Role.findAll.resolves([{
        name: "all",
        id: 1,
        roleEntities: [
          {
            roleId: 1,
            entityId: 1
          },
          {
            roleId: 1,
            entityId: 2
          }
        ],
        roleEntityBlacklists: []
      }]);

      await entityUserPermissions.assignEntityIdsUserCanAccessToLocals(req, res, next);

      sinon.assert.calledWith(Role.findAll, {
        include: {
          model: UserRole,
          where: { userId: req.user.id },
        },
      });

      sinon.assert.called(next);
      expect(res.locals.entitiesUserCanAccess).to.eql([
        {
          publicId: 'entity 01',
          id: 1,
          children: [],
          parents: [],
          roles: {
            1: {
              roleId: 1
            }
          }
        },
        {
          publicId: 'entity 02',
          id: 2,
          children: [],
          parents: [],
          roles: {
            1: {
              roleId: 1
            }
          }
        }
      ]);
    });

    it('sets locals.entitiesUserCanAccess with all entities user can access via blacklist', async () => {
      const entities = [{
        publicId: 'entity 01',
        id: 1,
        children: [],
        parents: [],
        roleEntities: [{ roleId: 1 }]
      },
      {
        publicId: 'entity 02',
        id: 2,
        children: [],
        parents: [],
        roleEntities: []
      }];

      Entity.findAll.resolves([entities[0]]);

      Role.findAll.resolves([{
        name: "all",
        id: 1,
        roleEntities: [
          {
            roleId: 1,
            entityId: 1
          }
        ]
      }]);

      await entityUserPermissions.assignEntityIdsUserCanAccessToLocals(req, res, next);

      sinon.assert.calledWith(Role.findAll, {
        include: {
          model: UserRole,
          where: { userId: req.user.id },
        }
      });

      sinon.assert.called(next);
      expect(res.locals.entitiesUserCanAccess).to.eql([{
        publicId: 'entity 01',
        id: 1,
        children: [],
        parents: [],
        roles: {
          1: {
            roleId: 1
          }
        }
      }]);
    });
  });
});
