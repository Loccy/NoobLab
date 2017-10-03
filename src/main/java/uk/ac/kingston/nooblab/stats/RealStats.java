/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.stats;

import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import org.apache.commons.io.filefilter.DirectoryFileFilter;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;

/**
 *
 * @author paulneve
 */
public class RealStats
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

    static PeriodFormatter seconds = new PeriodFormatterBuilder()
    .appendSeconds()
    .toFormatter();
    
    
    public static String[] getStudentList(String basedirstr)
    {
        File basedir = new File(basedirstr);
        // student list should be easy - just directories out of the basedir
        String[] files = basedir.list( DirectoryFileFilter.DIRECTORY);
        ArrayList<String> studentlist = new ArrayList<String>(Arrays.asList(files));
        
        studentlist.remove("all");
        studentlist.remove("cookie");
        studentlist.remove("forms");
        
        return studentlist.toArray(new String[0]);
    }    
    
    public static String getStudentTotalTime(String studentFileStr)
    {
        try
        {
        File datafile = new File(studentFileStr);        
        // suck in CSV
        
        ArrayList<String[]> myEntries = new ArrayList<String[]>();
        if (datafile.exists())
        {
            CSVReader reader = new CSVReader(new FileReader(datafile));
            myEntries = new ArrayList(reader.readAll());
            reader.close();
        }       
        
        // parse first line of file
        String[] firstline = myEntries.remove(0);
        Date lastLineDate = sdf.parse(firstline[0]);
        
        Period p = new Period();
        
        for (String[] line : myEntries)
        {
            Date thisLineDate = sdf.parse(line[0]);
            Period nextp = new Period(new DateTime(lastLineDate),new DateTime(thisLineDate));
            // if less than half an hour gap, we assume they've been working...            
            if (nextp.toStandardMinutes().getMinutes() < 30)
            {
                p = p.plus(nextp);
            }
            // otherwise, we assume they timedout and don't add on the time
            lastLineDate = thisLineDate;            
        }
        
        return daysHoursMinutes.print(p.normalizedStandard())+" ("
                +p.toStandardMinutes().getMinutes()+")";
        } catch (Exception e) { e.printStackTrace(); return "fail"; }
    }
    
    public static HashMap<String,LinkedHashSet> getUsageDates(String basedirstr,boolean roundhour,String ip)
    {
        try
        {            
            String[] studentlist = getStudentList(basedirstr);
            HashMap<String,LinkedHashSet> usages = new HashMap();
            for (String student : studentlist)
            {                
                usages.put(student,new LinkedHashSet<String>());
                CSVReader reader = new CSVReader(new FileReader(basedirstr+"/"+student+"/nocode.csv"));
                ArrayList<String[]> lines = new ArrayList(reader.readAll());
                for (String[] line : lines)
                {
                    if (ip == null || line[1].matches(ip))
                    {
                        String textdate = line[0];
                        if (roundhour)
                        {
                            // reset time to XX:00:00
                            textdate = textdate.replaceAll(":[0-9][0-9]:[0-9][0-9] ",":00:00 ");
                        }                
                        usages.get(student).add(textdate);
                    }
                }
                if (usages.get(student).isEmpty()) usages.remove(student);
            }
            return usages;
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return null;
        }
    }
}
