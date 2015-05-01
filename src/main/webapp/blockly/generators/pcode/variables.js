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
 * @fileoverview Generating Pseudocode for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Pseudocode.variables');

goog.require('Blockly.Pseudocode');


Blockly.Pseudocode['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Pseudocode.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Pseudocode.ORDER_ATOMIC];
};

Blockly.Pseudocode['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Pseudocode.valueToCode(block, 'VALUE',
      Blockly.Pseudocode.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.Pseudocode.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return "set "+varName + ' = ' + argument0 + '\n';
};

/* Added by PN for NoobLab */

Blockly.Pseudocode['variables_input'] = function(block) {
  var variable_var = Blockly.Pseudocode.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var code = "get "+variable_var+"\n";
  return code;
};