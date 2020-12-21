import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User as UserEntity } from '../entity/user';

/**
 * Authenticate user
 * 
 * @param req
 * @param res
 * @param next
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'mytaskmanagerapp');

        const User = getRepository(UserEntity);
        const user = await User.findOne({
            where: {
                id: decoded.id
            },
            relations: ['tokens']
        });

        if (!user) {
            throw new Error();
        }

        const currentTokenFromDb = user.tokens.find((userToken) => userToken.token === token);
        if (!currentTokenFromDb) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        req.tokenId = currentTokenFromDb.id;
        next();
    } catch (error) {
        res.status(401).send({ error: 'You are unauthorized to access this route!' });
    }
};