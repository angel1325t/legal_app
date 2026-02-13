// CLIENT APP - constants/categories.ts

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LegalCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

interface CategoryStyle {
  icon: string;
  color: string;
}

type CategoryName = 
  | 'civil' 
  | 'penal' 
  | 'laboral' 
  | 'familiar' 
  | 'mercantil' 
  | 'administrativo';

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_STYLES: Record<CategoryName, CategoryStyle> = {
  civil: { 
    icon: 'home', 
    color: 'bg-blue-500' 
  },
  penal: { 
    icon: 'alert-circle', 
    color: 'bg-red-500' 
  },
  laboral: { 
    icon: 'briefcase', 
    color: 'bg-green-500' 
  },
  familiar: { 
    icon: 'people', 
    color: 'bg-purple-500' 
  },
  mercantil: { 
    icon: 'business', 
    color: 'bg-yellow-500' 
  },
  administrativo: { 
    icon: 'document-text', 
    color: 'bg-indigo-500' 
  },
} as const;

const DEFAULT_STYLE: Readonly<CategoryStyle> = {
  icon: 'document-text',
  color: 'bg-gray-500',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normaliza el nombre de una categoría para búsqueda
 */
const normalizeCategoryName = (name: string): string => {
  return name.toLowerCase().trim();
};

/**
 * Obtiene el estilo de una categoría por su nombre
 */
const getCategoryStyle = (name: string): CategoryStyle => {
  const normalizedName = normalizeCategoryName(name);
  return CATEGORY_STYLES[normalizedName as CategoryName] ?? DEFAULT_STYLE;
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Enriquece una categoría con estilos visuales (icono y color)
 * basándose en su nombre
 * 
 * @param category - Categoría legal a enriquecer
 * @returns Categoría con propiedades de estilo agregadas
 */
export const addStylesToCategory = (category: LegalCategory): LegalCategory => {
  const style = getCategoryStyle(category.name);
  
  return {
    ...category,
    icon: style.icon,
    color: style.color,
  };
};

/**
 * Enriquece un array de categorías con estilos visuales
 * 
 * @param categories - Array de categorías legales
 * @returns Array de categorías enriquecidas con estilos
 */
export const addStylesToCategories = (
  categories: LegalCategory[]
): LegalCategory[] => {
  return categories.map(addStylesToCategory);
};

/**
 * Obtiene el color Tailwind de una categoría por su nombre
 * 
 * @param name - Nombre de la categoría
 * @returns Clase de color Tailwind (ej: 'bg-blue-500')
 */
export const getCategoryColor = (name: string): string => {
  return getCategoryStyle(name).color;
};

/**
 * Obtiene el nombre del icono de una categoría
 * 
 * @param name - Nombre de la categoría
 * @returns Nombre del icono (ej: 'home')
 */
export const getCategoryIcon = (name: string): string => {
  return getCategoryStyle(name).icon;
};