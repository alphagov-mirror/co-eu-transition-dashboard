const moment = require('moment');
const pick = require('lodash/pick');

const validateBool = value => {
  const truthy = ['true', 'yes', '1', 'y'];
  const falsey = ['false', 'no', '0', 'n'];

  const isABoolean = [...truthy, ...falsey].includes(String(value).toLowerCase());

  if(!isABoolean) {
    throw Error(`Is not a valid boolean`);
  }
};

const validateNumber = value => {
  const isNotNumber = isNaN(value);

  if(isNotNumber) {
    throw Error(`Is not a valid number`);
  }
};

const validateDate = value => {
  const isValidDate = moment(value).isValid();
  if(!isValidDate) {
    throw Error(`Is not a valid date`);
  }
};

const isValueInGroup = (value, options) => {
  const valueInGroup = options.includes(value);

  if(!valueInGroup) {
    throw Error(`Must match one of the following: ${options.join(', ')}`);
  }
};

const validateIsDefined = value => {
  return value !== undefined && value !== null && Boolean(value && String(value).length);
};

const validateIsRequired = (value, isRequired) => {
  const isDefined = validateIsDefined(value);

  if(isRequired && !isDefined) {
    throw Error(`Must enter a value`);
  }
};

const validateIsUnique = (value, allValues, isUnique) => {
  if (isUnique) {
    const matches = allValues.filter(allValue => value === allValue);
    if (matches.length > 1) {
      throw Error(`Must be a unique value`);
    }
  }
};

const validateValue = (value, definition, allValues) => {
  const isDefined = validateIsDefined(value);

  if(!isDefined) {
    return validateIsRequired(value, definition.isRequired);
  }

  validateIsUnique(value, allValues, definition.isUnique);

  switch(definition.type) {
  case 'boolean':
    return validateBool(value);
  case 'integer':
  case 'float':
    return validateNumber(value);
  case 'date':
    return validateDate(value);
  case 'group':
    return isValueInGroup(value, definition.config.options);
  }
};

const validateItems = (items, itemDefinitions) => {
  const validateItem = (errors, item) => {
    itemDefinitions.forEach(itemDefinition => {
      const value = item[itemDefinition.name];
      const allValues = pick(items, [itemDefinition.name]);

      try {
        validateValue(value, itemDefinition, allValues);
      } catch (error) {
        errors.push({ item, itemDefinition, value, error: error.message });
      }
    });

    return errors;
  };

  return items.reduce(validateItem, []);
};

const validateColumns = (columnsRecieved, requiredColumns) => {
  const errors = [];

  requiredColumns.forEach(requiredColumn => {
    const isMissing = !columnsRecieved.includes(requiredColumn);
    if(isMissing) {
      errors.push({ error: `"${requiredColumn}" column is missing from the spreadsheet.` });
    }
  });

  columnsRecieved.forEach(columnRecieved => {
    const isExtraColumn = !requiredColumns.includes(columnRecieved);
    if(isExtraColumn) {
      errors.push({ error: `"${columnRecieved}" column is not reqcognized as a valid column, please either remove or rename.` });
    }
  });

  return errors;
};

module.exports = {
  validateItems,
  validateColumns,
  validateBool,
  validateNumber,
  validateDate,
  isValueInGroup,
  validateIsDefined,
  validateIsRequired,
  validateIsUnique,
  validateValue
};