import { Image } from '../models/index.js';

/**
 * Data-access layer for images. Controllers call into here; this is the only
 * place that talks to the Image model directly.
 */

const createImage = ({ name, description, buffer, mimeType, size, date }) =>
  Image.create({
    name,
    description,
    image: buffer,
    mimeType,
    size,
    ...(date ? { date } : {}),
  });

/**
 * Lists images without their binary payload (keeps the response light).
 */
const listImages = () =>
  Image.findAll({
    attributes: { exclude: ['image'] },
    order: [['createdAt', 'DESC']],
  });

const getImageById = (id) => Image.findByPk(id);

const deleteImage = async (id) => {
  const deletedCount = await Image.destroy({ where: { id } });
  return deletedCount > 0;
};

export default { createImage, listImages, getImageById, deleteImage };
