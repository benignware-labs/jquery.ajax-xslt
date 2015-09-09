(function($) {
  
  function dirname(path) {
    return path.indexOf('/') >= 0 ? path.replace( /\\/g, '/' ).replace( /\/[^\/]*$/, '' ) : ".";
  }
  
  function isAbsolutePath(path) {
    return (new RegExp('^([a-z]+://|//)')).test(path);
  }
  
  function getXMLStylesheet(url, doc) {
    var i, child, children = doc.childNodes, match, file = null;
    for (i = 0; i < children.length; i++) {
      child = children[i];
      if (child.target === 'xml-stylesheet') {
        match = child.data.match(/href=\"([^'"]*)\"/);
        if (match) {
          file = match[1];
          // Check for relative path
          if (!isAbsolutePath(file)) {
            // Concat paths
            file = dirname(url) + "/" + file;
          }
          break;
        }
      }
    }
    return file;
  }
  
  function serializeToString(xml) {  
    if (window.XMLSerializer) {
      // W3C
      var serializer = new XMLSerializer();
      var string = serializer.serializeToString(xml);
      return string;
    } else if (typeof xml.xml === 'object') {
      // Internet Explorer 8
      return xml.xml;
    }  
  }
  
  
  // Based on https://gist.github.com/1129031 by Eli Grey, http://eligrey.com
  function parseFromString(xmlString, outputType) {
    var
      doc;
    
    // Firefox/Opera/IE throw errors on unsupported types
    try {
      doc = (new DOMParser()).parseFromString(xmlString, outputType);
      if (doc) {
        // Output type is natively supported
        return doc;
      }
    } catch (ex) {
    }
    
    // HTML-Extension
    if (/^\s*text\/html\s*(?:;|$)/i.test(outputType)) {
      doc = document.implementation.createHTMLDocument("");
      if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        doc.documentElement.innerHTML = markup;
      }
      else {
        doc.body.innerHTML = markup;
      }
      return doc;
    }
    
    // Unsupported output type
    return null;
  }
  
  function transformToDocument(xml, xsl, options) {
    
    options = options || {};
    var result = null, xsltProcessor;
    
    if ('XSLTProcessor' in window && xml.implementation && xml.implementation.createDocument) {
      
      // W3C
      xsltProcessor = new XSLTProcessor();
      try {
        xsltProcessor.importStylesheet(xsl);
      } catch (e) {
        console.error(e);
      }
      result = xsltProcessor.transformToDocument(xml);
      
    } else if ('DOMParser' in window && (window.ActiveXObject || "ActiveXObject" in window)) {
      
      // Internet Explorer 9+
      try {
        
        var
          // Resolve output type
          outputElement = xsl.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'output')[0],
          outputMethod = outputElement && outputElement.getAttribute('method') || 'xml',
          outputType = outputMethod === 'html' ? 'text/html' : 'text/xml',
        
          // Serialize string
          xmlString = serializeToString(xml);
        
        // Replace entities
        // TODO: Configurable as option
        xmlString = xmlString.replace(/\&shy;/gi, '&#173;');
        
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
        xmlDoc.async = false;
        xmlDoc.resolveExternals = false;
        xmlDoc.validateOnParse = false;
        xmlDoc.loadXML(xmlString);
        
        var
          xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument"),
          xslString = serializeToString(xsl);
        
        xslDoc.loadXML(xslString);
        
        var output;
        if ('transformNode' in xmlDoc) {
          output = xmlDoc.transformNode(xslDoc);
        }
        
        if (!output) {
          var xslt = new ActiveXObject("Msxml2.XSLTemplate");
          xslt.stylesheet = xslDoc;
          xsltProcessor = xslt.createProcessor();
          xsltProcessor.input = xmlDoc;
          xsltProcessor.transform();
          output = xsltProcessor.output;
        }
        
        result = parseFromString( output , outputType );
        
      } catch (e) {
        console.error(e);
      }
    } else {
      // Unsupported
      console.warn("XSLT is not supported");
    }
    return result;
  }
  
  function unescapeOutput(result) {
    $(result).find('*').contents().filter(function () { return this.nodeType === 3; }).each(function() {
      var frag = document.createDocumentFragment();
      var holder = document.createElement("div");
      holder.innerHTML = this.nodeValue;
      $(holder).contents().each(function() {
        frag.appendChild(this);
      });
      $(frag).insertBefore(this);
      $(this).remove();
    });
  }
  
  $.ajaxTransport("xslt", function(options, originalOptions, jqXHR, headers, completeCallback   ) {
    
    if (options.dataType === 'xslt' || options.xmlStylesheet) {
      options.dataType = 'xslt';
      var xhr, aborted = false;
      return {
        send: function( headers, completeCallback ) {
          // Load Document
          xhr = $.ajax($.extend(true, {}, options, {
            dataType: 'xml',
            contentType: 'application/xml',
            success: function(xml) {
              if (xml && !aborted) {
                var xmlStylesheet = options.xmlStylesheet || getXMLStylesheet(options.url, xml);
                if (xmlStylesheet) {
                  // Load Stylesheet
                  xhr = $.ajax({
                    url: xmlStylesheet,
                    dataType: 'xml',
                    contentType: 'text/xml',
                    success: function(xmlStylesheet) {
                      if (!aborted) {
                        // Transform
                        var result = transformToDocument(xml, xmlStylesheet, options);
                        if (result) {
                          if (options.unescapeOutput) {
                            unescapeOutput(result);
                          }
                          // Success
                          completeCallback(200, "Transform successful", {xslt: result});
                        } else {
                          // Fail
                          completeCallback(400, "Error transforming xml", {});
                        }
                      }
                    },
                    error: function() {
                      if (!aborted) {
                        completeCallback(xhr.status, xhr.statusText, {});
                      }
                    }
                  });
                } else {
                  // No Stylesheet provided
                  completeCallback(400, "No Stylesheet provided", {});
                }
              }
            },
            error: function(doc) {
              if (!aborted) {
                completeCallback(xhr.status, xhr.statusCode, {});
              }
            }
          }));
        },
        abort: function() {
          aborted = true;
          if (xhr) {
            xhr.abort();
          }
        }
      };
    }
  });
  
})(jQuery);