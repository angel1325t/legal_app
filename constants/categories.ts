// CLIENT APP - constants/categories.ts

export interface LegalCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;     // ← añadido
  color?: string;    // ← añadido
}

// Mapeo de iconos y colores por nombre de categoría
const CATEGORY_STYLES: { [key: string]: { icon: string; color: string } } = {
  'civil':         { icon: 'home',           color: 'bg-blue-500' },
  'penal':         { icon: 'alert-circle',   color: 'bg-red-500' },
  'laboral':       { icon: 'briefcase',      color: 'bg-green-500' },
  'familiar':      { icon: 'people',         color: 'bg-purple-500' },
  'mercantil':     { icon: 'business',       color: 'bg-yellow-500' },
  'administrativo':{ icon: 'document-text',  color: 'bg-indigo-500' },
  // puedes agregar más categorías aquí
};

// Estilo por defecto si no se encuentra match
const DEFAULT_STYLE = { icon: 'document-text', color: 'bg-gray-500' };

/**
 * Agregar estilos visuales a una categoría basándose en su nombre
 */
export const addStylesToCategory = (category: LegalCategory): LegalCategory => {
  const nameLower = category.name.toLowerCase().trim();
  const style = CATEGORY_STYLES[nameLower] || DEFAULT_STYLE;
  
  return {
    ...category,
    icon: style.icon,
    color: style.color,
  };
};

/**
 * Agregar estilos a un array de categorías
 */
export const addStylesToCategories = (categories: LegalCategory[]): LegalCategory[] => {
  return categories.map(cat => addStylesToCategory(cat));
};

/**
 * Obtener el color de una categoría por su nombre
 */
export const getCategoryColor = (name: string): string => {
  const nameLower = name.toLowerCase().trim();
  return CATEGORY_STYLES[nameLower]?.color || DEFAULT_STYLE.color;
};

/**
 * Obtener el icono de una categoría por su nombre
 */
export const getCategoryIcon = (name: string): string => {
  const nameLower = name.toLowerCase().trim();
  return CATEGORY_STYLES[nameLower]?.icon || DEFAULT_STYLE.icon;
};