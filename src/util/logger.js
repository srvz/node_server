import log4js from 'log4js'
import log4js_extend from './logger_extend'
import fs from 'fs'
import path from 'path'

const filePath = process.cwd();
try {
  fs.statSync(`${filePath}/logs`)
} catch (e) {
  fs.mkdirSync(`${filePath}/logs`)
}

log4js_extend(log4js, {
  path  : filePath,
  format: "[@pid][@memory][@port][@worker] (@file @method @line:@column)"
})

function getLogger(category, level, replace = false) {
  const toString = Object.prototype.toString
  if (toString.call(level) === '[object Boolean]') {
    replace = level
    level = undefined
  }
  log4js.configure({
    appenders: [
      {
        type: 'console'
      },
      {
        type: 'dateFile',
        filename: './logs/development',
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        maxLogSize: 20480
      }
    ],
    replaceConsole: replace,
  })
  let dateFileLog = log4js.getLogger(category || 'default')
  dateFileLog.setLevel(level || 'DEBUG')
  return dateFileLog;
}


export default getLogger