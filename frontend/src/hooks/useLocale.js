import { useTranslation } from 'react-i18next';

export function useLocale() {
  const { i18n } = useTranslation();
  return ['de', 'en', 'fr'].includes(i18n.language) ? i18n.language : 'en';
}
