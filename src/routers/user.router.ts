import { Router } from "express";
import UserController from '../controllers/user.controller';
import { authorize } from "../auth/authorize";


const userController = new UserController();
const router = Router();

/**
* @openapi
* '/api/v1/clients':
*  post:
*     summary: Create a user
*     requestBody:
*      required: true
*      content:
*        application/json:
*           schema:
*            type: object
*            required:
*              - last_name
*              - first_name
*              - email
*              - birth_date
*              - auth_id
*            properties:
*              last_name:
*                type: string
*                default: johndoe
*                description: The username of the user
*                required: true
*              email:
*                type: string
*                default: johndoe@mail.com
*                description: The email of the user
*                required: true
*              first_name:
*                type: string
*                default: John
*                description: The first name of the user
*                required: true
*              birth_date:
*               type: string
*               default: 2000-01-01
*               description: The birth date of the user
*               required: true
*              auth_id:
*               type: string
*               default: sub|1234567890
*               description: The sub claim value of the user in Auth0
*               required: true
*     responses:
*      201:
*        description: Created
*      400:
*        description: Bad Request
*      409:
*        description: Conflict
*      500:
*        description: Server Error
*/
router.post('/', authorize(["admin:client"]), userController.createUser);

/**
* @openapi
* '/api/v1/clients':
*  get:
*     summary: Get all users
*     parameters:
*        - name: page
*          in: query
*          type: integer
*          description: Page number
*          required: false
*          default: 1
*        - name: limit
*          in: query
*          type: integer
*          description: Number of users per page
*          required: false
*          default: 10
*     responses:
*      200:
*        description: Fetched Successfully
*      400:
*        description: Bad Request
*      500:
*        description: Server Error
*/
router.get('/', userController.getAllUsers);

/**
* @openapi
* '/api/v1/clients/{auth_id}':
*  get:
*     summary: Get user by auth ID
*     parameters:
*      - name: auth_id
*        in: path
*        type: string
*        description: User auth ID
*        required: true
*     responses:
*      200:
*        description: Fetched Successfully
*      400:
*        description: Bad Request
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.get('/:auth_id', userController.getUserByAuthId);

/**
* @openapi
* '/api/v1/clients/{auth_id}':
*  patch:
*     summary: Modify a user
*     parameters:
*       - name: auth_id
*         in: path
*         type: string
*         description: User auth ID
*         required: true
*     requestBody:
*      required: true
*      content:
*        application/json:
*           schema:
*            type: object
*            required:
*              - last_name
*              - first_name
*              - email
*              - birth_date
*            properties:
*              last_name:
*                type: string
*                default: johndoe
*                description: The username of the user
*                required: true
*              email:
*                type: string
*                default: johndoe@mail.com
*                description: The email of the user
*                required: true
*              first_name:
*                type: string
*                default: John
*                description: The first name of the user
*                required: true
*              birth_date:
*               type: string
*               default: 2000-01-01
*               description: The birth date of the user
*               required: true
*     responses:
*      201:
*        description: Modified
*      400:
*        description: Bad Request
*      409:
*        description: Conflict
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.patch('/:auth_id', userController.updateUser);

/**
* @openapi
* '/api/v1/clients/{auth_id}':
*  delete:
*     summary: Delete user by auth ID
*     parameters:
*      - name: auth_id
*        in: path
*        type: string
*        description: User auth ID
*        required: true
*     responses:
*      204:
*        description: Deleted Successfully
*      400:
*        description: Bad Request
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.delete('/:auth_id', userController.deleteUser);

/**
* @openapi
* '/api/v1/clients/mb/orders':
*   post:
*     summary: Publish message to the specified exchange with RabbitMQ 
*     parameters:
*       - name: exchangeName
*         in: query
*         type: string
*         description: Name of the exchange to publish the message to
*         required: true
*       - name: exchangeType
*         in: query
*         type: string
*         description: Type of the exchange to publish the message to
*         required: true
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object or string
*             example:
*               clientId: "abc789"
*               productId: "product123"
*     responses:
*       200:
*         description: Message published successfully
*       400:
*         description: Bad Request
*       500:
*         description: Server Error
*/
router.post('/mb/orders', userController.birthdayEvent);

module.exports = router;