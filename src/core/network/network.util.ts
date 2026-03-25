export const buildAuthHeader = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};
