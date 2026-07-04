export const createUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

export const createSchemaId = (schemaName: string, length = 8) => {
  const schemaInitial = schemaName.trim().charAt(0).toUpperCase();
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const numericId = Math.floor(min + Math.random() * (max - min + 1));

  return `${schemaInitial}ID${numericId}`;
};
