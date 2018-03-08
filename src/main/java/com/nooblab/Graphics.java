/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.nooblab;

import com.google.gson.Gson;
import org.apache.commons.lang.StringUtils;

public class Graphics	    	      	     	        	       	
{   
  private static void redraw()
  {
    try { Thread.yield(); } catch (Exception e) {}
  }
  
  public static void sleep(long millis)
  {
      try { Thread.sleep(millis); } catch (Exception e) {};
  }
  
  public static void setAspectRatio(int x, int y)
  {
      doppio.JavaScript.eval("parent.setAspectRatio("+x+","+y+")");
  }
  
  public static void wipeCanvas()	    	      	     	        	       	
  {	    	      	     	        	       	
    doppio.JavaScript.eval("parent.wipeCanvas()");	    	      	     	        	       	
  }  
  
  public static String drawRectangle(int x, int y, int w, int h, String colour, String strokeColor, int strokeWeight)
  {
    String result = doppio.JavaScript.eval("parent.drawRectangle("+x+","+y+","+w+","+h+",'"+colour+"','"+strokeColor+"',"+strokeWeight+")");
    redraw();
    return result;
  }          
  
  public static String drawRectangle(int x, int y, int w, int h, String colour, String strokeColor)
  {
    String result = doppio.JavaScript.eval("parent.drawRectangle("+x+","+y+","+w+","+h+",'"+colour+"','"+strokeColor+"')");
    redraw();
    return result;
  }
  
  public static String drawRectangle(int x, int y, int w, int h, String colour)
  {
    String result = doppio.JavaScript.eval("parent.drawRectangle("+x+","+y+","+w+","+h+",'"+colour+"')");
    redraw();
    return result;
  }
          
  public static String drawRectangle(int x, int y, int w, int h)	    	      	     	        	       	
  {	    	      	     	        	       	
    String result = doppio.JavaScript.eval("parent.drawRectangle("+x+","+y+","+w+","+h+")");
    redraw();
    return result;
  }	
  
  public static String drawCircle(int x, int y, int r, String colour, String strokeColor, int strokeWeight)
  {
    String result = doppio.JavaScript.eval("parent.drawCircle("+x+","+y+","+r+",'"+colour+"','"+strokeColor+"',"+strokeWeight+")");
    redraw();
    return result;
  }
  
  public static String drawCircle(int x, int y, int r, String colour, String strokeColor)
  {
    String result = doppio.JavaScript.eval("parent.drawCircle("+x+","+y+","+r+",'"+colour+"','"+strokeColor+"')");
    redraw();
    return result;
  }
  
  public static String drawCircle(int x, int y, int r, String colour)
  {
    String result = doppio.JavaScript.eval("parent.drawCircle("+x+","+y+","+r+",'"+colour+"')");
    redraw();
    return result;
  }
  
  public static String drawCircle(int x, int y, int r)
  {
    String result = doppio.JavaScript.eval("parent.drawCircle("+x+","+y+","+r+")");
    redraw();
    return result;
  }
  
  public static String drawLine(int x, int y, int x2, int y2, String strokeColour, int strokeWeight)
  {
    String result = doppio.JavaScript.eval("parent.drawLine("+x+","+y+","+x2+","+y2+",'"+strokeColour+"',"+strokeWeight+")");
    redraw();
    return result;
  }
  
  public static String drawLine(int x, int y, int x2, int y2, String strokeColour)
  {
    String result = doppio.JavaScript.eval("parent.drawLine("+x+","+y+","+x2+","+y2+",'"+strokeColour+"')");
    redraw();
    return result;
  }
  
  public static String drawLine(int x, int y, int x2, int y2)
  {
    String result = doppio.JavaScript.eval("parent.drawLine("+x+","+y+","+x2+","+y2+")");
    redraw();
    return result;
  }
  
  public static String drawPolygon(String points,String colour,String strokeColour,int strokeWidth)
  {
      String result = doppio.JavaScript.eval("parent.drawPolygon('"+points+"','"+colour+"','"+strokeColour+"',"+strokeWidth+")");
      redraw();
      return result;
  }
  
  public static String drawPolygon(int[][] points,String colour,String strokeColour,int strokeWidth)
  {
      String strPoints = "";
      for(int[] coord : points)
      {
          strPoints += coord[0]+","+coord[1]+" ";
      }
      return drawPolygon(strPoints,colour,strokeColour,strokeWidth);
  }
  
  public static String drawText(int x, int y, String text, String style)
  {
      String result = doppio.JavaScript.eval("parent.drawText("+x+","+y+",'"+text+"','"+style+"')");
      redraw();
      return result;
  }
  
  public static String drawText(int x, int y, String text)
  {
      String result = doppio.JavaScript.eval("parent.drawText("+x+","+y+",'"+text+"')");
      redraw();
      return result;
  }
  
  public static void updateText(String id, String newtext)
  {
      doppio.JavaScript.eval("parent.updateText('"+id+"','"+newtext+"')");
  }
  
  public static void updateTextStyle(String id, String newstyle)
  {
      doppio.JavaScript.eval("parent.updateTextStyle('"+id+"','"+newstyle+"')");
  }
  
  public static void updateShapeStyle(String id,String colour,String strokeColour,String strokeWeight)
  {
      doppio.JavaScript.eval("parent.updateShapeStyle('"+id+"','"+colour+"','"+strokeColour+"',"+strokeWeight+")");
  }
  
  public static void updateShapeStyle(String id,String colour,String strokeColour)
  {
      doppio.JavaScript.eval("parent.updateShapeStyle('"+id+"','"+colour+"','"+strokeColour+")");
  }
  
  public static void updateShapeStyle(String id,String colour)
  {
      doppio.JavaScript.eval("parent.updateShapeStyle('"+id+"','"+colour+"')");
  }
  
  public static String drawWebSprite(int x, int y, String url, int w, int h)
  {
      String result = doppio.JavaScript.eval("parent.drawWebSprite("+x+","+y+",'"+url+"',"+w+","+h+")");
      redraw();
      return result;
  }
  
  public static String drawWebSprite(int x, int y, String url, int w)
  {
      String result = doppio.JavaScript.eval("parent.drawWebSprite("+x+","+y+",'"+url+"',"+w+")");
      redraw();
      return result;
  }
  
  public static String drawWebSprite(int x, int y, String url)
  {
      String result = doppio.JavaScript.eval("parent.drawWebSprite("+x+","+y+",'"+url+"')");
      redraw();
      return result;
  }
  
  public static void updateWebSpriteImage(String id, String url)
  {
      doppio.JavaScript.eval("parent.updateWebSpriteImage('"+id+"','"+url+"')");
  }
  
  public static String drawSprite(int x,int y,String[][] data,int width,int height)
  {      
      String jsondata = "[";
      for (String[] line : data)
      {
          jsondata += "[";
          for (String item : line)
          {
              jsondata += "\""+item+"\",";
          }
          jsondata = jsondata.substring(0, jsondata.length() - 1);
          jsondata += "],";
      }
      jsondata = jsondata.substring(0, jsondata.length() - 1);
      jsondata += "]";
      
      String result = doppio.JavaScript.eval("parent.drawSprite("+x+","+y+",'"+jsondata+"',"+width+","+height+")");
      return result;
  }
  
  public static String drawPlayingCard(String num,String suit,int x,int y,int width)
  {
      String result = doppio.JavaScript.eval("parent.drawPlayingCard('"+num+"','"+suit+"',"+x+","+y+","+width+")");
      return result;
  }
  
  public static void updatePosition(String id, int x)
  {
      doppio.JavaScript.eval("parent.updatePosition('"+id+"',"+x+")");	    	      	     	        	       	
      redraw();
  }
  
  public static void updatePosition(String id, Object x, int y)	    	      	     	        	       	
  {
    if (x == null) x = "undefined";
    doppio.JavaScript.eval("parent.updatePosition('"+id+"',"+x+","+y+")");	    	      	     	        	       	
    redraw();
  }
  
  public static void resizeShape(String id,Object width,Object height)
  {
      if (width == null) width = "undefined";
      if (height == null) height = "undefined";
      doppio.JavaScript.eval("parent.resizeShape('"+id+"',"+width+","+height+")");
  }
  
  public static void resizeShape(String id, int width)
  {
      doppio.JavaScript.eval("parent.resizeShape('"+id+"',"+width+")");
  }  
  
  public static void removeShape(String id)
  {
      doppio.JavaScript.eval("parent.removeShape('"+id+"')");
  }
  
  public static boolean isCursorKeyPressed(String key)
  {
      boolean result = doppio.JavaScript.eval("parent.isCursorKeyPressed('"+key+"')").equals("true");
      redraw();
      return result;
  }
  
  public static String whichCursorKeyPressed()
  {
      String result = doppio.JavaScript.eval("parent.whichCursorKeyPressed()");
      redraw();
      return result;
  }
  
}