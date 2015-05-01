/* Carol blocks */

'use strict';

goog.provide('Blockly.Pseudocode.carol');

goog.require('Blockly.Pseudocode');

Blockly.Blocks['carol_move'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("move");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_turnLeft'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("turn left");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_pickUp'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("pick up");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_putDown'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("put down");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_isBlocked'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carol is blocked?");
    this.setOutput(true, "Boolean");
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_isNotBlocked'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carol is not blocked?");
    this.setOutput(true, "Boolean");
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_isAtGoal'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carol is at the goal?");
    this.setOutput(true, "Boolean");
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_isNotAtGoal'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carol is not at the goal?");
    this.setOutput(true, "Boolean");
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_isPickupVisible'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carol can see an item to pick up?");
    this.setOutput(true, "Boolean");
    this.setTooltip('');
  }
};

Blockly.Blocks['carol_distanceToPickup'] = {
  init: function() {
    this.setColour(15);
    this.appendDummyInput()
        .appendField("distance to visible item");
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

