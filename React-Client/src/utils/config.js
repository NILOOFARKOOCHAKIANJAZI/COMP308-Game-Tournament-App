export const resolveGraphqlUrl = (envUrl) => {
  return envUrl || 'http://localhost:4000/graphql';
};

export const getGraphqlUrl = () => {
  return resolveGraphqlUrl(import.meta.env.VITE_GRAPHQL_URL);
};