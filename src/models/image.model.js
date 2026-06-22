import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/database.js';

/**
 * Image model — represents an uploaded picture (JPG/PNG) stored in Postgres.
 *
 * The binary is persisted in a BYTEA column (`image`). `mimeType` and `size`
 * are kept alongside so the file can be validated and served back with the
 * correct headers without re-inspecting the bytes.
 */
class Image extends Model {
  /**
   * Returns a plain object safe for JSON responses — excludes the heavy binary
   * payload so list/detail endpoints stay lightweight.
   */
  toMetadata() {
    const { image, ...rest } = this.toJSON();
    return rest;
  }
}

Image.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB, // maps to Postgres BYTEA
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Image',
    tableName: 'images',
    timestamps: true, // createdAt / updatedAt
  },
);

export default Image;
