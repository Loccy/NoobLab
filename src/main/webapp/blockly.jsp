<%-- 
    Document   : blockly
    Created on : May 19, 2014, 4:35:11 PM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="blockly/blockly_compressed.js"></script>

        <script type="text/javascript" src="blockly/blocks/colour.js"></script>  
        <script type="text/javascript" src="blockly/blocks/logic.js"></script>  
        <script type="text/javascript" src="blockly/blocks/math.js"></script>  
        <script type="text/javascript" src="blockly/blocks/text.js"></script>  
        <script type="text/javascript" src="blockly/blocks/loops.js"></script>  
        <script type="text/javascript" src="blockly/blocks/procedures.js"></script>  
        <script type="text/javascript" src="blockly/blocks/variables.js"></script>
        <script type="text/javascript" src="blockly/blocks/carol.js"></script>  

        <script type="text/javascript" src="blockly/generators/${param.language}.js"></script>
        <script type="text/javascript" src="blockly/generators/${param.language}/colour.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/logic.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/math.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/text.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/loops.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/procedures.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/variables.js"></script>  
        <script type="text/javascript" src="blockly/generators/${param.language}/carol.js"></script>
        <script type="text/javascript" src="blockly/msg/js/en.js"></script>
        <style>
            html, body {
                background-color: #fff;
                margin: 0;
                padding: 0;
                overflow: hidden;
                height: 100%;
            }
            .blocklySvg {
                height: 100%;
                width: 100%;
            }
            .blocklyTreeLabel {
        	font-size: 12px !important;
                font-family: Tahoma, Arial, sans-serif !important;
            }
            .blocklyTreeRow {
                margin-bottom : 0px !important;
            }
            .blocklyText {
                font-size: 12px !important;
                font-family: Tahoma, Arial, sans-serif !important;
            }
            .blocklyToolboxDiv {
                width : 190px !important;
            }
            #blocklyCodePreview {
             padding: 3px; 
             font-family: Tahoma, Arial, sans-serif; 
             font-size: 11px; 
             color : #666666;
             position: absolute;
             bottom: 8px; left: 5px; right: 5px; top: 210px; 
             overflow: auto; 
             border: 1px solid #888888; 
             white-space: nowrap; 
             background-color: #EEEEEE;
            }
            #blocklyCodePreview div {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            #blocklyCodePreviewTitlebar { 
             position: absolute;
             line-height: 20px;
             left: 5px; right: 5px; top: 190px;
             height : 20px;
             background-color: #888888;
             color : white;
             font-family: Tahoma, Arial, sans-serif; 
             font-size: 11px; 
             font-weight : bolder;
             text-align : center;
            }
            .error {
                background-color: #FFB2B2 !important;
            }
            .cblineno {
                float : left;
                background-color: white;
                width : 2em;
            }
            #blocklyCodePreview div.highlight {
                background-color: #CCFF99;                
            }
        </style>
        <script>
            function init() {
		if (parent.$("div.parameter#language").text().trim() != "pcarol" && parent.$("div.parameter#language").text().trim() != "pythoncarol")
            	{
                	parent.$("xml#toolbox",document).find("category[name=Carol]").remove();
            	}
                Blockly.inject(document.body,
                        {path: './blockly/', toolbox: document.getElementById('toolbox'), sounds : false });
                // Let the top-level application know that Blockly is ready.
                window.parent.blocklyLoaded(Blockly);
                Blockly.addChangeListener(window.parent.blocklyCodeUpdate);                
            }
        </script>
    </head>
    <body onload="init()">
    <xml id="toolbox" style="display: none">
        <category name="Display">
            <block type="text_print"></block>
        </category>
        <category name="Text">
            <block type="text"></block>
        </category>    
        <category name="Variables">
            <block type="variables_set">
                <field name="VAR">p</field>
                <value name="VALUE">
                    <!--<block type="math_number">
                        <field name="NUM">1</field>
                    </block>-->
                </value>
            </block>
            <block type="variables_get">
                <field name="VAR">p</field>
            </block>
            <block type="variables_input">
                <field name="VAR">p</field>
            </block>
        </category>  
        <category name="Decisions and loops">
            <block type="controls_if"></block>
            <block type="controls_for">
                <field name="VAR">i</field>
                <value name="FROM">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="TO">
                    <block type="math_number">
                        <field name="NUM">10</field>
                    </block>
                </value>
                <value name="BY">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
            </block>
            <block type="controls_while"></block>
            <block type="controls_repeatUntil"></block>
        </category>
        <category name="Comparisons">
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
        </category>
        <category name="Numbers and maths       ">
            <block type="math_number"></block>
            <block type="math_arithmetic"></block>
            <block type="math_single"></block>
        </category>
        <category name="Functions" custom="PROCEDURE"></category>
        <category name="Carol">
            <block type="carol_move"></block>
            <block type="carol_turnLeft"></block>
            <block type="carol_pickUp"></block>
            <block type="carol_putDown"></block>
            <block type="carol_isBlocked"></block>
            <block type="carol_isNotBlocked"></block>
            <block type="carol_isAtGoal"></block>
            <block type="carol_isNotAtGoal"></block>
            <block type="carol_isPickupVisible"></block>
            <block type="carol_distanceToPickup"></block>
        </category>
    </xml>
</body>
</html>
