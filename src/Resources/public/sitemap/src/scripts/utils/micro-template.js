/**
 * Simple JavaScript Templating
 *
 * @author John Resig - http://ejohn.org/
 * @license MIT Licensed
 * @see http://ejohn.org/blog/javascript-micro-templating/
 */

import escape from './escape';

$.escape = escape;

var cache = {};

function emptyBlockWhiteSpace (html) {
    var result;
    var regex = /(<\/?(div|p)[^>]*>)\s+(<\/?(div|p)[^>]*>)/g;

    while (true) {
        result = html.replace(regex, '$1$3');

        if (result === html) break;
        html = result;
    }

    return html;
}

export default function tmpl (str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("vars",
        "var p=[],escape=$.escape,print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(vars){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? emptyBlockWhiteSpace( fn( data ) ) : fn;
};
