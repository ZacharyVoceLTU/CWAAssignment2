'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ERConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  ERConfig.init({
    name: {
     type:  DataTypes.STRING,
      allowNull: false
  },
  appliedImagesData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }, 
}, {
    sequelize,
    modelName: 'ERConfig',
  });
  return ERConfig;
};