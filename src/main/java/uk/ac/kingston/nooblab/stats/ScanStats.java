/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab.stats;

import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.ArrayUtils;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;

/**
 *
 * @author paulneve
 */
public class ScanStats {
    
    static String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
    static SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
    
    
    static String[] games = 
{
    "k1458356","k1444774","k1308736","k1314043","k1350969","k1457842","k1416511","k1451069","k1428937","k1433932","k1430895","k1426271","k1136742","k1427318","k1449944","k1459332","k1426434","k1320137","k1353809","k1320666","k1419356","k1322866","k1406059","k1403947","k1407118","k1417906","k1415240","k1421139","k1457777","k1308053","k1415331","k1431662","k1424844","k1323598","k1412521","k1428784","k1417804","k1440577","k1440576","k1326564","k1415709","k1416150","k1414595","k1416077","k1420713","k1444375","k0834603","k1315098","k1329482","k1420690","k1426017","k1437878","k1460419","k1442152","k1314478","k1448922","k1420834","k1460991"
};
    
    static String[] programming1A = 
{
    "k1424832","k1312881","k1462490","k1064006","k1464000","k1319535","k1458440","k1231703","k1359637","k1435626","k1464443","k1404060","k1461324","k1416171","k1461654","k1425819","k1426135","k1461514","k1421599","k1456430","k1428890","k1429663","k1428104","k1439189","k1464888","k1456298","k1462833","k1451927","k1416194","k1402013","k1456370","k1420386","k1459373","k1224187","k1414494","k1413365","k1427301","k1357282","k1418792","k1331415","k1411643","k1414758","k1463884","k1303579","k1432332","k1412050","k1415635","k1445760","k1438332","k1413110","k1304151","k1426446","k1464377","k1416527","k1459982","k1308516","k1458600","k1314411","k1457990","k1310030","k1425067","k1454368","k1222065","k1403955","k1431894","k1457923","k1421600","k1416592","k1416281","k1417154","k1318512","k1323987","k1429269","k1416601","k1425681","k1414561","k1425934","k1423436","k1427126","k1431975","k1427653","k1457391","k1326274","k1463130","k1447546","k1407495","k1315975","k1428683","k1424737","k1420401","k1422655","k1403277","k1458992","k1463467","k1322916","k1409548","k1457144","k1409058","k1451976","k1459824","k1425802","k1408957","k1416170","k1317043","k1436419","k1429465","k1459889","k1459974","k1460697","k1406809","k1457240","k1461981","k1136465","k1422738","k1448981","k1414490","k1412123","k1320864","k1403042","k1411201","k1430996","k1406302","k1408492","k1423459","k1413129","k1418895","k1460501","k1451757","k1459938","k1460789","k1418441","k1421416","k1459795","k1459663","k1415390","k1421103","k1458849","k1408442","k1321984","k1343524","k1427026","k1429795","k1459638","k1418717","k1460846","k1461147","k1040260","k1320370","k1320958","k1329929","k1345120","k1355187","k1404910","k1418750","k1427474","k1445571","k1447717","k1448518","k1459759","k1461770","k1430946","k1412694","k1460847","k1457554","k1436170","k1322820","k1421779"
};
    
    static String[] programming1B =
{  
    "k1328851","k1422602","k1314147","k1329141","k1318552","k1408491","k1310940","k1431011","k1424474","k1408967","k1422101","k1442605","k1232402","k1458610","k1422176","k1460511","k1266827","k1433300","k1316713","k1420505","k1226281","k1316563","k1314131","k1463063","k1326043","k1413506","k1121367","k1316322","k1319623","k1459114","k1463593","k1456652","k1459885","k1420890","k1449658","k1231992","k1449286","k1433204","k1210425","k1347550","k1126427","k1460323","k1425003","k1431124","k1322445","k1420400","k1430230","k1430745","k1430487","k1310999","k1420758","k1459808","k1414862","k1425129","k1427377","k1303072","k1431410","k1425138","k1328022","k1417349","k1408111","k1427303","k1329210","k1412683","k1422889","k1433326","k1311132","k1422220","k1409100","k1451070","k1352451","k1422401","k1405518","k1322117","k1407590","k1432278","k1423946","k1403826","k1303582","k1305646","k1463339","k1410099","k1312207","k1428898","k1448748","k1429589","k1404694","k1414694","k1439071"
};    

    static String[] allProg1 = (String[])ArrayUtils.addAll(programming1A, programming1B);

    static String[] allStudents = (String[])ArrayUtils.addAll(allProg1, games);


    ////////////////////////


    static String[] listOfStudents = allStudents;


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

    static PeriodFormatter seconds = new PeriodFormatterBuilder()
    .appendSeconds()
    .toFormatter();
    
    

    public static String betterGetTotalTime(String knumber, String baseDir) throws IOException, ParseException
    {
        int timeout = 1800; // half an hour in seconds
        
        File datafile = new File(baseDir+"/"+knumber+"/nocode.csv");
        
        ArrayList<String[]> myEntries = new ArrayList<String[]>();
//
        if (datafile.exists())
        {
            CSVReader reader = new CSVReader(new FileReader(datafile));
            myEntries = new ArrayList(reader.readAll());
        }
        
        // if after all that we still have an empty list, return
        if (myEntries.size() == 0) return "0,0";
        
        Date lastDate = null;
        Date currentDate = null;
        
        Period p = new Period();

        if (myEntries.size() == 1)
        {
            return "0,0";
        }
        
        String[] firstLine = myEntries.get(0);
        lastDate = sdf.parse(firstLine[0]);
        
        long seconds = 0;
        
        for (int i = 0; i < myEntries.size(); i++)
        {
            String[] line = myEntries.get(i);
            currentDate = sdf.parse(line[0]);
            Period gap = new Period(new DateTime(lastDate),new DateTime(currentDate));
            long gapSeconds = 0;
            try
            {
                gapSeconds = gap.toStandardDuration().getStandardSeconds();            
            }
            catch (Exception e) { } // do nothing;
            if (gapSeconds < timeout)
            {
                //System.out.println(gapSeconds);
                //System.out.println(gapSeconds+"  "+currentDate);
                seconds += gapSeconds;                
            }
            lastDate = currentDate;
        }
        
        long mins = seconds / 60;
        
        String human = mins/24/60 + "d " + mins/60%24 + "h " + mins%60+"m";                
        
        return (seconds / 60)+","+human;

    }
    
    public static String getTotalTime(String knumber, String baseDir, String smalltest) throws Exception
    {
        File datafile = new File(baseDir+"/"+knumber+".csv");
        
        ArrayList<String[]> myEntries = new ArrayList<String[]>();
//
        if (datafile.exists())
        {
            CSVReader reader = new CSVReader(new FileReader(datafile));
            myEntries = new ArrayList(reader.readAll());
        }

        // prefix the small test if appropriate
        if (smalltest != null)
        {
            File smalltestFile = new File(baseDir+"/../"+smalltest+"/"+knumber+".csv");
            if (smalltestFile.exists())
            {
                CSVReader streader = new CSVReader(new FileReader(smalltestFile));
                ArrayList<String[]> stEntries = new ArrayList(streader.readAll());
                stEntries.addAll(myEntries);
                myEntries = stEntries;
            }
        }

        // if after all that we still have an empty list, return
        if (myEntries.size() == 0) return "0s, 0";

        // if the first line isn't a login line, treat the first line as such

        if (!myEntries.get(0)[1].equals("login"))
        {
            myEntries.get(0)[1] = "login";
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
            if (line[1].equals("login"))
            {
                // last line before a login should be a logout.
                // If not, treat the line before this one as a logout.
                if (i != 0 && !myEntries.get(i-1)[1].equals("logout"))
                {
                    // deduct one from i
                    i--;
                    line = myEntries.get(i);
                    line[1] = "logout";
                }
                // otherwise, it's a login line - process it
                else
                {
                    // bypass duplicate consecutive login lines
                    while(i < myEntries.size()-1 && myEntries.get(i+1)[1].equals("login"))
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
            if (line[1].equals("logout"))
            {
                lastLogoutDate = sdf.parse(line[0]);
                //System.out.println("adding period "+lastLoginDate+"-"+lastLogoutDate);
                p = p.plus(new Period(new DateTime(lastLoginDate),new DateTime(lastLogoutDate)));
            }
        }

        if (!myEntries.get(myEntries.size()-1)[1].equals("logout"))
        {
            // one sitting with no logout - use last line as logout date
            lastLogoutDate = sdf.parse(myEntries.get(myEntries.size()-1)[0]);
            //System.out.println("adding period "+lastLoginDate+"-"+lastLogoutDate);
            p = p.plus(new Period(new DateTime(lastLoginDate),new DateTime(lastLogoutDate)));
        }

        return (daysHoursMinutes.print(p.normalizedStandard())+", "
                +p.toStandardMinutes().getMinutes());
    }

    public static String totalTimeDir(String dir, String smalltest) throws Exception
    {
        File baseDir = new File(dir);
        File[] files = baseDir.listFiles();

        LinkedHashSet<String> fileList = new LinkedHashSet<String>();

        for (File file : files)
        {
             if (file.isFile() && file.getName().contains("csv"))
             {
                 fileList.add(file.getName());
             }
        }

        if (smalltest != null)
        {
            File[] stfiles = new File(baseDir+"/../"+smalltest).listFiles();
            for (File file : stfiles)
            {
                 if (file.isFile() && file.getName().contains("csv"))
                 {
                     fileList.add(file.getName());
                 }
            }
        }

        String retStr = "";
        for (String filename : fileList)
        {
            retStr += filename+": ";
            String knumber = filename.replace(".csv", "");
            try
            {
                retStr += getTotalTime(knumber,dir, smalltest)+"\n";
            }
            catch (Exception e)
            {
                retStr += "*** threw an error :-( ***"+"\n";
                //e.printStackTrace();
            }
        }
        return retStr;
    }

    public static void totals() throws Exception
    {
        File baseDir = new File("/Users/paulneve/Desktop/pp-stats");
        File[] files = baseDir.listFiles();
        HashMap<String,Integer> totals = new HashMap<String,Integer>();


        for (File file : files)
        {
            if (!file.getName().contains("total") && file.getName().contains(".csv"))
            {
                // shlurp in file
                CSVReader reader = new CSVReader(new FileReader(file));
                ArrayList<String[]> lines = new ArrayList(reader.readAll());

                // now go through file's contents
                for (String[] line : lines)
                {
                    if (line.length > 1) // assuming no error at line
                    {
                        int minutes = Integer.parseInt(line[1].trim());
                        String filename = line[0].split(":")[0];
                        String student = filename.split("\\.")[0];
                        if (Arrays.asList(listOfStudents).contains(student))
                        {
                            int existingMins = 0;
                            if (totals.containsKey(filename))
                            {
                                existingMins = totals.get(filename);
                            }
                            totals.put(filename, minutes+existingMins);
                        }
                    }
                }
            }
        }

        System.out.println("Student,total time,total mins,week1,week2,week3 plus st1,week4,week5 plus st2,week5 afternoon,week6 plus st3,week7, week89easter,finalsprint");

        // print out the values
        for (Map.Entry<String, Integer> entry : totals.entrySet())
        {
            String key = entry.getKey();
            int value = entry.getValue();

            Period time = new Period(0, value, 0, 0);

            System.out.print(key+", "+daysHoursMinutes.print(time.normalizedStandard())+", "+value+", ");
            
            // *** rem this out for totals only
            String knumber = key.replace(".csv","");

            String week1time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week1",null).split(",")[0];
            System.out.print(week1time+",");

            String week2time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week2",null).split(",")[0];
            System.out.print(week2time+",");

            String week3time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week3","smalltest1").split(",")[0];
            System.out.print(week3time+",");

            String week4time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week4",null).split(",")[0];
            System.out.print(week4time+",");

            String week5time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week5","smalltest2").split(",")[0];
            System.out.print(week5time+",");

            String week5pm = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/smalltest2/afternoon-session",null).split(",")[0];
            System.out.print(week5pm+",");

            String week6pm = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week6-smalltest3",null).split(",")[0];
            System.out.print(week6pm+",");

            String week7time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week7",null).split(",")[0];
            System.out.print(week7time+",");

            String week8time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata/week89easter",null).split(",")[0];
            System.out.print(week8time+",");

            String week9time = getTotalTime(knumber,"/Volumes/webdav/pp/noobdata",null).split(",")[0];
            System.out.print(week9time);
            // ** end rem

            System.out.println();
        }
    }
    
    public static void newAttendences() throws Exception
    {
       String[] locations = { 
           "/Users/paulneve/Desktop/noobstatscurrent/CI4100/all",
           "/Users/paulneve/Desktop/noobstatscurrent/CI4100-html/all",
           "/Users/paulneve/Desktop/noobstatscurrent/CI4100-Java/all",
           "/Users/paulneve/Desktop/noobstatscurrent/CI4100-JS/all"
       };
       
       ArrayList<DateTime> workshopDates = new ArrayList();
       ArrayList<DateTime> workshopEnds = new ArrayList();
       ArrayList<DateTime> workshopDatesAlt = new ArrayList();
       ArrayList<DateTime> workshopEndsAlt = new ArrayList();
       // CI4520
       //workshopDates.add(new DateTime(sdf.parse("9:00:00 2013/9/23")));
       //workshopEnds.add(new DateTime(sdf.parse("11:00:00 2013/9/23")));   
       //workshopDatesAlt.add(new DateTime(sdf.parse("14:00:00 2013/9/27")));
       //workshopEndsAlt.add(new DateTime(sdf.parse("16:00:00 2013/9/27"))); 
              
       // Programming 1 A
       workshopDates.add(new DateTime(sdf.parse("14:00:00 2013/9/24")));
       workshopEnds.add(new DateTime(sdf.parse("16:00:00 2013/9/24")));   
       workshopDatesAlt.add(new DateTime(sdf.parse("16:00:00 2013/9/24")));
       workshopEndsAlt.add(new DateTime(sdf.parse("18:00:00 2013/9/24")));   
       
       // Programming 1 B
       //workshopDates.add(new DateTime(sdf.parse("14:00:00 2013/9/27")));
       //workshopEnds.add(new DateTime(sdf.parse("16:00:00 2013/9/27")));   
       //workshopDatesAlt.add(new DateTime(sdf.parse("14:00:00 2013/9/27")));
       //workshopEndsAlt.add(new DateTime(sdf.parse("16:00:00 2013/9/27"))); 

       
       for (int i = 0; i < 26; i++)
       {
           DateTime ld = new DateTime(workshopDates.get(workshopDates.size()-1));
           ld = ld.plusDays(7);
           workshopDates.add(ld);
           
           DateTime ldend = new DateTime(workshopEnds.get(workshopEnds.size()-1));
           ldend = ldend.plusDays(7);
           workshopEnds.add(ldend);
           
           DateTime ldalt = new DateTime(workshopDatesAlt.get(workshopDatesAlt.size()-1));
           ldalt = ldalt.plusDays(7);
           workshopDatesAlt.add(ldalt);
           
           DateTime ldendalt = new DateTime(workshopEndsAlt.get(workshopEndsAlt.size()-1));
           ldendalt = ldendalt.plusDays(7);
           workshopEndsAlt.add(ldendalt);
       }      
       
       // go through students
       for (String student : listOfStudents)
       {
           boolean[] attendence = new boolean[workshopDates.size()];
           // attempt to read in the file
           
           for (String location : locations)
           {
           File datafile = new File(location+"/"+student+".csv");
           ArrayList<String[]> lines = new ArrayList<String[]>();

            // if they have a log in that location
             if (datafile.exists())
             {
                 CSVReader reader = new CSVReader(new FileReader(datafile));
                 lines = new ArrayList(reader.readAll());

                 // go through each line
                 for (String[] line : lines)
                 {
                     DateTime lineDate = new DateTime(sdf.parse(line[0]));
                     for (int i = 0; i < workshopDates.size(); i++)
                     {
                         if (
                             (
                                 (lineDate.isAfter(workshopDates.get(i)) && lineDate.isBefore(workshopEnds.get(i))) 
                                 || (lineDate.isAfter(workshopDatesAlt.get(i)) && lineDate.isBefore(workshopEndsAlt.get(i))) 
                             ) && (line[1].startsWith("141.241"))
                            )
                         {
                             attendence[i] = true;
                         }
                     }
                 }
             }
           }
           System.out.print(student+",");
           for (boolean b : attendence)
           {
                if (b) System.out.print("\"X\","); else System.out.print("\"\",");
           }
           System.out.println();
             
                 
       } 
    }

    public static void attendences() throws Exception
    {
        
       String[] locations =
       {
           "/Users/paulneve/Desktop/noobdata/CI4100/all"
       };

       // String[] locations = { "/Volumes/webdav/pp/noobdata/bigfiles" };

       Date[][] weeksAm = new Date[11][];
       Date[][] weeksPm = new Date[11][];

       weeksAm[0] = new Date[]{ sdf.parse("9:00:00 2012/01/30"), sdf.parse("11:00:00 2012/01/30")};
       weeksPm[0] = new Date[]{ sdf.parse("13:00:00 2012/01/30"), sdf.parse("15:00:00 2012/01/30")};

       weeksAm[1] = new Date[]{ sdf.parse("9:00:00 2012/02/06"), sdf.parse("11:00:00 2012/02/06")};
       weeksPm[1] = new Date[]{ sdf.parse("13:00:00 2012/02/06"), sdf.parse("15:00:00 2012/02/06")};

       weeksAm[2] = new Date[]{ sdf.parse("9:00:00 2012/02/13"), sdf.parse("11:00:00 2012/02/13")};
       weeksPm[2] = new Date[]{ sdf.parse("13:00:00 2012/02/13"), sdf.parse("15:00:00 2012/02/13")};

       weeksAm[3] = new Date[]{ sdf.parse("9:00:00 2012/02/20"), sdf.parse("11:00:00 2012/02/20")};
       weeksPm[3] = new Date[]{ sdf.parse("13:00:00 2012/02/20"), sdf.parse("15:00:00 2012/02/20")};

       weeksAm[4] = new Date[]{ sdf.parse("9:00:00 2012/02/27"), sdf.parse("11:00:00 2012/02/27")};
       weeksPm[4] = new Date[]{ sdf.parse("13:00:00 2012/02/27"), sdf.parse("15:00:00 2012/02/27")};

       weeksAm[5] = new Date[]{ sdf.parse("9:00:00 2012/03/05"), sdf.parse("11:00:00 2012/03/05")};
       weeksPm[5] = new Date[]{ sdf.parse("13:00:00 2012/03/05"), sdf.parse("15:00:00 2012/03/05")};

       weeksAm[6] = new Date[]{ sdf.parse("9:00:00 2012/03/12"), sdf.parse("11:00:00 2012/03/12")};
       weeksPm[6] = new Date[]{ sdf.parse("13:00:00 2012/03/12"), sdf.parse("15:00:00 2012/03/12")};

       weeksAm[7] = new Date[]{ sdf.parse("9:00:00 2012/03/19"), sdf.parse("11:00:00 2012/03/19")};
       weeksPm[7] = new Date[]{ sdf.parse("13:00:00 2012/03/19"), sdf.parse("15:00:00 2012/03/19")};

       weeksAm[8] = new Date[]{ sdf.parse("9:00:00 2012/03/26"), sdf.parse("11:00:00 2012/03/26")};
       weeksPm[8] = new Date[]{ sdf.parse("13:00:00 2012/03/26"), sdf.parse("15:00:00 2012/03/26")};

       weeksAm[9] = new Date[]{ sdf.parse("9:00:00 2012/04/23"), sdf.parse("11:00:00 2012/04/23")};
       weeksPm[9] = new Date[]{ sdf.parse("13:00:00 2012/04/23"), sdf.parse("15:00:00 2012/04/23")};

       weeksAm[10] = new Date[]{ sdf.parse("9:00:00 2012/04/30"), sdf.parse("11:00:00 2012/04/30")};
       weeksPm[10] = new Date[]{ sdf.parse("13:00:00 2012/04/30"), sdf.parse("15:00:00 2012/04/30")};

       // go through each student
       for (String student : listOfStudents)
       {
           boolean[][] attendanceGrid = new boolean[11][2];

           // go through each location
           for (String location : locations)
           {
               // attempt to read in the file
               File datafile = new File(location+"/"+student+".csv");
               ArrayList<String[]> lines = new ArrayList<String[]>();

               // if they have a log in that location
                if (datafile.exists())
                {
                    CSVReader reader = new CSVReader(new FileReader(datafile));
                    lines = new ArrayList(reader.readAll());

                    // go through each line
                    for (String[] line : lines)
                    {
                        Date dateTime = sdf.parse(line[0]);
                        for (int i=0; i < weeksAm.length; i++)
                        {
                            if ( dateTime.after(weeksAm[i][0]) && dateTime.before(weeksAm[i][1]) )
                            {
                                attendanceGrid[i][0] = true;
                            }

                            if ( dateTime.after(weeksPm[i][0]) && dateTime.before(weeksPm[i][1]) )
                            {
                                attendanceGrid[i][1] = true;
                            }
                        }
                    }

                }
           }

           // javascript

           /*
           System.out.println("var "+student+" = [");
           String output = "";
           for (int i = 0; i < weeksAm.length; i++)
           {
               output+= "["+attendanceGrid[i][0]+","+attendanceGrid[i][1]+"],";
           }
           output = output.replaceAll(",$", "");

           System.out.println(output);
           System.out.println("];");
           System.out.println();*/

           // csv
           System.out.print(student+",");
           for (int i = 0; i < weeksAm.length; i++)
           {
               System.out.print((attendanceGrid[i][0]?1:0)+","+(attendanceGrid[i][1]?1:0)+",");
           }
           System.out.println();

       }
    }

    public static void evalTests() throws Exception
    {
        HashMap<String,String> dataOverall = new HashMap<String,String>();
        HashMap<String,HashMap<String,String>> dataByStudent = new HashMap<String,HashMap<String,String>>();

        String basedir = "/Volumes/webdav/pp/noobdata/bigfiles/";

        for (String student : listOfStudents)
        {
            //System.out.println("student: "+student);
            File datafile = new File(basedir+"/"+student+".csv");
           ArrayList<String[]> lines = new ArrayList<String[]>();

           // if they have a log in that location
            if (datafile.exists())
            {
                CSVReader reader = new CSVReader(new FileReader(datafile));
                lines = new ArrayList(reader.readAll());
                 // go through each line
                for (int i = 0; i < lines.size()-1; i++)
                {
                    String[] line = lines.get(i);
                    String[] nextLine = lines.get(i+1);

                    if (line[1].contains("TestStart"))
                    {
                        String result = "O";
                        // what's next line?
                        if (nextLine[1].contains("Error")) result = "X";
                        if (nextLine[1].contains("Failed")) result = "+";
                        // add to result
                        String testId = line[2];

                        HashMap<String,String> myData = dataByStudent.get(student);
                        if (myData == null) myData = new HashMap<String,String>();

                        String thisItem = myData.get(testId);
                        if (thisItem == null) thisItem = "";

                        String thisItemOverall = dataOverall.get(testId);
                        if (thisItemOverall == null) thisItemOverall = "";

                        thisItem += result;
                        thisItemOverall += result;

                        myData.put(testId,thisItem);
                        dataByStudent.put(student,myData);
                        dataOverall.put(testId,thisItemOverall);
                    }
                }
            }
        }

        // go through and see results for each activity
        System.out.println("Key,Passed,Fails,Errors");
        for (Map.Entry<String, String> entry : dataOverall.entrySet())
        {
            String key = entry.getKey();
            String value = entry.getValue();
            
            int pass = value.split("O").length;
            int fail = value.split("\\+").length;
            int error = value.split("X").length;

            System.out.println(key+","+pass+","+fail+","+error);

            //System.out.println(key+","+value);
        }

        System.out.println("---------------");
        System.out.println("Student--------");
        System.out.println("---------------");

        System.out.println("Student,Key,Passed,Fails,Errors");
        for (String student : listOfStudents)
        {
            System.out.print(student+",");
            //System.out.println("----------- student: "+student+"-------------");
            testStatsOneStudent(student,dataByStudent);
            //System.out.println("-------------------------------------------");
        }
    }

    public static void testStatsOneStudent(String student, HashMap<String,HashMap<String,String>> dataByStudent)
    {
        HashMap<String,String> dataForMe = dataByStudent.get(student);

        if (dataForMe == null)
        {
            System.out.println("0,0,0");
            return;
        }


        int pass = 0;
        int fail = 0;
        int error = 0;

        for (Map.Entry<String, String> entry : dataForMe.entrySet())
        {
            String key = entry.getKey();
            String value = entry.getValue();

            // to print details of each exercise per student
            //System.out.println(key+","+value);

            // if you unrem above, rem these plus final System.out.println
            pass += value.split("O").length;
            fail += value.split("\\+").length;
            error += value.split("X").length;
        }
        System.out.println(pass+","+fail+","+error);
    }

    public static void surveyStats() throws Exception
    {
        String[] titles = new String[36];
        int[][] values = new int[36][6];

        String comments = "";

        File basedir = new File("/Volumes/webdav/pp/noobdata/forms");

        File[] files = basedir.listFiles();

        for (File file : files)
        {
            // shlurp in file
            if (file.getName().contains(".csv"))
            {
                //System.out.println(file.getName());
                ArrayList<String> lines = new ArrayList(FileUtils.readLines(file));
                for (String line : lines)
                {
                    //System.out.println(line);
                    String[] linevals = line.split(",");
                    // get name/number
                    String namenum = linevals[0].trim();
                    String ratingStr = "";
                    if (linevals.length >1) ratingStr = linevals[1].trim();
                    String name = namenum.split("_")[0];

                    if (!name.equals("formid") && !name.equals("studentid"))
                    {

                        //System.out.println(name);
                        int index = Integer.parseInt(namenum.split("_")[1]);
                        titles[index-1] = name;

                        try
                        {
                            int rating = Integer.parseInt(ratingStr);
                            values[index-1][rating-1]++;
                        }
                        catch (Exception e)
                        {
                            if (!line.contains("X") && line.trim().split(",").length > 1) comments += line+"\r";
                        }

                    }
                }
            }
        }

        for (int i = 0; i < 36; i++)
        {
            if (titles[i] != null && !titles[i].equals("null"))
            {
                System.out.print(titles[i]+":");
                int total = 0;
                int rawtotal = 0;
                for (int x = 5; x > -1; x--)
                {
                    System.out.print(values[i][x]+":");
                    total+= values[i][x]*(x+1);
                    rawtotal += values[i][x];
                }
                System.out.print("total="+total+" (possible max: "+rawtotal*6+")");
                if (total != 0)
                {
                    double satfactor = new Double(total)/(rawtotal*6)*100;
                    System.out.print(" satisfaction factor: "+new DecimalFormat("#.##").format(satfactor)+"%");
                }
                System.out.println();
            }
        }

        System.out.println(comments);

    }

    public static void footprint()
    {
        File basedir = new File("/Volumes/webdav/pp/noobdata/bigfiles");

        for (String student : listOfStudents)
        {
            File f = new File(basedir+"/"+student+".csv");
            try
            {
                List l = FileUtils.readLines(f);
                System.out.println(student+","+l.size());
            } catch (IOException e)
            {
                System.out.println(student+",0");
            }
        }
    }

    public static void buildBigFiles()
    {
        String[] locations = new String[]{
            "/Volumes/webdav/pp/noobdata/week1",
            "/Volumes/webdav/pp/noobdata/week2",
            "/Volumes/webdav/pp/noobdata/week3",
            "/Volumes/webdav/pp/noobdata/smalltest1",
            "/Volumes/webdav/pp/noobdata/week4",
            "/Volumes/webdav/pp/noobdata/week5",
            "/Volumes/webdav/pp/noobdata/smalltest2",
            "/Volumes/webdav/pp/noobdata/smalltest2/afternoon-session",
            "/Volumes/webdav/pp/noobdata/week6-smalltest3",
            "/Volumes/webdav/pp/noobdata/week7",
            "/Volumes/webdav/pp/noobdata/week89easter",
            "/Volumes/webdav/pp/noobdata/smalltest4",
            "/Volumes/webdav/pp/noobdata"
        };

        String basedir = "/Volumes/webdav/pp/noobdata";

        String bigfilesdir = basedir+"/bigfiles";

        for (String student : listOfStudents)
        {
            System.out.println(student);
            for (String location : locations)
            {
                try
                {
                    String smallfilecontents = FileUtils.readFileToString(new File(location+"/"+student+".csv"));
                    //smallfilecontents += System.getProperty("line.separator");
                    FileUtils.writeStringToFile(new File(bigfilesdir+"/"+student+".csv"), smallfilecontents, true);
                } catch (IOException e) { /* file not found - valid scenario - keep calm and carry on! */ }
            }
        }
    }
    
    public static void getCheaters(String baseDir) throws Exception
    {
        File[] users = new File(baseDir+"/all").listFiles();        
        for (File user : users)
        {
            if (!user.getName().contains("emotions"))
            {    
            String kno = user.getName().replace(".csv","");
            System.out.println(kno);
            
            CSVReader reader = new CSVReader(new FileReader(user));
            ArrayList<String[]> myEntries = new ArrayList(reader.readAll());
            
            Date lastCheat = null;
            String lastCheatType = null;
            String lastCheatFrom = null;
            
            ArrayList<String> cheated = new ArrayList<String>();
            ArrayList<String> littleCheat = new ArrayList<String>();
            
            for (String[] entry : myEntries)
            {
                Date date = sdf.parse(entry[0]);
                String type = entry[2];
                if (type.equals("LoadCheat"))
                {
                    lastCheatFrom = entry[4];
                }
                if (type.equals("CodePasteLarge") || type.equals("LoadCheat"))
                {
                    lastCheat = date;
                    lastCheatType = type;                    
                }                
                else if (type.equals("Medal"))
                {
                    String medal = entry[3]+"/"+entry[4];
                    String[] submedalx = medal.split(":");
                    String submedal = submedalx[submedalx.length-1];
                    if (lastCheat != null && !cheated.contains(medal))
                    {
                        cheated.add(medal);                        
                        // get gap
                        Period gap = new Period(new DateTime(lastCheat),new DateTime(date));
                        long gapSeconds = 0;
                        try
                        {
                            gapSeconds = gap.toStandardDuration().getStandardSeconds();            
                        }
                        catch (Exception e) { gapSeconds = 121; } // do nothing;
                        if (gapSeconds < 120) // two minutes
                        {                            
                            System.out.println("Cheat type: "+lastCheatType+"("+lastCheat+")");
                            if (lastCheatType.equals("LoadCheat"))
                            {
                                System.out.println("Cheated from "+lastCheatFrom);
                            }                           
                            System.out.print(" : Medal ("+date+"): "+medal+" / "+gapSeconds);
                            if (littleCheat.contains(submedal))
                            {
                                System.out.println(" **** lower medal cheat detected too!");
                            }
                            else
                            {
                                System.out.println();
                            }
                            littleCheat.add(submedal);
                        }
                        lastCheat = null;
                        lastCheatType = null;
                        lastCheatFrom = null;
                   }
                }
            }
            System.out.println("-----------------");
            }
        }
        
    }
    
    public static void emoScannerIndividual() throws Exception
    {
        String dir = "/Users/paulneve/Desktop/noobstatscurrent/CI4100-JS/all/emotions";
        String dir2 = "/Users/paulneve/Desktop/noobstatscurrent/CI4100-java/all/emotions";
        File dirfile = new File(dir);
        File[] files = dirfile.listFiles();
        File[] file2 = (new File(dir2)).listFiles();
        
        File[] files3 = (File[])ArrayUtils.addAll(files,file2);
        
        LinkedHashMap<String,LinkedHashMap<String,Integer>> individualEmos = new LinkedHashMap();
        
        System.out.println("heeerrre");
        
        for (File file : files3)
        {
             CSVReader reader = new CSVReader(new FileReader(file));
             List<String[]> lines = reader.readAll();
             for (String[] line : lines)
             {
                 String emo = line[4].split(":")[0];
                 String kno = file.getName();
                 LinkedHashMap<String,Integer> singleEmo;
                 if (!individualEmos.containsKey(kno))
                 {
                     // create a new hashmap and add to exerciseEmos
                     singleEmo = new LinkedHashMap<String,Integer>();
                     singleEmo.put("happy",0);
                     singleEmo.put("sad",0);
                     singleEmo.put("embarrassed",0);
                     singleEmo.put("confused",0);
                     singleEmo.put("disappointed",0);
                     singleEmo.put("angry",0);                       
                     individualEmos.put(kno, singleEmo);
                 }
                 else
                 {
                     singleEmo = individualEmos.get(kno);
                 }
                 if (!singleEmo.containsKey(emo))
                 {
                     singleEmo.put(emo, 1);
                 }
                 else
                 {
                     int emonum = singleEmo.get(emo);
                     emonum++;
                     singleEmo.put(emo,emonum);
                 }
                 individualEmos.put(kno,singleEmo);
             }
        }
        
        // end...
        // print out the values
        System.out.println("kno,happy,sad,embarrassed,confused,disappointed,angry");
        for (Map.Entry<String, LinkedHashMap<String,Integer>> entry1 : individualEmos.entrySet())
        {
            String kno = entry1.getKey();
            HashMap<String,Integer> emohash = entry1.getValue();
            System.out.print(kno);
            for (Map.Entry<String,Integer> entry2 : emohash.entrySet())
            {
                System.out.print(",");
                String emo = entry2.getKey();
                int quantity = entry2.getValue();
                System.out.print(quantity);
            }
            System.out.println();
        }
        
    }
    
    public static void emoScanner() throws Exception
    {
        String dir = "/Users/paulneve/Desktop/noobstatscurrent/CI4100-JS/all/emotions";
        String dir2 = "/Users/paulneve/Desktop/noobstatscurrent/CI4100-java/all/emotions";
        File dirfile = new File(dir);
        File[] files = dirfile.listFiles();
        File[] file2 = (new File(dir2)).listFiles();
        
        files = (File[])ArrayUtils.addAll(files,file2);
        
        LinkedHashMap<String,LinkedHashMap<String,Integer>> exerciseEmos = new LinkedHashMap();
        for (File file : files)
        {
             CSVReader reader = new CSVReader(new FileReader(file));
             List<String[]> lines = reader.readAll();
             for (String[] line : lines)
             {
                 String emo = line[4].split(":")[0];
                 String[] x = line[3].split(":",2);
                 String exercise = x[x.length-1];
                 LinkedHashMap<String,Integer> singleEmo;
                 if (!exerciseEmos.containsKey(exercise))
                 {
                     // create a new hashmap and add to exerciseEmos
                     singleEmo = new LinkedHashMap<String,Integer>();
                     singleEmo.put("happy",0);
                     singleEmo.put("sad",0);
                     singleEmo.put("embarrassed",0);
                     singleEmo.put("confused",0);
                     singleEmo.put("disappointed",0);
                     singleEmo.put("angry",0);                     
                     exerciseEmos.put(exercise, singleEmo);
                 }
                 else
                 {
                     singleEmo = exerciseEmos.get(exercise);
                 }
                 if (!singleEmo.containsKey(emo))
                 {
                     singleEmo.put(emo, 1);
                 }
                 else
                 {
                     int emonum = singleEmo.get(emo);
                     emonum++;
                     singleEmo.put(emo,emonum);
                 }
                 exerciseEmos.put(exercise,singleEmo);
             }
        }
        
        // end...
       // print out the values
        System.out.println("exerciseno,partno,id,medal,happy,sad,embarrassed,confused,disappointed,angry");
        for (Map.Entry<String, LinkedHashMap<String,Integer>> entry1 : exerciseEmos.entrySet())
        {
            String[] exercise = entry1.getKey().split(":");
            String workshopno = exercise[0];
            String workshoppart = exercise[1];
            String workshopmedal = exercise[2];
            String workshopID;
            
            if (exercise.length != 3)
            {
                workshopID = exercise[3];
            }
            else
            {
                workshopID = workshopmedal;
                workshopmedal = "n/a";
            }
            
            HashMap<String,Integer> emohash = entry1.getValue();
            System.out.print(workshopno+","+workshoppart+","+workshopID+","+workshopmedal);
            for (Map.Entry<String,Integer> entry2 : emohash.entrySet())
            {
                System.out.print(",");
                String emo = entry2.getKey();
                int quantity = entry2.getValue();
                System.out.print(quantity);
            }
            System.out.println();
        }
        
    }
    
    public static boolean isActive(String s)
    {
        if (s == null) s = "";
        s = s.toLowerCase();
        if (
                s.startsWith("run") ||
                s.startsWith("test") ||
                s.endsWith("error")
           ) return true;
        return false;
    }

    public static void sosScanner() throws Exception
    {               
        File[] files = new File("/Users/paulneve/Desktop/noobstatscurrent/CI4100/all").listFiles();
        File[] files2 = new File("/Users/paulneve/Desktop/noobstatscurrent/CI4100-Java/all").listFiles();
        File[] files3 = new File("/Users/paulneve/Desktop/noobstatscurrent/CI4100-js/all").listFiles();

        files = (File[])ArrayUtils.addAll(files,files2);
        files = (File[])ArrayUtils.addAll(files,files3);

        HashMap<String,Integer> maxreps = new HashMap();
        HashMap<String,Long> maxtime = new HashMap();
        HashMap<String,Double> maxsev = new HashMap();

        for (File file : files)
        {
            int reps = 0;
            int lev = 0;
            Date start = new Date();
            Date end = new Date();
            if (file.getName().endsWith(".csv"))
            {
                CSVReader reader = new CSVReader(new FileReader(file));
                List<String[]> lines = reader.readAll();
                String user = file.getName().replace(".csv","");
                System.out.println("-----------------------------------------------");                
                for (int i = 0; i < lines.size()-1; i++)
                {
                    String[] line;
                    String[] nextline;
                    line = lines.get(i);                    
                    nextline = lines.get(i+1);

                    if (line[2].endsWith("Start") && nextline[2].endsWith("Error"))
                    {
                        reps++;
                        i++;
                        try
                        {
                            end = sdf.parse(nextline[0]);
                            if (reps > 1)
                            {
                                lev += Integer.parseInt(line[4]);
                            }
                            else // first one
                            {
                                // set start time
                                 start = sdf.parse(line[0]);
                            }
                        }
                        catch (Exception e) {}
                    }
                    else // c-c-c-c-combo breaker!
                    {
                        if (reps >= 4 && lev < 4)
                        {                            
                            long duration = end.getTime() - start.getTime();
                            if (duration < 120)
                            {
                                duration = duration / 1000;
                                System.out.println(file.getAbsolutePath());
                                System.out.println("SOS pattern detected - "+reps+" reps");
                                System.out.println(user+" - SOS ends at around line number "+i+", lev is "+lev);
                                System.out.println("Duration: "+duration+" seconds");
                                if (duration == 0) duration = 1;
                                System.out.println("Severity index: "+(double)reps/duration);
                                if (!maxreps.containsKey(user))
                                {
                                    maxreps.put(user, 0);
                                    maxtime.put(user,0L);
                                    maxsev.put(user,0.0);
                                }
                                int currentmax = maxreps.get(user);
                                currentmax += reps;
                                long currenttime = maxtime.get(user);
                                currenttime += duration;
                                double currentsev = maxsev.get(user);
                                currentsev += (double)reps/duration;
                                maxreps.put(user,currentmax);
                                maxtime.put(user, currenttime);
                                maxsev.put(user,currentsev);
                            }
                        }
                        reps = 0;
                        lev = 0;
                    }
                }
                System.out.println("-----------------------------------------------");
            }
        }

        System.out.println("Maxreps figures: ");
        for (Map.Entry<String,Integer> entry : maxreps.entrySet())
        {
            String user = entry.getKey();
            int reps = entry.getValue();
            long time = maxtime.get(user);
            double sev = maxsev.get(user);
            System.out.println(user+","+reps+","+time+","+sev);
        }

    }


    public static void main(String[] args) throws Exception
    {
        
        //sosScanner();

        String baseDir = "/Users/paulneve/Desktop/noobstats/CI4100v2-TLAP";
        for (String student : listOfStudents)
        {
            System.out.println(student+","+betterGetTotalTime(student,baseDir));
        }

//        System.out.println(betterGetTotalTime("k1304577", "/Users/paulneve/Desktop/noobstatscurrent/CI4100"));
//        System.out.println(betterGetTotalTime("k1304577", "/Users/paulneve/Desktop/noobstatscurrent/CI4100-Java"));
//        System.out.println(betterGetTotalTime("k1304577", "/Users/paulneve/Desktop/noobstatscurrent/CI4100-JS"));
        
        
        // new, better attendences
        //newAttendences();
        
        // with small test
       //String baseDir = "/Volumes/webdav/pp/noobdata/week5";
       //System.out.println(totalTimeDir(baseDir,"smalltest2"));

       // specifying directory only
       //String baseDir = "/Volumes/webdav/pp/noobdata";
       //System.out.println(totalTimeDir(baseDir,null));

       // one only
       //String baseDir = "/Users/paulneve/Desktop/ci1152ball";
       //System.out.println(getTotalTime("k1223015",baseDir,null));

        // totals
        //totals();

        // attendances
        //attendences();

        //buildBigFiles();
        // specifying directory only
       //String baseDir = "/Volumes/webdav/pp/noobdata/bigfiles";
       //System.out.println(totalTimeDir(baseDir,null));

        //evalTests();
        //surveyStats();
        //footprint();
        
        // cheaters
        /* System.out.println("Javascript");
        String baseDir = "/Users/paulneve/Desktop/noobstatscurrent/CI4100-js";
        getCheaters(baseDir); */
        
        /// below is medal plus engagement table.

        /*String baseDir = "/Users/paulneve/Desktop/noobstats/CI4100v2-TLAP";
        
        File[] users = new File(baseDir+"/all").listFiles();
        HashMap<String,HashMap<String,String>> byMedal = new HashMap<String,HashMap<String,String>>();
        for (File user : users)
        {
            String kno = user.getName().replace(".csv","");
            String medalFile = baseDir+"/"+kno+"/medal.csv";
            TreeMap<String,String> results = StudentStatuses.medals(medalFile);
            
            for (Map.Entry<String, String> entry : results.entrySet()) 
            {
                String key = entry.getKey();
                String value = entry.getValue();
                
                HashMap<String,String> medalMap = byMedal.get(key);
                if (medalMap == null) medalMap = new HashMap<String,String>();
                medalMap.put(kno, value);
                byMedal.put(key,medalMap);
            }
        }
        
        System.out.print("knumber,");
        // now iterate through what we ended up in byMedal keys
        // These SHOULD be the medal titles
        for (String key : byMedal.keySet()) 
        {
            System.out.print(key+",");
        }
        
        System.out.println("TotalTimeMins");       
        
        // now iterate through individual students (again)
        for (File user : users)
        {
            String kno = user.getName().replace(".csv","");
            System.out.print(kno+",");
            // for each possible medal...
            for (String key : byMedal.keySet()) 
            {
                // did we get one?
                String grade = byMedal.get(key).get(kno);
                if (grade == null) grade = "--";
                System.out.print(grade+",");
            }            
            
                System.out.println(betterGetTotalTime(kno,baseDir));
            
        }  
        /* END MEDAL PLUS ENGAGEMENT TABLE */
        
    }

}
