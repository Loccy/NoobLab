/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var carolXpos = 0;
var carolYpos = 0;
var carolDirection = "right";
var carolBasket = [];
var moveDelay = 300; // ms

var carolImage = parent.carolImage;

var carolDiv;

var isTest;

function spanner(msg)
{
    var Sk = $("iframe#outputframe").get(0).contentWindow.Sk;    
    if (typeof Sk === 'undefined')
    {
        throw new Error(msg)
    }
    else
    {        
        Sk.halt(msg);
        throw new Error(msg);
    }
}

function initialiseCarol(test,reset)
{
    isTest = test;
    carolDiv = getCarolDiv();

    if (carolDiv == undefined)
    {
        spanner("You need a Carol grid to be on the screen before you can run a Carol program! Scroll down (or up) until an appropriate grid is in the browser window.");
    }

    // find carol starting point   
    var carolCoords = $(carolDiv).find("div.startat").text().trim();
    var startx = 0;
    var starty = 0;

    var currentCoords = $(carolDiv).find("img.carol").parent()[0].className.replace(/[^0-9|^-]/g,"").split("-");
    var currentX = parseInt(currentCoords[0]);
    var currentY = parseInt(currentCoords[1]);

    if (carolCoords != "")
    {
        startx = parseInt(carolCoords.split(",")[0]);
        starty = parseInt(carolCoords.split(",")[1]);
    }

    if (parent.$("div.parameter#kinder").text().trim() != "true" || reset)
    {
        carolXpos = startx;
        carolYpos = starty;
    
        // make carol face default right
        carolDirection = "right";
    
        // repaint current Carol DIV
        //parent.buildCarolDiv(carolDiv);
    }
    else
    {
        carolXpos = currentX;
        carolYpos = currentY;
    }
    if (parent.$("div.parameter#kinder").text().trim() != "true") parent.buildCarolDiv(carolDiv);
    updateCarol();
    
}

function isBlocked()
{
    var carolsize = $(carolDiv).find("div.size").css("display","none")
                        .text().trim();
    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);

    var x = 0;
    var y = 0;
    
    if (carolDirection == "left") x = -1;
    if (carolDirection == "right") x = 1;
    if (carolDirection == "up") y = -1;
    if (carolDirection == "down") y = 1;
    
    x = carolXpos + x;
    y = carolYpos + y;
    
    if (x < 0 || y < 0 || x > (carolsize-1) || y > (carolsize-1) || getSquare(x,y).hasClass("blocked")) return true;
    return false;
}

function isNotBlocked()
{
	return !isBlocked();
}

function getCarolDiv()
{    
    return parent.getCarolDiv();
}

function getSquare(x,y)
{
    if (x == undefined) x = carolXpos;
    if (y == undefined) y = carolYpos;
    
    return $(carolDiv).find(".carolsquare.carolpos"+x+"-"+y);
}

// displays Carol on the board in the right place.
function updateCarol(reset)
{
    if (carolDiv == undefined) carolDiv = getCarolDiv();
    if (reset)
    {
        var carolCoords = $(carolDiv).find("div.startat").text().trim();
        if (carolCoords != "")
        {
            carolXpos = parseInt(carolCoords.split(",")[0]);
            carolYpos = parseInt(carolCoords.split(",")[1]);
        }
    }
    // remove any existing carol image
    $(carolDiv).find("img.carol").remove();
    getSquare().append('<img class="carol" src="'+parent.contextPath+'/images/'+carolImage+'-'+carolDirection+'.png"/>');
}

// turns Carol left
function turnLeft()
{
    if (parent.$("div.parameter#realcarol").text().trim() == "true")
    {
        $.ajax({
            type: "GET",
            url: parent.contextPath+"/BotController?direction=left",
            cache: false,
            async: false
        })
        hold(3000);
    }

    if (carolDirection == "right")
    {
        carolDirection = "up";
    }
    else if (carolDirection == "up")
    {
        carolDirection = "left";
    }
    else if (carolDirection == "left")
    {
        carolDirection = "down";
    }
    else if (carolDirection == "down")
    {
        carolDirection = "right";
    }
    updateCarol();    
    hold(moveDelay);
}

function niblick()
{
    if (carolDirection == "right")
    {
        carolDirection = "down";
    }
    else if (carolDirection == "up")
    {
        carolDirection = "right";
    }
    else if (carolDirection == "left")
    {
        carolDirection = "up";
    }
    else if (carolDirection == "down")
    {
        carolDirection = "right";
    }
    updateCarol();
    hold(moveDelay);
}

function up()
{
    move(1,"up");
}

function down()
{
    move(1,"down");
}

function right()
{
    move(1,"right");
}

function left()
{
    move(1,"left");
}

function backwards()
{
   if (carolDirection == "up") move(1,"down");
   if (carolDirection == "down") move(1,"up");
   if (carolDirection == "left") move(1,"right");
   if (carolDirection == "right") move(1,"left");
}

function move(distance,dir)
{
    if (parent.$("div.parameter#realcarol").text().trim() == "true")
    {
        $.ajax({
            type: "GET",
            url: parent.contextPath+"/BotController?direction=forward",
            cache: false,
            async: false
        })
    }

    if (dir == undefined) dir = carolDirection;

    var carolsize = $(carolDiv).find("div.size").css("display","none")
                        .text().trim();
    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);

    if (distance == undefined) distance = 1;
    for (var count = 0; count < 1; count++)
    {
        var x = 0;
        var y = 0;
        if (dir == "left") x = -1;
        if (dir == "right") x = 1;
        if (dir == "up") y = -1;
        if (dir == "down") y = 1;
        var top = 0;
        var left = 0;
        carolXpos += x;
        carolYpos += y;
        
        var carolImg = $(carolDiv).find("img.carol");

        var size = parseInt($(carolDiv).find(".carolsquare").eq(0).css("width"));

        if (carolXpos < 0 || carolYpos < 0 || carolXpos > (carolsize-1) || carolYpos > (carolsize-1) || getSquare().hasClass("blocked"))
        {
            size = parseInt(size / 4);
            /* spanner("Carol can't move in that direction! Carol's giving up!"); */
        }
        if (x != 0) $(carolImg).animate({"margin-left" : size*x},moveDelay*3);
        if (y != 0) $(carolImg).animate({"margin-top" : size*y},moveDelay*3);
        hold(moveDelay*3);

        // animation on IE is WAY too slow. grrrr.
        //if (!$.browser.msie)
        /*{
            for (var i = 0; i < size; i++)
            {
                $(carolImg).css("margin-left",left+"px");
                $(carolImg).css("margin-top",top+"px");
                left += x;
                top += y;
                hold(moveDelay/size);
            }
        } */
        /*else
        {
            var jerkyIncrement = size/4;
            var xJerk = x*jerkyIncrement;
            var yJerk = y*jerkyIncrement;
            for (var i = 0; i < 4; i++)
            {
                $(carolImg).css("margin-left",left+"px");
                $(carolImg).css("margin-top",top+"px");
                left += xJerk;
                top += yJerk;
                hold(moveDelay/4);
            }
        } */

        if (carolXpos < 0 || carolYpos < 0 || carolXpos > (carolsize-1) || carolYpos > (carolsize-1) || getSquare().hasClass("blocked"))
        {
             spanner("Carol can't move in that direction! Carol's giving up!");
        }

        $(carolImg).remove();
        updateCarol();
        if (parent.$("div.parameter#realcarol").text().trim() == "true") hold(3000);
        hold(moveDelay);
    }
    //if (atGoal() && !isTest) /* return */ spanner("NOTERRORCarol has found her way home and is stopping and putting her feet up.");
}

function pickUp()
{
    // where are we? :-)
    if (!getSquare().hasClass("pickup"))
    {
        /* return */ spanner("Nothing in the square to pick up! Carol's brain hurts now so she's giving up.");
    }
    
    // otherwise, what are we picking up? :-)
    var item = getSquare().text();
    getSquare().text("");
    getSquare().removeClass("pickup");
    
    // add to basket
    carolBasket[carolBasket.length] = item;
    
    // print out the basket
    printBasket();
    
    carolImage = "package";
    
    updateCarol();
    
    hold(moveDelay);    
}

function printBasket()
{
    if (typeof cls == "undefined")
    {    
      cls = outputframe.cls;
    }
    if (typeof println == "undefined")
    {
      println = outputframe.outf;
    }

    // print out the basket
    cls();
    if (carolBasket.length == 0)
    {
        println("Carol's trolley is now empty.");
    }
    else
    {
        println("Carol's trolley now contains "+carolBasket);
    }
}

function putDown(index)
{
    // if there's something already there!
    if (getSquare().hasClass("pickup"))
    {
        /* return */ spanner ("Can't put something down there! There's already something there, so Carol gives up!");
    }
    
    // nothing in basket
    if (carolBasket.length == 0)
    {
        /* return */ spanner ("Carol hasn't got anything in her trolley to put down, so she gives up!");
    }
    
    if (index == undefined) index = carolBasket.length - 1;
    var item = carolBasket.splice(index,1);
    
    if (item.length == 0)
    {
        /* return */ spanner ("Carol doesn't have that many things in her trolley, so she's giving up!");
    }
    
    item = item[0];
    
    if (carolBasket.length == 0) carolImage = "carol";
    updateCarol();
    
    getSquare().append(item);
    getSquare().addClass("pickup");
    
    printBasket();
    
    hold(moveDelay);
}

function atGoal()
{
    if (getSquare().hasClass("goal")) return true;
    return false;
}

function notAtGoal()
{
    return (!(atGoal()));
}

function isPickupVisible(distanceMode)
{
    var carolsize = $(carolDiv).find("div.size").css("display","none")
                        .text().trim();
    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);

    var x = 0;
    var y = 0;
    if (carolDirection == "left") x = -1;
    if (carolDirection == "right") x = 1;
    if (carolDirection == "up") y = -1;
    if (carolDirection == "down") y = 1;

    var found = -1;
    var Xpos = carolXpos;
    var Ypos = carolYpos;
    var count = 0;
    do
    {
        if (!distanceMode)
        {
            // do animation
            getSquare(Xpos,Ypos).addClass("temphighlight");
            hold(moveDelay/3);
        }

        // pickup detected at current square?
        if (getSquare(Xpos,Ypos).hasClass("pickup"))
        {
            found = count;
        }

        // move pos
        Xpos += x;
        Ypos += y;

        // check for blocked
        if (Xpos > (carolsize-1) || Ypos > (carolsize-1) || Xpos < 0 || Ypos < 0 || getSquare(Xpos,Ypos).hasClass("blocked"))
        {
            if (found == -1) found = -2;
        }
        count++;
    } while (found == -1);

    // reset highlights
    if (!distanceMode)
    {
        hold(moveDelay);
        $(carolDiv).find(".temphighlight").removeClass("temphighlight");
    }

    // return value
    if (!distanceMode)
    {
        if (found < 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    return found;
}

function distanceToPickup()
{
    var distance = isPickupVisible(true);
    if (distance < 0) spanner("Carol can't see a pickup in the direction she's facing, so she's giving up.");    
    return distance;
}

function getState(x,y)
{
    if (carolDiv == undefined) carolDiv = getCarolDiv();
    var carolsize = $(carolDiv).find("div.size").text().trim();

    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);

    if (x != undefined && y != undefined)
    {
        var state = "-";
        var $sq = getSquare(x,y);
        if ($sq.hasClass("goal") && $sq.find("img.carol").length != 0)
        {
            state = "W";
        }
        else if ($sq.find("img.carol").length != 0)
        {
            state = "C";
        }
        else if ($sq.hasClass("blocked"))
        {
            state = "X";
        }
        else if ($sq.hasClass("goal"))
        {
            state = "G";
        }
        else if ($sq.text().trim() != "")
        {
            state = $sq.text().trim();
        }
        return state;
    }
    
    // otherwise, it's give an array back for the whole board.    
    var lines = [];
     // set up the board.            
    for (var y = 0; y < carolsize; y++)
    {
        var line = [];
        for (var x = 0; x < carolsize; x++)
        {
            line += getState(x,y);
        }
        lines[lines.length] = line;
    }
    return lines;
}

function pause()
{
    input("Carol is paused. Press RETURN to make her continue.");
}

exports.getState = function (x,y) {     
    return getState(x,y);
};

// throws error hence X
exports.move = function (distance) {     
    return move(distance);
};

exports.up = function() {
    return up();
}

exports.down = function() {
    return down();
}

exports.left = function() {
    return left();
}

exports.right = function() {
    return right();
}

exports.turnLeft = function () {     
    return turnLeft();
};

exports.niblick = function () {
   return niblick();
};

exports.backwards = function() {
   return backwards();
};

exports.initialiseCarol = function(x,y) {
    return initialiseCarol(x,y);
};

exports.updateCarol = function (x) {
    return updateCarol(x);
}

exports.getCarolDiv = function() {
    return carolDiv;
};

// throws error hence X
exports.pickUp = function() {
    return pickUp();
};

// throws error hence X
exports.putDown = function(index) {
    return putDown(index);
};

exports.setDelay = function(x) {
    moveDelay = x;
};

exports.isBlocked = function() {
    return isBlocked();
}

exports.isNotBlocked = function() {
    return isNotBlocked();
}

exports.printBasket = function() {
    return printBasket();
};

exports.isPickupVisible = function() {
    return isPickupVisible();
}

exports.distanceToPickup = function() {
    return distanceToPickup();
}

exports.pause = function() {
    return pause();
}

exports.atGoal = function() {
    return atGoal();
}

exports.notAtGoal = function() {
    return notAtGoal();
}

exports.getMoveDelay = function() {
    return moveDelay;
}

exports.printCommands = function() {

    var hidden = "initialiseCarol,getState,getCarolDiv";
    var commands = [];

    for (var x in exports)
    {
        if (hidden.indexOf(x) == -1) commands[commands.length] = x;
    }
    commands = ""+commands;
    commands = commands.replace(/,/g,", ");
    println("Carol understands the following commands: "+commands);
}
