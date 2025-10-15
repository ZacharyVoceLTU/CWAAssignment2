import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import path from 'path';

// Dynamically import sqlite3 to prevent bundling issues
import sqlite3 from 'sqlite3';

interface AppliedImage {
    id: number;
    x: number;
    y: number;
    hintText: string;
    clueText: string;
    answer: string;
    fileName: string;
}

// SQLite setup with explicitly defined dialectModule
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3, // Make sure to use the correct sqlite3 driver
  storage: path.resolve('./sqlite/dev.sqlite'),
  logging: false,
});

// Typed Sequelize User model
export class ERConfig extends Model<
  InferAttributes<ERConfig>,
  InferCreationAttributes<ERConfig>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare appliedImagesData: AppliedImage[];
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ERConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appliedImagesData: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    // ✅ Optionally declare these to satisfy TypeScript
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ERConfig',
    timestamps: true,
  }
);