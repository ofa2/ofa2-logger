'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var pino = _interopDefault(require('pino'));

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
  logger.log = logger.info.bind(logger); // enable als, use traceId

  if (global.als) {
    ['log', 'info', 'warn', 'error', 'trace'].forEach(key => {
      let originFn = logger[key].bind(logger);

      logger[key] = function wrap(...args) {
        let traceId = global.als.get('traceId');

        if (!traceId) {
          originFn(...args);
        } else if (args[0] instanceof Error) {
          originFn(...[...args, global.als.get('traceId')]);
        } else {
          originFn(...[global.als.get('traceId'), ...args]);
        }
      };
    });
  }

  global.logger = logger;
  return logger;
}

module.exports = lift;
//# sourceMappingURL=bundle.cjs.js.map
