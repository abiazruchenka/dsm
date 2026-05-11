import api from '../config/axios';

export const reenactmentService = {
  getBlocksGroupedByCategory: async () => {
    try {
      const response = await api.get('/api/reenactment');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/api/reenactment/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createCategory: async ({ code, nameDe, nameEn, nameFr, sortOrder = 0 }) => {
    const response = await api.post('/api/reenactment/categories', {
      code,
      nameDe,
      nameEn,
      nameFr,
      sortOrder,
    });
    return response.data;
  },

  updateCategory: async (id, { code, nameDe, nameEn, nameFr, sortOrder }) => {
    const response = await api.patch(`/api/reenactment/categories/${id}`, {
      code: code ?? '',
      nameDe,
      nameEn,
      nameFr,
      sortOrder,
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/api/reenactment/categories/${id}`);
  },

  getBlockById: async (blockId) => {
    try {
      const response = await api.get(`/api/reenactment/blocks/${blockId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createBlock: async ({ titles, texts, categoryId, sortOrder = 0 }) => {
    const response = await api.post('/api/reenactment/blocks', {
      titles: titles || {},
      texts: texts || {},
      categoryId: categoryId || null,
      sortOrder,
    });
    return response.data;
  },

  updateBlock: async (blockId, { titles, texts, categoryId, sortOrder, image }) => {
    const response = await api.patch(`/api/reenactment/blocks/${blockId}`, {
      titles,
      texts,
      categoryId,
      sortOrder,
      image,
    });
    return response.data;
  },

  deleteBlock: async (blockId) => {
    await api.delete(`/api/reenactment/blocks/${blockId}`);
  },

  deletePhoto: async (photoId) => {
    await api.delete(`/api/photos/${photoId}`);
  },
};
