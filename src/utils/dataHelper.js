/**
 * Safely extract array data from various API response formats
 * @param {any} data - The data to extract
 * @param {string} fieldName - Optional field name to look for
 * @returns {array} - Always returns an array
 */
export const safeExtractArray = (data, fieldName = null) => {
  console.log(`Extracting array (fieldName: ${fieldName}):`, data);

  // If it's already an array, return it
  if (Array.isArray(data)) {
    console.log('✅ Data is already an array');
    return data;
  }

  // If it's an object, try to find the array
  if (data && typeof data === 'object') {
    // Check for common nested pattern: { data: [...] }
    if (Array.isArray(data.data)) {
      console.log('✅ Found array in data.data');
      return data.data;
    }

    // Check for specific field name
    if (fieldName && Array.isArray(data[fieldName])) {
      console.log(`✅ Found array in data.${fieldName}`);
      return data[fieldName];
    }

    // Try common field names
    const commonFields = ['guests', 'rooms', 'bookings', 'items', 'results', 'records'];
    for (const key of commonFields) {
      if (Array.isArray(data[key])) {
        console.log(`✅ Found array in data.${key}`);
        return data[key];
      }
    }

    // If object has a single property that's an array, return it
    const keys = Object.keys(data);
    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
      console.log(`✅ Found array in single property: data.${keys[0]}`);
      return data[keys[0]];
    }
  }

  // Fallback to empty array
  console.log('⚠️ Could not extract array, returning empty array');
  return [];
};
