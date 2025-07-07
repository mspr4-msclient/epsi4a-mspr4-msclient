import { Request, Response } from 'express';
import UserService from "../services/user.service"; 
import { publishMessage } from '../rabbitmq/publisher';
import logger from '../loggers/logger';
import { formatUser } from '../utils/response';
import { getTracer } from '../observability/otel';
import { Span, context, trace, propagation } from '@opentelemetry/api';


const userService = new UserService();

export function extractRequestContext(req: Request) {

    const span = trace.getSpan(context.active());

  return {
    route: req.originalUrl,
    method: req.method,
    requestId: req.headers['x-request-id'] || null,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    traceId: span?.spanContext().traceId ?? null,
    spanId: span?.spanContext().spanId ?? null,
  };
}

export default class UserController {
    
    async createUser(req: Request, res: Response) {

        const requestContext = extractRequestContext(req);

        getTracer().startActiveSpan("UserController.createUser", async (span: Span) => {
            try {
                
                const { email, first_name, last_name, birth_date, auth_id } = req.body;
        
                if (!email || !first_name || !last_name || !birth_date || !auth_id) {
                    logger.warn("Champs manquants", { ...requestContext, body: req.body });
                    return res.status(400).json({ message: 'Champs manquants' });
                }

                const existingMail = await userService.getUserByEmail(email);
            
                if (existingMail) {
                    logger.info("Email déjà utilisé", { ...requestContext, email });
                    return res.status(409).json({ message: 'Email déjà utilisé' });
                }

                const existingAuthId = await userService.getUserByAuthId(auth_id);

                if (existingAuthId) {
                    logger.info("Auth ID déjà utilisé", { ...requestContext, auth_id });
                    return res.status(409).json({ message: 'Auth ID déjà utilisé' });
                }
        
                const newUser = await userService.createUser({ email, first_name, last_name, birth_date, auth_id });
                logger.info("Utilisateur créé", { ...requestContext, userId: newUser._id });
                res.status(201).json({ data: formatUser({ ...newUser.toObject(), _id: newUser._id.toString() }) });
            } catch (err) {

                span.recordException(err as Error);
                logger.error("Erreur création utilisateur", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ message: 'Erreur serveur' });
            } finally {
                span.end();
            }
        })
    }

    async getUserByAuthId(req: Request, res: Response) {

        const requestContext = extractRequestContext(req);

        getTracer().startActiveSpan("UserController.getUserByAuthId", async (span: Span) => {
            try {
                
                const { auth_id } = req.params as { auth_id: string };

                if (!auth_id) {
                    logger.warn("Auth ID manquant", { ...requestContext, params: req.params });
                    return res.status(400).json({ message: 'Auth ID manquant' });
                }
        
                const user = await userService.getUserByAuthId(auth_id);
                logger.info("Utilisateur récupéré", { ...requestContext, userId: auth_id });

                if (!user) {
                    logger.warn("Utilisateur non trouvé", { ...requestContext, userId: auth_id });
                    return res.status(404).json({ message: 'Utilisateur non trouvé' });
                }
        
                res.status(200).json({ data: formatUser({ ...user.toObject(), _id: user._id.toString() }) });
            } catch (err) {

                span.recordException(err as Error);

                logger.error("Erreur récupération utilisateur", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ message: 'Erreur serveur' });
            } finally {
                span.end();
            }
        })
    }

    async updateUser(req: Request, res: Response) {

        const requestContext = extractRequestContext(req);

        getTracer().startActiveSpan("UserController.updateUser", async (span: Span) => {
            try {

                const { auth_id } = req.params as { auth_id: string };
            
                if (!auth_id) {
                    logger.warn("Auth ID manquant", { ...requestContext, params: req.params });
                    return res.status(400).json({ message: 'Auth ID manquant' });
                }

                if (req.body.email !== undefined) {
                    const existingUser = await userService.getUserByEmail(req.body.email);
            
                    if (existingUser) {
                        logger.info("Email déjà utilisé", { ...requestContext, email: req.body.email });
                        return res.status(409).json({ message: 'Email déjà utilisé' });
                    }
                }

                if (req.body.auth_id !== undefined) {
                    logger.warn("Modification de auth ID non autorisée", { ...requestContext, body: req.body });
                    return res.status(400).json({ message: 'Modification de auth ID non autorisée' });
                }
        
                const updatedUser = await userService.updateUser({ auth_id, data: req.body });

                if (!updatedUser) {
                    logger.warn("Utilisateur non trouvé", { ...requestContext, userId: auth_id });
                    return res.status(404).json({ message: 'Utilisateur non trouvé' });
                }

                logger.info("Utilisateur mis à jour", { ...requestContext, userId: auth_id });
                res.status(201).json({ data: formatUser({ ...updatedUser.toObject(), _id: updatedUser._id.toString() }) });
            } catch (err) {

                span.recordException(err as Error);

                logger.error("Erreur mise à jour utilisateur", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ message: 'Erreur serveur' });
            } finally {
                span.end();
            }
        })
    }

    async deleteUser(req: Request, res: Response) {

        const requestContext = extractRequestContext(req);
        
        getTracer().startActiveSpan("UserController.deleteUser", async (span: Span) => {
            try {
                
                const { auth_id } = req.params as { auth_id: string };
            
                if (!auth_id) {
                    logger.warn("Auth ID manquant", { ...requestContext, params: req.params });
                    return res.status(400).json({ message: 'Auth ID manquant' });
                }

                const deletedUser = await userService.deleteUser({ auth_id });

                if (!deletedUser) {
                    logger.warn("Utilisateur non trouvé", { ...requestContext, userId: auth_id });
                    return res.status(404).json({ message: 'Utilisateur non trouvé' });
                }

                logger.info("Utilisateur supprimé", { ...requestContext, userId: auth_id });
                res.status(204).send();
            } catch (err) {

                span.recordException(err as Error);

                logger.error("Erreur suppression utilisateur", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ message: 'Erreur serveur' });
            } finally {
                span.end();
            }
        })
    }

    async getAllUsers(req: Request, res: Response) {

        const requestContext = extractRequestContext(req);

        getTracer().startActiveSpan("UserController.getAllUsers", async (span: Span) => {
            try {

                const page = parseInt(req.query.page as string) || 1;
                const limit = parseInt(req.query.limit as string) || 10;
                const { users, total, total_pages } = await userService.getAllUsers({ page, limit });

                if (!users) {
                    logger.warn("Erreur lors de la récupération de tous les utilisateurs", { ...requestContext });
                    return res.status(400).json({ message: 'Erreur lors de la récupération de tous les utilisateurs' });
                } 

                logger.info("Utilisateurs récupérés", { ...requestContext, totalUsers: total });

                res.status(200).json({
                    page: page.toString(),
                    total_pages: total_pages.toString(),
                    total_users: total.toString(),
                    data: users.map(user => formatUser({ ...user.toObject(), _id: user._id.toString() }))
                });
            } catch (err) {

                span.recordException(err as Error);

                logger.error("Erreur récupération utilisateurs", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ message: 'Erreur serveur' });
            } finally {
                span.end();
            }
        })
    }

    async birthdayEvent(req: Request, res: Response): Promise<void> {

        const requestContext = extractRequestContext(req);

        getTracer().startActiveSpan("UserController.birthdayEvent", async (span: Span) => {
            try {

                const msg = req.body;
                const { exchangeName, exchangeType } = req.query as { exchangeName: string, exchangeType: string };
                const carrier: Record<string, string> = {};
                propagation.inject(context.active(), carrier);

                if (!msg || typeof msg !== 'object' || Array.isArray(msg) || !exchangeName || !exchangeType) {
                    logger.warn("Message, name and type of the exchange are required.", { ...requestContext, body: req.body });
                    res.status(400).json({ success: false, error: 'Message, name and type of the exchange are required.' });
                    span.end();
                    return;
                }

                await publishMessage(
                    {
                        ...(msg as object),
                        traceContext: carrier
                    },
                    exchangeName,
                    exchangeType
                );

                logger.info("Message publié", { ...requestContext, msg });
                res.status(200).json({ success: true, message: 'Message published.' });
            } catch (err) {

                span.recordException(err as Error);

                logger.error("Erreur publication message", {
                    ...requestContext,
                    error: (err as Error).message,
                    stack: (err as Error).stack,
                });

                res.status(500).json({ success: false, error: (err as Error).message });
            } finally {
                span.end();
            }
        })
    }
}