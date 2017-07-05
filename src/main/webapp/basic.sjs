            /*
    Simple Web Basic Interpreter  (swbasic)
    Copyright (C) 2010 Yohanes Nugroho

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    initial creation: 2010-05-22 12:11:16
    last update: Thu May 27 00:42:16 EDT 2010

    Mods added by Paul Neve March 2012 to integrate with OniLab's Apollo
    and with the NoobLab learning environment. Now dependent on JQuery, however.

 */

var interpreter = new Interpreter();
var outputframeDocument;
var outputframeWindow;
var variables = new Array;

function myclear()
{
    if (!outputframeWindow) outputframeWindow = $("#outputframe")[0].contentWindow;
    if (!outputframeDocument)  outputframeDocument = outputframeWindow.document;
	$("#output-main",outputframeDocument).remove();
	$(outputframeDocument).find("body").append('<code id="output-main" style="word-wrap: break-word"></code>');
}

var inputform =
 '<form id="inputform" style="display: inline"><input type="text" id="inp" name="inp" size="1">' +
 '<input type="submit" value="ok" style="display: none"></form>'
;

function my_string_input()
{
    var promptString = "";
    var objectDiv = outputframeDocument.getElementById("output-main");
    var input = outputframeDocument.createElement("input");
    var txtNode = outputframeDocument.createTextNode(promptString+" ");
    input.id = "inputbox";
    input.size = "1";

    objectDiv.appendChild(txtNode);
    objectDiv.appendChild(input);
    input.focus();

    var dom = require("dom");
    dom.waitforEvent(input,"keydown",waitForReturn);
    var inputVal = outputframeDocument.getElementById("inputbox").value;
    objectDiv.removeChild(input);
    txtNode = outputframeDocument.createTextNode(inputVal);
    objectDiv.appendChild(txtNode);    
    //parent.LOGrunInput(inputVal);
    if (!isNaN(inputVal)) return parseInt(inputVal);
    return inputVal;
}

function waitForReturn(event)
{
    var currentText = outputframeDocument.getElementById("inputbox").value;
    outputframeDocument.getElementById("inputbox").size = currentText.length + 1;
    if (event.keyCode == 13)
    {
        return true;
    }
    else
    {
        return false;
    } 
}

function my_number_input()
{
    return my_string_input();
}

function message(status,error)
{
    if (status == "goodtest")
    {

    }
    else if (status == "badtest")
    {

    }
    else if (status == "error")
    {
        $("#output-main",outputframeDocument).append('<span style="color: red; font-weight: bolder">'+
                        "<br/>"+error+"</span>");
    }
    else // win :-)
    {
        $("#output-main",outputframeDocument).append('<span style="color: green; font-weight: bolder">'+
                        "<br/>Program successfully completed its run.</span>");
    }
    toBottom();
}

function myprint(text, eol)
{
	$("#output-main",outputframeDocument).append(text);
	if (eol)
 		$("#output-main",outputframeDocument).append("<br/>");

         toBottom();
}

function toBottom()
{
    outputframeWindow.scrollTo(0,outputframeDocument.body.scrollHeight);
}

function runbasic(inp,noLog)
{
	myclear();

       // disable run button
       $("input#runbutton").attr('disabled', true);
       // enable stop button
       $("input#stopbutton").attr('disabled', false);

	try {
                LOGrun(inp);
		var p = new Parser(inp);
		p.parse();

		interpreter.setParser(p);
		interpreter.print_function = myprint;
		interpreter.string_input_function = my_string_input;
		interpreter.number_input_function = my_number_input;
		interpreter.clear_function = myclear;
		interpreter.interpret();
                message();		
	} catch (error) {
		message("error",error);

                if (error.indexOf("PARSING") == -1)
                {
                    if (!noLog) LOGerror(error);
                }
                else
                {
                    if (!noLog) LOGsyntaxError(error);
                }

                var lineno = error+"";                                
                lineno = lineno.replace("LINE ","").trim();
                lineno = parseInt(lineno);
                
                var codeLines = inp.split("\n");
                for (var i = 0; i < codeLines.length; i++)
                {
                    if (parseInt(codeLines[i].split(" ")[0].toString().trim()) == lineno)
                    {
                        editor.focus(); 
                        editor.setCursor(i);
                        //parent.editor.setLineClass(i,"error");
                        parent.editor.addLineClass(i,"background","error");
                    }
                }
                // enable run button
               $("input#runbutton").attr('disabled', false);
               // disable stop button
               $("input#stopbutton").attr('disabled', true);
               return false;
	}

        // enable run button
       $("input#runbutton").attr('disabled', false);
       // disable stop button
       $("input#stopbutton").attr('disabled', true);
       
       if (!noLog) LOGrunSuccess();
       return false;
}

function Token(text, type)
{
	this.text = text;
	this.type = type;

	this.toString = function() {
		return "[" + this.text + ","+ this.type + "]";
	}

	this.getType = function() {
		return this.type;
	}

	this.getText = function() {
		return this.text;
	}
}

function is_number(m)
{
	return typeof(m)==="number" || typeof(m)==="boolean";
}

function is_space(c)
{
	return c==" " || c=="\t" || c=="\v" || c=="\f";
}

function is_digit(c)
{
	return c>='0' && c<='9';
}

function is_digit_in_base(c,base)
{
	if (base==10) {
		return c>='0' && c<='9';
	}
	if (base==8) {
		return c>='0' && c<='7';
	}
	if (base==16) {
		var d= c.toUpperCase();
		return (c>='0' && c<='9') || (d>='A' && d<='F');
	}
	return false;
}


function is_alpha(c)
{
	return (c>='A' && c<='Z') || (c>='a' && c<='z');
}

function is_alnum(c)
{
	return is_alpha(c) || is_digit(c);
}

function Tokenizer(input)
{
	var inp = input;
	this.error = false;
	this.tokens = new Array;

	this.current_token = 0;

	//last accepted token
	this.last_token = null;

	this.reset = function() {
		this.current_token = 0;
	};

	this.hasMoreTokens = function() {
		return (this.current_token < this.tokens.length);
	};

	this.nextToken = function() {
		return this.tokens[this.current_token++];
	};

	this.lastToken = function() {
		return this.last_token;
	}

	this.currentToken = function() {
		return this.tokens[this.current_token];
	}

	this.addToken = function(t) {
		this.tokens[this.tokens.length] = t;
	};

	this.isError = function() {
		return error;
	}

	this.tokenize =  function() {
		var keywords = /^(IF|THEN|ELSE|FOR|TO|STEP|GOTO|GOSUB|RETURN|NEXT|INPUT|LET|CLS|END|PRINT|DIM|DATA|READ|REM|END|OR|AND|MOD|WHILE|WEND|RANDOMIZE|SYSTEM|KEY|CLEAR)$/i;
		var functions = /^(VAL|STR\$|LEFT\$|RIGHT\$|MID\$|LEN|RND|INT|INSTR|ABS|ASC|CHR\$|SQR|STRING\$|SIN|COS|TAN|TIMER)$/i;
		var i = 0;
		this.error = false;
		while (i<input.length) {
			var c = input[i];
			var next;
			if (i+1 < input.length) {
				next = input[i+1];
			} else {
				next = -1;
			}

			if (c==".") {
				var start = i;
				i++;
				c = input[i];
				while (i < input.length && is_digit(c)) {
					i++;
					c = input[i];
				}
				var number = input.substring(start, i);
				var t = new Token(number, "NUMBER");
				this.addToken(t);
				continue;
			}

			if (is_digit(c)) {
				var start = i;
				while (i < input.length && is_digit(c)) {
					i++;
					c = input[i];
				}

				if (i < input.length && c==".") {
					i++;
					c = input[i];
					while (i < input.length && is_digit(c)) {
						i++;
						c = input[i];
					}
				} else if (i < input.length && c=="E") {
					i++;
					c = input[i];
					if (i < input.length && (c=="+" || c=="-")) {
						i++;
						c = input[i];
						while (i < input.length && is_digit(c)) {
							i++;
							c = input[i];
						}
					}
				}

				var number = input.substring(start, i);

				if (c=="#" || c=="!") { //ignore 123#
					i++;
				}

				var t = new Token(number, "NUMBER");
				this.addToken(t);
				continue;
			}

			if (c=="&") {
				var base = 8;
				var start = i + 1;
				if (next.toUpperCase()=="H") {
					base = 16;
					i+=2;
					start++;
				} else if (next.toUpperCase()=="O") {
					i+=2;
					start++;
				}

				if (i < input.length) c = input[i];  else c=-1;

				while (i < input.length && is_digit_in_base(c, base)) {
					i++;
					c = input[i];
				}
				var number = input.substring(start, i);
				var n = parseInt(number, base);
				var t = new Token(n.toString(), "NUMBER");
				this.addToken(t);
				continue;
			}

			if (is_alpha(c)) {
				var start = i;
				while (i < input.length && is_alnum(c)) {
					i++;
					c = input[i];
				}

				if (c=="$" || c=="!" || c=="#" || c=="%") {
					i++;
				}

				identifier = input.substring(start, i);
				r = identifier.match(keywords);
				if (r && r[0]) {
					var n = identifier.toUpperCase();
					if (n==="OR" || n==="AND") {
						t = new Token(n, "LOGICAL_OPERATOR");
					} else if (n==="MOD") {
						t = new Token(n, "MULT_OPERATOR");
					} else {
						t = new Token(identifier.toUpperCase(), "KEYWORD");
					}
				} else {
					r = identifier.match(functions);
					if (r && r[0]) {
						t = new Token(identifier.toUpperCase(), "FUNCTION");
					} else {
						t = new Token(identifier, "IDENTIFIER");
					}
				}
				this.addToken(t);
				continue;
			}

			if (c=="\"") {
				var start = i;
				i++;
				if (i>=input.length) {
					this.error = true;
					break;
				}
				c = input[i];
				while (i < input.length && c!="\"") {
					i++;
					c = input[i];
				}
				if (c!="\"") {
					this.error = true;
					break;
				}
				i++;
				var str = input.substring(start, i);
				var t = new Token(str.substring(1, str.length-1), "STRING");
				this.addToken(t);
				continue;
			}
			if (is_space(c)) {
				while (i < input.length && is_space(c)) {
					i++;
					c = input[i];
				}
				continue;
			}

			if (c=="*" || c=="/" || c=="^" || c=="\\") {
				i++;
				var t = new Token(c, "MULT_OPERATOR");
				this.addToken(t);
				continue;
			}

			if (c=="(") {
				i++;
				var t = new Token(c, "OPENPAREN");
				this.addToken(t);
				continue;
			}

			if (c==")") {
				i++;
				var t = new Token(c, "CLOSEPAREN");
				this.addToken(t);
				continue;
			}

			if (c=="+" || c=="-") {
				i++;
				var t = new Token(c, "PLUS_OPERATOR");
				this.addToken(t);
				continue;
			}

			if (c=="'") {
				i++;
				var t = new Token(c, "COMMENT");
				this.addToken(t);
				continue;
			}

			if (c==":") {
				i++;
				var t = new Token(c, "STATEMENT_DELIMITER");
				this.addToken(t);
				continue;
			}

			if (c=="," || c==";") {
				i++;
				var t = new Token(c, "DELIMITER");
				this.addToken(t);
				continue;
			}

			if (c=="=") {
				//actually ambiguous, might be equality testing
				i++;
				var t = new Token(c, "ASSIGNMENT");
				this.addToken(t);
				continue;
			}

			if (c==">" || c=="<") {
				i++;
				if (c=="<" && next==">") {
					i++;
					t = new Token("<>", "RELATIONAL");
				} else {
					if (next=='=') {
						i++;
						t = new Token(c+"=", "RELATIONAL");
					} else {
						t = new Token(c, "RELATIONAL");
					}
				}
				this.addToken(t);
				continue;
			}
			if (c=="\r" || c=="\n") {
				i++;
				if (c=="\r" && next=="\n") {
					i++;
				}
				var t = new Token("--", "ENDOFLINE");
				this.addToken(t);
				continue;
			}

			var t = new Token(c, "CHARACTER");
			this.addToken(t);
			i++;

		}
		if (this.error) throw("ERROR: " + this.error);

	}

	this.toString = function() {
		var result = "current token: "+ this.current_token + "\n";
		for (i = 0; i<this.tokens.length; i++) {
			result += "<" +i+ "> " +  this.tokens[i].toString();
			result +"\n";
		}
		return result;
	};


	this.acceptText = function(text) {
		if (!this.hasMoreTokens()) {
			return false;
		}
		var t = this.tokens[this.current_token];
		if (t.getText().toUpperCase()==text.toUpperCase()) {
			this.last_token = t;
			this.nextToken();
			return true;
		}
		return false;
	}


	this.will_acceptText = function(text) {
		if (!this.hasMoreTokens()) {
			return false;
		}
		var t = this.tokens[this.current_token];
		if (t.getText().toUpperCase()==text.toUpperCase()) {
			return true;
		}
		return false;
	}

	this.unaccept  = function(type) {
		if (this.current_token>0)
			this.current_token--;
	}

	/*like accept, but doesn't forward the token*/
	this.will_accept = function(type) {
		if (!this.hasMoreTokens()) {
			return false;
		}
		var t = this.tokens[this.current_token];
		if (t.getType()===type) {
			return true;
		}
		return false;
	}

	this.accept = function(type) {
		if (!this.hasMoreTokens()) {
			return false;
		}
		var t = this.tokens[this.current_token];
		if (t.getType()===type) {
			this.last_token = t;
			this.nextToken();
			return true;
		}
		return false;
	}

	this.expect = function(type) {
		if (this.accept(type)) {
			return;
		}
		if (!this.hasMoreTokens()) {
			throw "Error: expected '"+type+"' but end of token found";
		}
		var t = this.tokens[this.current_token].getType();
		throw "Error: expected '"+type+"' but "+ t +" found";
	}

	this.tokenize();

};

function Line(number)
{
	this.linenumber = number;
	this.statements = new Array;

	this.setStatements = function(statements) {
		this.statements = statements;
	};

	this.toString = function() {
		var result = "[ LINE# " +  this.linenumber + "] ";
		for (var i = 0; i< this.statements.length; i++) {
			s = this.statements[i];
			result += "ST >> " + s.toString();
		}
		result += "[END OF LINE# " + this.linenumber +"]";
		return result;
	}
}

function Node(type,text)
{
	this.type = type;
	this.text = text;
	this.children = new Array;

	this.getText = function() {
		return this.text;
	}

	this.getType = function() {
		return this.type;
	}

	this.addChild = function(c) {
		this.children[this.children.length] = c;
	}

	this.toString = function(level) {
		if (level===undefined)
			level = 0;

		var space  = "";
		for (var i = 0; i<level; i++) {
			space += " ";
		}

		var result = space + "TYPE = <" + this.type + "> ";
		if (this.text!==undefined) {
			result += "TEXT = " + this.text;
		}
		result += "\n";
		for (var i = 0; i< this.children.length;i++) {
			result += this.children[i].toString(level+1);
		}
		result += "\n";
		return result;
	}
}


function Parser(text)
{
	this.text = text;

	/*code that has line numbers goes here*/
	this.lines = new Array;

	/*list of statements (flattened) */
	this.statements = new Array;
	this.label_index = new Array;

	/*idx is for generating unique labels*/
	this.expand_if = function(dest, ifs, idx, line) {
		/*convert IF A THEN B ELSE C to
		  IF A THEN GOTO A_TRUE
		  ELSE GOTO A_FALSE
		  A_TRUE:
		  THEN_STATEMENTS
		  GOTO DONE
		  A_FALSE:
		  ELSE_STATEMENTS
		  DONE:
		 */
		/**
		   for IF GOTO, don't change
		 */
		if (ifs.children[1].getType()=="GOTO") {
			dest.push(ifs);
			return;
		}
		if (ifs.children[1].getType()=="GOSUB") {
			dest.push(ifs);
			return;
		}

		var uniq_pos = line + "_"+ idx;

		var label_true = uniq_pos + "_TRUE";
		var label_false = uniq_pos + "_FALSE";
		var label_done = uniq_pos + "_DONE";
		var newif = new Node("IF");
		newif.addChild(ifs.children[0]);
		newif.addChild(new Node("GOTO", label_true));
		if (ifs.children.length==3) {
			//only if there is else part
			newif.addChild(new Node("GOTO", label_false));
		} else {
			newif.addChild(new Node("GOTO", label_done));
		}
		dest.push(newif);
		dest.push(new Node("LINENUMBER", label_true));
		//add all children of THEN
		var thenpart = ifs.children[1];

		for (var i = 0; i<thenpart.children.length; i++) {
			dest.push(thenpart.children[i]);
		}
		//have else part
		if (ifs.children.length==3) {
			dest.push(new Node("GOTO", label_done));
			var elsepart = ifs.children[2];
			dest.push(new Node("LINENUMBER", label_false));
			for (var i = 0; i<elsepart.children.length; i++) {
				dest.push(elsepart.children[i]);
			}
		}
		dest.push(new Node("LINENUMBER", label_done));
	}

	this.flatten = function() {
		for (var i = 0; i<this.lines.length; i++) {
			var line = this.lines[i];
			this.statements.push(new Node("LINENUMBER", line.linenumber));
			for (var j = 0; j < line.statements.length; j++) {
				var stmt = line.statements[j];
				if (stmt.getType()=="IF") {
					this.expand_if(this.statements, stmt, j, i);
				} else {
					this.statements.push(stmt);
				}
			}
		}


		for (var i = 0; i<this.statements.length; i++) {
			var stmt = this.statements[i];
			if (stmt.getType()=="LINENUMBER") {
				if (this.label_index[stmt.getText()]===undefined) {
					this.label_index[stmt.getText()] = i;
				} else {
					throw "ERROR: duplicate line number "+ stmt.getText();
				}
			}
		}
	}

	this.functions = new Array;

	this.tokenizer = null;

	this.accept = function(t) {
		return this.tokenizer.accept(t);
	};

	this.will_accept = function(t) {
		return this.tokenizer.will_accept(t);
	};

	this.will_acceptText = function(t) {
		return this.tokenizer.will_acceptText(t);
	}

	this.hasMoreTokens = function() {
		return this.tokenizer.hasMoreTokens();
	};

	this.acceptText = function(t) {
		return this.tokenizer.acceptText(t);
	};


	this.lastText = function() {
		var x = this.tokenizer.lastToken();
		return x.getText();
	}

	this.processLine = function(t) {
		linenum = parseInt(t.getText());
		l = new Line(linenum);
		l.setStatements(this.getStatementsTree());
		this.lines[this.lines.length] = l;
	};

	this.toString = function() {
		var result = "***\n";
		for (var i = 0; i<this.lines.length; i++) {
			line = this.lines[i];
			result += line.toString();
			result += "---\n";
		}
		return result;
	}

	this.atom = function() {
		if (this.accept("NUMBER")) {
			return new Node("NUMBER", parseFloat(this.lastText()));
		} else 	if (this.will_accept("IDENTIFIER")) {
			return this.identifier();
		} else 	if (this.will_accept("FUNCTION")) {
			/*function is just like identifier*/
			var n = this.identifier();
			n.type = "FUNCTION";
			return n;
		} else 	if (this.accept("STRING")) {
			return new Node("STRING", this.lastText());
		} else if  (this.accept("OPENPAREN")) {
			var c = this.expression();
			this.accept("CLOSEPAREN")
			return c;
		}
		var x = this.tokenizer.currentToken();
		if (x===undefined) {
			throw "ERROR: unexpected end of tokens";
		}
		throw "ERROR: unexpected token " + x.getType() + " (" + x.getText() + ")";
	}

	this.unary_expr = function() {
		if (this.acceptText("+")) {
			var node = new Node("UNARY_PLUS");
			node.addChild(this.atom());
			return node;
		}
		if (this.acceptText("-")) {
			var node = new Node("UNARY_MINUS");
			node.addChild(this.atom());
			return node;
		}
		return this.atom();
	}

	this.mult_expr = function() {
		node = this.unary_expr();
		// x -> (x)
		// 1*2/3  1-> (/ (* 1 2) 3)
		while (this.accept("MULT_OPERATOR")) {
			var opnode = new Node(this.lastText());
			opnode.addChild(node);
			var rnode = this.unary_expr();
			opnode.addChild(rnode);
			node = opnode;
		}
		return node;
	}

	this.plus_expr = function() {
		var node = this.mult_expr();
		while (this.accept("PLUS_OPERATOR")) {
			var opnode = new Node(this.lastText());
			opnode.addChild(node);
			var rnode = this.mult_expr();
			opnode.addChild(rnode);
			node = opnode;
		}
		return node;
	}


	this.relational = function() {
		var node = this.plus_expr();

		while (this.accept("RELATIONAL") || this.acceptText("=")) {
			var opnode = new Node(this.lastText());
			opnode.addChild(node);
			var rnode = this.plus_expr();
			opnode.addChild(rnode);
			node = opnode;
		}
		return node;
	};


	this.logical = function() {
		var node = this.relational();
		while (this.accept("LOGICAL_OPERATOR")) {
			var opnode = new Node(this.lastText());
			opnode.addChild(node);
			var rnode = this.relational();
			opnode.addChild(rnode);
			node = opnode;
		}
		return node;
	};

	this.expression = function() {
		var node = new Node("EXPRESSION");
		var child = this.logical();
		node.addChild(child);
		return node;
	};


	this.end_of_statement = function() {
		if (this.will_accept("ENDOFLINE") ||
		    this.will_accept("STATEMENT_DELIMITER") ||
		     this.will_acceptText("ELSE")||
			this.will_accept("COMMENT")) {
			return true;
		}
		return false;
	}

	this.input_statement = function(self) {
		var node = new Node("INPUT");

		var q = "?";
		if (self.accept("STRING")) {
			q = self.lastText();
		}
		var query = new Node("STRING", q);

		node.addChild(query);

		while (self.hasMoreTokens()) {
			if (self.end_of_statement())
				break;

			if (self.tokenizer.accept("KEYWORD")) {
				throw "ERROR: unexpected keyword "+self.lastText();
			}

			if (self.tokenizer.accept("DELIMITER")) {
				continue;
			}
			var ch = self.identifier();
			node.addChild(ch);
		}
		return node;
	}

	this.identifier = function() {
		var node = new Node("VARIABLE");
		if (!this.accept("IDENTIFIER")) {
			this.accept("FUNCTION");
		}
		node.text = this.lastText();
		if (this.accept("OPENPAREN")) {
			node.type = "ARRAY";
			while (this.hasMoreTokens()) {
				var expr = this.expression();
				node.addChild(expr);
				if (this.acceptText(",")) {
					continue;
				}
				if (this.accept("CLOSEPAREN")) {
					break;
				}
			}
		}
		return node;
	}

	this.dim_statement = function(self) {
		var node = new Node("DIM");
		if (self.will_accept("IDENTIFIER")) {
			while (self.hasMoreTokens()) {
				var child = self.identifier();
				child.type="ARRAY";
				node.addChild(child);
				if (self.acceptText(",")) {
					continue;
				}
				if (self.end_of_statement()) {
					break;
				}
			}
			return node;
		}
		throw "ERROR: expected identifer after DIM";
	}

	/**
	 * For IF statement, if there is no else after the THEN, then
	 * all statements before end of line is included in THEN part
	 * if there is ELSE then the rest of the line goes to the ELSE part
	 */
	this.get_rest_of_line = function(node) {
		/*if not end of token*/

		while (this.hasMoreTokens() &&
		       !this.will_accept("ENDOFLINE")) {
			var s = this.getStatement();
			node.addChild(s);
			if (this.accept("STATEMENT_DELIMITER"))
				continue;
		}
	}

	this.rem_statement = function(self) {
		var node = new Node("REM");
		while (self.hasMoreTokens() &&
		       !self.will_accept("ENDOFLINE")) {
			self.tokenizer.nextToken();
		}
	}

	this.goto_statement = function(self) {
		var node = new Node("GOTO");
		if (self.accept("NUMBER")) {
			node.text = self.lastText();
			return node;
		}
		throw "ERROR: GOTO should be followed by number";
	}

	this.randomize_statement = function(self) {
		var node = new Node("RANDOMIZE");
		node.addChild(self.expression());
		return node;
		throw "ERROR: RANDOMIZE should be followed by expression";
	}

	this.gosub_statement = function(self) {
		var node = new Node("GOSUB");
		if (self.accept("NUMBER")) {
			node.text = self.lastText();
			return node;
		}
		throw "ERROR: GOSUB should be followed by number";
	}

	this.return_statement = function(self) {
		var node = new Node("RETURN");
		return node;
	}

	this.cls_statement = function(self) {
		var node = new Node("CLS");
		return node;
	}

	this.end_statement = function(self) {
		var node = new Node("END");
		return node;
	}

	this.for_statement = function(self) {
		var node = new Node("FOR");
		if (!self.accept("IDENTIFIER")) {
			throw "ERROR: expected identifier in FOR statement";
		}

		var variable = new Node("VARIABLE");
		variable.text = self.lastText();

		if (!self.acceptText("=")) {
			throw "ERROR: expected = ";
		}
		node.addChild(variable);
		var expr = self.expression();
		if (!self.acceptText("TO")) {
			throw "ERROR: expected TO in FOR statement ";
		}
		node.addChild(expr);
		var limitexpr = self.expression();
		node.addChild(limitexpr);
		if (self.acceptText("STEP")) {
			var stepexpr = self.expression();
			node.addChild(stepexpr);
		}
		return node;
	}

	this.data_statement = function(self) {
		var node = new Node("DATA");
		if (self.will_accept("NUMBER") || self.will_accept("STRING")) {
			while (self.hasMoreTokens()) {
				if (self.accept("NUMBER")) {
					var text = self.lastText();
					if (!is_number(text))
						text = parseFloat(text);
					node.addChild(new Node("DATUM", text));
				} else if (self.accept("STRING")) {
					node.addChild(new Node("DATUM", self.lastText()));
				} else {
					throw "ERROR: unexpected token " + self.lastText();
				}
				if (!self.acceptText(","))
					break;
			}
		}
		return node;
	}

	this.read_statement = function(self) {
		var node = new Node("READ");
		while (self.hasMoreTokens()) {
			if (self.end_of_statement())
				break;

			if (self.tokenizer.accept("KEYWORD")) {
				throw "ERROR: unexpected keyword "+self.lastText();
			}

			if (self.tokenizer.accept("DELIMITER")) {
				continue;
			}
			var ch = self.identifier();
			node.addChild(ch);
		}
		return node;
	}

	this.next_statement = function(self) {
		var node = new Node("NEXT");
		if (self.accept("IDENTIFIER")) {
			while (self.hasMoreTokens()) {
				node.addChild(new Node("IDENTIFIER", self.lastText()));
				if (!self.acceptText(","))
					break;
				if (!self.accept("IDENTIFIER"))
					break;
			}
		}
		return node;
	}

	this.while_statement = function(self) {
		var node = new Node("WHILE");
		var expr = self.expression();
		node.addChild(expr);
		return node;
	}

	this.wend_statement = function(self) {
		var node = new Node("WEND");
		return node;
	}

	this.clear_statement = function(self) {
		var node = new Node("CLEAR");
		return node;
	}

	this.if_statement = function(self) {
		var node = new Node("IF");
		var expr = self.expression();
		node.addChild(expr);

		if (self.acceptText("THEN")) {


			var thenpart = new Node("THEN");
			var statement = null;

			if (self.will_accept("NUMBER")) {
				self.accept("NUMBER");
				statement = new Node("GOTO");
				statement.text = self.lastText();
			} else {
				/*get one statement */
				statement = self.getStatement();
			}
			thenpart.addChild(statement);
			node.addChild(thenpart);

			if (self.acceptText("ELSE")) {
				var elsepart = new Node("ELSE");

				if (self.will_accept("NUMBER")) {
					self.accept("NUMBER");
					var gstatement = new Node("GOTO");
					gstatement.text = self.lastText();
					elsepart.addChild(gstatement);
				} else {
					var else_statement = self.getStatement();
					self.accept("STATEMENT_DELIMITER");
					elsepart.addChild(else_statement);
					self.get_rest_of_line(elsepart);
				}
				node.addChild(elsepart);
				return node;
			}
			return node;
		} else if (self.accept("GOTO")) {

			var gpart = new Node("GOTO");

			if (self.accept("NUMBER")) {
				gpart.text = self.lastText();
				node.addChild(gpart);
				//Ignore rest of line
				var ignore = new Node("_");
				self.accept("STATEMENT_DELIMITER");
				self.get_rest_of_line(ignore);
				return node;
			} else {
				throw "ERROR: expected NUMBER after GOTO";
			}
			self.accept("STATEMENT_DELIMITER");
			self.get_rest_of_line(thenpart);
			return node;
		}
		throw "ERROR: expected THEN or GOTO in IF statement";
	}

	this.print_statement = function(self) {
		var node = new Node("PRINT");
		while (self.hasMoreTokens()) {


			if (self.end_of_statement())
				break;

			if (self.accept("KEYWORD")) {
				throw "ERROR: unexpected keyword "+self.lastText();
			}
			if (self.accept("DELIMITER")) {
				node.addChild(new Node("DELIMITER", self.lastText()));
			}

			if (self.end_of_statement())
				break;

			var ch = self.expression();
			node.addChild(ch);
		}

		return node;
	};

	this.key_statement = function(self) {
		var node = new Node("KEY");
		if (self.acceptText("ON") || self.acceptText("OFF")) {
			node.text = self.lastText();
			return node;
		}
		throw "ERROR: only supports KEY ON or KEY OFF";
	}


	this.let_statement = function(self) {
		var variable = self.identifier();

		if (self.acceptText("=")) {
			var node = self.expression();
			var anode = new Node("ASSIGNMENT");
			anode.addChild(variable);
			anode.addChild(node);
			return anode;
		}
		throw "ERROR: expected '='";
	}

	this.getStatement = function() {
		if (this.accept("KEYWORD")) {
			var k = this.lastText().toUpperCase();
			if (this.functions[k]) {
				return this.functions[k](this);
			}
		}
		if (this.accept("COMMENT")) {
			return this.functions["REM"](this);
		}

		if (this.will_accept("IDENTIFIER")) {
			return this.let_statement(this);
		}
		throw "ERROR: statement error " + this.tokenizer;
	}

	this.getStatementsTree = function() {
		if (!this.hasMoreTokens()) {
			throw "ERROR: unexpected end of program";
		}
		var statements =  new Array;
		while (this.hasMoreTokens() && !this.accept("ENDOFLINE")) {
			var stat = this.getStatement();
			if (stat!==undefined)
				statements.push(stat);
			this.accept("STATEMENT_DELIMITER");
			if (this.accept("COMMENT")) {
				while (this.hasMoreTokens() && !this.accept("ENDOFLINE")) {
					this.tokenizer.nextToken();
				}
				//statements.push(new Node("REM"));
				break;
			}
		}
		return statements;
	}

	this.parse = function() {
		this.tokenizer = new Tokenizer(text);

		while (this.hasMoreTokens()) {
			this.accept("ENDOFLINE");
			var t = this.tokenizer.nextToken();
			if (t.getType()==="NUMBER") {
                            try
                            {
				this.processLine(t);
                            }
                            catch (error)
                            {
                                error = "LINE "+t.text+" PARSING "+error;
                                throw error;
                            }
			} else {
				throw "ERROR: statement without line number";
			}
			this.accept("ENDOFLINE");
		}
		this.flatten();
	}

	this.functions["PRINT"] = this.print_statement;
	this.functions["INPUT"] = this.input_statement;
	this.functions["DIM"] = this.dim_statement;
	this.functions["IF"] = this.if_statement;
	this.functions["GOTO"] = this.goto_statement;
	this.functions["GOSUB"] = this.gosub_statement;
	this.functions["RETURN"] = this.return_statement;
	this.functions["END"] = this.end_statement;
	this.functions["SYSTEM"] = this.end_statement; //this also ends program
	this.functions["FOR"] = this.for_statement;
	this.functions["NEXT"] = this.next_statement;
	this.functions["LET"] = this.let_statement;
	this.functions["WHILE"] = this.while_statement;
	this.functions["WEND"] = this.wend_statement;
	this.functions["REM"] = this.rem_statement;
	this.functions["CLS"] = this.cls_statement;
	this.functions["RANDOMIZE"] = this.randomize_statement;
	this.functions["DATA"] = this.data_statement;
	this.functions["READ"] = this.read_statement;
	this.functions["KEY"] = this.key_statement;
	this.functions["CLEAR"] = this.clear_statement;
}

/*variable name with [] means its an array */
function Variable(name)
{
	this.name = name;
	this.value = null;
	this.bounds = null;
	this.mult = null;

	this.setBounds = function(dbounds) {
		this.value = new Array;
		this.bounds = new Array; /*a(4,3), bounds = 4,3*/
		this.mult = new Array; /*a(4,3), mult 1,4*/

		var m = 1;

		for (var i = 0; i<dbounds.length; i++) {
			this.bounds[i] = dbounds[i]+1;
			this.mult[i] = m;
			m *= this.bounds[i];
		}

		var val;
		if (name[name.length-3]=="$") {
			val = "";
		} else {
			val = 0;
		}
		for (var i = 0; i<m; i++) {
			this.value[i] = val;
		}

	}

	this.getDimension = function() {
		return this.bounds==null?0:this.bounds.length;
	}

	this.compute_pos = function(indices) {
		var pos = 0;
		for (var i = 0; i < indices.length; i++) {
			pos += indices[i]*this.mult[i];
		}
		return pos;
	}

	this.inBounds = function(indices) {
		if (indices.length != this.bounds.length)
			return false;

		for (var i = 0; i < indices.length; i++) {
			if (indices[i] <0 || indices[i]>=this.bounds[i]) {
				return false;
			}
		}
		return true;
	}

	this.setValue = function(value, indices) {
		if (indices===undefined) {
			this.value = value;
			return;
		}
		this.value[this.compute_pos(indices)] = value;
	}

	this.getValue = function(indices) {
		if (indices===undefined) {
			return this.value;
		}
		return this.value[this.compute_pos(indices)];
	}
}

//http://support.microsoft.com/kb/28150
function Random(seed)
{
	var a = 214013;
	var c = 2531011;
	var z = 1<<24;

	this.seed = seed; /*keep the initial seed*/
	this.x0 = seed;

	if (seed===undefined) {
		this.seed = new Date().getTime();
		this.x0 = this.seed;
	}

	this.setSeed = function(s) {
		this.seed = s;
		this.x0 = s;
	}

	this.random = function() {
		this.x0 = ( this.x0 * a + c ) % (z);
		return this.x0/z;
	}
}


function Interpreter(parser)
{
	this.parser = parser;
	this.ifunctions = new Array;
	this.stop = false;

	variables = new Array;

	this.gosub_stack = new Array;

	this.for_stack = new Array;
	this.while_stack = new Array;
	this.for_info = new Array;

	var MAX_GOSUB = 100;
	var DEFAULT_ARRAY = 10;

	var debug_enabled = false;

	this.print_function = null;
	this.number_input_function = null;
	this.string_input_function = null;

	this.clear_function = null;

	this.random = new Random;

	this.last_random = 0;

	this.input_stack = new Array;

	this.last_point = 0;

	this.data = new Array;

	this.data_pointer = 0;

	this.push_input = function(v) {
		this.input_stack.push(v);
	}

	function debug(text) {
		if (debug_enabled) {
			if (typeof(document)=="undefined") {
				print(text);
			} else {
				document.writeln(text);
			}
		}
	}

	this.get_array_indices = function(identifier) {
		var indices = new Array;
		for (var i = 0; i < identifier.children.length; i++) {
			indices[i] = this.evalExpr(identifier.children[i]);
		}
		return indices;
	}

	this.get_next_line = function(i) {
		return i + 1;
	}

	this.ensure_exist = function(identifier) {
		var name = identifier.getText();
		if (identifier.getType()=="ARRAY") {
			name += "[]";
			if (variables[name]===undefined) {
				var v = new Variable(name);
				var bounds = new Array;
				bounds[0] = DEFAULT_ARRAY;
				v.setBounds(bounds);
				variables[name] = v;
			}
		} else {
			if (variables[name]===undefined) {
				var v = new Variable(name);
				variables[name] = v;
				if (name[name.length-1] == "$") {
					v.setValue("");
				} else {
					v.setValue(0);
				}
			}
		}
	}

	this.getValue = function(identifier) {
		var name = identifier.getText();
		this.ensure_exist(identifier);
		if (identifier.getType()=="ARRAY") {
			name += "[]";
			var variable = variables[name];
			var indices = this.get_array_indices(identifier);
			if (!variable.inBounds(indices)) {
				throw "ERROR: subscript out of range";
			}
			return variable.getValue(indices);
		} else {
			var variable = variables[name];
			return variable.getValue();
		}
	}

	this.setNumericValue = function(name, value) {
		if (variables[name]===undefined) {
			var v = new Variable(name);
			variables[name] = v;
			v.setValue(value);
		}
		var v = variables[name];
		v.setValue(value);
	}

	this.getNumericValue = function(name, value) {
		if (variables[name]===undefined) {
			var v = new Variable(name);
			variables[name] = v;
			v.setValue(0);
			return 0;
		}
		var v = variables[name];
		debug("getnumeric '"+name+"' value = " + v.getValue());
		return v.getValue();
	}

	this.setValue = function(identifier, value) {
		var name = identifier.getText();
		this.ensure_exist(identifier);
		if (identifier.getType()=="ARRAY") {
			debug("SET VALUE array " + value);
			name += "[]";
			var variable = variables[name];
			debug("Name = " + name);

			var indices = this.get_array_indices(identifier);

			if (!variable.inBounds(indices)) {
				throw "ERROR: subscript out of range";
			}
			return variable.setValue(value, indices);
		} else {
			debug("SET VALUE " + value);
			var variable = variables[name];
			variable.setValue(value);
		}
	}

	this.expect_param = function(f, n, m) {
		if (m==undefined) {
			if (f.children.length!=n) {
				throw "ERROR: function '" + f.text +
				"' expects "+ n + " parameter(s), but got " +
				f.children.length;
			}
		}

		if (f.children.length<n || f.children.length>m) {
			throw "ERROR: function '" + f.text +
			"' expects "+ n + " to " +  m + "parameters, but got " +
			f.children.length;
		}
	}

	this.evalFunction = function(f) {
		var name = f.getText();
		debug("evalfunction " + name + " param count " + f.children.length);
		var paramcount = f.children.length;

		//var functions = /^(RND)\s*/i;

		switch (name) {


		case "TIMER":
			this.expect_param(f, 0);
			return new Math.floor(new Date().getTime()/1000);

		case "RND":
			this.expect_param(f, 0, 1);
			if (paramcount==0) {
				this.last_random = this.random.random();
				return this.last_random;
			} else {
				var n = this.evalExpr(f.children[0]);
				if (is_number(n)) {
					if (n!=0) {
						this.last_random = this.random.random();
					}
					return this.last_random;
				}
			}
			throw "ERROR: type mismatch for function RND";
		case "CHR$":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return String.fromCharCode(val);
			}
			throw "ERROR: type mismatch for function CHR$";

		case "STRING$":
			this.expect_param(f, 2);
			var count = this.evalExpr(f.children[0]);
			if (is_number(count)) {
				var c = this.evalExpr(f.children[1]);
				var x = "";
				if (is_number(c)) {
					x = String.fromCharCode(c);
				} else {
					if (c.length<1)
						throw "ERROR: illegal function call for STRING$";
					x = c[0];
				}
				var result = "";
				for (var i =0; i<count; i++) {
					result += x;
				}
				return result;
			}
			throw "ERROR: type mismatch for function STRING$";
		case "ASC":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				return val.charCodeAt(0);
			}
			throw "ERROR: type mismatch for function ASC";
		case "LEN":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				return val.length;
			}
			throw "ERROR: type mismatch for function LEN";

		case "ABS":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return Math.abs(val);
			}
			throw "ERROR: type mismatch for function ABS";
		case "INT":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return Math.floor(val);
			}
			throw "ERROR: type mismatch for function INT";
		case "SIN":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)!=="string") {
				return Math.sin(val);
			}
			throw "ERROR: type mismatch for function SIN";
		case "SQR":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);

			if (is_number(val)) {
				return Math.sqrt(val);
			}
			throw "ERROR: type mismatch for function SQR";
		case "COS":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return Math.cos(val);
			}
			throw "ERROR: type mismatch for function COS";
		case "TAN":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return Math.tan(val);
			}
			throw "ERROR: type mismatch for function TAN";

		case "VAL":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				return parseFloat(val);
			}
			throw "ERROR: type mismatch for function VAL";
		case "STR$":
			this.expect_param(f, 1);
			var val = this.evalExpr(f.children[0]);
			if (is_number(val)) {
				return val.toString();
			}
			throw "ERROR: type mismatch for function STR$";
		case "LEFT$":
			this.expect_param(f, 2);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				var n = this.evalExpr(f.children[1]);
				if (is_number(n)) {
					return val.substring(0, n);
				}
			}
			throw "ERROR: type mismatch for function LEFT$";
		case "RIGHT$":
			this.expect_param(f, 2);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				var n = this.evalExpr(f.children[1]);
				if (is_number(n)) {
					return val.substring(val.length-n);
				}
			}
			throw "ERROR: type mismatch for function RIGHT$";
		case "MID$":
			this.expect_param(f, 2, 3);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				var n = this.evalExpr(f.children[1]);
				if (is_number(n)) {
					if (paramcount==2) {
						return val.substring(n);
					}
					var m = this.evalExpr(f.children[2]);
					if (is_number(m)) {
						return val.substr(n-1,m);
					}
				}
			}
			throw "ERROR: type mismatch for function MID$";
		case "INSTR":
			this.expect_param(f, 2, 3);
			var val = this.evalExpr(f.children[0]);
			if (typeof(val)==="string") {
				var substr = this.evalExpr(f.children[1]);
				if (typeof(substr)=="string") {
					return val.indexOf(substr)+1;
				}
			} else if (is_number(val)) {
				var start = val;
				var str = this.evalExpr(f.children[1]);
				if (typeof(str)=="string") {
					var substr = this.evalExpr(f.children[2]);
					if (typeof(substr)=="string") {
						return str.indexOf(substr)+1;
					}
				}
			}
			throw "ERROR: type mismatch for function INSTR";
		}
	}

	this.evalExpr = function(expr) {

		var type = expr.getType();

		if (type=="EXPRESSION") {
			expr = expr.children[0];
			type = expr.getType();
		}

		var text = expr.getText();
		debug("EVAL TYPE = "+ type + " TEXT " + text);
		if (type=="STRING")
			return expr.getText();
		if (type=="NUMBER") {
			var t = expr.getText();
			if (is_number(t))
				return t;
			if (t.indexOf(".")>=0) {
				return parseFloat(t);
			} else {
				return parseInt(t);
			}
		}

		var left = expr.children[0];
		var right = expr.children[1];
		var leftval = undefined;
		if (left!==undefined)
			leftval = this.evalExpr(left);

		var rightval = undefined;
		if (right!==undefined)
			rightval = this.evalExpr(right);

		if (text=="=")
			return leftval == rightval;

		switch (type) {
		case "*":
			return leftval * rightval;
		case "^":
			return Math.pow(leftval, rightval);
		case "/":
			return leftval / rightval;
		case "\\":
			return leftval / rightval;
		case "+":
			return leftval + rightval;
		case "-":
			return leftval - rightval;
		case "=":
			return leftval == rightval;
		case ">":
			return leftval > rightval;
		case "<":
			return leftval < rightval;
		case "<=":
			return leftval <= rightval;
		case ">=":
			return leftval >= rightval;
		case "<>":
			return leftval != rightval;
		case "AND":
			return leftval & rightval;
		case "OR":
			return leftval | rightval;
		case "MOD":
			return leftval % rightval;
		case "UNARY_MINUS":
			return -leftval;
		case "FUNCTION":
			return this.evalFunction(expr);
		default:
		        debug("VARIABLE: " + text + " expr " + expr);
		return this.getValue(expr);
		}
	}

	this.last_input_var = 0;

	this.read_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var count = statement.children.length;
		for (var i = 0; i<count; i++) {
			var variable = statement.children[i];
			var name = variable.text;
			if (self.data_pointer>self.data.length) {
				throw "ERROR: READ without DATA";
			}
			var value = self.data[self.data_pointer++].text;
			self.setValue(variable, value);
		}
		return idx + 1;
	}

	this.input_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var count = statement.children.length;
		var prompt = statement.children[0].text;
		if (self.print_function && self.last_input_var==0) {
			self.print_function(prompt, false);
			self.last_input_var = 1;
		}

		for (var i = self.last_input_var; i<count; i++) {
			var variable = statement.children[i];
			var name = variable.text;
			var value = null;
			if (self.input_stack.length>0) {
				self.setValue(variable, self.input_stack.pop());
				continue;
			}

			if (name[name.length-1]=="$") {
				if (self.string_input_function) {
					value = self.string_input_function(prompt);
				} else {
					throw "ERROR: string input function not defined";
				}
			} else {
				if (self.number_input_function) {
					value = self.number_input_function(prompt);
				} else {
					throw "ERROR: number input function not defined";
				}
			}
			if (value==null) {
				self.last_input_var = i;
				return -1; //pause until we get value for input
			}

			self.setValue(variable, value);

		}
		if (self.print_function) {
			self.print_function("", true);
		}

		self.last_input_var = 0;
		return idx+1;
	}

	this.print_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var count = statement.children.length;
		debug("PRINTING "+count);
		var result = "";
		for (var i = 0; i< count; i++) {
			var child = statement.children[i];
			if (child.getType()==="EXPRESSION") {
				var res = self.evalExpr(child);
				result += res;
			}
			if (child.getType()=="DELIMITER") {
				var t = child.text;
				if (t==",")
					result += "   ";
			}
		}

		var eol = true;

		if (count>0 && statement.children[count-1].text==";") {
			eol = false;
		}

		if (self.print_function)
			self.print_function(result, eol);

		return idx + 1;
	}

	this.cls_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		if (self.clear_function)
			self.clear_function();
		return idx + 1;
	}

	this.randomize_statement = function(self, idx){
		var statement = self.parser.statements[idx];
		var v = self.evalExpr(statement.children[0]);
		if (is_number(v)) {
			random.setSeed(v);
		} else {
			throw "ERROR: RANDOMIZE expects number as argument";
		}
		return idx + 1;
	}

	this.assignment_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var count = statement.children.length;
		var variable = statement.children[0];
		var expression = statement.children[1];
		var exprvalue = self.evalExpr(expression);
		self.setValue(variable, exprvalue);
		return idx + 1;
	}

	this.find_label = function(label) {
		var label_index = this.parser.label_index;
		if (label_index[label]==undefined)
			throw "ERROR: goto destination "+label + " not found";
		debug("NEXT INDEX" + label_index[label]);
		return label_index[label];
	}

	this.if_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var count = statement.children.length;

		debug("IF "+count + " " + statement.getText());
		for (var i = 0; i<count; i++) {
			debug(statement.children[i]);
		}

		var expression = statement.children[0];
		var exprvalue = self.evalExpr(expression);
		debug(exprvalue);
		if (exprvalue) {
			thenpart = statement.children[1];
			return self.find_label(thenpart.getText());
		} else {
			elsepart = statement.children[2];
			return self.find_label(elsepart.getText());
		}
		return idx + 1;
	}

	this.goto_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var label = statement.getText();
		return self.find_label(label);
	}


	this.gosub_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var label = statement.getText();
		self.gosub_stack.push(idx+1);
		if (self.gosub_stack.length>MAX_GOSUB) {
			throw "ERROR: GOSUB stack exceeded";
		}
		return self.find_label(label);
	}

	this.return_statement = function(self, idx) {
		if (self.gosub_stack.length==0) {
			throw "ERROR: RETURN without GOSUB";
		}
		var nidx = self.gosub_stack.pop();
		debug("RETURN TO " + nidx);
		return nidx;
	}

	this.find_next = function(idx, varname) {
		var len =  this.parser.statements.length;
		for (var i = idx + 1; i<len; i++) {
			var statement = this.parser.statements[i];
			if (statement.getType()=="NEXT") {
				/*next without variable match with anything*/
				if (statement.children.length==0) {
					return i;
				}
				var nextlen = statement.children.length;
				for (var j = 0; j<nextlen; j++) {
					if (statement.children[j].text===varname) {
						return i;
					}
				}
			}
		}
		throw "ERROR: FOR without NEXT";
	}

	this.find_wend = function(idx, varname) {
		var len =  this.parser.statements.length;
		for (var i = idx + 1; i<len; i++) {
			var statement = this.parser.statements[i];
			if (statement.getType()=="WEND") {
				return i;
			}
		}
		throw "ERROR: while without wend";
	}


	this.while_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		var expression  = statement.children[0];
		var val = self.evalExpr(expression);
		if (typeof(val)!=="number" && typeof(val)!=="boolean") {
			throw "ERROR: WHILE expression is not boolean";
		}
		if (val) {
			self.while_stack.push(idx);
			return idx+1;
		} else {
			var next = self.find_wend(idx);
			return next + 1;
		}
	}

	this.wend_statement = function(self, idx) {

		if (self.while_stack.length==0) {
			throw "ERROR:  WEND without while";
		}
		var statement = self.parser.statements[idx];
		var whilepos = self.while_stack.pop();
		return whilepos;
	}

	this.for_statement = function(self, idx) {

		var statement = self.parser.statements[idx];
		var loopvar = statement.children[0].getText();
		var start = statement.children[1];
		var startval = self.evalExpr(start);

		if (typeof(startval)!=="number") {
			throw "ERROR: FOR expression is not numeric";
		}

		var end = statement.children[2];
		var endval = self.evalExpr(end);

		if (typeof(endval)!=="number") {
			throw "ERROR: TO expression is not numeric";
		}

		var stepval = 1;
		if (statement.children.length==4) {
			var step = statement.children[3];
			stepval = self.evalExpr(step);
		}

		/*find the next*/
		var next = self.find_next(idx, loopvar);

		self.setNumericValue(loopvar, startval);

		if (startval*stepval>endval) {
			debug("SKIPPING LOOP");
			return next + 1;
		}

		var loop_info = {"lvar": loopvar,
				 "limit": endval,
				 "step": stepval,
				 "body": idx+1};

		self.for_info[idx] = loop_info;
		self.for_stack.push(idx);
		debug("start execute loop");
		return idx+1; //start execute loop
	}


	this.next_statement = function(self, idx) {

		if (self.for_stack.length==0) {
			throw "ERROR: NEXT without FOR";
		}
		var statement = self.parser.statements[idx];

		var nidx = self.for_stack[self.for_stack.length-1];
		var loop_info = self.for_info[nidx];


		var loopvar = loop_info.lvar;
		debug("NEXT TO " + nidx);

		if (statement.children.length==0) {
			var val = self.getNumericValue(loopvar);
			debug("val " + val + " STEP: " + loop_info.step);
			val += loop_info.step;
			debug("valnow " + val);
			if (loop_info.step>=0) {
				if (val > loop_info.limit) {
					self.for_stack.pop();
					return idx + 1;
				}
			} else {
				if (val < loop_info.limit) {
					self.for_stack.pop();
					return idx + 1;
				}
			}
			self.setNumericValue(loopvar, val);
			debug("back to " + loop_info.body);
			return loop_info.body;
		}
		var nextlen = statement.children.length;
		for (var j = 0; j<nextlen; j++) {
			var nextvar = statement.children[j].text;
			if (nextvar===loopvar) {
				var val = self.getNumericValue(loopvar);
				val += loop_info.step;
				var done = false
				if (loop_info.step>=0) {
					if (val > loop_info.limit)
						done = true;
				} else {
					if (val < loop_info.limit)
						done = true;
				}
				if (done) {
					self.for_stack.pop();
					if (j==nextlen-1) {
						return idx + 1;
					}
					if (self.for_stack.length==0) {
						throw "ERROR: NEXT without FOR";
					}

					nidx = self.for_stack[self.for_stack.length-1];
					loop_info = self.for_info[nidx];
					loopvar = loop_info.lvar;
					continue;
				}
				self.setNumericValue(loopvar, val);
				return loop_info.body;
			} else {
				throw "ERROR: Expected NEXT " + loopvar + " got NEXT " + nextvar;
			}
		}

		return nidx;
	}

	this.end_statement = function(self, idx) {
		return self.parser.statements.length+1;
	}

	this.data_statement = function(self, idx) {
		var statement = self.parser.statements[idx];
		return idx + 1;
	}

	this.dummy_statement = function(self, idx) {
		return idx+1;
	}

	this.clear_statement = function(self, idx) {
		variables = new Array;
		return idx + 1;
	}

	this.dim_statement = function(self, idx) {
		debug("DIM DIMENSION");                
		var statement = self.parser.statements[idx];                
		for (var i = 0; i < statement.children.length; i++) {
			var currentvar = statement.children[i];
			var name = currentvar.getText();
			debug("DIM NAME " + name);
			name += "[]";
			if (variables[name]===undefined) {                            
				var v = new Variable(name);
				var bounds = self.get_array_indices(currentvar);
				debug(bounds);
				v.setBounds(bounds);
				variables[name] = v;
			}
		}                
		return idx + 1;
	}

	this.run = function(idx) {
		var statement = this.parser.statements[idx];
		debug("statement: " + statement);
		var type = statement.getType();
		if (type==="LINENUMBER")
			return idx+1;
		if (this.ifunctions[type]!==undefined) {
			return this.ifunctions[type](this, idx);
		}
		return idx+1;
	}
/*
	this.resume_input = function() {
		var len =  this.parser.statements.length;
		var idx = this.last_point;
		this.stop = false;
		while (!this.stop && idx<len) {
			try {
                                var newidx = this.run(idx);
                                hold(1); // this is the key :-)
                        } catch (err) {
                                var errstr = "LINE " + this.find_line_number(idx) + " ";
                                errstr += err;
                                throw errstr;
                        }
                        if (newidx==-1)  {
                                this.last_point = idx;
                                break;
                        }
                        idx = newidx;
		}
		this.last_point = idx;
	}
*/
	this.find_line_number = function(idx) {
		var i = idx;
		while (i>=0) {
			var statement = this.parser.statements[i];
			var type = statement.getType();
			if (type==="LINENUMBER")
				return statement.text;
			i--;
		}
		return 0;
	}

	this.interpret = function() {
		debug("Interpreting");

		var len =  this.parser.statements.length;
		this.data = new Array;
		this.data_pointer = 0;
		variables = new Array;

		for(var i = 0; i<len; i++) {
			var statement = this.parser.statements[i];
			if (statement.getType()=="DATA") {
				var datacount = statement.children.length;
				for (var j = 0; j <datacount ; j++) {
					this.data.push(statement.children[j]);
				}
			}
		}

                var idx = 0;
                this.stop = false;

                this.last_input_var = 0;
                
                // bind stop event to stop button
                var that = this;
                $("input#stopbutton").click(function(){
                    that.stop = "aborted";
                });

                while (!this.stop && idx<len) {
                        //debug("CURRENT = " + idx);
                        try {
                                var newidx = this.run(idx); 
                                hold(1); // this is the key :-)
                        } catch (err) {
                                var errstr = "LINE " + this.find_line_number(idx) + " ";
                                errstr += err;                    
                                throw errstr;
                        }
                        if (newidx==-1)  {
                                this.last_point = idx;
                                break;
                        }
                        idx = newidx;
                }
                this.last_point = idx;
                if (this.stop == "aborted")
                {
                    var errstr = "USER ABORTED AT LINE " + this.find_line_number(idx);
                    throw errstr;
                }                
	}

	this.setParser = function(p) {
		this.parser = p;
	}

	this.last_random = this.random.random();
	this.ifunctions["PRINT"] = this.print_statement;
	this.ifunctions["INPUT"] = this.input_statement;
	this.ifunctions["ASSIGNMENT"] = this.assignment_statement;
	this.ifunctions["IF"] = this.if_statement;
	this.ifunctions["GOTO"] = this.goto_statement;
	this.ifunctions["GOSUB"] = this.gosub_statement;
	this.ifunctions["RETURN"] = this.return_statement;
	this.ifunctions["END"] = this.end_statement;
	this.ifunctions["DIM"] = this.dim_statement;
	this.ifunctions["FOR"] = this.for_statement;
	this.ifunctions["NEXT"] = this.next_statement;
	this.ifunctions["WHILE"] = this.while_statement;
	this.ifunctions["WEND"] = this.wend_statement;
	this.ifunctions["CLS"] = this.cls_statement;
	this.ifunctions["RANDOMIZE"] = this.randomize_statement;
	this.ifunctions["READ"] = this.read_statement;
	this.ifunctions["DATA"] = this.data_statement;
	this.ifunctions["KEY"] = this.dummy_statement;
	this.ifunctions["CLEAR"] = this.clear_statement;
}

exports.runbasic = function (x) { 
    
    runbasic(x)

};
exports.variables = function (x){
    if (!x) return variables;
    try
    {
        return variables[x].value;
    }
    catch (e)
    {
        return undefined;
    }
};