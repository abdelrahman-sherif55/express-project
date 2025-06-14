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
import DBConnection from './src/mongo/mongoDB';
import mountRoutes from './src';
import {xssSanitizeMiddleware} from "./src/common/middlewares/xss.middleware";

const app: express.Application = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-CSRF-Token', 'X-API-KEY', 'Authorization', 'Content-Type'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({limit: '1kb'}));
app.use(xssSanitizeMiddleware());
app.use(compression());
app.use(ExpressMongoSanitize());
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}));
app.use(hpp({whitelist: []}));
app.use(express.static('uploads'));
app.set('trust proxy', true);
dotenv.config();

const port = process.env.PORT;
let server: Server;
i18n.configure({
  locales: ['en', 'ar'],
  defaultLocale: process.env.DEFAULT_LOCALE || 'en',
  queryParameter: 'lang',
  autoReload: true,
  updateFiles: false,
  objectNotation: true,
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
