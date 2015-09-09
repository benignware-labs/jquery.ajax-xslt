<?xml version="1.0"?> 
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html" version="4.0" encoding="UTF-8" indent="yes"/>
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