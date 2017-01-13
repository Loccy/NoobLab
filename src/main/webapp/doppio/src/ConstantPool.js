// Generated by CoffeeScript 1.3.3
(function() {
  var AbstractMethodFieldReference, ClassReference, ConstDouble, ConstFloat, ConstInt32, ConstLong, ConstString, ConstantPool, FieldReference, InterfaceMethodReference, MethodReference, MethodSignature, SimpleReference, StringReference, gLong, util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  gLong = require('../vendor/gLong.js');

  util = require('./util');

  "use strict";


  SimpleReference = (function() {

    function SimpleReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
    }

    SimpleReference.size = 1;

    SimpleReference.from_bytes = function(bytes_array, constant_pool) {
      var ref, value;
      value = bytes_array.get_uint(2);
      ref = new this(constant_pool, value);
      return ref;
    };

    SimpleReference.prototype.deref = function() {
      var pool_obj;
      pool_obj = this.constant_pool[this.value];
      return (typeof pool_obj.deref === "function" ? pool_obj.deref() : void 0) || pool_obj.value;
    };

    return SimpleReference;

  })();

  ClassReference = (function(_super) {

    __extends(ClassReference, _super);

    function ClassReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'class';
    }

    return ClassReference;

  })(SimpleReference);

  StringReference = (function(_super) {

    __extends(StringReference, _super);

    function StringReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'String';
    }

    return StringReference;

  })(SimpleReference);

  AbstractMethodFieldReference = (function() {

    function AbstractMethodFieldReference() {}

    AbstractMethodFieldReference.size = 1;

    AbstractMethodFieldReference.from_bytes = function(bytes_array, constant_pool) {
      var class_ref, ref, sig;
      class_ref = ClassReference.from_bytes(bytes_array, constant_pool);
      sig = SimpleReference.from_bytes(bytes_array, constant_pool);
      ref = new this(constant_pool, {
        class_ref: class_ref,
        sig: sig
      });
      return ref;
    };

    AbstractMethodFieldReference.prototype.deref = function() {
      var sig;
      sig = this.value.sig.deref();
      return {
        "class": this.value.class_ref.deref(),
        sig: sig.name + sig.type
      };
    };

    return AbstractMethodFieldReference;

  })();

  MethodReference = (function(_super) {

    __extends(MethodReference, _super);

    function MethodReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'Method';
    }

    return MethodReference;

  })(AbstractMethodFieldReference);

  InterfaceMethodReference = (function(_super) {

    __extends(InterfaceMethodReference, _super);

    function InterfaceMethodReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'InterfaceMethod';
    }

    return InterfaceMethodReference;

  })(AbstractMethodFieldReference);

  FieldReference = (function(_super) {

    __extends(FieldReference, _super);

    function FieldReference(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'Field';
    }

    FieldReference.prototype.deref = function() {
      var sig;
      sig = this.value.sig.deref();
      return {
        "class": this.value.class_ref.deref(),
        name: sig.name,
        type: sig.type
      };
    };

    return FieldReference;

  })(AbstractMethodFieldReference);

  MethodSignature = (function() {

    function MethodSignature(constant_pool, value) {
      this.constant_pool = constant_pool;
      this.value = value;
      this.type = 'NameAndType';
    }

    MethodSignature.size = 1;

    MethodSignature.from_bytes = function(bytes_array, constant_pool) {
      var meth_ref, ref, type_ref;
      meth_ref = StringReference.from_bytes(bytes_array, constant_pool);
      type_ref = StringReference.from_bytes(bytes_array, constant_pool);
      ref = new this(constant_pool, {
        meth_ref: meth_ref,
        type_ref: type_ref
      });
      return ref;
    };

    MethodSignature.prototype.deref = function() {
      return {
        name: this.value.meth_ref.deref(),
        type: this.value.type_ref.deref()
      };
    };

    return MethodSignature;

  })();

  ConstString = (function() {

    function ConstString(value) {
      this.value = value;
      this.type = 'Asciz';
    }

    ConstString.size = 1;

    ConstString.from_bytes = function(bytes_array) {
      var const_string, strlen, value;
      strlen = bytes_array.get_uint(2);
      value = util.bytes2str(bytes_array.read(strlen));
      const_string = new this(value);
      return const_string;
    };

    return ConstString;

  })();

  ConstInt32 = (function() {

    function ConstInt32(value) {
      this.value = value;
      this.type = 'int';
    }

    ConstInt32.size = 1;

    ConstInt32.from_bytes = function(bytes_array) {
      var int32, uint32, value;
      uint32 = bytes_array.get_uint(4);
      value = -(1 + ~uint32);
      int32 = new this(value);
      return int32;
    };

    return ConstInt32;

  })();

  ConstFloat = (function() {

    function ConstFloat(value) {
      this.value = value;
      this.type = 'float';
    }

    ConstFloat.size = 1;

    ConstFloat.from_bytes = function(bytes_array) {
      var float, uint32, value;
      uint32 = bytes_array.get_uint(4);
      value = util.intbits2float(uint32);
      float = new this(value);
      return float;
    };

    return ConstFloat;

  })();

  ConstLong = (function() {

    function ConstLong(value) {
      this.value = value;
      this.type = 'long';
    }

    ConstLong.size = 2;

    ConstLong.from_bytes = function(bytes_array) {
      var high, long, low, value;
      high = bytes_array.get_uint(4);
      low = bytes_array.get_uint(4);
      value = gLong.fromBits(low, high);
      long = new this(value);
      return long;
    };

    return ConstLong;

  })();

  ConstDouble = (function() {

    function ConstDouble(value) {
      this.value = value;
      this.type = 'double';
    }

    ConstDouble.size = 2;

    ConstDouble.from_bytes = function(bytes_array) {
      var double, uint32_a, uint32_b;
      uint32_a = bytes_array.get_uint(4);
      uint32_b = bytes_array.get_uint(4);
      double = new this(util.longbits2double(uint32_a, uint32_b));
      return double;
    };

    return ConstDouble;

  })();

  ConstantPool = (function() {

    function ConstantPool() {}

    ConstantPool.prototype.parse = function(bytes_array) {
      var constant_tags, idx, pool_obj, tag;
      constant_tags = {
        1: ConstString,
        3: ConstInt32,
        4: ConstFloat,
        5: ConstLong,
        6: ConstDouble,
        7: ClassReference,
        8: StringReference,
        9: FieldReference,
        10: MethodReference,
        11: InterfaceMethodReference,
        12: MethodSignature
      };
      this.cp_count = bytes_array.get_uint(2);
      this.constant_pool = {};
      idx = 1;
      while (idx < this.cp_count) {
        tag = bytes_array.get_uint(1);
        if (!((1 <= tag && tag <= 12))) {
          throw "invalid tag: " + tag;
        }
        pool_obj = constant_tags[tag].from_bytes(bytes_array, this.constant_pool);
        this.constant_pool[idx] = pool_obj;
        idx += constant_tags[tag].size;
      }
      return bytes_array;
    };

    ConstantPool.prototype.get = function(idx) {
      var _ref;
      return (function() {
        if ((_ref = this.constant_pool[idx]) != null) {
          return _ref;
        } else {
          throw new Error("Invalid constant_pool reference: " + idx);
        }
      }).call(this);
    };

    ConstantPool.prototype.each = function(fn) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.cp_count; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (i in this.constant_pool) {
          _results.push(fn(i, this.constant_pool[i]));
        }
      }
      return _results;
    };

    return ConstantPool;

  })();

  if (typeof module !== "undefined" && module !== null) {
    module.exports = ConstantPool;
  } else {
    window.ConstantPool = ConstantPool;
  }

}).call(this);