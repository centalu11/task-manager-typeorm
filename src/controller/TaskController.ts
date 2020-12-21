import { Task as TaskEntity } from '../entity/task';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';

export class TaskController {
    /**
     * Add new task of a user
     * 
     * @param req
     * @param res
     */
    static create = async (req: Request, res: Response) => {
        try {
            const Task = getRepository(TaskEntity);
            const task = Task.create({
                ...req.body,
                user: req.user.id
            })
            const result = await Task.save(task);

            res.status(201).send(result);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Get all tasks of a user
     * 
     * @param req
     * @param res
     */
    static getAll = async (req: Request, res: Response) => {
        try {
            const Task = getRepository(TaskEntity);
            const result = await Task.find({ user: req.user.id });

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Get task of a user by id
     * 
     * @param req
     * @param res
     */
    static getById = async (req: Request, res: Response) => {
        try {
            const Task = getRepository(TaskEntity);
            const result = await Task.findOne({
                id: req.params.id,
                user: req.user.id
            });

            if (!result) {
                return res.status(404).send({ error: 'Task not found!' });
            }

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };

    /**
     * Update task of a user by id
     * 
     * @param req
     * @param res
     */
    static updateById = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['description', 'completed'];
        const isUpdatesValid = updates.every((update) => allowedUpdates.includes(update));

        if (!isUpdatesValid) {
            return res.status(400).send({ error: 'Invalid properties to update!' });
        }

        try {
            const Task = getRepository(TaskEntity);
            let task = await Task.findOne({
                id: req.params.id,
                user: req.user.id
            });

            if (!task) {
                return res.status(404).send({ error: 'Task not found!' });
            }

            updates.forEach((update) => task[update] = req.body[update]);
            const result = await Task.save(task);

            res.send(result);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    };

    /**
     * Delete task of a user by id
     * 
     * @param req
     * @param res
     */
    static deleteById = async (req: Request, res: Response) => {
        try {
            const Task = getRepository(TaskEntity);
            let task = await Task.delete({
                id: req.params.id,
                user: req.user.id
            });

            const result = task.affected ? { message: "Task removed successfully!" } : false;
            if (!result) {
                return res.status(404).send({ error: 'Task not found!' });
            }

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    };
}