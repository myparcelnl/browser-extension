export const getEnvironment = (fallback = 'production') => process.env.ENVIRONMENT ?? fallback;
