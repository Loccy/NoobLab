// Generated by CoffeeScript 1.3.3
(function() {
  var ClassFile, fs, root, util, _ref;

  require('./runtime');

  util = require('./util');

  ClassFile = require('../src/ClassFile');

  fs = (_ref = typeof node !== "undefined" && node !== null ? node.fs : void 0) != null ? _ref : require('fs');

  "use strict";


  root = typeof exports !== "undefined" && exports !== null ? exports : this.jvm = {};

  root.classpath = [];

  root.jspath = [];

  root.read_classfile = function(cls) {
    var data, filename, p, _i, _j, _len, _len1, _ref1, _ref2;
    _ref1 = root.jspath;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      p = _ref1[_i];
      filename = "" + p + "/" + cls + ".js";
      if (!fs.existsSync(filename)) {
        continue;
      }
      return require("../" + filename);
    }
    _ref2 = root.classpath;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      p = _ref2[_j];
      filename = "" + p + "/" + cls + ".class";
      if (!fs.existsSync(filename)) {
        continue;
      }
      data = util.bytestr_to_array(fs.readFileSync(filename, 'binary'));
      if (data != null) {
        return new ClassFile(data);
      }
    }
  };

  root.run_class = function(rs, class_name, cmdline_args, done_cb) {
    var main_method, main_spec;
    if (!rs.run_until_finished((function() {
      return rs.init_threads();
    }), (function() {}), true)) {
      return;
    }
    if (rs.system_initialized == null) {
      if (!rs.run_until_finished((function() {
        return rs.init_system_class();
      }), (function() {}), true)) {
        return;
      }
    }
    main_spec = {
      "class": class_name,
      sig: 'main([Ljava/lang/String;)V'
    };
    rs.init_args(cmdline_args);
    main_method = null;
    if (!rs.run_until_finished((function() {
      return main_method = rs.method_lookup(main_spec);
    }), (function() {}), true)) {
      return;
    }
    if (done_cb == null) {
      done_cb = (function() {});
    }
    return rs.run_until_finished((function() {
      return main_method.setup_stack(rs);
    }), done_cb);
  };

}).call(this);