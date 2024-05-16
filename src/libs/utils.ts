export const isEmptyArray = (value: any): boolean => {
  return Array.isArray(value) && value.length === 0;
};

export const isEmptyObject = (value: any): boolean => {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
};
