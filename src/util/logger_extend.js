import path from 'path'
import cluster from 'cluster'
// override instance methods

const colours = {
  ALL  : "grey",
  TRACE: "blue",
  DEBUG: "cyan",
  INFO : "green",
  WARN : "yellow",
  ERROR: "red",
  FATAL: "magenta",
  OFF  : "grey"
}

const styles = {
  //styles
  'bold'     : [1, 22],
  'italic'   : [3, 23],
  'underline': [4, 24],
  'inverse'  : [7, 27],
  //grayscale
  'white'    : [37, 39],
  'grey'     : [90, 39],
  'black'    : [90, 39],
  //colors
  'blue'     : [34, 39],
  'cyan'     : [36, 39],
  'green'    : [32, 39],
  'magenta'  : [35, 39],
  'red'      : [31, 39],
  'yellow'   : [33, 39]
}

function extend(log4js) {
  let logger = log4js.getLogger();
  ["trace", "debug", "info", "warn", "error", "fatal"].forEach(function (method) {
    let original = logger.constructor.prototype[method];
    logger.constructor.prototype[method] = function log() {
      let args = [].slice.call(arguments),
        trace = getTrace(log);
      args.unshift(colorize(formatter(trace), colours[method.toUpperCase()]));
      //args.push(formatter(trace))
      return original.apply(this, args);
    };
  });
}

function prepareStackTrace(error, structuredStackTrace) {
  let trace = structuredStackTrace[0];
  return {
    // method name
    method: trace.getMethodName() || trace.getFunctionName() || "<anonymous>",
    // file name
    file: trace.getFileName(),
    // line number
    line: trace.getLineNumber(),
    // column number
    column: trace.getColumnNumber()
  };
}

function getTrace(caller) {
  let original = Error.prepareStackTrace,
    error = {};
  Error.captureStackTrace(error, caller || getTrace);
  Error.prepareStackTrace = prepareStackTrace;
  let stack = error.stack;
  Error.prepareStackTrace = original;
  return stack;
}

// format trace
function formatter(trace) {
  if (trace.file) {
    // absolute path -> relative path
    exports.path && (trace.file = path.relative(exports.path, trace.file));
  } else {
    trace.file = "";
  }

  return exports.format
    .split("@method").join(trace.method)
    .split("@file").join(trace.file)
    .split("@line").join(trace.line)
    .split("@column").join(trace.column)
    .split("@memory").join(getProcessMemory())
    .split("@pid").join(process.pid || '@pid')
    .split("@port").join(process.port || '@port')
    .split("@worker").join(((cluster.worker && cluster.worker.id) ? 'W-' + cluster.worker.id : 'M'));
}

function getProcessMemory(){
  return `${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB`
}
function colorizeStart(style) {
  return style ? '\x1B[' + styles[style][0] + 'm' : '';
}

function colorizeEnd(style) {
  return style ? '\x1B[' + styles[style][1] + 'm' : '';
}

function colorize(str, style) {
  return colorizeStart(style) + str + colorizeEnd(style);
}


let extended = false;
exports = module.exports = function (log4js, options) {
  extended || extend(log4js);
  extended = true;

  // init
  exports.path = null;
  exports.format = "at @name (@file:@line:@column)";

  options || (options = {});
  options.path && (exports.path = options.path);
  options.format && (exports.format = options.format);

  return log4js
};