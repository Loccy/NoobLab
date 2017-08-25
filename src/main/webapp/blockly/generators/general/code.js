/**
 * @fileoverview Generating inline code block
 * @author Paul Neve (paul@paulneve.com)
 */
'use strict';

var language = "Pseudocode";
if (parent.$("div.parameter#language").text().trim().indexOf("python") != -1) language = "Python";
goog.provide('Blockly.'+language+'.code');
    
Blockly[language]['code_code'] = function(block) {    
    var code = block.getFieldValue("CODE");
    code = code.replace(/ ⏎ /g,"\n");
    return code+"\n";
}