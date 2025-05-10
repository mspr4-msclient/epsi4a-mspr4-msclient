import { Router } from "express";
import UserController from '../controllers/user.controller';


const userController = new UserController();
const router = Router();

/**
* @openapi
* '/api/v1/client':
*  post:
*     summary: Create a user
*     requestBody:
*      required: true
*      content:
*        application/json:
*           schema:
*            type: object
*            required:
*              - username
*              - email
*              - age
*            properties:
*              username:
*                type: string
*                default: johndoe
*                description: The username of the user
*                required: true
*              email:
*                type: string
*                default: johndoe@mail.com
*                description: The email of the user
*                required: true
*              age:
*                type: integer
*                default: 20
*                description: The age of the user
*                required: false
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
router.post('/',  userController.createUser);

/**
* @openapi
* '/api/v1/client':
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
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.get('/', userController.getAllUsers);

/**
* @openapi
* '/api/v1/client/{id}':
*  get:
*     summary: Get user by ID
*     parameters:
*      - name: id
*        in: path
*        type: string
*        description: User ID
*        required: true
*     responses:
*      201:
*        description: Fetched Successfully
*      400:
*        description: Bad Request
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.get('/:id', userController.getUserById);

/**
* @openapi
* '/api/v1/client/{id}':
*  patch:
*     summary: Modify a user
*     parameters:
*       - name: id
*         in: path
*         type: string
*         description: User ID
*         required: true
*     requestBody:
*      required: true
*      content:
*        application/json:
*           schema:
*            type: object
*            required:
*              - username
*              - email
*              - age
*            properties:
*              username:
*                type: string
*                default: johndoe
*                description: The username of the user
*                required: false
*              email:
*                type: string
*                default: johndoe@mail.com
*                description: The email of the user
*                required: false
*              age:
*                type: integer
*                default: 20
*                description: The age of the user
*                required: false
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
router.patch('/:id', userController.updateUser);

 /**
* @openapi
* '/api/v1/client/{id}':
*  delete:
*     summary: Delete user by Id
*     parameters:
*      - name: id
*        in: path
*        type: string
*        description: User ID
*        required: true
*     responses:
*      200:
*        description: Removed
*      400:
*        description: Bad request
*      404:
*        description: Not Found
*      500:
*        description: Server Error
*/
router.delete('/:id', userController.deleteUser);

module.exports = router;