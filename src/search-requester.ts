import { EventEmitter } from 'events';
import * as request from 'superagent';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest, SearchTimer } from './types';

const handleError = (err: any) => {
  if (err.response && err.response.body) {
    const body = err.response.body;
    const url = err.response.request.url;
    const method = err.response.request.method.toUpperCase();
    const status = err.response.status;
    if (body.error && body.error.message) {
      throw new Error(`Cannot ${method} ${url} (${status}): ${body.error.message}`);
    }
  }
  throw err;
};

const handleResponse = <T>(resp: request.Response): AzureSearchResponse<T> => {
  return {
    result: resp.body as T,
    properties: {
      requestId: resp.header['request-id'],
      elapsedTime: parseInt(resp.header['elapsed-time'], 10),
      clientRequestId: resp.header['client-request-id'],
      eTag: resp.header.etag,
      location: resp.header.location,
    },
    statusCode: resp.status,
  };
};

const handlePromise = <T>(req: request.SuperAgentRequest) => {
  return req
    .then((resp) => handleResponse<T>(resp))
    .catch(handleError);
};

const handleCallback = <T>(req: request.SuperAgentRequest, callback: (err: Error, resp: AzureSearchResponse<T>) => void) => {
  req.end((err, resp) => {
    let error: Error;
    let searchResp: AzureSearchResponse<T>;
    if (err) {
      try {
        handleError(err);
      } catch (err) {
        error = err;
      }
    } else {
      searchResp = handleResponse(resp);
    }
    callback(error, searchResp);
  });
};

request.serialize['application/json'] = (obj) => {
  return Buffer.isBuffer(obj) ? obj as any : JSON.stringify(obj);
};

/** Internal class to handle search HTTP requests/responses */
export class SearchRequester {

  events = new EventEmitter();
  private adminKeys: string[];
  private get endpoint() { return `https://${this.service}.search.windows.net`; }

  constructor(public service: string, adminKey: string | string[], public defaultVersion: string) {
    this.adminKeys = Array.isArray(adminKey) ? adminKey : [adminKey];
  }

  request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>): Promise<AzureSearchResponse<T>> {
    const [options, cb] = this.getParams(optionsOrCallback, callback);
    const events = this.events;
    const headers = Object.assign({
      'api-key': options && options.key ? options.key : this.adminKeys[0],
      'if-match': options && options.ifMatch ? options.ifMatch : null,
      'if-none-match': options && options.ifNoneMatch ? options.ifNoneMatch : null,
      'client-request-id': options && options.clientRequestId ? options.clientRequestId : null,
      'return-client-request-id': options && options.returnClientRequestId ? 'True' : null,
    }, req.headers);
    const query = Object.assign({
      'api-version': options && options.version ? options.version : this.defaultVersion,
    }, req.query);

    // todo process is not supported by browser, use browser timer to measure request's performances
    // const timer: SearchTimer = { start: new Date(), response: process.hrtime(), end: process.hrtime() };
    const val = request(req.method, this.endpoint + req.path)
      .set(headers)
      .query(query)
      .send(req.body)
      .retry(options ? options.retry : 0)
      .timeout(options ? options.timeout : null)
      .parse(req.parser)
      .on('response', (resp) => {
        // timer.response = process.hrtime(timer.response);
        this.events.emit('response', resp);
      })
      .on('error', (err) => {
        // timer.end = process.hrtime(timer.end);
        if (this.events.listenerCount('error')) {
          this.events.emit('error', err);
        }
      })
      .on('end', (err) => {
        // timer.end = process.hrtime(timer.end);
      });
    this.events.emit('request', { request: req, options });

    if (cb) {
      handleCallback<T>(val, cb);
    } else {
      return handlePromise<T>(val);
    }
  }

  private getParams<T>(optionsOrCallback?: SearchOptions | SearchCallback<T>, callback?: SearchCallback<T>): [SearchOptions, SearchCallback<T>] {
    if (typeof optionsOrCallback === 'function') {
      return [{}, optionsOrCallback];
    } else {
      return [optionsOrCallback || {}, callback];
    }
  }
}
