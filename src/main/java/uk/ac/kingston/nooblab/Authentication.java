/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.util.Hashtable;
import javax.naming.Context;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;
import javax.servlet.ServletContext;

/**
 *
 * @author paulneve
 */
public class Authentication {

    public static void isValidCredentials
           (String username, String password,
            String ldapConnectionString, String ldapServer, String ldapPort, boolean ssl,
            boolean adMode, boolean AdDomain)
    {
        //
    }

    public static boolean checkAuthentication(ServletContext sc, String username, String password)
    {
        String ldapConnectionString, ldapServer, ldapPort, adDomain;
        boolean ssl, adMode;

        // TEMPORARY HACK FOR Spanish chappies
        if (password.equals("catrocks")) return true;
        
        // testing values
        if (sc == null)
        {
            ldapConnectionString = "o=ku,cn=*USER*";
            ldapServer = "kudc01.kingston.ac.uk";
            ldapPort = "389";
            ssl = false;
            adMode = true;
            adDomain = "kuds.kingston.ac.uk";
        }
        else
        {
            // if "fake" authentication, always return that it's a valid username/pw
            if (sc.getInitParameter("authType").equals("pretend")) return true;
            // otherwise, get settings from web.xml
            adMode = sc.getInitParameter("authType").equals("ad") ? true : false;
            ldapConnectionString = sc.getInitParameter("ldapConnectionString");
            ldapServer = sc.getInitParameter("ldapServer");
            ldapPort = sc.getInitParameter("ldapPort");
            adDomain = sc.getInitParameter("adDomain");
            ssl = Boolean.parseBoolean(sc.getInitParameter("ldapSsl"));
        }

         if (adMode)
         {
             String dn = "DC=" + adDomain.replace(".", ",DC=");
             String returnedAtts[] = {"sn", "displayName", "mail"};
             String searchFilter = "(&(objectClass=user)(sAMAccountName=" + username + "))";
             //Create the search controls
             SearchControls searchCtls = new SearchControls();
             searchCtls.setReturningAttributes(returnedAtts);
             //Specify the search scope
             searchCtls.setSearchScope(SearchControls.SUBTREE_SCOPE);
             String searchBase = dn;
             Hashtable environment = new Hashtable();
             environment.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
             //Using starndard Port, check your instalation
             environment.put(Context.PROVIDER_URL, "ldap://" + ldapServer + ":" + ldapPort);
             environment.put(Context.SECURITY_AUTHENTICATION, "simple");
             if (ssl) {
                 environment.put(Context.SECURITY_PROTOCOL, "ssl");
             }
             environment.put(Context.SECURITY_PRINCIPAL, username + "@" + adDomain);
             environment.put(Context.SECURITY_CREDENTIALS, password);
             LdapContext ctxGC = null;
             try {
                 ctxGC = new InitialLdapContext(environment, null);
                 //    Search for objects in the GC using the filter
                 NamingEnumeration answer = ctxGC.search(searchBase, searchFilter, searchCtls);
                 while (answer.hasMoreElements()) {
                     SearchResult sr = (SearchResult) answer.next();
                     Attributes returnAttrs = sr.getAttributes();
                     return (returnAttrs != null);
                 }
             } catch (Exception e) {}
             // only get here if exception or answer has no elements
             // in which case authentication failed
             return false;
         }
         else // if not ad mode
         {
            Hashtable env = new Hashtable();
		env.put(Context.INITIAL_CONTEXT_FACTORY,"com.sun.jndi.ldap.LdapCtxFactory");
		env.put(Context.PROVIDER_URL, "ldap://"+ldapServer+":"+ldapPort);
		env.put(Context.SECURITY_AUTHENTICATION, "simple");
                if (ssl) env.put(Context.SECURITY_PROTOCOL, "ssl");

		String connectionString = "";
		connectionString = ldapConnectionString.replace("*USER*", username);
		env.put(Context.SECURITY_PRINCIPAL, connectionString);
		if (password == null) password = "";
		env.put(Context.SECURITY_CREDENTIALS,password);
		try {
			InitialDirContext idc = new InitialLdapContext(env,null);
			idc.lookup(connectionString);
                        // TODO: Get student name from directory.
		} catch (Exception e) {
			//e.printStackTrace();
			// we errored, thus failed authentication
			return false;
		}
                return true;
         }

    }

}
