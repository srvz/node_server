/**
 * Created on 5/5/16.
 */
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import busboy from 'connect-busboy';


function parseParams(req, method) {
  const params = {};
  if (req.params) {
    Object.keys(req.params).forEach(v => {
      params[v] = req.params[v];
    });
  }

  if (method === 'GET') {
    Object.keys(req.query).forEach(v => {
      params[v] = req.query[v];
    });
  } else if (method === 'POST' || method === 'PUT') {
    Object.keys(req.body).forEach(v => {
      params[v] = req.body[v];
    });
  }
  params['x-app-id'] = req.headers['x-app-id'];
  params['x-access-token'] = req.headers['x-access-token'];
  return params;
}

class HTTP {
  constructor(opts) {
    if (!opts.port) {
      throw new Error('http `port` should not be null.');
    }
    this.port = opts.port;
    this.app = express();
    morgan.token('params', req => JSON.stringify(parseParams(req, req.method)));
    this.use(morgan('[:date[iso]] [:method :url] [:status] [:response-time ms] [:params]'));
    this.use(cors());
    this.use(bodyParser.json({ limit: '64mb' }));
    this.use(bodyParser.urlencoded({ limit: '64mb', extended: true, parameterLimit: 1000000 }));
    this.use(compression());
    this.use(busboy({ limits: { fileSize: 1024 * 1024 * 1024 } })); // 1G

    this.app.all('*', (req, res, next) => {
      req.header("Access-Control-Request-Headers", "*");
      res.header("Access-Control-Allow-Origin", "*");
      res.header("X-Frame-Options", "DENY");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-app-id");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
      next();
    });
  }

  errorLog = (e, req, res, next) => {
    console.error(req.path, 'error = ', e, e.stack);
    next(e);
  };

  clientErrorHandler = (e, req, res, next) => {
    if (req.xhr) {
      return res.send({ code: 0, message: '请求异常' });
    }
    return next(e);
  };

  errorHandler = (e, req, res, next) => {
    logger.error(e, e.stack);
    res.statusCode = 500;
    res.send({ code: 500 });
  };

  notFoundHandler = (req, res) => {
    res.statusCode = 404;
    res.end();
  };

  use = (...args) => {
    this.app.use.apply(this.app, args);
  };

  start = () => {
    this.app.get('*', this.notFoundHandler);
    this.use(this.errorLog);
    this.use(this.clientErrorHandler);
    this.use(this.errorHandler);

    const server = this.app.listen(this.port, () => {
      console.log('http listen on', this.port);
    });
    process.on('SIGINT', () => {
      console.log('http exiting...');
      server.close(() => {
        console.log('http exited.');
        process.exit(0);
      });
    });
  }
}

export default HTTP;
