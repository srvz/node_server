import HTTP from './server/http';
import getLogger from './util/logger';
global.logger = getLogger('NODE_SERVER', 'DEBUG');

process.on('uncaughtException', e => logger.error('uncaughtException =', e, e.stack));

function main() {
  try {
    const server = new HTTP({ port: 3080});
    server.app.get('/', (req, res) => {
      logger.debug(req.path, req.query || '');
      res.send({ message: 'root' });
    });
    server.app.get('/search', (req, res) => {
      logger.debug(req.path, req.query || '');
      logger(cbc.log(b));
      res.send({ message: 'search' });
    });
    server.start();
  } catch (e) {
    logger.error('error = ', e, e.stack);
  }
}

main();

