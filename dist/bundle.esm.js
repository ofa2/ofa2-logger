import _ from 'lodash';
import pino from 'pino';
import als from 'async-local-storage';

als.enable();
function lift() {
  this.config.log = this.config.log || {};
  let pretty;

  if (this.config.log.pretty !== false) {
    let prettyConfig = _.assign({
      errorProps: ['extra']
    }, this.config.log.pretty);

    pretty = pino.pretty(prettyConfig);
    pretty.pipe(process.stdout);
  }

  let logger = pino(this.config.log, pretty);
  this.logger = logger;
  logger.log = logger.info.bind(logger);
  ['log', 'info', 'warn', 'error', 'trace'].forEach(key => {
    let originFn = logger[key].bind(logger);

    logger[key] = function wrap(...args) {
      let traceId = als.get('traceId');

      if (!traceId) {
        originFn(...args);
      } else if (args[0] instanceof Error) {
        originFn(...[...args, als.get('traceId')]);
      } else {
        originFn(...[als.get('traceId'), ...args]);
      }
    };
  });
  global.logger = logger;
  global.als = als;
  return logger;
}

export default lift;
//# sourceMappingURL=bundle.esm.js.map
