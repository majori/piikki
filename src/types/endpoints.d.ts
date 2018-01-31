import { Request } from 'express';

declare interface Endpoint {
  [key: string]: EndpointFunction;
}

declare type EndpointFunction = (req: Request) => Promise<any>;
