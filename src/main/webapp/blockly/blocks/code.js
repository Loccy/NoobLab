/**
 * @fileoverview Code blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author paul@paulneve.com (Paul Neve)
 */
'use strict';

goog.provide('Blockly.Blocks.code');  // Deprecated
goog.provide('Blockly.Code.code');

goog.require('Blockly.Blocks');

Blockly.PN = {
    codeBlocks : []
};

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Block for code..
  {
    "type": "code_code",
    "message0": "Code %1",
    "args0": [{
      "type": "field_input",
      "name": "CODE",
      "text": "..."
    }],    
    "colour": "190",
    "previousStatement": null,
    "nextStatement": null,
    "helpUrl": "http://nohelp.com",
    "tooltip": "Insert text-based code",
    "extensions": ["parent_tooltip_when_inline"],
    "mutator" : "checkCodeEdit"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)


// We hijack the mutator to dom call - at this point the block should have
// loaded and we can sneak an onclick onto the input field
Blockly.Extensions.registerMutator('checkCodeEdit',
{
    mutationToDom: function(x) {
        if (!this.clickhook)
        {
            this.clickhook = true;
            var block = this;            
            var clickable = parent.$(block.svgGroup_).find(".blocklyEditableText").get(0);                        
            clickable.onclick = function(event) {                
                var current = block.getFieldValue('CODE');
                current = current.replace(/ ⏎ /g,"\n");
                if (current == "...") current = "";
                // fade out blockly in our page
                var oldEditor = parent.editor.getValue();                
                parent.$("iframe#code-blockly").hide();                
                parent.$("div#code-main").show();
                parent.editor.setValue(current);
                parent.editor.refresh();
                parent.editor.focus();
                var oldTitle = parent.$("div#code-titlebar").clone(true,true);
                parent.$("div#code-titlebar").html('<div style="float: left"><b>EDITING CODE BLOCK</b></div>');
                parent.$("div#code-titlebar").css({
                    "text-align":"right",
                    "padding-left" : "1em",
                    "padding-right" : "1em",
                    "height" : "auto",
                    "font-size" : "100%",
                    "position" : "relative"
                });
                parent.$("div#code-titlebar div").css({
                    "position":"absolute",
                    "margin-top":"-0.5em",
                    "top":"50%"
                });
                parent.$("div#code-titlebar").append('<button>OK</button>&nbsp;');
                parent.$("div#code-titlebar").append('<button>Cancel</button>');
                parent.$("div#code-titlebar button").eq(0).click(function(){                    
                    var result = parent.editor.getValue();
                    parent.editor.setValue(current);                       
                    // need to escape returns...
                    result = result.replace(/\n/g," ⏎ ");
                    
                    document.querySelector("input.blocklyHtmlInput").value = result;                        
                    block.setFieldValue(result,"CODE");
                    Blockly.WidgetDiv.hide();
                    parent.$("iframe#code-blockly").show();                
                    parent.$("div#code-main").hide();
                    parent.$("div#code-titlebar").replaceWith(oldTitle);
                    block.render();
                });
                parent.$("div#code-titlebar button").eq(1).click(function(){                    
                    parent.editor.setValue(current);                    
                    Blockly.WidgetDiv.hide();
                    parent.$("iframe#code-blockly").show();                
                    parent.$("div#code-main").hide();
                    parent.$("div#code-titlebar").replaceWith(oldTitle);                    
                    block.render();
                });
            }            
        }
    },
    domToMutation: function(xmlElement) {}
},
function() {
});
