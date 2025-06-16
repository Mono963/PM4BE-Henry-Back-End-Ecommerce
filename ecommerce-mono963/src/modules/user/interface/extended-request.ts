import { Request } from 'express';

export interface RequestWithDate extends Request {
  now: string;
}
