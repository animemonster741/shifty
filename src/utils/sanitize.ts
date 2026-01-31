import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Only allows safe tags and attributes commonly used in rich text content.
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
      // Block elements
      'div', 'span', 'blockquote', 'pre', 'code', 'hr',
      // Links and media (with restrictions)
      'a', 'img',
      // Text alignment wrapper
      'mark',
    ],
    ALLOWED_ATTR: [
      'class', 'style', 'dir', 'id',
      // Table attributes
      'colspan', 'rowspan', 'scope',
      // Link attributes
      'href', 'target', 'rel',
      // Image attributes
      'src', 'alt', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
    // Force safe link handling
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};
