// Couldn't find an official mode for codemirror for Basic.
//
// This is stolen from the Applesoft JS basic page
// http://www.calormen.com/applesoft/
//
// The code on that page is distributed under the Apache 2.0 licence
// http://www.apache.org/licenses/LICENSE-2.0
//
// I am assuming that this, as part of that app, is also Apache 2.

// Really just a lexer

CodeMirror.defineMode('basic', function(config, parserConfig) {

  var STATEMENT = 'basic-statement',
      OPERATOR = 'basic-operator',
      FUNCTION = 'basic-function',
      UNSUPPORTED = 'basic-unsupported';

  var reserved = {
    "ABS": FUNCTION,
    "AND": OPERATOR,
    "ASC": FUNCTION,
    "ATN": FUNCTION,
    "AT": STATEMENT,
    "CALL": STATEMENT,
    "CHR$": FUNCTION,
    "CLEAR": STATEMENT,
    "COLOR=": STATEMENT,
    "CONT": UNSUPPORTED,
    "COS": FUNCTION,
    "DATA": STATEMENT,
    "DEF": STATEMENT,
    "DEL": UNSUPPORTED,
    "DIM": STATEMENT,
    "DRAW": UNSUPPORTED,
    "END": STATEMENT,
    "EXP": FUNCTION,
    "FLASH": STATEMENT,
    "FN": STATEMENT,
    "FOR": STATEMENT,
    "FRE": FUNCTION,
    "GET": STATEMENT,
    "GOSUB": STATEMENT,
    "GOTO": STATEMENT,
    "GR": STATEMENT,
    "HCOLOR=": STATEMENT,
    "HGR2": STATEMENT,
    "HGR": STATEMENT,
    "HIMEM:": UNSUPPORTED,
    "HLIN": STATEMENT,
    "HOME": STATEMENT,
    "HPLOT": STATEMENT,
    "HTAB": STATEMENT,
    "IF": STATEMENT,
    "IN#": UNSUPPORTED,
    "INPUT": STATEMENT,
    "INT": FUNCTION,
    "INVERSE": STATEMENT,
    "LEFT$": FUNCTION,
    "LEN": FUNCTION,
    "LET": STATEMENT,
    "LIST": UNSUPPORTED,
    "LOAD": UNSUPPORTED,
    "LOG": FUNCTION,
    "LOMEM:": UNSUPPORTED,
    "MID$": FUNCTION,
    "NEW": UNSUPPORTED,
    "NEXT": STATEMENT,
    "NORMAL": STATEMENT,
    "NOTRACE": STATEMENT,
    "NOT": OPERATOR,
    "ONERR": STATEMENT,
    "ON": STATEMENT,
    "OR": OPERATOR,
    "PDL": FUNCTION,
    "PEEK": FUNCTION,
    "PLOT": STATEMENT,
    "POKE": STATEMENT,
    "POP": STATEMENT,
    "POS": FUNCTION,
    "PRINT": STATEMENT,
    "PR#": STATEMENT,
    "READ": STATEMENT,
    "RECALL": UNSUPPORTED,
    "REM": STATEMENT,
    "RESTORE": STATEMENT,
    "RESUME": STATEMENT,
    "RETURN": STATEMENT,
    "RIGHT$": FUNCTION,
    "RND": FUNCTION,
    "ROT=": UNSUPPORTED,
    "RUN": UNSUPPORTED,
    "SAVE": UNSUPPORTED,
    "SCALE=": UNSUPPORTED,
    "SCRN": FUNCTION,
    "SGN": FUNCTION,
    "SHLOAD": UNSUPPORTED,
    "SIN": FUNCTION,
    "SPC": FUNCTION,
    "SPEED=": STATEMENT,
    "SQR": FUNCTION,
    "STEP": STATEMENT,
    "STOP": STATEMENT,
    "STORE": UNSUPPORTED,
    "STR$": FUNCTION,
    "TAB": FUNCTION,
    "TAN": FUNCTION,
    "TEXT": STATEMENT,
    "THEN": STATEMENT,
    "TO": STATEMENT,
    "TRACE": STATEMENT,
    "USR": FUNCTION,
    "VAL": FUNCTION,
    "VLIN": STATEMENT,
    "VTAB": STATEMENT,
    "WAIT": UNSUPPORTED,
    "WHILE" : STATEMENT,
    "WEND" : STATEMENT,
    "XDRAW": UNSUPPORTED,
    "&": UNSUPPORTED,
    "?": STATEMENT
  };
  var reservedKeys = (function() {
    // Need longer stems first: ATN/AT, ONERR/ON, NOTRACE/NOT
    var keys = [], name;
    for (name in reserved) {
      if (Object.prototype.hasOwnProperty.call(reserved, name)) {
        keys.push(name);
      }
    }
    keys.sort();
    keys.reverse();
    return keys;
  } ());

  // states are 'normal' and 'comment'

  return {
    startState: function() {
      return {
        state: 'normal'
      };
    },

    token: function(stream, state) {
      var name, i;

      if (state.state === 'normal') {
        if (stream.eatSpace()) {
          return null;
        }
        else if (/[0-9.]/.test(stream.peek())) {
          stream.eatWhile(/[0-9]/);
          if (stream.peek() === '.') {
            stream.next();
            stream.eatWhile(/[0-9]/);
          }
          if (/[eE]/.test(stream.peek())) {
            stream.next();
            stream.eatWhile(/[ \u00a0]/);
            if (stream.peek() === '-' || stream.peek() === '+') {
              stream.next();
            }
            stream.eatWhile(/[ \u00a0]/);
            stream.eatWhile(/[0-9]/);
          }
          return 'basic-number';
        }
        else if (stream.peek() === '"') {
          stream.next();
          while (!stream.eol()) {
            if (stream.next() === '"') {
              break;
            }
          }
          return 'basic-string';
        }
        else if (/[;=<>+\-*\/\^(),]/.test(stream.peek())) {
          stream.next();
          return 'basic-operator';
        }
        else if (stream.peek() === ':') {
          stream.next();
          return 'basic-separator';
        }
        else if (stream.match('REM', true, true)) {
          stream.eatWhile(/[ \u00a0]/);
          if (!stream.eol()) {
            state.state = 'comment';
          }
          return 'basic-statement';
        }

        // TODO: Applesoft-style space ignoring within reserved words

        for (i = 0; i < reservedKeys.length; i += 1) {
          name = reservedKeys[i];
          if (stream.match(name, true, true)) {
            return reserved[name];
          }
        }

        if (/[A-Za-z]/.test(stream.peek())) {
          stream.next();
          stream.eatWhile(/[A-Za-z0-9]/);
          if (stream.peek() === '$' || stream.peek() === '%') {
            stream.next();
          }
          return 'basic-identifier';
        }

        stream.next();
        return 'basic-error';
      }
      else if (state.state === 'comment') {
        while (!stream.eol()) {
          stream.next();
        }
        state.state = 'normal';
        return 'basic-comment';
      }
      else {
        throw 'WTF!?';
      }


    }
  };
});

CodeMirror.defineMIME("text/x-basic", "basic");
CodeMirror.defineMIME("text/x-applesoft", "basic");


