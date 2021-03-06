// Generated by CoffeeScript 1.3.3
(function() {
  var debug, error, exceptions, gLong, root, trace, vtrace, _ref, _ref1;

  gLong = require('../vendor/gLong.js');

  exceptions = require('./exceptions');

  _ref = require('./logging'), trace = _ref.trace, vtrace = _ref.vtrace, error = _ref.error, debug = _ref.debug;

  "use strict";


  root = typeof exports !== "undefined" && exports !== null ? exports : (_ref1 = window.util) != null ? _ref1 : window.util = {};

  root.INT_MAX = Math.pow(2, 31) - 1;

  root.INT_MIN = -root.INT_MAX - 1;

  root.FLOAT_POS_INFINITY = Math.pow(2, 128);

  root.FLOAT_NEG_INFINITY = -1 * root.FLOAT_POS_INFINITY;

  root.FLOAT_NaN = 5.104235503814077e+38;

  root.int_mod = function(rs, a, b) {
    if (b === 0) {
      exceptions.java_throw(rs, 'java/lang/ArithmeticException', '/ by zero');
    }
    return a % b;
  };

  root.int_div = function(rs, a, b) {
    if (b === 0) {
      exceptions.java_throw(rs, 'java/lang/ArithmeticException', '/ by zero');
    }
    if (a === root.INT_MIN && b === -1) {
      return a;
    }
    return (a / b) | 0;
  };

  root.long_mod = function(rs, a, b) {
    if (b.isZero()) {
      exceptions.java_throw(rs, 'java/lang/ArithmeticException', '/ by zero');
    }
    return a.modulo(b);
  };

  root.long_div = function(rs, a, b) {
    if (b.isZero()) {
      exceptions.java_throw(rs, 'java/lang/ArithmeticException', '/ by zero');
    }
    return a.div(b);
  };

  root.float2int = function(a) {
    if (a > root.INT_MAX) {
      return root.INT_MAX;
    } else if (a < root.INT_MIN) {
      return root.INT_MIN;
    } else {
      return a | 0;
    }
  };

  root.intbits2float = function(uint32) {
    var exponent, f_view, i_view, sign, significand, value;
    if (typeof Int32Array !== "undefined" && Int32Array !== null) {
      i_view = new Int32Array([uint32]);
      f_view = new Float32Array(i_view.buffer);
      return f_view[0];
    }
    sign = (uint32 & 0x80000000) >>> 31;
    exponent = (uint32 & 0x7F800000) >>> 23;
    significand = uint32 & 0x007FFFFF;
    if (exponent === 0) {
      value = Math.pow(-1, sign) * significand * Math.pow(2, -149);
    } else {
      value = Math.pow(-1, sign) * (1 + significand * Math.pow(2, -23)) * Math.pow(2, exponent - 127);
    }
    return value;
  };

  root.longbits2double = function(uint32_a, uint32_b) {
    var d_view, exponent, i_view, sign, significand, value;
    if (typeof Uint32Array !== "undefined" && Uint32Array !== null) {
      i_view = new Uint32Array(2);
      i_view[0] = uint32_b;
      i_view[1] = uint32_a;
      d_view = new Float64Array(i_view.buffer);
      return d_view[0];
    }
    sign = (uint32_a & 0x80000000) >>> 31;
    exponent = (uint32_a & 0x7FF00000) >>> 20;
    significand = root.lshift(uint32_a & 0x000FFFFF, 32) + uint32_b;
    if (exponent === 0) {
      value = Math.pow(-1, sign) * significand * Math.pow(2, -1074);
    } else {
      value = Math.pow(-1, sign) * (1 + significand * Math.pow(2, -52)) * Math.pow(2, exponent - 1023);
    }
    return value;
  };

  root.is_float_NaN = function(a) {
    return a > root.FLOAT_POS_INFINITY || a < root.FLOAT_NEG_INFINITY;
  };

  root.are_floats_NaN = function(a, b) {
    return a > root.FLOAT_POS_INFINITY || a < root.FLOAT_NEG_INFINITY || b > root.FLOAT_POS_INFINITY || b < root.FLOAT_NEG_INFINITY;
  };

  root.wrap_float = function(a) {
    if (a > 3.40282346638528860e+38) {
      return root.FLOAT_POS_INFINITY;
    }
    if ((0 < a && a < 1.40129846432481707e-45)) {
      return 0;
    }
    if (a < -3.40282346638528860e+38) {
      return root.FLOAT_NEG_INFINITY;
    }
    if ((0 > a && a > -1.40129846432481707e-45)) {
      return 0;
    }
    return a;
  };

  root.cmp = function(a, b) {
    if (a === b) {
      return 0;
    }
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return null;
  };

  root.lshift = function(x, n) {
    return x * Math.pow(2, n);
  };

  root.read_uint = function(bytes) {
    var i, n, sum, _i;
    n = bytes.length - 1;
    sum = 0;
    for (i = _i = 0; _i <= n; i = _i += 1) {
      sum += root.lshift(bytes[i], 8 * (n - i));
    }
    return sum;
  };

  root.chars2js_str = function(jvm_carr, offset, count) {
    return root.bytes2str(jvm_carr.array).substr(offset != null ? offset : 0, count);
  };

  root.bytestr_to_array = function(bytecode_string) {
    var i, _i, _ref2, _results;
    _results = [];
    for (i = _i = 0, _ref2 = bytecode_string.length; _i < _ref2; i = _i += 1) {
      _results.push(bytecode_string.charCodeAt(i) & 0xFF);
    }
    return _results;
  };

  root.array_to_bytestr = function(bytecode_array) {
    return String.fromCharCode.apply(String, bytecode_array);
  };

  root.parse_flags = function(flag_byte) {
    return {
      "public": flag_byte & 0x1,
      "private": flag_byte & 0x2,
      "protected": flag_byte & 0x4,
      "static": flag_byte & 0x8,
      final: flag_byte & 0x10,
      synchronized: flag_byte & 0x20,
      "super": flag_byte & 0x20,
      volatile: flag_byte & 0x40,
      transient: flag_byte & 0x80,
      "native": flag_byte & 0x100,
      "interface": flag_byte & 0x200,
      abstract: flag_byte & 0x400,
      strict: flag_byte & 0x800
    };
  };

  root.escape_whitespace = function(str) {
    return str.replace(/\s/g, function(c) {
      switch (c) {
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        case "\v":
          return "\\v";
        case "\f":
          return "\\f";
        default:
          return c;
      }
    });
  };

  root.format_extra_info = function(entry) {
    var info, type;
    type = entry.type;
    info = typeof entry.deref === "function" ? entry.deref() : void 0;
    if (!info) {
      return "";
    }
    switch (type) {
      case 'Method':
      case 'InterfaceMethod':
        return "\t//  " + info["class"] + "." + info.sig;
      case 'Field':
        return "\t//  " + info["class"] + "." + info.name + ":" + info.type;
      case 'NameAndType':
        return "//  " + info.name + ":" + info.type;
      default:
        if (root.is_string(info)) {
          return "\t//  " + root.escape_whitespace(info);
        }
    }
  };

  root.BytesArray = (function() {

    function BytesArray(raw_array, start, end) {
      this.raw_array = raw_array;
      this.start = start != null ? start : 0;
      this.end = end != null ? end : this.raw_array.length;
      this._index = 0;
    }

    BytesArray.prototype.rewind = function() {
      return this._index = 0;
    };

    BytesArray.prototype.pos = function() {
      return this._index;
    };

    BytesArray.prototype.skip = function(bytes_count) {
      return this._index += bytes_count;
    };

    BytesArray.prototype.has_bytes = function() {
      return this.start + this._index < this.end;
    };

    BytesArray.prototype.get_uint = function(bytes_count) {
      var rv;
      rv = root.read_uint(this.raw_array.slice(this.start + this._index, this.start + this._index + bytes_count));
      this._index += bytes_count;
      return rv;
    };

    BytesArray.prototype.get_int = function(bytes_count) {
      var bytes_to_set;
      bytes_to_set = 32 - bytes_count * 8;
      return this.get_uint(bytes_count) << bytes_to_set >> bytes_to_set;
    };

    BytesArray.prototype.read = function(bytes_count) {
      var rv;
      rv = this.raw_array.slice(this.start + this._index, this.start + this._index + bytes_count);
      this._index += bytes_count;
      return rv;
    };

    BytesArray.prototype.peek = function() {
      return this.raw_array[this.start + this._index];
    };

    BytesArray.prototype.size = function() {
      return this.end - this.start - this._index;
    };

    BytesArray.prototype.splice = function(len) {
      var arr;
      arr = new root.BytesArray(this.raw_array, this.start + this._index, this.start + this._index + len);
      this._index += len;
      return arr;
    };

    return BytesArray;

  })();

  root.initial_value = function(type_str) {
    var _ref2;
    if (type_str === 'J') {
      return gLong.ZERO;
    } else if ((_ref2 = type_str[0]) === '[' || _ref2 === 'L') {
      return null;
    } else {
      return 0;
    }
  };

  root.is_string = function(obj) {
    return typeof obj === 'string' || obj instanceof String;
  };

  root.lookup_handler = function(handlers, object) {
    var handler, obj;
    obj = object;
    while (obj != null) {
      handler = handlers[obj.constructor.name];
      if (handler) {
        return handler;
      }
      obj = Object.getPrototypeOf(obj);
    }
    return null;
  };

  root.ext_classname = function(str) {
    return str.replace(/\//g, '.');
  };

  root.int_classname = function(str) {
    return str.replace(/\./g, '/');
  };

  root.bytes2str = function(bytes) {
    var char_array, idx, x, y, z;
    idx = 0;
    char_array = (function() {
      var _results;
      _results = [];
      while (idx < bytes.length) {
        x = bytes[idx++] & 0xff;
        if (x === 0) {
          break;
        }
        _results.push(String.fromCharCode(x <= 0x7f ? x : x <= 0xdf ? (y = bytes[idx++], ((x & 0x1f) << 6) + (y & 0x3f)) : (y = bytes[idx++], z = bytes[idx++], ((x & 0xf) << 12) + ((y & 0x3f) << 6) + (z & 0x3f))));
      }
      return _results;
    })();
    return char_array.join('');
  };

  root.last = function(array) {
    return array[array.length - 1];
  };

  root.SafeMap = (function() {

    function SafeMap() {
      this.cache = Object.create(null);
      this.proto_cache = void 0;
    }

    SafeMap.prototype.get = function(key) {
      if (this.cache[key] != null) {
        return this.cache[key];
      }
      if (key.toString() === '__proto__' && this.proto_cache !== void 0) {
        return this.proto_cache;
      }
      return void 0;
    };

    SafeMap.prototype.set = function(key, value) {
      if (key.toString() !== '__proto__') {
        return this.cache[key] = value;
      } else {
        return this.proto_cache = value;
      }
    };

    return SafeMap;

  })();

}).call(this);
