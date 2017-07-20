var $builtinmodule = function(name)
{
    var mod = {};
    mod.alert = new Sk.builtin.func(function(text){
       alert(text.v); 
    });
    
    mod.initialiseCarol = new Sk.builtin.func(function(){        
       parent.carol.initialiseCarol(); 
    });
    
    mod.move = new Sk.builtin.func(function(){       
        parent.carol.move();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.up = new Sk.builtin.func(function(){       
        parent.carol.up();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.down = new Sk.builtin.func(function(){       
        parent.carol.down();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.left = new Sk.builtin.func(function(){       
        parent.carol.left();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.right = new Sk.builtin.func(function(){       
        parent.carol.right();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.backwards = new Sk.builtin.func(function(){       
        parent.carol.backwards();
        Sk.hold(parent.carol.getMoveDelay()*3);             
    });
    
    mod.turnLeft = new Sk.builtin.func(function(){       
        parent.carol.turnLeft();
        Sk.hold(parent.carol.getMoveDelay());             
    });
    
    mod.getState = new Sk.builtin.func(function(x,y){        
        if (x == undefined && y == undefined)
        {
            return Sk.builtin.list(parent.carol.getState());
        }
        else
        {
            var ret = parent.carol.getState(x.v,y.v);
            console.log("Returning "+ret);
            console.log(x);
            console.log(y);
            return Sk.builtin.str(ret);
        }
    });
    
    mod.atGoal = new Sk.builtin.func(function(){       
        return parent.carol.atGoal();        
    });
    
    mod.notAtGoal = new Sk.builtin.func(function(){       
        return parent.carol.notAtGoal();        
    });
    
    mod.isBlocked = new Sk.builtin.func(function(){       
        return parent.carol.isBlocked();        
    });
    
    mod.isNotBlocked = new Sk.builtin.func(function(){       
        return parent.carol.isNotBlocked();        
    });
    
    mod.isPickupVisible = new Sk.builtin.func(function(){       
        return parent.carol.isPickupVisible();        
    });
    
    mod.distanceToPickup = new Sk.builtin.func(function(){       
        return parent.carol.distanceToPickup();        
    });
    
    mod.pickUp = new Sk.builtin.func(function(){       
        parent.carol.pickUp();        
    });
    
    mod.pickup = new Sk.builtin.func(function(){       
        parent.carol.pickUp();        
    });
    
    mod.putDown = new Sk.builtin.func(function(){       
        parent.carol.putDown();        
    });
    
    mod.putdown = new Sk.builtin.func(function(){       
        parent.carol.putDown();        
    });
        
    return mod;
}

