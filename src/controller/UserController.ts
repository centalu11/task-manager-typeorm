import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { User as UserEntity } from '../entity/user';
import { Token as TokenEntity } from '../entity/token';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class UserController {
    /**
     * Add new user
     * 
     * @param req
     * @param res
     */
    static create = async (req: Request, res: Response) => {
        try {
            const User = getRepository(UserEntity);
            let user = User.create(UserController.hashPassword(req.body));
            user = await User.save(user);

            const token = await UserController.generateAuthToken(user);
            delete user['password'];

            const result = { user, token };

            res.status(201).send(result);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Get all users
     * 
     * @param req
     * @param res
     */
    static getAll = async (req: Request, res: Response) => {
        try {
            const User = getRepository(UserEntity);
            const result = await User.find({});

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Get user by id
     * 
     * @param req
     * @param res
     */
    static getById = async (req: Request, res: Response) => {
        try {
            const User = getRepository(UserEntity);
            const result = await User.findOne({ id: req.params.id });

            if (!result) {
                return res.status(404).send({ error: 'User not found!' });
            }

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Update user by id
     * 
     * @param req
     * @param res
     */
    static updateById = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password', 'age'];
        const isUpdatesValid = updates.every((update) => allowedUpdates.includes(update));

        if (!isUpdatesValid) {
            return res.status(400).send({ error: 'Invalid properties to update!' });
        }

        try {
            const User = getRepository(UserEntity);
            let user = await User.findOne({ id: req.params.id });

            if (!user) {
                return res.status(404).send({ error: 'User not found!' });
            }

            req.body = UserController.hashPassword(req.body);
            updates.forEach((update) => user[update] = req.body[update]);
            const result = await User.save(user);

            res.send(result);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Delete user by id
     * 
     * @param req
     * @param res
     */
    static deleteById = async (req: Request, res: Response) => {
        try {
            const User = getRepository(UserEntity);
            let user = await User.delete(req.params.id);

            const result = user.affected ? { message: "User removed successfully!" } : false;
            if (!result) {
                return res.status(404).send({ error: 'User not found!' });
            }

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Get current logged in user
     * 
     * @param req
     * @param res
     */
    static getProfile = async (req: Request, res: Response) => {
        try {
            const result = req.user;

            res.send(UserController.removeHiddenFields(result));
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Update current logged in user
     * 
     * @param req
     * @param res
     */
    static updateProfile = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password', 'age'];
        const isUpdatesValid = updates.every((update) => allowedUpdates.includes(update));

        if (!isUpdatesValid) {
            return res.status(400).send({ error: 'Invalid properties to update!' });
        }

        try {
            updates.forEach((update) => req.user[update] = req.body[update]);
            const User = getRepository(UserEntity);
            const result = await User.save(req.user);

            res.send(UserController.removeHiddenFields(result));
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Delete current logged in user
     * 
     * @param req
     * @param res
     */
    static deleteProfile = async (req: Request, res: Response) => {
        try {
            const User = getRepository(UserEntity);
            await User.delete(req.user.id);

            res.send({ message: "Profile removed successfully!" });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Login user
     * 
     * @param req
     * @param res
     */
    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await UserController.findByCredentials(email, password);
            const token = await UserController.generateAuthToken(user);
            const result = { token };

            res.send(result);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Logout user
     * 
     * @param req
     * @param res
     */
    static logout = async (req: Request, res: Response) => {
        try {
            const Token = getRepository(TokenEntity);
            Token.delete(req.tokenId);

            res.send();
        } catch (error) {
            res.send(500).send({ error: error.message });
        }
    };

    /**
     * Logout user from all devices
     * 
     * @param req
     * @param res
     */
    static logoutAll = async (req: Request, res: Response) => {
        try {
            const Token = getRepository(TokenEntity);
            Token.delete(req.user.tokens);

            res.send();
        } catch (error) {
            res.send(500).send({ error: error.message });
        }
    };

    /**
     * Hash Password
     * 
     * @param data
     */
    private static hashPassword(data) {
        if (data.password !== undefined) {
            data.password = bcrypt.hashSync(data.password, 8);
        }

        return data;
    };

    /**
     * Generate the JWT Token
     * 
     * @param user
     */
    private static async generateAuthToken(user) {
        const token = jwt.sign({ id: user.id }, 'mytaskmanagerapp');
        const Token = getRepository(TokenEntity);
        Token.save(Token.create({ token, user: user.id }));

        return token;
    };

    /**
     * Find user by credentials (email and password)
     * 
     * @param email
     * @param password
     */
    private static async findByCredentials(email, password) {
        const User = getRepository(UserEntity);
        const user = await User.findOne({ select: ["id", "email", "password"], where: { email } });

        if (!user) {
            throw new Error('Unable to login!');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            throw new Error('Unable to login!');
        }

        return user;
    };

    /**
     * Remove hidden fields from the response data
     * 
     * @param data
     */
    private static removeHiddenFields(data) {
        delete data.tokens;

        return data;
    }
}