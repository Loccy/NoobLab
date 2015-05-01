/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Pseudocode for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Pseudocode.loops');

goog.require('Blockly.Pseudocode');


Blockly.Pseudocode['controls_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var loopVar = Blockly.Pseudocode.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' = 1 to ' +repeats+"\n";
  code += branch + '\n';
  code += "endfor\n";
  return code;
};
/*
Blockly.Pseudocode['controls_repeat_ext'] = function(block) {
  // Repeat n times (external number).
  var repeats = Blockly.Pseudocode.valueToCode(block, 'TIMES',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var code = '';
  var loopVar = Blockly.Pseudocode.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.Pseudocode.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (var ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
}; */

Blockly.Pseudocode['controls_while'] = function(block) {
  // Do while loop.
  var until = false;
  var argument0 = Blockly.Pseudocode.valueToCode(block, 'BOOL',
      until ? Blockly.Pseudocode.ORDER_LOGICAL_NOT :
      Blockly.Pseudocode.ORDER_NONE) || 'false';
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while ' + argument0 + '\n' + branch + 'endwhile\n';
};

Blockly.Pseudocode['controls_repeatUntil'] = function(block) {
  // Do while/until loop.
  var until = false;
  var argument0 = Blockly.Pseudocode.valueToCode(block, 'BOOL',
      until ? Blockly.Pseudocode.ORDER_LOGICAL_NOT :
      Blockly.Pseudocode.ORDER_NONE) || 'false';
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'repeat ' + '\n' + branch + 'until '+argument0 + '\n';
};

Blockly.Pseudocode['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Pseudocode.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Pseudocode.valueToCode(block, 'FROM',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Pseudocode.valueToCode(block, 'TO',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.Pseudocode.valueToCode(block, 'BY',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var code;

    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for ' + variable0 + ' = ' + argument0 + ' to ' + argument1;
    var step = Math.abs(parseFloat(increment));
    if (step != 1) {
      code += " step "+ (up ? '' : '-') + step;
    }
    code += '\n' + branch + 'endfor\n';
	
	return code;
};
/*
Blockly.Pseudocode['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Pseudocode.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Pseudocode.valueToCode(block, 'LIST',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.Pseudocode.statementToCode(block, 'DO');
  if (Blockly.Pseudocode.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudocode.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var indexVar = Blockly.Pseudocode.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.Variables.NAME_TYPE);
  branch = Blockly.Pseudocode.INDENT + variable0 + ' = ' + argument0 + '[' + indexVar + '];\n' +
      branch;
  var code = 'for (var ' + indexVar + ' in  ' + argument0 + ') {\n' +
      branch + '}\n';
  return code;
};

Blockly.Pseudocode['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
}; */
