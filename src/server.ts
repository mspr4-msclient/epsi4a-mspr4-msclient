import app, { config } from './app';
import logger from './loggers/logger';
import swaggerDocs from './swagger';


const port = config.PORT;
const clientUrl = config.CLIENT_URL;

app.listen(port, () => {
  logger.info(`Microservice User is running on port ${clientUrl}:${port}`);
  console.log(`✅ Microservice User lancé sur : ${clientUrl}:${port}`);
  swaggerDocs(app);
});