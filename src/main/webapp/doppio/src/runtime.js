// Generated by CoffeeScript 1.3.3
// PNMOD
stopRequested = false;

(function() {
  var ClassFile, ClassState, JavaArray, JavaClassObject, JavaObject, Method, ReturnException, YieldIOException, c2t, debug, error, gLong, java_throw, log, root, thread_name, trace, types, util, vtrace, _, _ref, _ref1, _ref2, _ref3,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : (_ref = window.runtime) != null ? _ref : window.runtime = {};

  _ = require('../vendor/_.js');

  gLong = require('../vendor/gLong.js');

  util = require('./util');

  types = require('./types');

  ClassFile = require('./ClassFile');

  _ref1 = require('./logging'), log = _ref1.log, vtrace = _ref1.vtrace, trace = _ref1.trace, debug = _ref1.debug, error = _ref1.error;

  _ref2 = require('./exceptions'), java_throw = _ref2.java_throw, YieldIOException = _ref2.YieldIOException, ReturnException = _ref2.ReturnException;

  _ref3 = require('./java_object'), JavaObject = _ref3.JavaObject, JavaClassObject = _ref3.JavaClassObject, JavaArray = _ref3.JavaArray, thread_name = _ref3.thread_name;

  c2t = types.c2t;

  Method = require('./methods').Method;

  "use strict";


  root.CallStack = (function() {

    function CallStack(initial_stack) {
      this._cs = [root.StackFrame.fake_frame('$bootstrap')];
      if (initial_stack != null) {
        this._cs[0].stack = initial_stack;
      }
    }

    CallStack.prototype.length = function() {
      return this._cs.length;
    };

    CallStack.prototype.push = function(sf) {
      return this._cs.push(sf);
    };

    CallStack.prototype.pop = function() {
      return this._cs.pop();
    };

    CallStack.prototype.curr_frame = function() {
      return util.last(this._cs);
    };

    CallStack.prototype.get_caller = function(frames_to_skip) {
      return this._cs[this._cs.length - 1 - frames_to_skip];
    };

    return CallStack;

  })();

  root.StackFrame = (function() {

    function StackFrame(method, locals, stack) {
      this.method = method;
      this.locals = locals;
      this.stack = stack;
      this.pc = 0;
      this.runner = null;
      this.name = this.method.full_signature();
    }

    StackFrame.fake_frame = function(name) {
      var sf;
      sf = new root.StackFrame(new Method(c2t(name)), [], []);
      sf.fake = true;
      return sf;
    };

    return StackFrame;

  })();

  ClassState = (function() {

    function ClassState(loader) {
      this.loader = loader;
      this.fields = null;
    }

    return ClassState;

  })();

  root.RuntimeState = (function() {
    var run_count;

    run_count = 0;

    function RuntimeState(print, async_input, read_classfile) {
      this.print = print;
      this.async_input = async_input;
      this.read_classfile = read_classfile;
      this.startup_time = gLong.fromNumber((new Date).getTime());
      this.run_stamp = ++run_count;
      this.class_states = Object.create(null);
      this.class_states['$bootstrap'] = new ClassState(null);
      this.jclass_obj_pool = Object.create(null);
      this.loaded_classes = Object.create(null);
      this.mem_start_addrs = [1];
      this.mem_blocks = {};
      this.high_oref = 1;
      this.string_pool = new util.SafeMap;
      this.lock_refs = {};
      this.lock_counts = {};
      this.waiting_threads = {};
      this.thread_pool = [];
      this.curr_thread = {
        $meta_stack: new root.CallStack(),
        main: true
      };
    }

    RuntimeState.prototype.init_threads = function() {
      var group, my_sf,
        _this = this;
      my_sf = this.curr_frame();
      this.push((group = this.init_object('java/lang/ThreadGroup')));
      this.method_lookup({
        "class": 'java/lang/ThreadGroup',
        sig: '<init>()V'
      }).setup_stack(this);
      return my_sf.runner = function() {
        var ct;
        ct = null;
        my_sf.runner = function() {
          my_sf.runner = null;
          ct.$meta_stack = _this.meta_stack();
          ct.main = true;
          _this.curr_thread = ct;
          _this.curr_thread.$isAlive = true;
          _this.thread_pool.push(_this.curr_thread);
          _this.class_states['java/lang/Thread'].fields.threadInitNumber = 1;
          return debug("### finished thread init ###");
        };
        return ct = _this.init_object('java/lang/Thread', {
          'java/lang/Thread/name': _this.init_carr('main'),
          'java/lang/Thread/priority': 1,
          'java/lang/Thread/group': group,
          'java/lang/Thread/threadLocals': null
        });
      };
    };

    RuntimeState.prototype.meta_stack = function() {
      return this.curr_thread.$meta_stack;
    };

    RuntimeState.prototype.init_system_class = function() {
      var my_sf;
      my_sf = this.curr_frame();
      this.class_lookup(c2t('java/lang/System')).methods['initializeSystemClass()V'].setup_stack(this);
      return my_sf.runner = function() {
        my_sf.runner = null;
        this.system_initialized = true;
        return debug("### finished system class initialization ###");
      };
    };

    RuntimeState.prototype.init_args = function(initial_args) {
      var a, args;
      args = new JavaArray(this, c2t('[Ljava/lang/String;'), (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = initial_args.length; _i < _len; _i++) {
          a = initial_args[_i];
          _results.push(this.init_string(a));
        }
        return _results;
      }).call(this));
      this.curr_thread.$meta_stack = new root.CallStack([args]);
      return debug("### finished runtime state initialization ###");
    };

    RuntimeState.prototype.show_state = function() {
      var cf, l, s, x, _ref4;
      cf = this.curr_frame();
      if (cf != null) {
        s = (function() {
          var _i, _len, _ref4, _results;
          _ref4 = cf.stack;
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            x = _ref4[_i];
            _results.push((x != null ? x.ref : void 0) != null ? x.ref : x);
          }
          return _results;
        })();
        l = (function() {
          var _i, _len, _ref4, _results;
          _ref4 = cf.locals;
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            x = _ref4[_i];
            _results.push((x != null ? x.ref : void 0) != null ? x.ref : x);
          }
          return _results;
        })();
        return debug("showing current state: method '" + ((_ref4 = cf.method) != null ? _ref4.name : void 0) + "', stack: [" + s + "], locals: [" + l + "]");
      } else {
        return debug("current frame is undefined. meta_stack: " + (this.meta_stack()));
      }
    };

    RuntimeState.prototype.choose_next_thread = function(blacklist) {
      var b, bl, key, t, _i, _j, _len, _len1, _ref4, _ref5;
      if (blacklist == null) {
        blacklist = [];
        _ref4 = this.waiting_threads;
        for (key in _ref4) {
          bl = _ref4[key];
          for (_i = 0, _len = bl.length; _i < _len; _i++) {
            b = bl[_i];
            blacklist.push(b);
          }
        }
      }
      _ref5 = this.thread_pool;
      for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
        t = _ref5[_j];
        if (!(t !== this.curr_thread && t.$isAlive)) {
          continue;
        }
        if (__indexOf.call(blacklist, t) >= 0) {
          continue;
        }
        debug("TE(choose_next_thread): choosing thread " + (thread_name(this, t)));
        return t;
      }
      debug("TE(choose_next_thread): no thread found, sticking with curr_thread");
      return this.curr_thread;
    };

    RuntimeState.prototype.wait = function(monitor, yieldee) {
      debug("TE(wait): waiting " + (thread_name(this, this.curr_thread)) + " on lock " + monitor.ref);
      if (this.waiting_threads[monitor] != null) {
        this.waiting_threads[monitor].push(this.curr_thread);
      } else {
        this.waiting_threads[monitor] = [this.curr_thread];
      }
      if (yieldee == null) {
        yieldee = this.choose_next_thread(this.waiting_threads[monitor]);
      }
      return this["yield"](yieldee);
    };

    RuntimeState.prototype["yield"] = function(yieldee) {
      var new_thread_sf, old_thread, old_thread_sf,
        _this = this;
      if (yieldee == null) {
        yieldee = this.choose_next_thread();
      }
      debug("TE(yield): yielding " + (thread_name(this, this.curr_thread)) + " to " + (thread_name(this, yieldee)));
      old_thread_sf = this.curr_frame();
      old_thread = this.curr_thread;
      this.curr_thread = yieldee;
      new_thread_sf = this.curr_frame();
      new_thread_sf.runner = function() {
        return _this.meta_stack().pop();
      };
      old_thread_sf.runner = function() {
        return _this.meta_stack().pop();
      };
      throw ReturnException;
    };

    RuntimeState.prototype.curr_frame = function() {
      return this.meta_stack().curr_frame();
    };

    RuntimeState.prototype.cl = function(idx) {
      return this.curr_frame().locals[idx];
    };

    RuntimeState.prototype.put_cl = function(idx, val) {
      return this.curr_frame().locals[idx] = val;
    };

    RuntimeState.prototype.put_cl2 = function(idx, val) {
      this.put_cl(idx, val);
      return (typeof UNSAFE !== "undefined" && UNSAFE !== null) || this.put_cl(idx + 1, null);
    };

    RuntimeState.prototype.push = function(arg) {
      return this.curr_frame().stack.push(arg);
    };

    RuntimeState.prototype.push2 = function(arg1, arg2) {
      return this.curr_frame().stack.push(arg1, arg2);
    };

    RuntimeState.prototype.push_array = function(args) {
      var cs;
      cs = this.curr_frame().stack;
      return Array.prototype.push.apply(cs, args);
    };

    RuntimeState.prototype.pop = function() {
      return this.curr_frame().stack.pop();
    };

    RuntimeState.prototype.pop2 = function() {
      this.pop();
      return this.pop();
    };

    RuntimeState.prototype.curr_pc = function() {
      return this.curr_frame().pc;
    };

    RuntimeState.prototype.goto_pc = function(pc) {
      return this.curr_frame().pc = pc;
    };

    RuntimeState.prototype.inc_pc = function(n) {
      return this.curr_frame().pc += n;
    };

    RuntimeState.prototype.check_null = function(obj) {
      if (obj == null) {
        java_throw(this, 'java/lang/NullPointerException', '');
      }
      return obj;
    };

    RuntimeState.prototype.heap_newarray = function(type, len) {
      var i;
      if (len < 0) {
        java_throw(this, 'java/lang/NegativeArraySizeException', "Tried to init [" + type + " array with length " + len);
      }
      if (type === 'J') {
        return new JavaArray(this, c2t("[J"), (function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; _i < len; i = _i += 1) {
            _results.push(gLong.ZERO);
          }
          return _results;
        })());
      } else if (type[0] === 'L') {
        return new JavaArray(this, c2t("[" + type), (function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; _i < len; i = _i += 1) {
            _results.push(null);
          }
          return _results;
        })());
      } else {
        return new JavaArray(this, c2t("[" + type), (function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; _i < len; i = _i += 1) {
            _results.push(0);
          }
          return _results;
        })());
      }
    };

    RuntimeState.prototype.static_get = function(field_spec) {
      var f, _base, _name, _ref4;
      f = this.field_lookup(field_spec);
      return (_ref4 = (_base = this.class_states[f.class_type.toClassString()].fields)[_name = f.name]) != null ? _ref4 : _base[_name] = util.initial_value(f.raw_descriptor);
    };

    RuntimeState.prototype.static_put = function(field_spec) {
      var f, val, _ref4;
      val = (_ref4 = field_spec.type) === 'J' || _ref4 === 'D' ? this.pop2() : this.pop();
      f = this.field_lookup(field_spec);
      return this.class_states[f.class_type.toClassString()].fields[f.name] = val;
    };

    RuntimeState.prototype.init_object = function(cls, obj) {
      var type;
      type = c2t(cls);
      return new JavaObject(this, type, this.class_lookup(type), obj);
    };

    RuntimeState.prototype.init_array = function(cls, obj) {
      var type;
      type = c2t(cls);
      return new JavaArray(this, type, obj);
    };

    RuntimeState.prototype.init_string = function(str, intern) {
      var carr, jvm_str, s, type;
      if (intern == null) {
        intern = false;
      }
      if (intern && ((s = this.string_pool.get(str)) != null)) {
        return s;
      }
      carr = this.init_carr(str);
      type = c2t('java/lang/String');
      jvm_str = new JavaObject(this, type, this.class_lookup(type), {
        'java/lang/String/value': carr,
        'java/lang/String/count': str.length
      });
      if (intern) {
        this.string_pool.set(str, jvm_str);
      }
      return jvm_str;
    };

    RuntimeState.prototype.init_carr = function(str) {
      var i;
      return new JavaArray(this, c2t('[C'), (function() {
        var _i, _ref4, _results;
        _results = [];
        for (i = _i = 0, _ref4 = str.length; _i < _ref4; i = _i += 1) {
          _results.push(str.charCodeAt(i));
        }
        return _results;
      })());
    };

    RuntimeState.prototype.jclass_obj = function(type, dyn) {
      var etype, file, jco;
      if (dyn == null) {
        dyn = false;
      }
      jco = this.jclass_obj_pool[type];
      if (jco === 'not found') {
        etype = dyn ? 'ClassNotFoundException' : 'NoClassDefFoundError';
        java_throw(this, "java/lang/" + etype, type.toClassString());
      } else if (jco === void 0) {
        this.jclass_obj_pool[type] = 'not found';
        file = type instanceof types.PrimitiveType ? null : this.load_class(type, dyn);
        this.jclass_obj_pool[type] = jco = new JavaClassObject(this, type, file);
      }
      return jco;
    };

    RuntimeState.prototype.load_class = function(type, dyn) {
      var class_file, cls, defining_class, defining_class_loader, msg, wrong_name, _ref4;
      cls = type.toClassString();
      if (this.loaded_classes[cls] == null) {
        if (type instanceof types.ArrayType) {
          this.loaded_classes[cls] = ClassFile.for_array_type(type);
          if (type.component_type instanceof types.PrimitiveType) {
            this.class_states[cls] = new ClassState(null);
          } else {
            this.load_class(type.component_type, dyn);
            this.class_states[cls] = new ClassState(this.class_states[type.component_type.toClassString()].loader);
          }
        } else {
          defining_class = this.curr_frame().method.class_type.toClassString();
          defining_class_loader = (_ref4 = this.class_states[defining_class]) != null ? _ref4.loader : void 0;
          if (defining_class_loader != null) {
            this.meta_stack().push(root.StackFrame.fake_frame('custom_class_loader'));
            this.push2(defining_class_loader, this.init_string(util.ext_classname(cls)));
            this.method_lookup({
              "class": defining_class_loader.type.toClassString(),
              sig: 'loadClass(Ljava/lang/String;)Ljava/lang/Class;'
            }).setup_stack(this);
            if (!this.run_until_finished((function() {}), (function() {}), true)) {
              throw 'Error in class initialization';
            }
            this.meta_stack().pop();
          } else {
            this.class_states[cls] = new ClassState(null);
            class_file = this.read_classfile(cls);
            if (!(class_file != null) || (wrong_name = class_file.this_class.toClassString() !== cls)) {
              msg = cls;
              if (wrong_name) {
                msg += " (wrong name: " + (class_file.this_class.toClassString()) + ")";
              }
              if (dyn) {
                java_throw(this, 'java/lang/ClassNotFoundException', msg);
              } else {
                java_throw(this, 'java/lang/NoClassDefFoundError', msg);
              }
            }
            this.loaded_classes[cls] = class_file;
          }
        }
      }
      return this.loaded_classes[cls];
    };

    RuntimeState.prototype.class_lookup = function(type, dyn) {
      var c, class_file, cls, component, _ref4;
      if (!(type instanceof types.Type)) {
        (typeof UNSAFE !== "undefined" && UNSAFE !== null) || (function() {
          throw new Error("class_lookup needs a type object, got " + (typeof type) + ": " + type);
        })();
      }
      if (type instanceof types.PrimitiveType) {
        (typeof UNSAFE !== "undefined" && UNSAFE !== null) || (function() {
          throw new Error("class_lookup was passed a PrimitiveType");
        })();
      }
      class_file = this.load_class(type, dyn);
      cls = type.toClassString();
      if (this.class_states[cls].fields == null) {
        trace("initializing class: " + cls);
        this.class_states[cls].fields = Object.create(null);
        if (type instanceof types.ArrayType) {
          component = type.component_type;
          if (component instanceof types.ArrayType || component instanceof types.ClassType) {
            this.class_lookup(component, dyn);
          }
        } else {
          c = this.class_states[cls];
          if (class_file.super_class) {
            this.class_lookup(class_file.super_class, dyn);
          }
          this.meta_stack().push(root.StackFrame.fake_frame('class_lookup'));
          if ((_ref4 = class_file.methods['<clinit>()V']) != null) {
            _ref4.setup_stack(this);
          }
          if (!this.run_until_finished((function() {}), (function() {}), true)) {
            throw 'Error in class initialization';
          }
          this.meta_stack().pop();
        }
      }
      return class_file;
    };

    RuntimeState.prototype.define_class = function(cls, data, loader) {
      var class_file, type;
      class_file = new ClassFile(data);
      this.class_states[cls] = new ClassState(loader);
      if (class_file.super_class) {
        this.class_lookup(class_file.super_class);
      }
      this.loaded_classes[cls] = class_file;
      type = c2t(cls);
      return this.jclass_obj_pool[type] = new JavaClassObject(this, type, class_file);
    };

    RuntimeState.prototype.method_lookup = function(method_spec) {
      var cls, method, type;
      type = c2t(method_spec["class"]);
      cls = this.class_lookup(type);
      method = cls.method_lookup(this, method_spec);
      if (method != null) {
        return method;
      }
      return java_throw(this, 'java/lang/NoSuchMethodError', "No such method found in " + method_spec["class"] + ": " + method_spec.sig);
    };

    RuntimeState.prototype.field_lookup = function(field_spec) {
      var cls, field;
      cls = this.class_lookup(c2t(field_spec["class"]));
      field = cls.field_lookup(this, field_spec);
      if (field != null) {
        return field;
      }
      return java_throw(this, 'java/lang/NoSuchFieldError', "No such field found in " + field_spec["class"] + ": " + field_spec.name);
    };

    RuntimeState.prototype.block_addr = function(address) {
      var addr, block_addr, _i, _len, _ref4;
      address = address.toNumber();
      block_addr = this.mem_start_addrs[0];
      _ref4 = this.mem_start_addrs.slice(1);
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        addr = _ref4[_i];
        if (address < addr) {
          return block_addr;
        }
        block_addr = addr;
      }
      return (typeof UNSAFE !== "undefined" && UNSAFE !== null) || (function() {
        throw new Error("Invalid memory access at " + address);
      })();
    };

    RuntimeState.prototype.handle_toplevel_exception = function(e, done_cb, no_threads) {
      var _this = this;
      if (e.toplevel_catch_handler != null) {
        this.run_until_finished((function() {
          return e.toplevel_catch_handler(_this);
        }), done_cb, no_threads);
      } else {
        error("\nInternal JVM Error:", e);
        if ((e != null ? e.stack : void 0) != null) {
          error(e.stack);
        }
        this.show_state();
        if (typeof done_cb === "function") {
          done_cb();
        }
      }
      return false;
    };

    RuntimeState.prototype.run_until_finished = function(setup_fn, done_cb, no_threads) {
      var retval, sf, tos,
        _this = this;
      if (no_threads == null) {
        no_threads = false;
      }
      try {
        setup_fn();
        while (true) {
          sf = this.curr_frame();
          while (sf.runner != null) {
            sf.runner();
            sf = this.curr_frame();
            // PNMOD
            if (stopRequested)
            {
                stopRequested = false;
                java_throw(this, 'java/lang/Exception', "BREAKBREAKBREAK");
            }
          }
          if (no_threads || this.thread_pool.length <= 1) {
            break;
          }
          debug("TE(toplevel): finished thread " + (thread_name(this, this.curr_thread)));
          this.curr_thread.$isAlive = false;
          this.thread_pool.splice(this.thread_pool.indexOf(this.curr_thread), 1);
          this.curr_thread = this.choose_next_thread();
        }
        if (typeof done_cb === "function") {
          done_cb();
        }
        return true;
      } catch (e) {
        if (e === 'Error in class initialization') {
          return false;
        } else if (e === ReturnException) {
          return this.run_until_finished((function() {}), done_cb, no_threads);
        } else if (e instanceof YieldIOException) {
          retval = null;
          e.condition(function() {
            return retval = _this.run_until_finished((function() {}), done_cb, no_threads);
          });
          return retval;
        } else {
          if ((e.method_catch_handler != null) && this.meta_stack().length() > 1) {
            tos = true;
            while (!e.method_catch_handler(this, this.curr_frame().method, tos)) {
              tos = false;
              if (this.meta_stack().length() === 1) {
                return this.handle_toplevel_exception(e, done_cb, no_threads);
              } else {
                this.meta_stack().pop();
              }
            }
            return this.run_until_finished((function() {}), done_cb, no_threads);
          } else {
            while (this.meta_stack().length() > 1) {
              this.meta_stack().pop();
            }
            return this.handle_toplevel_exception(e, done_cb, no_threads);
          }
        }
      }
    };

    return RuntimeState;

  })();

}).call(this);