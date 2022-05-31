var $builtinmodule = function(name)
{
    var mod = {};
    
    function generic(funcName,args)
    {
        var jsArr = [];
        for (var i = 0; i < args.length; i++) jsArr.push(args[i].v);        
        console.log(jsArr);
        return parent[funcName].apply(null,jsArr);
    } 
    
    valid = ["drawRectangle","drawCircle","drawLine","drawPolygon","drawText","drawWebSprite","drawPlayingCard","updateText","updateTextStyle","updateWebSpriteImage","updatePosition","resizeShape","removeShape","showShape","hideShape","toggleShape","wipeCanvas","isCursorKeyPressed","whichCursorKeyPressed","setAspectRatio"]
    for (var i = 0; i < valid.length; i++)
    {
        mod[valid[i]] = new Sk.builtin.func(function(){                  
            //var funcName = lastLine.match(/noobgraphics\.(.+?)\(/)[1];
            var result = generic(this.funcName,arguments);
            return Sk.builtin.str(result); 
        },{ "funcName" : valid[i] } )        
    }
    
    mod.drawSprite = new Sk.builtin.func(function(x,y,data,width,height){
    // need to de-skuplt the list in the list
        data = Sk.ffi.remapToJs(data);
/*        for(var row = 0; row < data.length; row++)
        {
            var line = data[row];
            for (var col = 0; col < line.length; col++)
            {
                data[row][col] = data[row][col].v;
            }
        }
        console.log(data); */
        return Sk.builtin.str(parent.drawSprite(x.v,y.v,data,width.v,height.v));
    })
    
    return mod;
}

