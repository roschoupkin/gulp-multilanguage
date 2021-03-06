'use strict';
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const through = require('through2');
const parsePage = function (page, lang) {
  const substitute = new RegExp('gp\\{\\{([^\\{\\{][\\n\\w\\W\\d\\D\\s\\S\\b\\B][^\\}\\}]*)\\}\\}', 'g');
  return page.replace(substitute, (s, str) => {
    str = str.replace(new RegExp('\'', 'g'), '\"');
    const obj = JSON.parse('{'+str+'}');
    return (obj[lang]) ? obj[lang] : '';
  });
};

module.exports = (lang) => {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new PluginError('gulp-ease-multilanguage', 'Streaming not supported'));
      return;
    }

    try {
      const data = parsePage(file.contents.toString(), lang);
      file.contents = new Buffer(data);
      this.push(file);
    } catch (err) {
      this.emit('error', new PluginError('gulp-ease-multilanguage', err));
    }

    cb();
  });
};