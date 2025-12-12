try {
  const config = require('./metro.config.js');
  console.log('Config loaded successfully');
  console.log('Transformer:', !!config.transformer);
  console.log('Resolver:', !!config.resolver);
} catch (error) {
  console.error('Failed to load config:', error);
}
