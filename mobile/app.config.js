// app.config.js
// Dynamic Expo configuration - allows environment variables

export default ({ config }) => {
  // Determine environment - defaults to development if not specified
  const isProduction = process.env.APP_ENV === 'production';
  const isStaging = process.env.APP_ENV === 'staging';
  const isDevelopment = !isProduction && !isStaging;

  // API URLs for different environments
  // For development: Use your local machine's IP address
  // Find your IP: On Windows run 'ipconfig', on Mac run 'ifconfig'
  const apiUrls = {
    development: process.env.API_URL || 'http://10.0.0.171:5000/api',
    staging: process.env.API_URL || 'https://staging-api.psivrentals.com/api',
    production: process.env.API_URL || 'https://api.psivrentals.com/api',
  };

  const environment = isProduction ? 'production' : isStaging ? 'staging' : 'development';
  const apiUrl = apiUrls[environment];

  return {
    ...config,
    extra: {
      apiUrl,
      environment,
      // Stripe publishable key (set via environment variable in production)
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here',
    },
  };
};
