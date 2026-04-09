import * as winston from 'winston';
import { WinstonModule, utilities as nestWinstonUtils } from 'nest-winston';

const isProduction = process.env.NODE_ENV === 'production';

export const createLogger = () => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: isProduction ? 'info' : 'debug',
        format: isProduction
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            )
          : winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonUtils.format.nestLike('LORVault', {
                colors: true,
                prettyPrint: true,
              }),
            ),
      }),
      // Production: also log errors to a file (when not using cloud logging)
      ...(isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ]
        : []),
    ],
  });
};
