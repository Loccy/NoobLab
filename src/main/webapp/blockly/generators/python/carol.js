/* Carol code */

Blockly.Python['carol_move'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'carol.move()\n';
  return code;
};

Blockly.Python['carol_turnLeft'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'carol.turnLeft()\n';
  return code;
};

Blockly.Python['carol_pickUp'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'carol.pickUp()\n';
  return code;
};

Blockly.Python['carol_putDown'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'carol.putDown()\n';
  return code;
};

Blockly.Python['carol_isBlocked'] = function(block) {
  var code = 'carol.isBlocked()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['carol_isNotBlocked'] = function(block) {
  var code = 'carol.isNotBlocked()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['carol_isAtGoal'] = function(block) {
  var code = 'carol.atGoal()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['carol_isNotAtGoal'] = function(block) {
  var code = 'carol.notAtGoal()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['carol_isPickupVisible'] = function(block) {
  var code = 'carol.isPickupVisible()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['carol_distanceToPickup'] = function(block) {
  var code = 'carol.distanceToPickup()';
  return [code, Blockly.Python.ORDER_NONE];
};