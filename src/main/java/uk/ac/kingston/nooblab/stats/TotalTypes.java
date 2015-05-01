/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.stats;

import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;

/**
 *
 * @author paulneve
 */
public class TotalTypes
{
     static String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
    static SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
        static PeriodFormatter daysHoursMinutes = new PeriodFormatterBuilder()
    .appendDays()
    .appendSuffix("d")
    .appendSeparator(" ")
    .appendHours()
    .appendSuffix("h")
    .appendSeparator(" ")
    .appendMinutes()
    .appendSuffix("m")
    .appendSeparator(" ")
    .appendSeconds()
    .appendSuffix("s")
    .toFormatter();
    
    public static String getTotalTime(String knumber, String baseDir) throws Exception
    {
        File datafile = new File(baseDir+"/"+knumber+".csv");
        
        ArrayList<String[]> myEntries = new ArrayList<String[]>();
//
        if (datafile.exists())
        {
            CSVReader reader = new CSVReader(new FileReader(datafile));
            myEntries = new ArrayList(reader.readAll());
        }

        // if after all that we still have an empty list, return
        if (myEntries.size() == 0) return "0s, 0";

        // if the first line isn't a login line, treat the first line as such

        if (!myEntries.get(0)[2].equals("login"))
        {
            myEntries.get(0)[2] = "login";
        }

        Date lastLoginDate = null;
        Date lastLogoutDate = null;

        Period p = new Period();

        if (myEntries.size() == 1)
        {
            return "*** login line only ***";
        }

        for (int i = 0; i < myEntries.size(); i++)
        {
            String[] line = myEntries.get(i);
            // is this a login line?
            if (line[2].equals("login"))
            {
                // last line before a login should be a logout.
                // If not, treat the line before this one as a logout.
                if (i != 0 && !myEntries.get(i-1)[2].equals("logout"))
                {
                    // deduct one from i
                    i--;
                    line = myEntries.get(i);
                    line[2] = "logout";
                }
                // otherwise, it's a login line - process it
                else
                {
                    // bypass duplicate consecutive login lines
                    while(i < myEntries.size()-1 && myEntries.get(i+1)[2].equals("login"))
                    {
                        i++;
                        line = myEntries.get(i);
                    }

                    // just set date of login
                    lastLoginDate = sdf.parse(line[0]);
                    //System.out.println("Login "+lastLoginDate);
                }
            }
            else // it's not a login line
            {
                // is its date BEFORE the last login?
                // this can happen if there's a discrepancy between server
                // and client date/time
                // if so, use it as the last login.                
                Date currentLineDate = sdf.parse(line[0]);
                if (currentLineDate.before(lastLoginDate))
                {
                    lastLoginDate = currentLineDate;
                }
            }


            // is this a logout line?
            if (line[2].equals("logout"))
            {
                lastLogoutDate = sdf.parse(line[0]);
                //System.out.println("adding period "+lastLoginDate+"-"+lastLogoutDate);
                p = p.plus(new Period(new DateTime(lastLoginDate),new DateTime(lastLogoutDate)));
            }
        }

        if (!myEntries.get(myEntries.size()-1)[2].equals("logout"))
        {
            // one sitting with no logout - use last line as logout date
            lastLogoutDate = sdf.parse(myEntries.get(myEntries.size()-1)[0]);
            //System.out.println("adding period "+lastLoginDate+"-"+lastLogoutDate);
            p = p.plus(new Period(new DateTime(lastLoginDate),new DateTime(lastLogoutDate)));
        }
        
        System.out.println(p);

        return (daysHoursMinutes.print(p.normalizedStandard())+", "
                +p.toStandardMinutes().getMinutes());
    }
    
    public static void main(String[] args) throws Exception
   {
       String dir = "/Users/paulneve/Desktop/co1040all";
       File dirF = new File(dir);
       File[] files = dirF.listFiles();    
       int total = 0;

       HashMap<String,Integer> numbers = new HashMap();

       HashMap<String,HashMap<String,Integer>> byUser = new HashMap();

       HashMap<String,Double> percentages = new HashMap();

       for (File file : files)
       {
           HashMap<String,Integer> userNumbers = new HashMap();
           int userTotal = 0;
           ArrayList<String[]> lines = new ArrayList<String[]>();
           CSVReader reader = new CSVReader(new FileReader(file));
           lines = new ArrayList(reader.readAll());

           for (String[] line : lines)
           {
               String type = line[2];
               int no = 0;
               if (numbers.containsKey(type)) no = numbers.get(type)+1;
               numbers.put(type, no); 

               no = 0;
               if (userNumbers.containsKey(type)) no = userNumbers.get(type)+1;
               userNumbers.put(type,no);

               total++;
               userTotal++;
           }                        
           numbers.put("Total",total);
           userNumbers.put("Total",userTotal);
           byUser.put(file.getName(),userNumbers);
       }
       Iterator it = numbers.entrySet().iterator();
       total = numbers.get("Total");
       while (it.hasNext()) {
           Map.Entry pairs = (Map.Entry)it.next();
           double percent = 1D*(Integer)pairs.getValue() / total * 100;
           //System.out.println(pairs.getKey() + " = " + pairs.getValue()+" ("+percent+"%)");
           percentages.put((String)pairs.getKey(),percent);
           //it.remove(); // avoids a ConcurrentModificationException
       }
       
       ArrayList<String> keys = new ArrayList<String>(numbers.keySet());
       System.out.println(keys);
       ArrayList<String> students = new ArrayList<String>(byUser.keySet());
       System.out.println(students);
       
       String header ="";
       String dataString = "";
       
       byUser.put("Total",numbers);
       students.add("Total");
       
       for (String student : students)
       {
           System.out.println("Scanning "+student);
           HashMap<String,Integer> userNumbers = byUser.get(student);
           //System.out.println(file.getName());
           dataString += student+",";
           header = "\"Student\",";
           total = userNumbers.get("Total");  
           for (String key : keys)
           {
               Integer hits = userNumbers.get(key);
               if (hits == null) hits = 0;
               double percent = 1D*hits / total * 100;
               double mainPercent = percentages.get(key);               
               double offsetP = percent - mainPercent;
               
               header += "\""+key+"\",\""+key+"%\","+"\"OFFSET_"+key+"\",";
               dataString += "\""+hits+"\",\""+percent+"\",\""+offsetP+"\",";
               
           }
           String totalTime = getTotalTime(student.replace(".csv",""),dir);
           header += "\"TotalTime\",";
           dataString += totalTime+",";
           dataString += "XXXX";
           dataString = dataString.replace(",XXXX","\n");                      
       }
       header += "XXXX";
        header = header.replace(",XXXX","");                      
       System.out.println(header+"\n"+dataString);
       
       
               /*
       System.out.println("Overall:");
       total = numbers.get("Total");
       while (it.hasNext()) {
           Map.Entry pairs = (Map.Entry)it.next();
           double percent = 1D*(Integer)pairs.getValue() / total * 100;
           System.out.println(pairs.getKey() + " = " + pairs.getValue()+" ("+percent+"%)");
           percentages.put((String)pairs.getKey(),percent);
           it.remove(); // avoids a ConcurrentModificationException
       }
       System.out.println("Total = "+total);
       System.out.println();
       System.out.println();
       System.out.println("By user...");
       System.out.println();
       System.out.println();

       for (File file : files)
       {
           HashMap<String,Integer> userNumbers = byUser.get(file.getName());
           System.out.println(file.getName());
           it = userNumbers.entrySet().iterator();
           total = userNumbers.get("Total");        
           while (it.hasNext()) {
               Map.Entry pairs = (Map.Entry)it.next();
               double percent = 1D*(Integer)pairs.getValue() / total * 100;
               double mainPercent = percentages.get((String)pairs.getKey());
               double offsetP = percent - mainPercent;
               System.out.println(pairs.getKey() + " = " + pairs.getValue()+" ("+percent+"% ... offset by "+offsetP+")");
               it.remove(); // avoids a ConcurrentModificationException

           }
           System.out.println();
       }
       */
}
}
