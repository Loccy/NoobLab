package java.util;

import java.io.*;
import java.math.*;
import java.util.*;

/* 
 * NOTE FROM PN:
 * 
 * This was found on the internet and provides a much faster implementation
 * of Scanner under Doppio than the Oracle Java 6 one.
 * 
 * It is not intended to be compiled/used in this location. Rather you
 * should compile it by hand and then drop the resulting class file
 * into doppio/third_party/classes/java/util and overwrite the "real"
 * Scanner class.
 * 
 * Depending on the level of use of Scanner, this may well be ample for
 * your teaching purposes, especially if all you're doing is using it
 * to get user input. If you depend on a wholly authentic Scanner,
 * don't use this!
 * 
 * No licence was indicated. Based on the description below, i.e. the
 * fact that it's a hodge-podge of code from different sources,
 * public domain is being assumed.
 * 
 */

/**
 * Found at http://nifty.stanford.edu/2006/reges-anagrams/Scanner.java
 * 
A simple text scanner which can parse primitive types and strings 
using regular expressions.

<p>
A Scanner breaks its input into tokens using a delimiter pattern,
which by default matches whitespace. The resulting tokens may then be
converted into values of different types using the various next methods.

<p>
This class is based on a subset of the functionality of Sun's
java.util.Scanner class from J2SE v1.5.0 RC1, with some code borrowed 
from the TextReader class written by Stuart Reges of the 
University of Washington.  It should work with 'lazy input' from the
keyboard as needed.

<p>
This implementation does not include the static factory 
Scanner.create methods as included in J2SE 1.5.0 beta 1.

<p>
Some notable differences from java.util.Scanner are the following:

<ul><li>

All Java 5-specific features, such as implementing Iterator &lt; String &gt; ,
are missing.

</li><li>

All support for regular expressions (Pattern, Matcher, MatchResult),
changing locales, and specalized character sets is missing.

</li><li>

This implementation is not guaranteed to exactly match the parsing behavior
of java.util.Scanner for complex cases.  The java.util.Scanner uses 
sophisticated delimiting between tokens of input; this Scanner simply 
tokenizes on whitespace.  Also, for example, this implementation returns
true on a call to hasNextFloat() if the upcoming input token is "2.1F", 
because this implementation's parsing is based on the primitive wrappers;
java.util.Scanner would return false in this same case.

</li><li>

The toString text, exception text and exception-throwing behavior 
is not guaranteed to match that of java.util.Scanner.  In particular,
this implementation includes the offending input line number in its
NoSuchElementException text to aid debugging.

</li><li>

This implementation is slower than java.util.Scanner, partly because it 
does not directly cache input for simplicity.  Since this class is a 
holdover implementation until widespread adoption of Java 5, this was
deemed acceptable.

</li></ul>

<p>
Recent changes:

<ul><li>

2005-01-01: Renamed all private methods with underscores because students
were discovering the private hasNextChar method and trying to use it in 
their programs.

</li><li>

2005-01-22: Fixed a bug where nextLine returned an empty string rather than
throwing an exception when no more input was available.

</li></ul>

@author Marty Stepp (stepp AT u washington edu),
Lecturer, University of Washington-Tacoma Institute of Technology

@version January 22, 2005
*/
public final class Scanner {
  private static final int EOF = -1;           // used to denote end-of-input
  private static final int PUSHBACK_BUFFER_SIZE = 4096;  // buffer to unread
  private static final String DELIMITER = " \t\f\r\n";   // whitespace chars
  private static final String TRUE = "true";
  private static final String FALSE = "false";
  private static final String REMOVE_EXCEPTION_MESSAGE = 
    "Remove is not supported by this Scanner.";
  private static final String BAD_INPUT_EXCEPTION_MESSAGE = 
    "bad input, line ";

  private PushbackReader m_reader;           // underlying input source
  private LineNumberReader m_lnReader;       // keeps track of line numbers
  private IOException m_ioException = null;  // last IO exception
  private StringBuffer m_previousNextBuffer = new StringBuffer();
  private int m_radix = 10;                  // default integer base
  private boolean m_closed = false;          // set true on close or exception

  /**
  Constructs a new Scanner that produces values scanned from the specified 
  file. Bytes from the file are converted into characters using the 
  underlying platform's default charset.

  @param source A file to be scanned
  @throws FileNotFoundException if source is not found
  */
  public Scanner(File source) throws FileNotFoundException {
    this(new FileInputStream(source));
  }

  /**
  Constructs a new Scanner that produces values scanned from the specified 
  input stream. Bytes from the stream are converted into characters using 
  the underlying platform's default charset.

  @param source An input stream to be scanned
  */
  public Scanner(InputStream source) {
    this(new InputStreamReader(source));
  }
  
  /**
  Constructs a new Scanner that produces values scanned from the specified
  source.

  @param source A character source to scan
  */
  public Scanner(Reader source) {
    m_lnReader = new LineNumberReader(source);
    m_lnReader.setLineNumber(1);  // it would be 0-based otherwise
    m_reader = new PushbackReader(m_lnReader, PUSHBACK_BUFFER_SIZE);
  }
  
  /**
  Constructs a new Scanner that produces values scanned from the specified
  string.

  @param source A string to scan
  */
  public Scanner(String source) {
    this(new StringReader(source));
  }

  /**
  Closes this scanner.
  
  <p>
  If this scanner is already closed then invoking 
  this method will have no effect.
  */
  public void close() {
    try {
      m_reader.close();
      m_closed = true;
    } catch (IOException ioe) {
      _setIoException(ioe);
    }
  }
  
  /**
  Returns true if this scanner has another token in its input. This method 
  may block while waiting for input to scan. The scanner does not advance 
  past any input.

  @return true if and only if this scanner has another token
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNext() {
    try {
      next();
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted
  as a BigDecimal using the nextBigDecimal() method. The scanner does not 
  advance past any input.
  
  @return true if and only if this scanner's next token is a valid BigDecimal
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextBigDecimal() {
    try {
      nextBigDecimal();
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted
  as a BigInteger in the default radix using the nextBigInteger() method. 
  The scanner does not advance past any input.

  @return true if and only if this scanner's next token is a valid BigInteger 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextBigInteger() {
    return hasNextBigInteger(m_radix);
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a BigInteger in the specified radix using the nextBigInteger() method. The 
  scanner does not advance past any input.

  @param radix the radix used to interpret the token as an integer 
  @return true if and only if this scanner's next token is a valid BigInteger 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextBigInteger(int radix) {
    try {
      nextBigInteger(radix);
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a boolean value. The scanner does not advance past the input that matched.

  @return true if and only if this scanner's next token is a valid boolean value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextBoolean() {
    try {
      nextBoolean();
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as 
  a byte value in the default radix using the nextByte() method. The scanner 
  does not advance past any input.

  @return true if and only if this scanner's next token is a valid byte value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextByte() {
    return hasNextByte(m_radix);
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a byte value in the specified radix using the nextByte() method. The scanner 
  does not advance past any input.

  @param radix the radix used to interpret the token as a byte value 
  @return true if and only if this scanner's next token is a valid byte value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextByte(int radix) {
    try {
      nextByte(radix);
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }

  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a double value using the nextDouble() method. The scanner does not advance 
  past any input.

  @return true if and only if this scanner's next token is a valid double value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextDouble() {
    try {
      nextDouble();
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a float value using the nextFloat() method. The scanner does not advance past 
  any input.

  @return true if and only if this scanner's next token is a valid float value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextFloat() {
    try {
      nextFloat();
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  an int value in the default radix using the nextInt() method. The scanner
  does not advance past any input.

  @return true if and only if this scanner's next token is a valid int value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextInt() {
    return hasNextInt(m_radix);
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as 
  an int value in the specified radix using the nextInt() method. The scanner 
  does not advance past any input.

  @param radix the radix used to interpret the token as an int value 
  @return true if and only if this scanner's next token is a valid int value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextInt(int radix) {
    try {
      nextInt(radix);
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if there is another line in the input of this scanner. This
  method may block while waiting for input. The scanner does not advance past 
  any input.

  @return true if and only if this scanner has another line of input 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextLine() {
    return _hasNextChar();
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a long value in the default radix using the nextLong() method. The scanner
  does not advance past any input.

  @return true if and only if this scanner's next token is a valid long value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextLong() {
    return hasNextLong(m_radix);
  }
 
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a long value in the specified radix using the nextLong() method. The scanner
  does not advance past any input.

  @return true if and only if this scanner's next token is a valid long value 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextLong(int radix) {
    try {
      nextLong(radix);
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as 
  a short value in the default radix using the nextShort() method. The scanner 
  does not advance past any input.

  @return true if and only if this scanner's next token is a valid short value
  in the default radix 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextShort() {
    return hasNextShort(m_radix);
  }
  
  /**
  Returns true if the next token in this scanner's input can be interpreted as
  a short value in the specified radix using the nextShort() method. The scanner
  does not advance past any input.

  @param radix the radix used to interpret the token as a short value 
  @return true if and only if this scanner's next token is a valid short value
  in the specified radix 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean hasNextShort(int radix) {
    try {
      nextShort(radix);
      return true;
    } catch (NoSuchElementException nsee) {
      return false;
    } finally {
      _undoNext();
    }
  }
  
  /**
  Returns the IOException last thrown by this Scanner. This method returns
  null if no such exception exists.

  @return the last exception thrown by this scanner's readable
  */
  public IOException ioException() {
    return m_ioException;
  }

  /**
  Finds and returns the next complete token from this scanner. A complete 
  token is preceded and followed by input that matches the delimiter pattern.
  This method may block while waiting for input to scan, even if a previous 
  invocation of hasNext() returned true.

  @return the next token
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public String next() {
    // wipe buffer of characters read by previous call to next()
    m_previousNextBuffer.setLength(0);
    
    try {
      // skip whitespace
      while (_hasNextChar() && _isWhitespace(_peek())) {
        m_previousNextBuffer.append((char)_nextChar());
      }

      // build the token
      StringBuffer result = new StringBuffer();
      while (_hasNextChar() && !_isWhitespace(_peek())) {
        char chr = (char)_nextChar();
        result.append(chr);
        m_previousNextBuffer.append(chr);
      }

      // make sure token is nonempty      
      if (result.length() == 0)
        throw _getNoSuchElementException();

      return result.toString();
    } catch (IOException ioe) {
      _setIoException(ioe);
      return null;
    }
  }
  
  /**
  Scans the next token of the input as a BigDecimal.
  
  @return the BigDecimal scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public BigDecimal nextBigDecimal() {
    try {
      return new BigDecimal(_nextToken());
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Scans the next token of the input as a BigInteger.
  
  @return the BigInteger scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public BigInteger nextBigInteger() {
    return nextBigInteger(m_radix);
  }
  
  /**
  Scans the next token of the input as a BigInteger.
  
  @param radix the radix used to interpret the token
  @return the BigInteger scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public BigInteger nextBigInteger(int radix) {
    try {
      return new BigInteger(_nextToken(), radix);
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Scans the next token of the input into a boolean value and returns that
  value. This method will throw FormatException if the next token cannot 
  be translated into a valid boolean value. If the match is successful, 
  the scanner advances past the input that matched.
  
  @return the boolean scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public boolean nextBoolean() {
    // Boolean.parseBoolean doesn't do what we want here; it assumes all 
    // strings other than "true" are false rather than invalid
    String token = _nextToken();
    if (token.equalsIgnoreCase(TRUE))
      return true;
    else if (token.equalsIgnoreCase(FALSE))
      return false;
    else
      throw _getNoSuchElementException();
  }
  
  /**
  Scans the next token of the input as a byte.

  <p>
  An invocation of this method of the form nextByte() behaves in exactly the
  same way as the invocation nextByte(radix), where radix is the default radix
  of this scanner.

  @return the byte scanned from the input 
  @throws NoSuchElementException if input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public byte nextByte() {
    return nextByte(m_radix);
  }
  
  /**
  Scans the next token of the input as a byte.

  @param radix the radix used to interpret the token as a byte value 
  @return the byte scanned from the input 
  @throws InputMismatchException if the next token does not match the 
  Integer regular expression, or is out of range 
  @throws NoSuchElementException if input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public byte nextByte(int radix) {
    try {
      return Byte.parseByte(_nextToken());
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }

  /**
  Scans the next token of the input as a double. This method will throw
  NumberFormatException if the next token cannot be translated into a valid
  double value. If the translation is successful, the scanner advances past
  the input that matched.

  @return the double scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public double nextDouble() {
    try {
      return Double.parseDouble(_nextToken());
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Scans the next token of the input as a float. This method will throw
  NumberFormatException if the next token cannot be translated into a valid
  float value. If the translation is successful, the scanner advances past
  the input that matched.

  @return the float scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public float nextFloat() {
    try {
      return Float.parseFloat(_nextToken());
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Scans the next token of the input as an int. This method will throw
  NumberFormatException if the next token cannot be translated into a valid
  int value. If the translation is successful, the scanner advances past the
  input that matched.

  @return the int scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public int nextInt() {
    return nextInt(m_radix);
  }
  
  /**
  Scans the next token of the input as an int. This method will throw
  FormatException if the next token cannot be translated into a valid 
  int value. If the translation is successful, the scanner advances past the
  input that matched.

  @param radix the radix used to interpret the token as an int value
  @return the int scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public int nextInt(int radix) {
    try {
      return Integer.parseInt(_nextToken(), radix);
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Advances this scanner past the current line and returns the input that was
  skipped. This method returns the rest of the current line, excluding any
  line separator at the end. The position is set to the beginning of the 
  next line.

  Since this method continues to search through the input looking for a line
  separator, it may buffer all of the input searching for the line to skip
  if no line separators are present. 

  @return the line that was skipped
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public String nextLine() {
    if (!hasNextLine())
      throw _getNoSuchElementException();
    
    StringBuffer result = new StringBuffer();
    while (_hasNextChar()) {
      char next = (char)_nextChar();
      
      // don't put the newline separator into the result
      if (next == '\n')
        break;
      else if (next == '\r')
        continue;
      
      result.append(next);
    }

    return result.toString();
  }

  /**
  Scans the next token of the input as a long. This method will throw
  NumberFormatException if the next token cannot be translated into a valid
  long value. If the translation is successful, the scanner advances past the
  input that matched.

  @return the long scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public long nextLong() {
    return nextLong(m_radix);
  }
  
  /**
  Scans the next token of the input as a long. This method will throw
  FormatException if the next token cannot be translated into a valid 
  long value. If the translation is successful, the scanner advances past the
  input that matched.

  @param radix the radix used to interpret the token as a long value
  @return the long scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public long nextLong(int radix) {
    try {
      return Long.parseLong(_nextToken(), radix);
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Scans the next token of the input as a short. This method will throw
  NumberFormatException if the next token cannot be translated into a valid
  short value. If the translation is successful, the scanner advances past the
  input that matched.

  @return the short scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public short nextShort() {
    return nextShort(m_radix);
  }
  
  /**
  Scans the next token of the input as a short. This method will throw
  FormatException if the next token cannot be translated into a valid 
  short value. If the translation is successful, the scanner advances past the
  input that matched.

  @param radix the radix used to interpret the token as a short value
  @return the long scanned from the input
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public short nextShort(int radix) {
    try {
      return Short.parseShort(_nextToken(), radix);
    } catch (NumberFormatException nfe) {
      throw _getNoSuchElementException();
    }
  }
  
  /**
  Returns this scanner's default radix.
  
  <p>
  A scanner's radix affects elements of its default number matching 
  regular expressions.
  
  @return the default radix of this scanner
  @throws NoSuchElementException if the input is exhausted 
  @throws IllegalStateException if this scanner is closed
  */
  public int radix() {
    return m_radix;
  }
  
  /**
  The remove operation is not supported by this implementation of Iterator.

  @throws UnsupportedOperationException if this method is invoked.
  */
  public void remove() {
    throw new UnsupportedOperationException(REMOVE_EXCEPTION_MESSAGE);
  }
  
  /**
  Returns the string representation of this Scanner. The string 
  representation of a Scanner contains information that may be useful 
  for debugging. The exact format is unspecified.
  
  @return The string representation of this scanner
  */
  public String toString() {
    return getClass().getName();
  }
  
  /**
  Sets this scanner's default radix to the specified radix.
  
  <p>
  A scanner's radix affects elements of its default number matching 
  regular expressions.
  
  <p>
  If the radix is less than Character.MIN_RADIX or greater than 
  Character.MAX_RADIX, then an IllegalArgumentException is thrown. 
  
  @throws IllegalArgumentException if radix is out of range
  */
  public Scanner useRadix(int radix) {
    if (radix < Character.MIN_RADIX || radix > Character.MAX_RADIX)
      throw new IllegalArgumentException();
    
    m_radix = radix;
    return this;
  }

  // common function to make sure input has not been exhausted
  private boolean _hasNextChar() {
    try {
      int chr = _nextChar();
      if (chr == EOF)
        return false;
      
      _unread(chr);
      return true;
    } catch (IOException ioe) {
      _setIoException(ioe);
      return false;
    } catch (NoSuchElementException nsee) {
      return false;
    }
  }
  
  // returns whether the given character is a whitespace character
  private boolean _isWhitespace(int chr) {
    return DELIMITER.indexOf((char)chr) >= 0;
  }

  // advances one character in the input
  private int _nextChar() {
    if (m_closed)
      throw new IllegalStateException();

    try {
      return m_reader.read();    
    } catch (IOException ioe) {
      _setIoException(ioe);
      return EOF;
    }
  }
  
  // advances one token in the input
  private String _nextToken() {
    return (String)next();
  }

  // returns next character in the input without advancing the reader
  private int _peek() throws IOException {
    int peekChar = _nextChar();
    _unread(peekChar);
    return peekChar;
  }
  
  private NoSuchElementException _getNoSuchElementException() {
    int lineNum = m_lnReader.getLineNumber();
    return new NoSuchElementException(BAD_INPUT_EXCEPTION_MESSAGE + lineNum);
  }
  
  // sets internal io exception
  private void _setIoException(IOException ioe) {
    m_ioException = ioe;
    ioe.printStackTrace();
  }
  
  // unreads buffer of characters that were consumed by
  // the last call to next()
  private void _undoNext() {
    if (m_previousNextBuffer.length() > 0) {
      try {
        m_reader.unread(m_previousNextBuffer.toString().toCharArray());
      } catch (IOException ioe) {
        _setIoException(ioe);
      }
    }
  }
  
  // put given value back into the input stream
  private void _unread(int chr) throws IOException {
    m_reader.unread(chr);
  }
}