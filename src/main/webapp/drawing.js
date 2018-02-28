var keysdown = [];
window.onkeyup = function(e) {keysdown[e.keyCode]=false;}
window.onkeydown = function(e) {keysdown[e.keyCode]=true;}

function enableCanvas()
{
    if (!$("div#graphics").is(":visible"))
    {
        toggleGraphics(true);
    }
}

function wipeCanvas()
{
    enableCanvas();
    $("div#graphics svg.container svg.main g").children().remove();
}

function setAspectRatio(x,y)
{
    enableCanvas();
    if (x > y) // landscape
    {
        var baseunit = 1000/x;
        y = Math.round(baseunit * y);
        x = 1000;
    }
    else // portrait;
    {
        var baseunit = 1000/y;
        x = Math.round(baseunit * x);
        y = 1000;
    }
    console.log(baseunit);
    console.log(x);
    console.log(y);
    $("div#graphics svg.main").get(0).setAttribute("viewBox","0 0 "+x+" "+y);
    $("div#graphics svg.main rect#graphicsbackground").get(0).setAttribute("width",x);
    $("div#graphics svg.main rect#graphicsbackground").get(0).setAttribute("height",y);
}

function drawWebSprite(x,y,url,width,height)
{
    enableCanvas();
    var id = "g"+Math.random().toString(36).substr(2, 10);
    var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
    svgimg.setAttribute("id",id);
    if (height) svgimg.setAttributeNS(null,'height',height);
    if (width) svgimg.setAttributeNS(null,'width',width);
    svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
    svgimg.setAttributeNS(null,'x',x);
    svgimg.setAttributeNS(null,'y',y);
    svgimg.setAttributeNS(null, 'visibility', 'visible');    
    $("div#graphics svg.container svg.main g").append(svgimg);
 //   $("div#graphics svg.container svg.main g").html($("div#graphics svg.container svg.main g").html());
    return id;
}

function updateWebSpriteImage(id,url)
{
    enableCanvas();
    if (!$(getShape(id)).is("image")) return; // fail silently if not image
    // otherwise
    getShape(id).setAttributeNS('http://www.w3.org/1999/xlink','href', url);
}

function drawSprite(x,y,data,width,height)
{
    enableCanvas();
    if (typeof data == "string") data = JSON.parse(data);
    var id = "g"+Math.random().toString(36).substr(2, 10);
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','svg');
    
    svgel.setAttribute("id",id);
    if (!width) width = 10;
    if (!height) height = 10;
    svgel.setAttribute("x",x);
    svgel.setAttribute("y",y);
    svgel.setAttribute("width",width);
    svgel.setAttribute("height",height);
    // find out how many "pixels" wide we are
    var maxx = 0;
    var maxy = data.length;
    for (var y = 0; y < maxy; y++)
    {
        if (data[y].length > maxx) maxx = data[y].length;
    }
    
    var pixelwidth = width/maxx;
    var pixelheight = height/maxy;
    
    for (var y = 0; y < maxy; y++)
    {
        for (var x = 0; x < maxx; x++)
        {
            var col = data[y][x];
            if (col != "" && col != undefined)
            {
                var svgpixel = document.createElementNS('http://www.w3.org/2000/svg','rect');
                svgpixel.setAttribute("x",x*pixelwidth+"%");
                svgpixel.setAttribute("y",y*pixelheight+"%");
                svgpixel.setAttribute("width",pixelwidth+"%");
                svgpixel.setAttribute("height",pixelheight+"%");
                svgpixel.setAttribute("stroke",col);
                svgpixel.setAttribute("stroke-width",0);
                svgpixel.setAttribute("fill",col); 
                $(svgel).append(svgpixel);
            }
        }
    }
    
    $("div#graphics svg.container svg.main g").append(svgel);
    
    return id;    
}

function drawRectangle(x,y,width,height,colour,strokeColour,strokeWeight)
{
    enableCanvas();
    if (colour == undefined) colour = "black";
    if (strokeColour == undefined) strokeColour = "black";
    if (strokeWeight == undefined) strokeWeight = "0";
    if (x == undefined) x = 20;
    if (y == undefined) y = 20;
    if (height == undefined) height = 20;
    if (width == undefined) width = 20;
    
    var id = "g"+Math.random().toString(36).substr(2, 10);
    
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','rect');
    svgel.setAttribute("id",id);
    svgel.setAttribute("x",x);
    svgel.setAttribute("y",y);
    svgel.setAttribute("width",width);
    svgel.setAttribute("height",height);
    svgel.setAttribute("stroke",strokeColour);
    svgel.setAttribute("stroke-width",strokeWeight);
    svgel.setAttribute("fill",colour);    
    
    $("div#graphics svg.container svg.main g").append(svgel);
    return id;
}

function drawCircle(x,y,radius,colour,strokeColour,strokeWeight)
{
    enableCanvas();
    if (colour == undefined) colour = "black";
    if (strokeColour == undefined) strokeColour = "black";
    if (strokeWeight == undefined) strokeWeight = "0";
    if (x == undefined) x = 20;
    if (y == undefined) y = 20;
    if (radius == undefined) radius = 20;
    
    var id = "g"+Math.random().toString(36).substr(2, 10);
    
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','circle');
    svgel.setAttribute("id",id);
    svgel.setAttribute("cx",x);
    svgel.setAttribute("cy",y);
    svgel.setAttribute("r",radius);
    svgel.setAttribute("stroke",strokeColour);
    svgel.setAttribute("stroke-width",strokeWeight);
    svgel.setAttribute("fill",colour);   
            
    $("div#graphics svg.container svg.main g").append(svgel);
    return id;    
}

function drawLine(x,y,x2,y2,strokeColour,strokeWeight)
{
    enableCanvas();
    if (strokeColour == undefined) strokeColour = "black";
    if (strokeWeight == undefined) strokeWeight = "2";
    
    var id = "g"+Math.random().toString(36).substr(2, 10);
    
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','line');
    svgel.setAttribute("id",id);
    svgel.setAttribute("x1",x);
    svgel.setAttribute("y1",y);
    svgel.setAttribute("x2",x2);
    svgel.setAttribute("y2",y2)
    svgel.setAttribute("stroke",strokeColour);
    svgel.setAttribute("stroke-width",strokeWeight);
    
    $("div#graphics svg.container svg.main g").append(svgel);
    return id;    
}

function drawPolygon(points,fillColour,strokeColour,strokeWeight)
{
    enableCanvas();
    if (fillColour == undefined) fillColour = "black";
    if (strokeColour == undefined) strokeColour = "transparent";
    if (strokeWeight == undefined) strokeWeight = 2;
    
    // what is points?
    var arrpoints = [];
    var strpoints = "";
    if (typeof points != "object") // we assume string
    {
        strpoints = points.trim();
        var toplevel = strpoints.split(" ");
        for (var i = 0; i < toplevel.length; i++)
        {
            var nextlevel = toplevel[i];
            arrpoints.push(nextlevel.split(","));
        }
    }
    else // we assume string
    {
        arrpoints = points;
        for (var i = 0; i < arrpoints.length; i++)
        {
            var current = arrpoints[i];
            strpoints += current[0]+","+current[1]+" ";
        }
        strpoints = strpoints.trim();
    }
    // in arrpoints we should have an array in the form
    // [
    //   [ 10,10 ],
    //   [ 100,5 ],
    //   [ 50,90 ]
    // ]
    // 
    // now iterate through and find the lowest and highest x/y coords
    var highx = undefined;
    var highy = undefined;
    var lowx = undefined;
    var lowy = undefined;
    
    for (var i = 0; i < arrpoints.length; i++)
    {
        var coord = arrpoints[i];
        if (coord[0] < lowx || lowx == undefined) lowx = parseInt(coord[0]);
        if (coord[0] > highx || highx == undefined) highx = parseInt(coord[0]);
        if (coord[1] < lowy || lowy == undefined) lowy = parseInt(coord[1]);
        if (coord[1] > highy || highy == undefined) highy = parseInt(coord[1]);
    }
    
    var width = highx - lowx;
    var height = highy - lowy;
    
    var id = "g"+Math.random().toString(36).substr(2, 10);
   
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    svgel.setAttribute("id",id);
    svgel.setAttribute("points",strpoints);
    svgel.setAttribute("stroke",strokeColour);
    svgel.setAttribute("stroke-width",strokeWeight);
    svgel.setAttribute("fill",fillColour); 
    // these attributes aren't actually used by the polygon, but we'll
    // make use of them if we ever resize or reposition it
    svgel.setAttribute("x",lowx);
    svgel.setAttribute("y",lowy);
    svgel.setAttribute("width",width);
    svgel.setAttribute("height",height);
    
    $("div#graphics svg.container svg.main g").append(svgel);
    return id;    
}

function drawPlayingCard(num,suit,x,y,width)
{
    enableCanvas();
    if (num == 1) num = "ace";
    num = num.toLowerCase();
    suit = suit.toLowerCase();    
    var url = contextPath+"/images/cards/"+num+"_of_"+suit+".svg";
    
    var id = "g"+Math.random().toString(36).substr(2, 10);
    // apparently, non-Chrome browsers need both width and height for an
    // SVG <image> within a wrapping SVG to render...
    // based on the dimensions in the card SVGs, 1.45 should do the trick
    return drawWebSprite(x,y,url,width,width*1.45);
}

function drawText(x,y,text,style)
{
    var svgel = document.createElementNS('http://www.w3.org/2000/svg','text');
    var id = "g"+Math.random().toString(36).substr(2, 10);
    svgel.setAttribute("id",id);
    svgel.setAttribute("x",x);
    svgel.setAttribute("y",y);
    if (style != undefined)
    {
        svgel.setAttribute("style",style);
    }
    svgel.setAttribute("dominant-baseline","hanging");
    var textNode = document.createTextNode(text);
    svgel.appendChild(textNode);
    $("div#graphics svg.container svg.main g").append(svgel);
    return id;
}

function updateText(id,newtext)
{
    if (getShape(id).tagName != "text") return; // fail silently...
    getShape(id).textContent = newtext;
}

function updateTextStyle(id,newstyle)
{
    if (getShape(id).tagName != "text") return; // fail silently...
    getShape(id).setAttribute("style",newstyle);
}

function getShape(id)
{    
    var shape = $("div#graphics svg.container svg.main g")[0].querySelector("#"+id);
    return shape;
}

function getXPos(id)
{
    return getShape(id).getAttribute("cx");
}

function getYPos(id)
{
    return getShape(id).getAttribute("cy");
}

function updatePosition(id,x,y)
{    
    if (x == undefined) x = getXPos(id);
    if (y == undefined) y = getYPos(id);
    
    var shapeType = getShape(id).tagName;
    
    if (shapeType == "circle")
    {
        getShape(id).setAttribute("cx",x);
        getShape(id).setAttribute("cy",y);
    }
    else if (shapeType == "polygon")
    {
        var existingpoints = getShape(id).getAttribute("points").trim().split(" ");
        var newpoints = "";
        var basex = parseInt(getShape(id).getAttribute("x"));
        var basey = parseInt(getShape(id).getAttribute("y"));
        for (var i = 0; i < existingpoints.length; i++)
        {
            var existingpoint = existingpoints[i].split(",");
            var existingx = parseInt(existingpoint[0]);
            var existingy = parseInt(existingpoint[1]);
            var offsetx = existingx - basex;
            var offsety = existingy - basey;
            var newx = x+offsetx;
            var newy = y+offsety;
            newpoints += newx+","+newy+" ";
        }
        newpoints = newpoints.trim();
        getShape(id).setAttribute("points",newpoints);
        getShape(id).setAttribute("x",x);
        getShape(id).setAttribute("y",y);
    }
    else
    {
        getShape(id).setAttribute("x",x);
        getShape(id).setAttribute("y",y);
    }
}

function resizeShape(id,width,height)
{    
    if (width == undefined && height == undefined) return; // not much point!
    var shapeType = getShape(id).tagName;
    if (shapeType == "line") return;
    if (shapeType == "circle")
    {
        // use whichever is the biggest 
        width = width || 0;
        height = height || 0;
        var radius = (width > height) ? width : height;        
        getShape(id).setAttribute("r",radius);
    }
    else
    {
        // get the current width and height
        var currentWidth = getShape(id).getAttribute("width");
        var currentHeight = getShape(id).getAttribute("height");
        
        if (width == undefined)
        {
            width = (currentWidth/currentHeight) * height; 
        }
        if (height == undefined)
        {
            height = (currentHeight/currentWidth) * width;
        }
        
        getShape(id).setAttribute("width",width);
        getShape(id).setAttribute("height",height);        
    }
    
    // note NOT else if! We need to do kludgery to recalculate the points of
    // a polygon...
    if (shapeType == "polygon")
    {
        var wmult = /* target */ width / currentWidth;
        var hmult = /* target */ height / currentHeight;
        var newpoints = "";
        var oldpoints = getShape(id).getAttribute("points").trim().split(" ");
        var x = parseInt(getShape(id).getAttribute("x"));
        var y = parseInt(getShape(id).getAttribute("y"));
        for (var i = 0; i < oldpoints.length; i++)
        {
            var point = oldpoints[i].split(",");
            var oldoffsetx = point[0]-x;
            var oldoffsety = point[1]-y;
            var newoffsetx = oldoffsetx * wmult;
            var newoffsety = oldoffsety * hmult;
            
            newpoints += (newoffsetx+x)+","+(newoffsety+y)+" ";
        }
        newpoints = newpoints.trim();
        getShape(id).setAttribute("points",newpoints);
    }
}


function removeShape(id)
{
    $(getShape(id)).remove();
}

function isCursorKeyPressed(key)
{
    if (key == "up" && keysdown[38]) return true;
    if (key == "down" && keysdown[40]) return true;
    if (key == "left" && keysdown[37]) return true;
    if (key == "right" && keysdown[39]) return true;
}

function whichCursorKeyPressed()
{
    var result = "";
    if (keysdown[38]) result += "up ";
    if (keysdown[40]) result += "down ";
    if (keysdown[37]) result += "left ";
    if (keysdown[39]) result += "right ";
    result = result.trim();
    if (result == "") return "none";
    return result;
}