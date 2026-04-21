export const resolveGraphqlUrl = (envUrl) => {
  return envUrl || 'https://comp308-backend-d0hec7hbg0dye6es.eastus2-01.azurewebsites.net/graphql';
};

export const getGraphqlUrl = () => {
  return resolveGraphqlUrl(import.meta.env.VITE_GRAPHQL_URL);
};
