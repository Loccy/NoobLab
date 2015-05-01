/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab.java;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author paulneve
 */
public class IORedefiner {

    // create the io channel objects
    ArrayList<String> out = new ArrayList<String>();
    ArrayList<String> in = new ArrayList<String>();     

    public ArrayList<String> getOut()
    {
        return out;
    }

    public void setOut(ArrayList<String> out)
    {
        this.out = out;
    }

    public ArrayList<String> getIn()
    {
        return in;
    }

    public void setIn(ArrayList<String> in)
    {
        this.in = in;
    }          

    public void systemOutPrintln(Object arg)
    {
       //synchronized(out) 
      {
        out.add(arg+"<br/>");
        try { Thread.sleep(1); } catch (InterruptedException ex) {}                
      }
      
    }

    public void systemOutPrint(Object arg)
    {
       //synchronized(out) 
       { 
          out.add(""+arg); 
          try { Thread.sleep(1); } catch (InterruptedException ex) {}                
       }
    }

    ////////////////////

    // static method for replacing appropriate bits of code
    public static String modCode(String code, String id, String classWithMain, String pkgWithMain)
    {
        // do replacements

        // System.out.println
        code = code.replace("System.out.println",id+"."+pkgWithMain+"."+classWithMain+".newIo.systemOutPrintln");

        // System.out.print
        code = code.replace("System.out.print",id+"."+pkgWithMain+"."+classWithMain+".newIo.systemOutPrint");

        // finally, add new variable newIo of type IORedefiner with setter
        
        String ioremap = "";
        ioremap += "public static uk.ac.kingston.nooblab.java.IORedefiner newIo; ";
        ioremap += "public static void setNewIo(uk.ac.kingston.nooblab.java.IORedefiner x) { newIo = x; }";

        code = replaceLast(code, "\\}", ioremap+"}");
        
        return code;
    }

     public static String replaceLast(String text, String regex, String replacement) {
        return text.replaceFirst("(?s)"+regex+"(?!.*?"+regex+")", replacement);
    }    

}
