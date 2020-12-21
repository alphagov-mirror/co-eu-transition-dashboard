const Page = require('core/pages/page');
const { paths } = require('config');
const { METHOD_NOT_ALLOWED } = require('http-status-codes');
const Category = require('models/category');
const CategoryField = require('models/categoryField');
const Entity = require('models/entity');
const EntityFieldEntry = require('models/entityFieldEntry');
const { Parser } = require('json2csv');
const sequelize = require('services/sequelize');
const DAO = require('services/dao');
const Milestone = require('models/milestone');
const moment = require('moment');
const cloneDeep = require('lodash/cloneDeep');
const authentication = require('services/authentication');
const { tableauIpWhiteList } = require('middleware/ipWhitelist');
const Role = require('models/role');
const logger = require('services/logger');
const EntityHelper = require('helpers/entity.js');

class TableauExport extends Page {
  get url() {
    return paths.tableauExport;
  }

  get middleware() {
    return [
      tableauIpWhiteList,
      ...authentication.protect(['management'])
    ];
  }

  get pathToBind() {
    return `${this.url}/:type/:mode?`;
  }

  get restrictExportByRole() {
    return this.req.query.role;
  }

  get exportingMeasures() {
    return this.req.params && this.req.params.type === 'measures';
  }

  get exportingProjects() {
    return this.req.params && this.req.params.type === 'projects-milestones';
  }

  get exportingCommunications() {
    return this.req.params && this.req.params.type === 'communications';
  }

  get showForm() {
    return this.req.params && !this.req.params.mode && this.isValidPageType;
  }

  get exportSchema() {
    return this.req.params && this.req.params.mode === 'schema' && this.isValidPageType;
  }

  get isValidPageType() {
    return this.exportingMeasures || this.exportingProjects || this.exportingCommunications;
  }

  async entitiesRoleCanAccess(roleName) {
    const entityHelper = new EntityHelper();
    const role = await Role.findOne({
      where: {
        name: roleName
      },
      include: ['roleEntities', 'roleEntityBlacklists']
    });

    if(!role) {
      throw new Error(`Cannot find role: ${roleName}`);
    }

    await entityHelper.init();
    const entities = entityHelper.entitiesWithRoles([role]);

    return Object.keys(entities);
  }

  async addParents(entity, entityFieldMap, replaceArraysWithNumberedKeyValues = true) {
    for(const parent of entity.parents) {
      const parentEntity = await Entity.findOne({
        where: {
          id: parent.id
        },
        include: [{
          model: EntityFieldEntry,
          include: CategoryField
        }, {
          model: Entity,
          as: 'parents'
        }, {
          model: Category
        }]
      });

      entityFieldMap[parentEntity.category.name] = entityFieldMap[parentEntity.category.name] || [];

      let nameEntry;
      let groupDescriptionEntry;


      parentEntity.entityFieldEntries.forEach(entityFieldEntry => {
        if(entityFieldEntry.categoryField.name === 'groupDescription') {
          groupDescriptionEntry = entityFieldEntry;
        }

        if(entityFieldEntry.categoryField.name === 'name') {
          nameEntry = entityFieldEntry;
        }
      });

      const name = groupDescriptionEntry || nameEntry;

      if(!entityFieldMap[parentEntity.category.name].some(item => item.value === name.value)){
        entityFieldMap[parentEntity.category.name].push({ value: name.value, type: name.categoryField.type });
      }

      if(parentEntity.parents.length) {
        await this.addParents(parentEntity, entityFieldMap, false);
      }
    }

    if(replaceArraysWithNumberedKeyValues){
      Object.keys(entityFieldMap).forEach(key => {
        const value = entityFieldMap[key];
        if(Array.isArray(value)) {
          value.reverse().forEach((valueItem, index) => {
            entityFieldMap[`${key} - ${index + 1}`] = valueItem;
          });
          delete entityFieldMap[key];
        }
      });
    }
  }

  async getEntitiesFlatStructure(startingCategory) {
    let entities = await Entity.findAll({
      where: {
        categoryId: startingCategory.id
      },
      include: [{
        model: EntityFieldEntry,
        include: {
          model: CategoryField,
          where: { isActive: true }
        }
      }, {
        model: Entity,
        as: 'parents'
      }]
    });

    const categoryFields = await CategoryField.findAll({
      where: {
        isActive: true,
        categoryId: startingCategory.id
      }
    });

    if(this.restrictExportByRole) {
      logger.info('restricting entities');
      // remove any entities role cannot access
      const entityIdsRoleCanAccess = await this.entitiesRoleCanAccess(this.restrictExportByRole);
      entities = entities.filter(entity => entityIdsRoleCanAccess.includes(entity.id));
    }

    const entityFieldMaps = [];

    for(const entity of entities) {
      const entityFieldMap = categoryFields.reduce((object, categoryField) => {
        const value = entity.entityFieldEntries.find(fieldEntry => fieldEntry.categoryFieldId == categoryField.id);
        object[categoryField.displayName] = {
          value: value === undefined ? undefined : value.value,
          type: categoryField.type
        }
        return object;
      }, {});

      entityFieldMap['Public ID'] = { value: entity.publicId, type: 'string' };
      const lastUpdatedOrCreated = entity.updated_at || entity.created_at;
      entityFieldMap['LastUpdate'] = { value: moment(lastUpdatedOrCreated, 'YYYY-MM-DD').format('DD/MM/YYYY'), type: 'date' };

      if(entity.parents.length) {
        await this.addParents(entity, entityFieldMap);
      }

      entityFieldMaps.push(entityFieldMap);
    }

    return entityFieldMaps;
  }

  async exportMeasures() {
    const measuresCategory = await Category.findOne({
      where: {
        name: 'Measure'
      }
    });

    return await this.getEntitiesFlatStructure(measuresCategory);
  }

  async exportCommunications() {
    const measuresCategory = await Category.findOne({
      where: {
        name: 'Communication'
      }
    });

    return await this.getEntitiesFlatStructure(measuresCategory);
  }

  async mergeProjectsWithEntities(entities) {
    const dao = new DAO({
      sequelize: sequelize
    });
    const milestoneFieldDefinitions = await Milestone.fieldDefinitions();

    const projectIds = entities.map(d => d['Public ID'].value);
    const projects = await dao.getAllData(this.id, {
      uid: projectIds
    });

    const milestoneDatas = [];

    for(const entity of entities) {
      const project = projects.find(project => entity['Public ID'].value === project.uid);

      if(project) {

        for(const milestone of project.milestones) {
          const milestoneData = cloneDeep(entity);

          milestoneData['Project - Name'] = { value: project.title, type: 'string' };
          milestoneData['Project - UID'] = { value: project.uid, type: 'string' };

          milestoneFieldDefinitions.forEach(field => {
            if(milestone[field.name]) {
              milestoneData[`Milestone - ${field.displayName || field.name}`] = { value:  milestone[field.name], type: 'string' };
            }
          });

          milestone.milestoneFieldEntries.forEach(field => {
            milestoneData[`Milestone - ${field.milestoneField.displayName}`] =  { value: field.value, type: field.milestoneField.type };
          });

          milestoneDatas.push(milestoneData);
        }
      }
    }

    return milestoneDatas;
  }

  async exportProjectsMilestones() {
    const projectsCategory = await Category.findOne({
      where: {
        name: 'Project'
      }
    });

    const entities = await this.getEntitiesFlatStructure(projectsCategory);
    return await this.mergeProjectsWithEntities(entities);
  }

  responseAsCSV(data, res) {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    res.set('Cache-Control', 'public, max-age=0');
    res.attachment(`${moment().format('YYYY.MM.DD')}_${this.req.params.type}.csv`);
    res.status(200);
    res.send(csv);
  }

  async getRequest(req, res) {
    if (this.showForm) {
      logger.info(`Print tableau request page`);
      return super.getRequest(req, res);
    }

    let data;
    if(this.exportingMeasures) {
      data = await this.exportMeasures(req, res);
    } else if(this.exportingProjects) {
      data = await this.exportProjectsMilestones(req, res);
    } else if(this.exportingCommunications) {
      data = await this.exportCommunications(req, res);
    }
    if (data && data.length) {
      if (this.exportSchema) {
        logger.info(`Exporting schema ${this.req.params.type}: ${Object.keys(data[0])}`);
        return res.json(data[0]);
      } else {
        logger.info(`Exporting data ${this.req.params.type}: ${Object.keys(data[0])}`);
        return res.json(data)
      }
    }

    return res.sendStatus(METHOD_NOT_ALLOWED);
  }

  async postRequest(req, res) {
    res.sendStatus(METHOD_NOT_ALLOWED);
  }
}


module.exports = TableauExport;
