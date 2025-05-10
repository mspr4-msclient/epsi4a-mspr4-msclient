import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import express, { Request, Response } from 'express';


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
    servers: [{
      url: "http://localhost:8080/",
      description: "Local server"
    }]
  },
  apis: [__dirname + '/routers/*.ts', __dirname + '/routers/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app: express.Express, port: number) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}

export default swaggerDocs