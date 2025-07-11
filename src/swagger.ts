import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import express, { Request, Response } from 'express';


function swaggerDocs(app: express.Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Client Microservice API',
        description: "Client service endpoints documented on swagger",
        contact: {
          name: "Antoine Letailleur",
          email: "ant.letailleur@gmail.com",
          url: "https://github.com/AntoineLetailleur/epsi4a-mspr4-msclient"
        },
        version: '1.0.0',
      },
      servers: [
        {
          url: `/`,
          description: "Dynamically generated local server"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: [__dirname + '/routers/*.ts', __dirname + '/routers/*.js'],
  };

  const swaggerSpec = swaggerJsdoc(options);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      authAction: {
        bearerAuth: {
          name: "Bearer",
          schema: {
            type: "http",
            in: "header",
            scheme: "bearer",
            bearerFormat: "JWT"
          },
          value: "Bearer <TON_ACCESS_TOKEN>"
        }
      }
    }
  }));

  app.get('/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export default swaggerDocs;
