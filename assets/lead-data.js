export function validName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 80;
}

export function normalizedContact(value) {
  if (typeof value !== 'string' || value.length > 32) return '';
  const contact = value.trim();
  if (/^@[a-z0-9_]{4,31}$/i.test(contact)) return contact;
  if (!/^(?:\+7|[78])?[\d ()-]+$/.test(contact)) return '';
  const digits = contact.replace(/\D/g, '');
  if (/^[78]\d{10}$/.test(digits)) return '+7' + digits.slice(1);
  if (!contact.startsWith('+') && digits.length === 10) return '+7' + digits;
  return '';
}
