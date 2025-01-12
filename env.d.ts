declare namespace NodeJS {
    interface ProcessEnv {
        PORT: any;
        DB: string;
        BASE_URL: string;
        NODE_ENV: 'development' | 'product';
        JWT_SECRET_KEY: string;
        JWT_RESET_SECRET_KEY: string;
        JWT_REFRESH_SECRET_KEY: string;
        EXPIRED_TIME: string;
        EXPIRED_RESET_TIME: string;
        EXPIRED_REFRESH_TIME: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        GOOGLE_CALLBACK: string;
        EMAIL_HOST: string;
        EMAIL_PORT: any;
        EMAIL_SECURE: any;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;
        APP_NAME: string;
        HMAC: string;
        PAYMOB_SECRET: string;
        PAYMOB_PUBLIC: string;
    }
}
