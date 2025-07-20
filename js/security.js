// ===== PROTECTION XSS ET SÉCURITÉ =====

/**
 * Échappe les caractères HTML pour éviter les failles XSS
 * @param {string} text - Le texte à échapper
 * @returns {string} - Le texte échappé
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Nettoie et valide les données utilisateur
 * @param {string} input - L'entrée utilisateur
 * @param {string} type - Le type de validation ('email', 'text', 'number')
 * @returns {string} - L'entrée nettoyée
 */
function sanitizeInput(input, type = 'text') {
  if (!input || typeof input !== 'string') return '';
  
  // Supprimer les scripts et balises dangereuses
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/[<>\"']/g, ''); // Supprimer les caractères dangereux
  
  // Validation selon le type
  switch (type) {
    case 'email':
      // Supprimer tout sauf les caractères autorisés pour un email
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
      break;
    case 'number':
      // Supprimer tout sauf les chiffres et points
      sanitized = sanitized.replace(/[^0-9.-]/g, '');
      break;
    case 'text':
    default:
      // Limiter la longueur et supprimer les caractères de contrôle
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      sanitized = sanitized.substring(0, 1000); // Limite de 1000 caractères
      break;
  }
  
  return sanitized.trim();
}

/**
 * Affiche du contenu de manière sécurisée dans un élément
 * @param {string} elementId - L'ID de l'élément
 * @param {string} content - Le contenu à afficher
 * @param {boolean} isHtml - Si true, permet du HTML limité (par défaut: false)
 */
function safeSetContent(elementId, content, isHtml = false) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (isHtml) {
    // Permettre seulement certaines balises HTML sûres
    const allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p', 'span'];
    let cleanHtml = content;
    
    // Supprimer toutes les balises sauf celles autorisées
    cleanHtml = cleanHtml.replace(/<(?!\/?(?:b|i|em|strong|br|p|span)\b)[^>]*>/gi, '');
    
    element.innerHTML = cleanHtml;
  } else {
    // Mode texte seulement (plus sûr)
    element.textContent = content;
  }
}

/**
 * Valide et sécurise les URLs
 * @param {string} url - L'URL à valider
 * @returns {boolean} - True si l'URL est sûre
 */
function isUrlSafe(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Rejeter les URLs avec JavaScript
  if (url.toLowerCase().includes('javascript:')) return false;
  if (url.toLowerCase().includes('data:')) return false;
  if (url.toLowerCase().includes('vbscript:')) return false;
  
  // Permettre seulement HTTP, HTTPS et URLs relatives
  const urlPattern = /^(https?:\/\/|\/)/i;
  return urlPattern.test(url);
}

/**
 * Valide les tokens JWT côté client (vérification basique)
 * @param {string} token - Le token à valider
 * @returns {boolean} - True si le token semble valide
 */
function isValidJWT(token) {
  if (!token || typeof token !== 'string') return false;
  
  // Un JWT doit avoir 3 parties séparées par des points
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Chaque partie doit être en base64
  try {
    parts.forEach(part => {
      if (part.length === 0) throw new Error('Empty part');
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Limite la fréquence des requêtes (rate limiting côté client)
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    
    // Supprimer les requêtes trop anciennes
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Vérifier si on peut faire une nouvelle requête
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}

// Instance globale de rate limiting
const globalRateLimiter = new RateLimiter(20, 60000); // 20 requêtes par minute

/**
 * Headers sécurisés pour les requêtes fetch
 * @param {object} additionalHeaders - Headers supplémentaires
 * @returns {Headers} - Headers sécurisés
 */
function getSecureHeaders(additionalHeaders = {}) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");
  headers.append("X-Content-Type-Options", "nosniff");
  headers.append("X-Frame-Options", "DENY");
  
  // Ajouter les headers supplémentaires
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    headers.append(key, value);
  });
  
  return headers;
}
