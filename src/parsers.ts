import * as request from 'superagent';

import { ParserCallback } from './types';

export const jsonParser = (reviver?: (key: any, value: any) => any) => {
  return (res: request.Response, cb: ParserCallback) => {
    let error: Error;
    let body: any;
    if (res.on) {
        const buf: Buffer[] = [];
        res.on('data', (d) => buf.push(d));
        res.on('error', cb);
        res.on('end', () => {
            try {
                body = JSON.parse(Buffer.concat(buf).toString().trim(), reviver);
            } catch (err) {
                error = err;
            }
            if (cb instanceof Function) {
                cb(error, body);
            }
        });
    } else {
        try {
            body = JSON.parse(res.text, reviver);
        } catch (err) {
            error = err;
        }
        if (cb instanceof Function) {
            cb(error, body);
        }
    }

    return body;
  };
};
