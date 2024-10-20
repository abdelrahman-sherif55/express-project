import path from "path";
import {Server} from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import i18n from "i18n";
import DBConnection from './src/global/config/database';
import mountRoutes from './src';

const app: express.Application = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['X-CSRF-Token', 'X-API-KEY', 'Authorization', 'Content-Type'],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({limit: '1kb'}));
app.use(compression());
app.use(ExpressMongoSanitize());
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}));
app.use(hpp({whitelist: []}));
app.use(express.static('uploads'));
dotenv.config();

const port = process.env.PORT;
let server: Server;
i18n.configure({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    queryParameter: 'lang',
    directory: path.join(__dirname, './locales')
})
app.use(i18n.init);
DBConnection();
mountRoutes(app);

server = app.listen(port, () => console.log(`app is listen on port ${port}`));

process.on('unhandledRejection', (err: Error) => {
    console.error(`unhandledRejection ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('shutting the application down');
        process.exit(1);
    });
});
