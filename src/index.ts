import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import userRoutes from './routes/user';
import taskRoutes from './routes/task';

createConnection().then(async connection => {
    const app = express();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log('Server is up and running at port ' + port);
    });

    app.use(express.json());
    app.use(userRoutes);
    app.use(taskRoutes);
}).catch((error) => {
    console.log(error);
});