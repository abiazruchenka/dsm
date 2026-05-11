import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../common/ImageUploader';
import LocalizedFormFields from '../common/LocalizedFormFields';
import { reenactmentService } from '../../services/reenactmentService';
import { useLocale } from '../../hooks/useLocale';
import './ReenactmentManagement.css';

export default function ReenactmentManagement({ blockId, blockDetail, onRefresh }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = useLocale();

  const [categories, setCategories] = useState([]);
  const [blockTitleDe, setBlockTitleDe] = useState('');
  const [blockTitleEn, setBlockTitleEn] = useState('');
  const [blockTitleFr, setBlockTitleFr] = useState('');
  const [blockTextDe, setBlockTextDe] = useState('');
  const [blockTextEn, setBlockTextEn] = useState('');
  const [blockTextFr, setBlockTextFr] = useState('');
  const [blockCategoryId, setBlockCategoryId] = useState('');
  const [blockSortOrder, setBlockSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [catCode, setCatCode] = useState('');
  const [catNameDe, setCatNameDe] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameFr, setCatNameFr] = useState('');
  const [catSortOrder, setCatSortOrder] = useState(0);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [updatingCategory, setUpdatingCategory] = useState(false);

  const loadCategories = () => reenactmentService.getCategories().then(setCategories).catch(console.error);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (blockDetail && blockId) {
      setBlockTitleDe(blockDetail.titles?.de || '');
      setBlockTitleEn(blockDetail.titles?.en || '');
      setBlockTitleFr(blockDetail.titles?.fr || '');
      setBlockTextDe(blockDetail.texts?.de || '');
      setBlockTextEn(blockDetail.texts?.en || '');
      setBlockTextFr(blockDetail.texts?.fr || '');
      setBlockCategoryId(blockDetail.categoryId || '');
      setBlockSortOrder(blockDetail.sortOrder ?? 0);
    }
  }, [blockDetail, blockId]);

  const updateBlock = async () => {
    if (!blockId) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await reenactmentService.updateBlock(blockId, {
        titles: { de: blockTitleDe.trim(), en: blockTitleEn.trim(), fr: blockTitleFr.trim() },
        texts: { de: blockTextDe.trim(), en: blockTextEn.trim(), fr: blockTextFr.trim() },
        categoryId: blockCategoryId || null,
        sortOrder: blockSortOrder,
      });
      setSuccess(true);
      onRefresh?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.message || t('reenactment.admin.updateFailed') || 'Failed to update block');
    } finally {
      setLoading(false);
    }
  };

  const createBlock = async () => {
    if (!blockTitleDe.trim()) {
      setError(t('reenactment.admin.titleRequired') || 'Title (DE) is required');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const block = await reenactmentService.createBlock({
        titles: { de: blockTitleDe.trim(), en: blockTitleEn.trim(), fr: blockTitleFr.trim() },
        texts: { de: blockTextDe.trim(), en: blockTextEn.trim(), fr: blockTextFr.trim() },
        categoryId: blockCategoryId || null,
        sortOrder: blockSortOrder,
      });
      setSuccess(true);
      onRefresh?.();
      setTimeout(() => {
        setSuccess(false);
        navigate(`/reenactment/${block.id}`);
      }, 1000);
    } catch (err) {
      setError(err?.message || t('reenactment.admin.createFailed') || 'Failed to create block');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    const code = catCode.trim().toLowerCase().replace(/\s+/g, '_');
    if (!code) {
      setError(t('reenactment.admin.categoryCodeRequired') || 'Category code is required');
      return;
    }
    if (!catNameDe.trim() || !catNameEn.trim() || !catNameFr.trim()) {
      setError(t('reenactment.admin.categoryNamesRequired') || 'All names (DE, EN, FR) are required');
      return;
    }
    setCreatingCategory(true);
    setError(null);
    setCategorySuccess(false);
    try {
      await reenactmentService.createCategory({
        code,
        nameDe: catNameDe.trim(),
        nameEn: catNameEn.trim(),
        nameFr: catNameFr.trim(),
        sortOrder: catSortOrder,
      });
      setCatCode('');
      setCatNameDe('');
      setCatNameEn('');
      setCatNameFr('');
      setCategorySuccess(true);
      loadCategories();
      onRefresh?.();
      setTimeout(() => setCategorySuccess(false), 3000);
    } catch (err) {
      setError(err?.message || t('reenactment.admin.categoryCreateFailed') || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCatCode(cat.code || '');
    setCatNameDe(cat.names?.de || '');
    setCatNameEn(cat.names?.en || '');
    setCatNameFr(cat.names?.fr || '');
    setCatSortOrder(cat.sortOrder ?? 0);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setCatCode('');
    setCatNameDe('');
    setCatNameEn('');
    setCatNameFr('');
    setCatSortOrder(0);
  };

  const updateCategory = async () => {
    if (!editingCategoryId) return;
    if (!catNameDe.trim() || !catNameEn.trim() || !catNameFr.trim()) {
      setError(t('reenactment.admin.categoryNamesRequired') || 'All names (DE, EN, FR) are required');
      return;
    }
    setUpdatingCategory(true);
    setError(null);
    setCategorySuccess(false);
    try {
      await reenactmentService.updateCategory(editingCategoryId, {
        code: catCode.trim(),
        nameDe: catNameDe.trim(),
        nameEn: catNameEn.trim(),
        nameFr: catNameFr.trim(),
        sortOrder: catSortOrder,
      });
      handleCancelEditCategory();
      setCategorySuccess(true);
      loadCategories();
      onRefresh?.();
      setTimeout(() => setCategorySuccess(false), 3000);
    } catch (err) {
      setError(err?.message || t('reenactment.admin.categoryUpdateFailed') || 'Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm(t('reenactment.admin.deleteCategoryConfirm') || 'Delete this category? Blocks will become uncategorized.')) return;
    try {
      await reenactmentService.deleteCategory(catId);
      if (editingCategoryId === catId) handleCancelEditCategory();
      loadCategories();
      onRefresh?.();
    } catch (err) {
      setError(err?.message || 'Failed to delete category');
    }
  };

  const handleDeleteBlock = async () => {
    if (!window.confirm(t('reenactment.admin.deleteBlockConfirm') || 'Delete this block and all its content?')) return;
    try {
      await reenactmentService.deleteBlock(blockId);
      navigate('/reenactment');
      onRefresh?.();
    } catch (err) {
      setError(err?.message || 'Failed to delete block');
    }
  };

  const getCategoryName = (cat) => cat?.names?.[lang] || cat?.names?.en || cat?.code || '';

  // Create block form (when on list view)
  if (!blockId) {
    const isEditingCategory = !!editingCategoryId;
    return (
      <div className="reenactment-management">
        <div className="reenactment-category-section">
          <div className="reenactment-category-form-wrap">
            <h2>{isEditingCategory ? (t('reenactment.admin.editCategory') || 'Edit Category') : (t('reenactment.admin.createCategory') || 'Create Category')}</h2>
            <div className="reenactment-form reenactment-category-form">
          <div className="form-group">
            <input
              id="cat-code"
              type="text"
              value={catCode}
              onChange={(e) => setCatCode(e.target.value)}
              placeholder="e.g. my_category"
              disabled={creatingCategory || isEditingCategory}
            />
          </div>
          <div className="form-group">
            <input
              id="cat-name-de"
              type="text"
              value={catNameDe}
              onChange={(e) => setCatNameDe(e.target.value)}
              placeholder="Deutscher Name"
              disabled={creatingCategory || updatingCategory}
            />
          </div>
          <div className="form-group">
            <input
              id="cat-name-en"
              type="text"
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
              placeholder="English name"
              disabled={creatingCategory || updatingCategory}
            />
          </div>
          <div className="form-group">
            <input
              id="cat-name-fr"
              type="text"
              value={catNameFr}
              onChange={(e) => setCatNameFr(e.target.value)}
              placeholder="Nom français"
              disabled={creatingCategory || updatingCategory}
            />
          </div>
          <div className="form-group">
            <input
              id="cat-sort"
              type="number"
              value={catSortOrder}
              onChange={(e) => setCatSortOrder(parseInt(e.target.value, 10) || 0)}
              disabled={creatingCategory || updatingCategory}
            />
          </div>
          {error && <div className="upload-error">{error}</div>}
          {categorySuccess && <div className="upload-success">{isEditingCategory ? (t('reenactment.admin.categoryUpdated') || 'Category updated!') : (t('reenactment.admin.categoryCreated') || 'Category created!')}</div>}
          <div className="form-actions">
            {isEditingCategory ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEditCategory}
                  className="upload-button upload-button-secondary"
                  disabled={updatingCategory}
                >
                  {t('reenactment.admin.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={updateCategory}
                  disabled={!catNameDe.trim() || !catNameEn.trim() || !catNameFr.trim() || updatingCategory}
                  className="upload-button"
                >
                  {updatingCategory ? t('reenactment.admin.saving') || 'Saving...' : t('reenactment.admin.updateCategory') || 'Update Category'}
                </button>
              </>
            ) : (
              <button
                onClick={createCategory}
                disabled={!catCode.trim() || !catNameDe.trim() || !catNameEn.trim() || !catNameFr.trim() || creatingCategory}
                className="upload-button"
              >
                {creatingCategory ? t('reenactment.admin.creating') || 'Creating...' : t('reenactment.admin.createCategory') || 'Create Category'}
              </button>
            )}
          </div>
        </div>
        </div>
          {categories.length > 0 && (
            <div className="reenactment-categories-list-wrap">
              <h3 className="reenactment-categories-list-title">{t('reenactment.admin.existingCategories') || 'Existing categories'}</h3>
              <div className="reenactment-categories-list">
                {categories.map((cat) => (
                  <span key={cat.id} className="reenactment-category-chip">
                    {getCategoryName(cat)}
                    <button type="button" className="reenactment-category-edit" onClick={() => handleEditCategory(cat)} title={t('reenactment.admin.edit') || 'Edit'}>✎</button>
                    <button type="button" className="reenactment-category-delete" onClick={() => handleDeleteCategory(cat.id)} title={t('reenactment.admin.delete')}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <h2 className="reenactment-form-section-title">{t('reenactment.admin.createBlock') || 'Create Block'}</h2>
        <div className="reenactment-form">
          <LocalizedFormFields
            value={{ de: blockTitleDe, en: blockTitleEn, fr: blockTitleFr }}
            onChange={(key, val) => { if (key === 'de') setBlockTitleDe(val); else if (key === 'en') setBlockTitleEn(val); else setBlockTitleFr(val); }}
            type="text"
            placeholderPrefix="Title"
            disabled={loading}
            requiredDe
          />
          <LocalizedFormFields
            value={{ de: blockTextDe, en: blockTextEn, fr: blockTextFr }}
            onChange={(key, val) => { if (key === 'de') setBlockTextDe(val); else if (key === 'en') setBlockTextEn(val); else setBlockTextFr(val); }}
            type="textarea"
            placeholderPrefix="Text"
            textareaRows={3}
            disabled={loading}
          />
          <div className="form-group">
            <select
              id="block-category"
              value={blockCategoryId}
              onChange={(e) => setBlockCategoryId(e.target.value)}
              disabled={loading}
            >
              <option value="">— {t('reenactment.admin.noCategory') || 'No category'} —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input
              id="block-sort"
              type="number"
              value={blockSortOrder}
              onChange={(e) => setBlockSortOrder(parseInt(e.target.value, 10) || 0)}
              disabled={loading}
            />
          </div>
          {error && <div className="upload-error">{error}</div>}
          {success && <div className="upload-success">{t('reenactment.admin.blockCreated') || 'Block created!'}</div>}
          <div className="form-actions">
            <button
              onClick={createBlock}
              disabled={!blockTitleDe.trim() || loading}
              className="upload-button"
            >
              {loading ? t('reenactment.admin.creating') || 'Creating...' : t('reenactment.admin.create') || 'Create Block'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reenactment-management">
      <h2>{t('reenactment.admin.manageBlock') || 'Manage Block'}</h2>
      <div className="reenactment-form reenactment-edit-form">
        <LocalizedFormFields
          value={{ de: blockTitleDe, en: blockTitleEn, fr: blockTitleFr }}
          onChange={(key, val) => { if (key === 'de') setBlockTitleDe(val); else if (key === 'en') setBlockTitleEn(val); else setBlockTitleFr(val); }}
          type="text"
          placeholderPrefix="Title"
          disabled={loading}
        />
        <LocalizedFormFields
          value={{ de: blockTextDe, en: blockTextEn, fr: blockTextFr }}
          onChange={(key, val) => { if (key === 'de') setBlockTextDe(val); else if (key === 'en') setBlockTextEn(val); else setBlockTextFr(val); }}
          type="textarea"
          placeholderPrefix="Text"
          textareaRows={3}
          disabled={loading}
        />
        <div className="form-group">
          <select
            value={blockCategoryId}
            onChange={(e) => setBlockCategoryId(e.target.value)}
            disabled={loading}
          >
            <option value="">— {t('reenactment.admin.noCategory') || 'No category'} —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <input
            type="number"
            value={blockSortOrder}
            onChange={(e) => setBlockSortOrder(parseInt(e.target.value, 10) || 0)}
            disabled={loading}
          />
        </div>
        {error && <div className="upload-error">{error}</div>}
        {success && <div className="upload-success">{t('reenactment.admin.blockUpdated') || 'Block updated!'}</div>}
        <div className="form-actions">
          <button
            onClick={updateBlock}
            disabled={loading}
            className="upload-button"
          >
            {loading ? t('reenactment.admin.saving') || 'Saving...' : t('reenactment.admin.saveBlock') || 'Save block'}
          </button>
        </div>
      </div>
      <div className="gallery-upload-section">
        <div className="gallery-admin-actions">
          <button
            type="button"
            className="delete-gallery-button"
            onClick={handleDeleteBlock}
          >
            {t('reenactment.admin.deleteBlock') || 'Delete block'}
          </button>
        </div>
        <ImageUploader
          galleryId={blockId}
          onUploadSuccess={() => onRefresh?.()}
          maxSizeMB={3}
        />
      </div>
      <p className="reenactment-admin-hint">{t('reenactment.admin.setMainHint') || 'Upload photos and click ⭒ on a photo to set it as the main image.'}</p>
    </div>
  );
}
