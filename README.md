# jquery.ajax-xslt
> JQuery Ajax XSLT Integration

This plugin lets you transform ajax xml response via xslt on the fly.


## Usage

```xml
<!-- test.xml -->
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="test.xsl"?>
<test> 
  <title>Hello World!</title>
</test>
```

```xml
<!-- test.xsl -->
<?xml version="1.0"?> 
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    version="1.0">
<xsl:template match="/test">
<html>
  <head>
    <title><xsl:value-of select="./title"/></title>
  </head>
  <body>
    <h1><xsl:value-of select="./title"/></h1>
  </body>
</html>
</xsl:template>
</xsl:stylesheet>
```

```js
$.ajax({
  url: 'test.xml',
  dataType: 'xslt'
}).done(function(result) {
  // Result contains transformed xml
});
```

The result should look like this:

```html
<html>
   <head>
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
      <title>Hello World!</title>
   </head>
   <body>
      <h1>Hello World!</h1>
   </body>
</html>
```

## Options

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>dataType</td>
      <td>Accepts a type <code>xslt</code> which triggers xslt processing.</td>
    </tr>
    <tr>
      <td>unescapeOutput</td>
      <td>Specify <code>true</code> to unescape output. This addresses missing of <code>xsl:disable-out-escaping</code> in Firefox. Defaults to <code>false</code></td>
    </tr>
    <tr>
      <td>xmlStylesheet</td>
      <td>Define a custom xsl-template. This will override a possibly embedded link in the xml-document.</td>
    </tr>
  </tbody>
</table>

## MSXML

Apparently namespaces are not supported in Internet Explorer. It complains about `Reference to undeclared namespace prefix: 'xxx'`. Try to get rid of namespaces in your xsl-template by refactoring your xpath-queries from `xxx:element` to `*[local-name()='element'].
