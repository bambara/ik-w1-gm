// ==UserScript==
// @name           IK W1 Improoved
// @namespace      Inselkampf
// @description    Adds functionality to inselkampf pages
// @include        http://213.203.194.123/us/1/index.php?s=*
// ==/UserScript==

function start() {
   for ( var i = 1; i <= 100; i++ ) {
      if ( document.getElementById( "timer"+i ) ) {
         var params = document.getElementById( "timer"+i ).title.split( "_" );
         var time = parseInt( params[1] );
         var type = params[3];
         __timer__( "timer"+i, time, type );
      }
   }
}

function pseudoInsertAfter(newElement, reference) {
   reference.parentNode.insertBefore(newElement,reference.nextSibling);
}

function __timer__( timer, time, type ) {
   var t = time;
   if ( t > 0 ) {
      var h = Math.floor( t / 3600 );
      var m = Math.floor( ( t - h * 3600 ) / 60 );
      var s = t - h * 3600 - m * 60;
      if ( type == 1 ) {
         if ( h == 0 ) h = "";
         else h = h + " Stunden ";
         if ( m == 0 && h == 0 ) m = "";
         else m = m + " Minuten ";
         if ( s == 0 && m == 0 && h == 0 ) s = "";
         else s = s + " Sekunden";
         document.getElementById( timer ).firstChild.nodeValue = h + m + s;
      } else if ( type == 2 ) {
         if ( m < 10 ) m = "0" + m;
         if ( s < 10 ) s = "0" + s;
         document.getElementById( timer ).firstChild.nodeValue = h + ":" + m + ":" + s;
      }
      var time = t - 1;
      window.setTimeout( '__timer__( "'+timer+'", "'+time+'", "'+type+'" )', 1000 );
   } else {
      if ( type == 1 ) document.getElementById( timer ).firstChild.nodeValue= "Abgeschlossen";
      else if ( type == 2 ) document.getElementById( timer ).firstChild.nodeValue= "Angekommen";
   }
}

Array.prototype.unique = function( b ) {
   var a = [], i, l = this.length;
   for( i=0; i<l; i++ ) {
      if( a.indexOf( this[i], 0, b ) < 0 ) { a.push( this[i] ); }
   }
   return a;
};

function Timer( interval ) {
   this.constructor();
   this.interval = interval;
   this.setTimeOut();
}

Timer.prototype = new Observable();

Timer.prototype.setTimeOut = function() {
   this.notifyObservers( this );
   setWindowTimeout( this, this.setTimeOut, this.interval );
};

function setWindowTimeout( object, func, seconds ) {
   return window.setTimeout(
      function() { func.apply( object ); }, seconds
      );
}

function Observable() {
   this.observers = [];
}

Observable.prototype.addObserver = function( observer ) {
   this.observers.push( observer )
};

Observable.prototype.notifyObservers = function( context ) {
   for( var i = 0; i < this.observers.length; i++ ) {
      this.observers[i].update( context );
   }
};

newClock = function ( timer, element, seconds ) {
   timer.addObserver( this );
   this.seconds = parseInt( seconds );
   this.element = element;
   this.element.title = DateHelper.getDateTime( new Date().getTime() + this.seconds * 1000 );
}

newClock.prototype.update = function() {
   if ( this.seconds > 0 ) {
      this.seconds--;
      this.element.innerHTML = DateHelper.getDuration( this.seconds );
   } else {
      this.element.innerHTML = "Finished";
   }
}

var timer = new Timer( 1000 );

DateHelper = function () {};

DateHelper.getDuration = function (seconds) {
   if (seconds == 0) {
      return "Finished";
   }

   var msg = "";
   var days, hours, minutes;
   if (seconds >= 86400) { days = Math.floor(seconds / 86400); seconds = seconds - (days * 86400); }
   if (seconds >= 3600) { hours = Math.floor(seconds / 3600); seconds = seconds - (hours * 3600); }
   if (seconds >= 60) { minutes = Math.floor(seconds / 60); seconds = seconds - (minutes * 60); }

   if (days > 0) {
      msg += days + " " + TextHelper.pluralize( days, "day", "days" ) + " ";
   }
   if (hours > 0) {
      msg += hours + " " + TextHelper.pluralize ( hours, "hour", "hours" ) + " ";
   }
   if (minutes > 0) {
      msg += minutes + " " + TextHelper.pluralize( minutes, "minute", "minutes" ) + " ";
   }
   if (seconds > 0) {
      msg += seconds + " " + TextHelper.pluralize( seconds, "second", "seconds" );
   }
   return msg;
}

function TextHelper() {}

TextHelper.pluralize = function( count, singular, plural ) {
   if ( count == 1 ) {
      return singular;
   }

   return plural;
}

DateHelper.toSeconds = function (duration) {
   var date = duration.split(':');
   var result = parseInt(date[0]) * 3600 + parseInt(date[1]) * 60 + parseInt(date[2]);
   return result;
};

DateHelper.getDateTime = function (time) {
   var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
   var date = new Date( time );
   return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + ( date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + ":" + ( date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() ) + ":" + ( date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() );
};

function init(){
   
   var scripts = document.getElementsByTagName('script');
   for( var i = 0, oElement; oElement = scripts[i]; ++i ) {
      // deze regexp werkt niet global! maar als ik g vlag bijvoeg, wil het helemaal niet meer matchen.
      // ik schuif schuld op opera.
      var a = oElement.innerHTML.match(/new Clock\(\s*\w+,\s*e\(\s*'(\S+)'\s*\),\s*(\d+)\s*\);/i);
      if (a) {
         clocks[a[1]] = parseInt(a[2]);
         new newClock(timer, document.getElementById(a[1]), a[2]);
      }
   }

   //add titles to the images you might find
   //does not have much use, Sven should have made it better!
   var imgs = document.images;

   for (var im = 0; im < imgs.length; ++im) {
      var imsrc = imgs[im].src;
      var filestart = imsrc.lastIndexOf("/");
      filestart = (filestart == -1? 0 : filestart + 1);
      var filename = imsrc.substr(filestart);
      if (imtitles[filename]) {
         imgs[im].title = imtitles[filename];
      }
   }

   getPlayerName();

   addTableElements();

   parseTables();

   parseTableCells();

   parseIn();

   parseDivs();

   parseBolds();

   parseMap();

   // start some clocks
   if (startStoreClock) {
      new newClock(timer, document.getElementById("goldin"), goldin);
      new newClock(timer, document.getElementById("stonein"), stonein);
      new newClock(timer, document.getElementById("woodin"), woodin);
   }
   if (startOrderClock) {
      new newClock(timer, document.getElementById("ordersdonein"), orderTotalTime);
   }

   // clean-up
   cells = null;
   divs = null;
   bolds = null;
}

// update the Units and Resources count on the harbour page
function updateUnitsResources(form) {
   var units = 0, resources = 0;
   for (var i = 0; i < form.elements.length; ++i) {
      var whowhat = form.elements[i].title.split(' ');
      if (whowhat[1] == 'units') {
         units += parseInt(whowhat[0]) * parseInt(form.elements[i].value);
      }
      else if (whowhat[1] == 'resources') {
         resources += parseInt(whowhat[0]) * parseInt(form.elements[i].value);
      }
   }
   if (document.getElementById('orders_units')) {
      document.getElementById('orders_units').innerHTML = units;
   }
   if (document.getElementById('orders_res')) {
      document.getElementById('orders_res').innerHTML = resources;
   }
}

function showElement(name) {
   document.getElementById(name).style.display = 'block';
}

function hideElement(name) {
   document.getElementById(name).style.display = 'none';
}


function parseTables(){
   tables = document.getElementsByTagName('table');
   for ( var i = 0; i < tables.length; i++) {
      if (tables[i].className == 'table') { // list page, alliance pages, random island page
         var rows = tables[i].getElementsByTagName('tr');
         // on lab page a table can have 0 rows (probably research table after research is all done)
         if (rows.length > 0) {
            var dataRows = rows[0].getElementsByTagName('td');
            var numcells = dataRows.length;  // 6 for resources, 4 for fleet, 3 for alliance pages
            if (dataRows[0].innerHTML == '<b>New order</b>') { // harbour page, orders
               // preparation to show how much units and resources you can ship
               var newrow = tables[i].insertRow(rows.length - 1);
               tables[i].style.width = '40%';
               newrow.insertCell(0).innerHTML = "Units: <span id='orders_units'>0</span> Resources: <span id='orders_res'>0</span>";
               newrow.insertCell(1); // visuals
            }

            else if (dataRows[0].innerHTML == '<b>Transport</b>' || dataRows[0].innerHTML == '<b>Attack</b>' ) { // shipping orders
               for (var r = 1; r < rows.length; ++r) {
                  if (rows[r].getElementsByTagName('td')[0].innerHTML.indexOf('<b>Army (') == 0) {
                        rows[r].getElementsByTagName('td')[0].innerHTML += " (<span id='orders_units'>0</span>)";
                  }
                  else if (rows[r].getElementsByTagName('td')[0].innerHTML.toLowerCase().indexOf('<b>resources (') == 0) {
                        rows[r].getElementsByTagName('td')[0].innerHTML += " (<span id='orders_res'>0</span>)";
                  }
               }
            }

            else if (dataRows[0].innerHTML == '<b>Members</b>') { // alliance, members page
               // make a list with all members in mailable format at bottom
               // - collect in array
               // - divide in pieces of 50
               // - add mail-button per segment
               var allmembers = new Array();
               for (var r = 2; r < rows.length; ++r) { // 2 to skip 'Members' and 'Player' rows
                  var a = rows[r].getElementsByTagName('td')[0].getElementsByTagName('a')[0].innerHTML;
                  if(a){
                     allmembers.push(a);
                  }
               }

               var newDiv = document.createElement('div');
               newDiv.id = 'membersinfo';

               var msg = '<h3>' + allmembers.length + ' members</h3>';
               msg += '<table><tr><td width="10"></td><td><b>Members</b></td></tr>';
               for (var i = 0, sc = 1; i < allmembers.length; i += 50, ++sc) {
                  var segment = allmembers.slice(i, i+50);
                  msg += "<tr><td>" + sc + "</td><td>" + segment.join(' ; ') + "</td></tr>";
               }

               msg += '</table>';

               newDiv.innerHTML = msg;
               document.body.appendChild(newDiv);
            }

            else if (dataRows[0].innerHTML == '<b>Events</b>') { // events page
               // add a delete button on top of the table
               dataRows[0].innerHTML = "<span style='float: left; font-weight: bold;'>Events</span><span style='float: right;'><input type='button' value='Delete' onclick='document.getElementById(\"events\").submit();'></span>";

               // select unseen and thus new events of transport to you automatically
               // will not select already seen transports to you, because it assumes
               // you want to keep them otherwise you'd have deleted them yourself
               for (var r = 2; r < rows.length - 1; ++r) { // 2 to skip 'Events' and 'Island' rows, and bottom rows
                  if (rows[r].getElementsByTagName('td')[1].getElementsByTagName('a')[0].innerHTML == 'Transport to ' + playername) {
                     document.getElementById('events').elements[r-1].checked = true;
                  }
               }
            }
         }
      }
   }

}

var cells = 0;

function parseTableCells(){
   cells = document.getElementsByTagName('td');

   for( var i = 0, oElement, cellcount = 0; oElement = cells[i]; ++i ) {
      var a = oElement.innerHTML.match(/\>.+?\>(.+?)\(Level (\d+)\).*Gold:\s+(\d+)\s+Stone:\s+(\d+)\s+Lumber:\s+(\d+)\s+Duration:\s+(\d+:\d+:\d+)/i);
      if(!a){
         var b = oElement.innerHTML.match(/\>.+?\>(.+?)\<.*Gold:\s+(\d+)\s+Stone:\s+(\d+)\s+Lumber:\s+(\d+)\s+Duration:\s+(\d+:\d+:\d+)/i);
      }
      if (a) {
         golds[golds.length] = a[3];
         stones[stones.length] = a[4];
         woods[woods.length] = a[5];
         items[a[1] + 's'] = cellcount++;
         durs[durs.length] = DateHelper.toSeconds(a[6]);
      }
      if(b){
         golds[golds.length] = b[2];
         stones[stones.length] = b[3];
         woods[woods.length] = b[4];
         items[b[1] + 's'] = cellcount++;
         durs[durs.length] = DateHelper.toSeconds(b[5]);
      }
   }


   // go over again and add new info
   for( var i = 0, oElement; oElement = cells[i]; i++ ) {

      if( oElement.innerHTML.indexOf("gold.gif") > -1 ) {
         var a = oElement.innerHTML.match(/\> (.+)/);
         gold = parseInt(a[1]);
         oElement.innerHTML += "<span id='goldspan'></span>";
      }
      else if( oElement.innerHTML.indexOf("stones.gif") > -1 ) {
         var a = oElement.innerHTML.match(/\> (.+)/);
         stone = parseInt(a[1]);
         oElement.innerHTML += "<span id='stonespan'></span>";
      }
      else if( oElement.innerHTML.indexOf("wood.gif") > -1 ) {
         var a = oElement.innerHTML.match(/\> (.+)/);
         wood = parseInt(a[1]);
         oElement.innerHTML += "<span id='woodspan'></span>";
      }
      else if( oElement.innerHTML.indexOf("To here") > -1) {
         var a = oElement.innerHTML.match(/'(.*index\.php\?s=.*)&p=b7&form\[pos1\]=(\d+)&form\[pos2\]=(\d+)&form\[pos3\]=(\d+)'/i);
         if (a) {
            oElement.innerHTML += "<form action='" + a[1] + "&p=map&zoom=&pos1=" + a[2] + "&pos2=" + a[3] + "' method='post'><input type='submit' value='On map'></form>";
            oElement.innerHTML += "<form action='" + a[1] + "&p=calculator&sub=distance' method='post'><input type='hidden' value='" + a[2] + "' name='form[pos1]'><input type='hidden' value='" + a[3] + "' name='form[pos2]'><input type='hidden' value='" + a[4] + "' name='form[pos3]'><b>Distance and Arrival</b>, at <input type='text' value='5' name='form[speed]' size='2'> knots: <input type='submit' value='Calculate'></form>";
         }

      }

      else if (gup('p') == 'b1') {
         var a = oElement.innerHTML.match(/(.+) \(Level (\d+)\)/);
         //var a = oElement.innerHTML.match(/(\w+(?: \w+)?)(?: \(Level (\d+)\))?/);
         if (a) {
            if (!a[2]) a[2] = 0;
            if (a[1].indexOf("Gold Mine") > -1) {
               goldprod = Math.floor(8 * Math.pow(1.2, parseInt(a[2])));
               oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + goldprod + "/h)");
               cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(8 * Math.pow(1.2, parseInt(a[2])+1));
            }
            else if (a[1].indexOf("Stone Quarry") > -1) {
               stoneprod = Math.floor(5 * Math.pow(1.2, parseInt(a[2])));
               oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + stoneprod + "/h)");
               cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(5 * Math.pow(1.2, parseInt(a[2])+1));
            }
            else if (a[1].indexOf("Lumber Mill") > -1) {
               woodprod = Math.floor(6 * Math.pow(1.2, parseInt(a[2])));
               oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + woodprod + "/h)");
               cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(6 * Math.pow(1.2, parseInt(a[2])+1));
            }
            else if (a[1].indexOf("Storehouse") > -1) {
               // mines at max don't show, but they still produce
               if (!goldprod) goldprod = 306;
               if (!stoneprod) stoneprod = 191;
               if (!woodprod) woodprod = 230;

               var stores = Math.floor(Math.pow(1.2, parseInt(a[2])) * 1000);
               cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(Math.pow(1.2, parseInt(a[2]) + 1) * 1000);
               goldin = Math.round((stores - gold) * 3600 / goldprod);
               stonein = Math.round((stores - stone) * 3600 / stoneprod);
               woodin = Math.round((stores - wood) * 3600 / woodprod);
               oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Stores " + stores + ")") + "<hr>Gold reached in <span id='goldin'>" + DateHelper.getDuration(goldin) + "</span><br>Stone reached in <span id='stonein'>" + DateHelper.getDuration(stonein) + "</span><br>Wood reached in <span id='woodin'>" + DateHelper.getDuration(woodin) + "</span><hr>";
               startStoreClock = true;
            }
         }
      }

      else if (gup('p') == 'b7') { // harbour
         if (oElement.innerHTML == '<b>New order</b>') {
            oElement.innerHTML = "<span style='float: left; font-weight: bold;'>New order</span><span style='float: right;'><input type='button' value='Fleetsave' onclick='var df = document.forms[document.forms.length-1]; var dfe = df.elements; if (dfe[0].value == 0) { dfe[0].value = 1; dfe[1].value = 1; dfe[2].value = 1; } for (var i = 3; i < dfe.length - 3; ++i) { var a = dfe[i].parentNode.parentNode.innerHTML.match(/<b>(.+?) \\((\\d+)\\)<\\/b>/i); if (a) { dfe[i].value = parseInt(a[2]); } } df.action += \"&a=fleetsave\"; dfe[dfe.length-3].click();'>";
         }
         else if (oElement.innerHTML == '<b>Island of destination</b>') {
            var msg = "<select onchange=\"if (this.value.length > 0) { var coords=this.value.match(/(\\d+):(\\d+):(\\d+)/); document.getElementsByName('form[pos1]')[0].value = coords[1]; document.getElementsByName('form[pos2]')[0].value = coords[2]; document.getElementsByName('form[pos3]')[0].value = coords[3];}\">";
            msg += "<option value''>Island of destination</option>";
           for (i=0;i<getValue('numIslands');i++) {
             var name = getValue('Name'+i);
             var split = name.match(/(.+)\((.+)\)/);
             var isle = split[1];
             var coords = split[2];
             msg += "<option value='" + coords + "'>" + name + "</option>";
           }
           msg += "</select>";
           oElement.innerHTML = msg;
           oElement.nextSibling.setAttribute("nowrap","true");
         }
      }
   }

   // mines at max don't show, but they still produce
   if (!goldprod) { goldprod = 306; minesunknown = true; }
   if (!stoneprod) { stoneprod = 191; minesunknown = true; }
   if (!woodprod) { woodprod = 230; minesunknown = true; }


   // now do it again, but update the times needed
   for( var i = 0, oElement; oElement = cells[i]; i++ ) {
      var a = oElement.innerHTML.match(/(red|ff0000).*>.*(Upgrade to level|Research|Build)/i);
      if (a) {
         // als dit gevonden, dan in vorige cell kijken hoeveel nodig was
         var goldwait = (golds[(i-4)/2] - gold) * 3600 / goldprod;
         var stonewait = (stones[(i-4)/2] - stone) * 3600 / stoneprod;
         var woodwait = (woods[(i-4)/2] - wood) * 3600 / woodprod;
         var longestwait = Math.round(Math.max(goldwait, stonewait, woodwait));
         var toRed;
         if(Math.round(goldwait) == longestwait) toRed = 'Gold';
         else if(Math.round(stonewait) ==  longestwait) toRed ='Stone';
         else if(Math.round(woodwait) == longestwait) toRed ='Lumber';
         var msg;
         if (minesunknown) { msg = "Ass. mines 20, upgrade"; } else { msg = "Upgrade"; }
         var needed = "<br>" + msg + " in <span id='upgr" + i + "'>" + DateHelper.getDuration(longestwait) + "</span>";
         var lines = cells[i - 1].innerHTML.split("<br>"); //Put the lacking resource in red!
         var newText = "";
         for(var r=0; r<lines.length; r++){
            var temp = lines[r].match(/Gold:.* Stone:.* Lumber:.*/);
            if(temp && toRed){
               myRegExp = new RegExp(toRed+": ([\\d]+)","i");
               newText += '<br>'+lines[r].replace(myRegExp, toRed+": <span style='color:red;'>$1</span>");
            }else{
               if( r!=0 ) newText += '<br>';
               newText += lines[r];
            }
         }
         cells[i - 1].innerHTML = newText; //End of red
         cells[i - 1].innerHTML = cells[i - 1].innerHTML + needed;
         new newClock( timer, document.getElementById("upgr" + i), longestwait );
      }
   }


   // on mail page, find all matches to xx:yy:zz and replace them with links
   if (gup('p') == 'mail' && gup('sub') == 'show'){
      cells[4].innerHTML = cells[4].innerHTML.replace(/(\d+):(\d+):(\d+)/g, "<a href='http://213.203.194.123/us/1/index.php?s=" + gup('s') + "&p=map&sub=isle&pos1=$1&pos2=$2&pos3=$3' target='_blank'>$1:$2:$3</a>");
      cells[5].innerHTML = cells[5].innerHTML.replace(/(\d+):(\d+):(\d+)/g, "<a href='http://213.203.194.123/us/1/index.php?s=" + gup('s') + "&p=map&sub=isle&pos1=$1&pos2=$2&pos3=$3' target='_blank'>$1:$2:$3</a>");
   }


   // overloop links, op main page zal je hopelijk storehouse vinden
   if (gup('p') == 'main') {
      var maxStorage = 1000; // just a main house
      for (var i = 0; i < document.links.length; ++i) {
         if (document.links[i].href.indexOf('&p=b8') > -1) {
            var storehouselevel = parseInt(document.links[i].text.match(/\(Level (\d+)\)$/)[1]);
            maxStorage = Math.floor(Math.pow(1.2, storehouselevel) * 1000);
            break;
         }
      }
      document.getElementById('goldspan').innerHTML = ' / ' + maxStorage;
      document.getElementById('stonespan').innerHTML = ' / ' + maxStorage;
      document.getElementById('woodspan').innerHTML = ' / ' + maxStorage;
   }
}

function keyupEventTextInput(){
   var r = parseInt(this.id);
   if (this.value == 0) {  
      document.getElementById((r + 'info')).style.display = 'none'; 
   }else { 
      document.getElementById((r + 'info')).style.display = 'block';
   }
   document.getElementById(r + 'gold').innerHTML = this.value * golds[r];
   if (gold < this.value * golds[r]) { 
      document.getElementById(r + 'gold').style.color = 'red'; 
   } else { 
      document.getElementById(r + 'gold').style.color = 'green'; 
   }
   document.getElementById(r + 'stone').innerHTML = this.value * stones[r];
   if (stone < this.value * stones[r]) { 
      document.getElementById(r + 'stone').style.color = 'red'; 
   } else { 
      document.getElementById(r + 'stone').style.color = 'green'; 
   }
   document.getElementById(r + 'wood').innerHTML = this.value * woods[r];
   if (wood < this.value * woods[r]) { 
      document.getElementById(r + 'wood').style.color = 'red'; 
   } else { 
      document.getElementById(r + 'wood').style.color = 'green';
   }
   var mydur = this.value * durs[r];
   mydur = (mydur == 0 ? '-' : (DateHelper.getDuration(mydur) + '<br>&nbsp;&nbsp;&nbsp;&nbsp;(' + DateHelper.getDateTime( new Date().getTime() + mydur * 1000 ) + ')'));
   document.getElementById(r + 'dur').innerHTML = mydur;
   var goldwait = ((this.value * golds[r]) - "+gold+") * 3600 / goldprod;
   var stonewait = ((this.value * stones[r]) - "+stone+") * 3600 / stoneprod;
   var woodwait = ((this.value * woods[r]) - "+wood+") * 3600 / woodprod;
   var longestwait = Math.round(Math.max(goldwait, stonewait, woodwait));
   // var myclock = null;
   var myneeded = '-';
   if (longestwait > 0) {
      // TODO: clock hieronder werkt wel, maar je kan ze niet weg krijgen!
      // oplossing: wegdoen van lijst observers, maar nogal moeilijk ;-)
      // myclock = new Clock( timer, document.getElementById(r + 'needed'), longestwait );
      
      myneeded = DateHelper.getDuration(longestwait) + '<br>&nbsp;&nbsp;&nbsp;&nbsp;(' + DateHelper.getDateTime( new Date().getTime() + longestwait * 1000 ) + ')';
   }
   document.getElementById(r + 'needed').innerHTML = myneeded;
}

function parseIn(){
   var inputs = document.getElementsByTagName('input');

   for (var i = 0, oElement, numbercounter = 0, hiddenrower = -1, fleet = new Object, units = new Array(); oElement = inputs[i]; ++i) {
      //alert(oElement.type);
      if (oElement.type == 'text') {
         if (oElement.name == 'number') {
            oElement.setAttribute('id', numbercounter + "input");
            oElement.addEventListener('keyup', keyupEventTextInput, false);
            theCell = cells[(3 + (numbercounter * 3))];
            theCell.innerHTML += "<div id='" + numbercounter + "info' style='display: none'>"+
                                 "<b>Needed:</b> Gold: <span id='" + numbercounter + "gold' style='color: green'>0</span> "+
                                 "Stone: <span id='" + numbercounter + "stone' style='color: green'>0</span> "+
                                 "Lumber: <span id='" + numbercounter + "wood' style='color: green'>0</span><br>"+
                                 "<b>Duration:</b> <span id='" + numbercounter + "dur'>-</span><br><b>Ass. mines 20:</b> "+
                                 "<span id='" + numbercounter + "needed'>-</span></div>";
            ++numbercounter;
         }

         // update the unit and resources count
         else if (oElement.name == 'form[s1]') { //LWS
            oElement.title = '5 units';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[s2]') { //LMS
            oElement.title = '500 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[s3]') { //SWS
            oElement.title = '2 units';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[s4]') { //SMS
            oElement.title = '200 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[s5]') { //Colo
            oElement.title = '5000 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }

         // also on ordering page
         // but it needs a few tricks ;-)
         else if (oElement.name == 'form[u1]') { //stone thrower
            oElement.title = '1 units';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
            if (gup('a') == 'fleetsave') {
               var a = oElement.parentNode.parentNode.innerHTML.match(/<b>(.+?) \((\d+)\)<\/b>/i);
               if (a) { units['u1'] = parseInt(a[2]); }
            }
         }
         else if (oElement.name == 'form[u2]') { //spearfighter
            oElement.title = '1 units';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
            if (gup('a') == 'fleetsave') {
               var a = oElement.parentNode.parentNode.innerHTML.match(/<b>(.+?) \((\d+)\)<\/b>/i);
               if (a) { units['u2'] = parseInt(a[2]); }
            }
         }
         else if (oElement.name == 'form[u3]') { //archer
            oElement.title = '1 units';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
            if (gup('a') == 'fleetsave') {
               var a = oElement.parentNode.parentNode.innerHTML.match(/<b>(.+?) \((\d+)\)<\/b>/i);
               if (a) { units['u3'] = parseInt(a[2]); }
            }
         }
         else if (oElement.name == 'form[catapult]') {
            if (gup('a') == 'fleetsave') {
               var a = oElement.parentNode.parentNode.innerHTML.match(/<b>(.+?) \((\d+)\)<\/b>/i);
               if (a) {
                  oElement.value = Math.min(parseInt(a[2]), (fleet['s1']?fleet['s1']:0));
               }
            }
         }
         else if (oElement.name == 'form[gold]') { //gold
            oElement.title = '1 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[stones]') { //stone
            oElement.title = '1 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
         else if (oElement.name == 'form[wood]') { //lumber
            oElement.title = '1 resources';
            oElement.addEventListener('keyup', function () { updateUnitsResources(this.form); }, false);
         }
      }
      else if (oElement.type == 'submit') {
         if (oElement.value == 'Train' || oElement.value == 'Build') {
            var par = oElement.parentNode;
            par.style.width = '30%';

            var buttX = document.createElement('input');
            buttX.type = 'button';
            buttX.value = 'X';
            buttX.id = numbercounter + 'buttX';
            buttX.addEventListener('click', 
                                    function () {
                                       var r = parseInt(this.id) - 1;
                                       document.forms[r].elements[0].value = 0;
                                    }, false);
            par.appendChild(buttX);

            par.appendChild(document.createElement('br'));
            var buttMax = document.createElement('input');
            buttMax.type = 'button';
            buttMax.value = 'Max';
            buttMax.id = numbercounter + 'buttMax';
            buttMax.addEventListener('click', 
                                    function () {
                                       var r = parseInt(this.id) - 1;
                                       var maxG = Math.floor(gold / golds[r]);
                                       var maxS = Math.floor(stone / stones[r]);
                                       var maxW = Math.floor(wood / woods[r]);
                                       document.forms[r].elements[0].value = Math.min(Math.min(maxG, maxS), maxW);
                                    }, false);
            par.appendChild(buttMax);

            var buttDay = document.createElement('input');
            buttDay.type = 'button';
            buttDay.value = 'Day';
            buttDay.id = numbercounter + 'buttDay';
            buttDay.addEventListener('click', 
                                    function () {
                                       var r = parseInt(this.id) - 1;
                                       var maxG = Math.floor(gold / golds[r]);
                                       var maxS = Math.floor(stone / stones[r]);
                                       var maxW = Math.floor(wood / woods[r]);
                                       var amountMax = Math.min(Math.min(maxG, maxS), maxW);
                                       var amountDay = Math.floor(86400 / durs[r]);
                                       document.forms[r].elements[0].value = Math.min(amountMax, amountDay);
                                    }, false);
            par.appendChild(buttDay);
            buttDay.click();

            par.appendChild(document.createElement('br'));

            var buttp1 = document.createElement('input');
            buttp1.type = 'button';
            buttp1.value = '+1';
            buttp1.id = numbercounter + 'buttp1';
            buttp1.addEventListener('click',  
                                    function () {
                                       var r = parseInt(this.id) - 1;
                                       document.forms[r].elements[0].value = parseInt(document.forms[r].elements[0].value) + 1;
                                    }, false);
            par.appendChild(buttp1);

            var buttp5 = document.createElement('input');
            buttp5.type = 'button';
            buttp5.value = '+5';
            buttp5.id = numbercounter + 'buttp1';
            buttp5.addEventListener('click',  
                                    function () {
                                       var r = parseInt(this.id) - 1;
                                       document.forms[r].elements[0].value = parseInt(document.forms[r].elements[0].value) + 5;
                                    }, false);
            par.appendChild(buttp5);

         }
         else if (oElement.value == 'Next' && gup('a') == 'fleetsave') {
            var totalarmy = 0;
            for (var fl in fleet) {
               if (fl == 's1') { totalarmy += 5 * fleet[fl]; }
               if (fl == 's3') { totalarmy += 2 * fleet[fl]; }
            }
            var archerForm;
            var spearForm;
            var stonersForm;
            for(var i=0; i<oElement.form.length; i++){
               if(oElement.form[i]){
                  if(oElement.form[i].name == 'form[u3]') archerForm = i;
                  if(oElement.form[i].name == 'form[u2]') spearForm = i;
                  if(oElement.form[i].name == 'form[u1]') stonersForm = i;
               }
            }
            if (units['u3'] && archerForm) { // archers
               oElement.form[archerForm].value = Math.min(totalarmy, units['u3']);
               totalarmy -= Math.min(totalarmy, units['u3']);
            }
            if (units['u2'] && spearForm) { // spearfighters
               oElement.form[spearForm].value = Math.min(totalarmy, units['u2']);
               totalarmy -= Math.min(totalarmy, units['u2']);
            }
            if (units['u1'] && stonersForm) { // stone throwers
               oElement.form[stonersForm].value = Math.min(totalarmy, units['u1']);
               totalarmy -= Math.min(totalarmy, units['u1']);
            }
            updateUnitsResources(oElement.form);
         }
         else if (oElement.value == 'Spy') {
            oElement.addEventListener('click',  
                                    function () {
                                       if ((this.form[form[s1]]?this.form[form[s1]].value:0) + (this.form[form[s3]]?this.form[form[s3]].value:0) == 0) {
                                          if (this.form[form[s3]]) { 
                                             this.form[form[s3]].value = 1; 
                                          }
                                          else if (this.form[form[s1]]) { 
                                             this.form[form[s1]].value = 1;
                                          }
                                       }
                                    }, false);
         }
      }

      else if (oElement.type == 'hidden' && gup('sub') == 'presend') {
         var a = oElement.name.match(/form\[(s\d)\]/);
         if (a) {
            if (hiddenrower == -1) {
               for (var c = 0; c < cells.length; ++c) {
                  if (cells[c].innerHTML == '<b>Loading</b>') {
                     hiddenrower = c-3;
                     break;
                  }
               }
            }
            if(hiddenrower == -1) hiddenrower = 5; //this if for spy ship
            var newrow = tables[tables.length-1].insertRow(hiddenrower++);
            newrow.insertCell(0).innerHTML = fullnames[a[1]];
            newrow.insertCell(1).innerHTML = oElement.value;
            fleet[a[1]] = oElement.value;
         }
      }
   }
}

function parseDivs(){
   // overloop divs
   var divs = document.getElementsByTagName('div');
   //	divs[0].style.display = 'none'; // hide advertisements
   for( var i = 0, oElement; oElement = divs[i]; i++ ) {

      // add a few links
      if (oElement.className == "signout") {
         oElement.innerHTML = "<a href='http://www.inselkampf.com/index.php?controller=help' target='_blank'>Help</a>&nbsp;&nbsp;" + oElement.innerHTML;
      }
      
      if (oElement.className == "island") {
         // add a menu for easier browsing
         var a = oElement.getElementsByTagName('a');
         
         var mh = document.createElement('a');
         mh.setAttribute('href', "/us/1/index.php?s=" + gup('s') + "&p=b1");
         mh.innerHTML = 'Main House  ';
         
         var lab = document.createElement('a');
         lab.setAttribute('href', "/us/1/index.php?s=" + gup('s') + "&p=b5");
         lab.innerHTML = 'Laboratory  ';
         
         var bar = document.createElement('a');
         bar.setAttribute('href', "/us/1/index.php?s=" + gup('s') + "&p=b6");
         bar.innerHTML = 'Barracks  ';
         
         var har = document.createElement('a');
         har.setAttribute('href', "/us/1/index.php?s=" + gup('s') + "&p=b7");
         har.innerHTML = 'Harbour  ';

         oElement.insertBefore(har, a[1]);
         oElement.insertBefore(bar, a[1]);
         oElement.insertBefore(lab, a[1]);
         oElement.insertBefore(mh, a[1]);
      }

      // barracks & harbour & laboratory
      if (oElement.innerHTML.indexOf("All orders:") > -1) {
         var a = oElement.innerHTML.match(/All orders: (.+?)\</i);
         if (a) {
            var b = a[1].split(/, /);
            var oo = '';
            for (var rr = 0; rr < b.length; rr++) {
               c = b[rr].match(/(\d+) (.*)/); // (5) (large warship/ships)
               //alert(c[2]);
               var singleGoldCost = golds[items[c[2]]];
               //alert(items);
               if (!singleGoldCost) { singleGoldCost = golds[items[c[2] + 's']]; }
               orderTotalGold += (c[1] * singleGoldCost);

               var singleStoneCost = stones[items[c[2]]];
               if (!singleStoneCost) { singleStoneCost = stones[items[c[2] + 's']]; }
               orderTotalStone += (c[1] * singleStoneCost);

               var singleWoodCost = woods[items[c[2]]];
               if (!singleWoodCost) { singleWoodCost = woods[items[c[2] + 's']]; }
               orderTotalWood += (c[1] * singleWoodCost);

               if (rr == 0) {
                  // eerste order - 1 doen, omdat hij al bezig is
                  c[1] -= 1;
                  // + wat al gedaan is van deze eerste order
                  if (gup('p') != 'b5') {
                     orderTotalTime += clocks['clock_0'];
                  }
                  else { // lab is special
                     orderTotalTime += clocks['clock_1'];
                  }
               }

               var singleTimeCost = durs[items[c[2]]];
               if (!singleTimeCost) { singleTimeCost = durs[items[c[2] + 's']]; }
               orderTotalTime += (c[1] * singleTimeCost);
            }
         }

         if (orderTotalTime != 0) {
            if (orderTotalTime != clocks['clock_0']) {
               // allemaal omdat gewoon innerHTML += niet werkt (breekt id van Duration: of zo)
               var theBOLD = document.createElement('b');
               var theInfoText = document.createTextNode('Done in: ');
               var theTotalDuration = document.createElement('span');
               var theTotalDurationText = document.createTextNode(DateHelper.getDuration(orderTotalTime));
               theTotalDuration.setAttribute('id', 'ordersdonein');
               theTotalDuration.appendChild(theTotalDurationText);
               theBOLD.appendChild(theInfoText);
               theBOLD.appendChild(theTotalDuration);
               oElement.appendChild(document.createElement('br'));
               oElement.appendChild(theBOLD);

               startOrderClock = true;
            }

            var theBOLD = document.createElement('b');
            var theInfoText = document.createTextNode('Totals: Gold: ' + orderTotalGold + ' Stone: ' + orderTotalStone + ' Lumber: ' + orderTotalWood);
            theBOLD.appendChild(theInfoText);

            oElement.appendChild(document.createElement('br'));
            oElement.appendChild(theBOLD);

         }

      }

      // fix silly typo on the laboratory page
      if (oElement.innerHTML.indexOf("the more") > -1) {
         oElement.innerHTML = oElement.innerHTML.replace(/the more the more/, 'the more');
      }

   }
}

function parseBolds(){
   var bolds = document.getElementsByTagName('b');
   for( var i = 0, oElement; oElement = bolds[i]; i++ ) {
      var buildingaction = '';
      var a = oElement.innerHTML.match(/^Amount delivered per hour: (\d+) units$/);
      if (a) { // mines
         // info per day
         oElement.innerHTML += "<br>Amount delivered per day: " + (parseInt(a[1]) * 24) + " units";
         buildingaction = 'Produces';
      }
      else {
         a = oElement.innerHTML.match(/^Capacity per resource: (\d+) units/); // storehouse
         if (a) { buildingaction = 'Stores'; }
         else {
            a = oElement.innerHTML.match(/^Offense level: (\d+)/); // stone wall
            if (a && gup('p') == 'b9') { buildingaction = 'Off/Defence'; }
            else if( gup('p') == 'b10'){
               a = oElement.innerHTML.match(/^Visibility: (\d+,?\d*) nautical miles$/); // watch-tower
               if (a) { buildingaction = 'Sees'; a[1] = a[1].replace(/,/, '.'); }
            }
         }
      }

      if (buildingaction) {
         var buildinfo = new Array(); // array with build factors, floor(factor*1.2^level)
         // Production rate, factor, Gold, Stone, Lumber
         buildinfo['goldmine'] = [8, 1.2, 75, 50, 50];
         buildinfo['stonequarry'] = [5, 1.2, 50, 50, 50];
         buildinfo['lumbermill'] = [6, 1.2, 75, (175/3), 50];
         buildinfo['storehouse'] = [1000, 1.2, 75, 50, 75];
         buildinfo['stonewall'] = [50, 1.25, (250/3), 125, (125/3)];
         buildinfo['watch-tower'] = [1, 1.2, 25, 75, (125/3)];

         var thisbuilding = bolds[i-1].innerHTML.match(/\>(.+)/);
         thisbuilding = thisbuilding[1];
         thisbuilding = thisbuilding.toLowerCase();
         thisbuilding = thisbuilding.replace(/\s/g, '');
         var currlevel = Math.round(Math.log(parseFloat(a[1]) / buildinfo[thisbuilding][0]) / Math.log(buildinfo[thisbuilding][1]));
         bolds[i-1].innerHTML += ' (Level ' + currlevel + ')';

         // now add some more useful info, like building costs for next levels
         var theDIV = document.createElement('div');
         var msg = '<table class="table"><caption>Building costs</caption><tr><td><b>Level</b></td><td><b>Gold</b></td><td><b>Stone</b></td><td><b>Lumber</b></td><td><b>' + buildingaction + '</b></tr>';

         for (var cl = currlevel + 1; cl <= 20; ++cl) {
            msg += '<tr><td>' + cl + '</td><td>' + Math.floor(buildinfo[thisbuilding][2] * Math.pow(1.2, cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][3] * Math.pow(1.2, cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][4] * Math.pow(1.2, cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][0] * Math.pow(buildinfo[thisbuilding][1], cl)) + '</td></tr>';
         }

         msg += '</table>';
         theDIV.innerHTML = msg;
         if (currlevel < 20) {
            oElement.parentNode.appendChild(document.createElement('br'));
            oElement.parentNode.appendChild(document.createElement('br'));
            oElement.parentNode.appendChild(theDIV);
         }
      }
   }
}

function parseMap(){
   // append info to map page
   if (gup('p') == 'map' && gup('sub') == '') {
      var areas = document.getElementsByTagName('area');

      var alliances = new Array();
      var unruled = new Array();
      var validislands = 0; // bug in IK source, it lists islands at other edge if looking at this.

      for (var i = 0; i < areas.length; ++i) {

         var coords = areas[i].coords.split(',');
         var cont = false;
         for (var c = 0; c < coords.length; ++c) {
            if (coords[c] < 0 || coords[c] > 420) { cont = true; }
         }
         if (cont) { continue; }
         ++validislands;

         var island = areas[i].title.match(/Island: (.*)/);
         var ruler = areas[i].title.match(/Ruler: (.*)/);
         var alliance = areas[i].title.match(/Alliance: (.*)/);
         var score = areas[i].title.match(/Score: (.*)/);
         if (island) {
            if (!ruler) { // als geen ruler, dan is het rulerless
               var msg = '<a href="' + areas[i].href + '">' + island[1] + "</a>";
               if (score != 1) { msg += ' (' + score[1] + ')'; } // score
               unruled.push(msg);
            }
            else {
               var alli = (alliance?alliance[1]:'None');
               if (!alliances[alli]) { alliances[alli] = new Array(); };
               alliances[alli].push(ruler[1]); // ruler name
            }
         }
      }

      var newDiv = document.createElement('div');
      newDiv.id = 'mapinfo';
      newDiv.className = 'mapinfo';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'showIslandsScore';
      checkbox.defaultChecked = false;
      checkbox.addEventListener("click", showIslandsScore, true);
      
      var bold = document.createElement('b');
      var text = document.createTextNode('See Islands Score : ');
      bold.appendChild(text);
      
      var h3 = document.createElement('h3');
      var text2 = document.createTextNode(validislands + ' islands');
      h3.appendChild(text2);
      
      var newTable = document.createElement('table');
      var newRow1 = document.createElement('tr');
      var newCell1 = document.createElement('td');
      newCell1.innerHTML = '<b>Alliance</b>';
      var newCell2 = document.createElement('td');
      newCell2.innerHTML = '<b>Members</b>';
      var newCell3 = document.createElement('td');
      newCell3.innerHTML = '<b># Islands</b>';
      
      newRow1.appendChild(newCell1);
      newRow1.appendChild(newCell2);
      newRow1.appendChild(newCell3);
      
      newTable.appendChild(newRow1);

      for (var alliance in alliances) {
         if (typeof alliances[alliance] != 'function') { // om de prototypes niet te hebben, christus!
            var newRow = document.createElement('tr');
            var newCe1 = document.createElement('td');
            var newCe2 = document.createElement('td');
            var newCe3 = document.createElement('td');
            newCe1.innerHTML = alliance;
            newCe2.innerHTML = alliances[alliance].unique().join(' ; ');
            newCe3.innerHTML = alliances[alliance].length;
            
            newRow.appendChild(newCe1);
            newRow.appendChild(newCe2);
            newRow.appendChild(newCe3);
            
            newTable.appendChild(newRow);
         }
      }
      
      var br = document.createElement('br');
      var b = document.createElement('b');
      var text3 = document.createTextNode('Unruled islands:');
      var text4 = document.createTextNode(unruled.join(', '));
      b.appendChild(text3);

      newDiv.appendChild(checkbox);
      newDiv.appendChild(bold);
      newDiv.appendChild(h3);
      newDiv.appendChild(newTable);
      newDiv.appendChild(br);
      newDiv.appendChild(b);
      newDiv.appendChild(text4);
      
      addGlobalStyle('.mapinfo { float:right;width:35%;}');
      document.body.insertBefore(newDiv, document.getElementsByTagName('br')[1]);
   }
}

function showIslandsScore(){
   if(document.getElementById('showIslandsScore').checked){
      var c; var d; 
      var im = document.images[4]; 
      var ot = im.offsetTop; 
      var ol = im.offsetLeft; 
      b = document.getElementsByTagName('area');
      for(i=1;i<b.length;i++) { 
         if (b[i].coords.length>0 && b[i].title.length>0) {
            var t = b[i].coords.split(','); 
            var s = b[i].title.split('Score: '); 
            var nl = (ol*1)+(t[0]*1); 
            var nt = (ot*1)+(t[1]*1);
            var lol = document.createElement('div');
            lol.setAttribute('id', 'ScoreOfIsland');
            lol.setAttribute('style', "font-family: Silkscreen; font-size:8px;"+
               "height:8px; line-height:8px; "+
               "position:absolute;left:"+nl+
               "px;top:"+nt+"px; "+
               "background-color: #FFF");
            lol.innerHTML = s[1]+'<br/>';
            document.body.appendChild(lol);
            lol = lol + '<div style=\'font-family: Verdana; font-size:8px; height:8px; line-height:8px; position:absolute;left:'+nl+'px;top:'+nt+'px; background-color: #FFF\'>'+s[1]+'<br/></div>'; 
            var nl=0; 
            var nt=0;
         }
      }
   }else{
      while(document.getElementById('ScoreOfIsland')){
         document.body.removeChild(document.getElementById('ScoreOfIsland'));
      }
   }
}
// http://www.netlobo.com/url_query_string_javascript.html
// get url parameter value
function gup( name )
{
   name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
   var regexS = "[\\?&]"+name+"=([^&#]*)";
   var regex = new RegExp( regexS );
   var results = regex.exec( window.location.href );
   if( results == null )
      return "";
   else
      return results[1];
}

function addGlobalStyle(css) {
   var head, style;
   head = document.getElementsByTagName('head')[0];
   if (!head) {
      return;
   }
   style = document.createElement('style');
   style.type = 'text/css';
   style.innerHTML = css;
   head.appendChild(style);
}

function getPlayerName(){
   // get player name
   var divs = document.getElementsByTagName('div');

   for(var i=0; i<divs.length; i++){
      if(divs[i].className == 'player'){
         var bolds = divs[i].getElementsByTagName('b');
         if(bolds.length == 1){
            playername = bolds[0].innerHTML;
         }
      }
   }
}

function addUpdateSection(){
   var newdiv = document.createElement('div');
   newdiv.className = 'update';
   
   var a = document.createElement('button');
   a.innerHTML = 'Update';
   a.addEventListener("click", updateIslandData, true);
   
   var text = document.createTextNode('Ready');
   
   var text2 = document.createTextNode('Last Update done : ');
   
   var sep = document.createTextNode(' | ');
   
   var bold = document.createElement('b');
   bold.setAttribute('id', 'islandtext');
   
   var bold2 = document.createElement('b');
   bold2.setAttribute('id', 'updatedate');
   
   var sep2 = document.createTextNode(' | ');
   
   var dat = document.createTextNode(GM_getValue(playername+'updatedate', new Date().toLocaleString()));
   
   var sep3 = document.createTextNode(' | ');
   
   var HarbourCheckbox = document.createElement('input');
   HarbourCheckbox.type = 'checkbox';
   HarbourCheckbox.id = 'getHarbourData';
   HarbourCheckbox.defaultChecked = false;
   
   var HarbourLabel = document.createElement('label');
   HarbourLabel.htmlFor = 'getHarbourData';
   
   var HarbourText = document.createTextNode("Harbour : ");
   
   var bold3 = document.createElement('b');
   
   bold3.appendChild(HarbourText);
   HarbourLabel.appendChild(bold3);
   newdiv.appendChild(a);
   newdiv.appendChild(sep2);
   bold.appendChild(text);
   newdiv.appendChild(bold);
   newdiv.appendChild(sep);
   bold2.appendChild(text2);
   newdiv.appendChild(bold2);
   newdiv.appendChild(dat);
   newdiv.appendChild(sep3);
   newdiv.appendChild(HarbourLabel);
      newdiv.appendChild(HarbourCheckbox);
   newdiv.align = 'left';
   addGlobalStyle('.navigation { width:100%;}');
   addGlobalStyle('.table { padding-top: 10px; }');
   addGlobalStyle(".update { padding-left: 20px; "+
                  "background-color:#F0F0F0; margin:1px; padding:3px;"+
                  "text-align:center; width:100%;}");

   document.getElementsByTagName('body')[0].insertBefore(newdiv, document.getElementsByTagName('br')[1]);
}

function updateIslandData(){
   parseURL(0, -1, 0);
}

var retryCount = 0;

var maxRetry = 3;

var eventsID = [];

function parseURL(iteration, sudIteration, isleNum){
   var theURL = '';
   switch (iteration) {
   case 0:        // Main Page
      theURL = getValue('href'+isleNum);
      break;
   case 1:        // Harbour Page
      theURL = window.location.toString();
      theURL = theURL.replace(gup('p'), 'b7');
      if(sudIteration != -1){    // Harbour Event Page
         theURL = theURL+'&sub=show&id='+eventsID[sudIteration];
      }
      break;
   }
   if(isleNum < getValue('numIslands')){
      GM_xmlhttpRequest({
            method: 'GET',
            url: theURL,
            headers: {
               'User-agent': 'Mozilla/4.0 (compatible)',
               'Accept': 'text/html'
            },
            onload: function(responseDetails) {
               if (responseDetails.status !== 200) {
                  var debugMessage = "error in parseURL onload " + responseDetails.status + " island " + isleNum + "<br>";
                  retryCount++;
                  if (retryCount > maxRetry) {
                     document.getElementById('islandtext').innerHTML = "Error: server health";
                     debugMessage += "Too many failures. Bailing<br>";
                     GM_log(debugMessage);
                     exit();
                  } else{
                     document.getElementById('islandtext').innerHTML = "Done!!!"
                  }
                  
               }else{
                  switch (iteration) {
                  case 0:
                     document.getElementById('islandtext').innerHTML = "     Loading : "+getValue('Name'+isleNum);
                     parseURLResult(responseDetails.responseText, isleNum);
                     if(document.getElementById('getHarbourData').checked){
                        parseURL( 1, -1, isleNum); //Parse Harbour page!
                     }else{
                        parseURL( 0, -1, (isleNum+1));
                     }
                     break;
                  case 1:
                     if(sudIteration == -1){
                        var s = responseDetails.responseText;
                        var Rx= /&p=b7&sub=show&id\=([0-9]*)/g;
                        var pat;
                        while(s && (pat= Rx.exec(s))!= null){
                           eventsID.push(pat[1]);
                        }
                        if(eventsID.length != 0){ //There is events!
                           parseURL( 1, 0, isleNum);
                        }else{    //No events, parse next Main Page
                           parseURL( 0, -1, (isleNum+1));
                        }
                     }else{
                        if(sudIteration < eventsID.length){
                           parseHarbourEvents(responseDetails.responseText, isleNum);
                           if((sudIteration+1) >= eventsID.length){ //last event, parse next Main Page
                              parseURL( 0, -1, (isleNum+1));
                           }else{
                              parseURL( 1, (sudIteration+1), isleNum);
                           }
                        }
                     }
                     break;
                  }
                  
               }
            },
            onerror: function(responseDetails) {
               document.getElementById('islandtext').innerHTML = "     Done!!!";
               var debugMessage = "error in sub onerror " + responseDetails.status + " island " + isleNum + "<br>";
               GM_log(debugMessage);
            }
      }); //end xmlrequest
   }else{
      setValue('updatedate', new Date().toLocaleString());
      document.getElementById('islandtext').innerHTML = "     Done!!!";
      document.getElementById('updatedate').innerHTML = getValue('updatedate');
      location.reload(true);
   }
}

function parseURLResult(result, isle){

   //buildings
   var mh = result.match(/\>Main House \(Level (.+?)\)/);
   if(mh) setValue('Main House'+isle, mh[1]);
   else setValue('Main House'+isle, 0);

   var gm = result.match(/\>Gold Mine \(Level (.+?)\)/);
   if(gm) setValue('Gold Mine'+isle, gm[1]);
   else setValue('Gold Mine'+isle, 0);

   var sq = result.match(/\>Stone Quarry \(Level (.+?)\)/);
   if(sq) setValue('Stone Quarry'+isle, sq[1]);
   else setValue('Stone Quarry'+isle, 0);

   var lm = result.match(/\>Lumber Mill \(Level (.+?)\)/);
   if(lm) setValue('Lumber Mill'+isle, lm[1]);
   else setValue('Lumber Mill'+isle, 0);

   var lab = result.match(/\>Laboratory \(Level (.+?)\)/);
   if(lab) setValue('Laboratory'+isle, lab[1]);
   else setValue('Laboratory'+isle, 0);

   var ba = result.match(/\>Barracks \(Level (.+?)\)/);
   if(ba) setValue('Barracks'+isle, ba[1]);
   else setValue('Barracks'+isle, 0);

   var ha = result.match(/\>Harbour \(Level (.+?)\)/);
   if(ha) setValue('Harbour'+isle, ha[1]);
   else setValue('Harbour'+isle, 0);

   var st = result.match(/\>Storehouse \(Level (.+?)\)/);
   if(st) setValue('Storehouse'+isle, st[1]);
   else setValue('Storehouse'+isle, 0);

   var sw = result.match(/\>Stone Wall \(Level (.+?)\)/);
   if(sw) setValue('Stone Wall'+isle, sw[1]);
   else setValue('Stone Wall'+isle, 0);

   var wt = result.match(/\>Watch-Tower \(Level (.+?)\)/);
   if(wt) setValue('Watch-Tower'+isle, wt[1]);
   else setValue('Watch-Tower'+isle, 0);

   //Army
   var sto = result.match(/\>Stone Throwers \((.+?)\)/);
   if(sto) setValue('Stone Throwers'+isle, sto[1]);
   else setValue('Stone Throwers'+isle, 0);

   var spe = result.match(/\>Spearfighters \((.+?)\)/);
   if(spe) setValue('Spearfighters'+isle, spe[1]);
   else setValue('Spearfighters'+isle, 0);

   var arch = result.match(/\>Archers \((.+?)\)/);
   if(arch) setValue('Archers'+isle, arch[1]);
   else setValue('Archers'+isle, 0);

   var cat = result.match(/\>Catapults \((.+?)\)/);
   if(cat) setValue('Catapults'+isle, cat[1]);
   else setValue('Catapults'+isle, 0);

   //Fleets

   var lws = result.match(/\>Large Warships \((.+?)\)/);
   if(lws) setValue('Large Warships'+isle, lws[1]);
   else setValue('Large Warships'+isle, 0);

   var lms = result.match(/\>Large Merchant Ships \((.+?)\)/);
   if(lms) setValue('Large Merchant Ships'+isle, lms[1]);
   else setValue('Large Merchant Ships'+isle, 0);

   var sws = result.match(/\>Small Warships \((.+?)\)/);
   if(sws) setValue('Small Warships'+isle, sws[1]);
   else setValue('Small Warships'+isle, 0);

   var sms = result.match(/\>Small Merchant Ships \((.+?)\)/);
   if(sms) setValue('Small Merchant Ships'+isle, sms[1]);
   else setValue('Small Merchant Ships'+isle, 0);

   var colo = result.match(/\>Colonization Ships \((.+?)\)/);
   if(colo) setValue('Colonization Ships'+isle, colo[1]);
   else setValue('Colonization Ships'+isle, 0);

   calculate_score(isle);
}

function parseHarbourEvents(s, isle){
   var arch = s.match(/Archers<\/td><td>([0-9]*)<\/td>/);
   if(arch) {
      var a = parseInt(getValue('Archers'+isle)) + parseInt(arch[1]);
      setValue('Archers'+isle, a);
   }
   var st = s.match(/Stone Throwers<\/td><td>([0-9]*)<\/td>/);
   if(st) {
      var b = parseInt(getValue('Stone Throwers'+isle)) + parseInt(st[1]);
      setValue('Stone Throwers'+isle, b);
   }
   var sp = s.match(/Spearfighters<\/td><td>([0-9]*)<\/td>/);
   if(sp) {
      var c = parseInt(getValue('Spearfighters'+isle)) + parseInt(sp[1]);
      setValue('Spearfighters'+isle, c);
   }
   var cat = s.match(/Catapults<\/td><td>([0-9]*)<\/td>/);
   if(cat) {
      var d = parseInt(getValue('Catapults'+isle)) + parseInt(cat[1]);
      setValue('Catapults'+isle, d);
   }
   var lws = s.match(/Large Warships<\/td><td>([0-9]*)<\/td>/);
   if(lws) {
      var e = parseInt(getValue('Large Warships'+isle)) + parseInt(lws[1]);
      setValue('Large Warships'+isle, e);
   }
   var sws = s.match(/Small Warships<\/td><td>([0-9]*)<\/td>/);
   if(sws) {
      var f = parseInt(getValue('Small Warships'+isle)) + parseInt(sws[1]);
      setValue('Small Warships'+isle, f);
   }
   var lms = s.match(/Large Merchant Ships<\/td><td>([0-9]*)<\/td>/);
   if(lms) {
      var g = parseInt(getValue('Large Merchant Ships'+isle)) + parseInt(lms[1]);
      setValue('Large Merchant Ships'+isle, g);
   }
   var sms = s.match(/Small Merchant Ships<\/td><td>([0-9]*)<\/td>/);
   if(sms) {
      var h = parseInt(getValue('Small Merchant Ships'+isle)) + parseInt(sms[1]);
      setValue('Small Merchant Ships'+isle, h);
   }
   var colo= s.match(/Colonization Ships<\/td><td>([0-9]*)<\/td>/);
   if(colo) {
      var i = parseInt(getValue('Colonization Ships'+isle)) + parseInt(colo[1]);
      setValue('Colonization Ships'+isle, i);
   }
}

function addTableElements(){

   var tables = document.getElementsByTagName('table');
   for ( var i = 0; i < tables.length; i++) {
      if (tables[i].className == 'table') { // list page, alliance pages, random island page
         var rows = tables[i].getElementsByTagName('tr');
         // on lab page a table can have 0 rows (probably research table after research is all done)
         if (rows.length > 0) {
            var dataRows = rows[0].getElementsByTagName('td');
            var numcells = dataRows.length;  // 6 for resources, 4 for fleet, 3 for alliance pages
            // add a row with totals

            if (dataRows[0].innerHTML == '<b>Island</b>' && numcells > 1 && dataRows[numcells-1].width == '1%') { // list page only
               setValue('numIslands', rows.length-1);
               // make table a bit wider
               dataRows[numcells-1].width = '1px';
               tables[i].style.width = '100%';
               var cells2sum;

               addUpdateSection();

               if (numcells == 6) {         // resources
                  createExtendedTable(tables[i], 5);
                  dataRows[1].width = '5%';
                  dataRows[2].width = '5%';
                  dataRows[3].width = '5%';
                  dataRows[4].width = '5%';
                  dataRows[5].width = '5%';
                  dataRows[6].width = '5%';
                  dataRows[7].width = '5%';
                  dataRows[8].width = '5%';
                  dataRows[9].width = '5%';
                  dataRows[10].width = '5%';
                  dataRows[11].width = '5%';
                  dataRows[12].width = '5%';
                  dataRows[13].width = '5%';
                  dataRows[14].width = '5%';
                  cells2sum = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];  // starting at 0 of course
               }else if(numcells == 4) {    // fleets & Schedules
                  if(dataRows[1].innerHTML == '<b>Army</b>'){ // fleets
                     createExtendedTable(tables[i], 3);
                     dataRows[1].width = '5%';
                     dataRows[2].width = '5%';
                     dataRows[3].width = '5%';
                     dataRows[4].width = '5%';
                     dataRows[5].width = '5%';
                     dataRows[6].width = '5%';
                     dataRows[7].width = '5%';
                     dataRows[8].width = '5%';
                     dataRows[9].width = '5%';
                     dataRows[10].width = '5%';
                     dataRows[11].width = '5%';
                     dataRows[12].width = '5%';
                     cells2sum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                  }else{                               // Schedules
                     createExtendedTableSchedule(tables[i], 2)
                     dataRows[1].width = '5%';
                     dataRows[2].width = '5%';
                     dataRows[3].width = '5%';
                     dataRows[4].width = '5%';
                     dataRows[5].width = '5%';
                     dataRows[6].width = '5%';
                     dataRows[7].width = '5%';
                     dataRows[8].width = '5%';
                     dataRows[9].width = '5%';
                     dataRows[10].width = '1%';
                     cells2sum = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                  }
               }

               var totalsisles = new Array();
               var averageisles = new Array();

               for (var k = 0; k < cells2sum.length; ++k) { // boring init
                  totalsisles[k] = 0;
               }
               
               for (var k = 0; k < cells2sum.length; ++k) { // boring init
                  averageisles[k] = 0;
               }

               for (var r = 1; r < rows.length; ++r) {
                  for (var k = 0; k < cells2sum.length; ++k) {
                     var childs = rows[r].getElementsByTagName('td');
                     totalsisles[k] += parseInt(childs[cells2sum[k]].innerHTML);
                  }
               }
               
               for (var r = 1; r < rows.length; ++r) {
                  for (var k = 0; k < cells2sum.length; ++k) {
                     averageisles[k] = Math.round(totalsisles[k]/getValue('numIslands'));
                  }
               }

               var newtfoot2 = tables[i].createTFoot(); //Create new tfoot
               var newtfootrow2 = newtfoot2.insertRow(0); //Define a new row for the tfoot
               newtfootrow2.insertCell(0).innerHTML = "<b>Average/Island :</b>"; //Define a new cell for the tfoot's row

               for (var r = 0; r < totalsisles.length; ++r) {
                  newtfootrow2.insertCell(r+1).innerHTML = averageisles[r];
               }
               
               var newtfoot = tables[i].createTFoot(); //Create new tfoot
               var newtfootrow = newtfoot.insertRow(0); //Define a new row for the tfoot
               newtfootrow.insertCell(0).innerHTML = "<b>Totals :</b>"; //Define a new cell for the tfoot's row

               for (var r = 0; r < totalsisles.length; ++r) {
                  newtfootrow.insertCell(r+1).innerHTML = totalsisles[r];
               }

               if(numcells == 6){      //for visual appearance
                  newtfootrow.insertCell(4).innerHTML = '';
                  newtfootrow2.insertCell(4).innerHTML = '';
               }

               for (var r = totalsisles.length + 1; r < numcells; ++r) {
                  newtfootrow.insertCell(r); // visual appearance
                  newtfootrow2.insertCell(r); // visual appearance
               }

               for(var r = 1; r < rows.length-2; ++r){
                  setValue('href'+(r-1), rows[r].getElementsByTagName('td')[0].getElementsByTagName('a')[0].href);
                  setValue('Name'+(r-1), rows[r].getElementsByTagName('td')[0].getElementsByTagName('a')[0].innerHTML);
               }
            }
         }
      }
   }
}

function createExtendedTable(table, start){

   var newCell1 = table.rows[0].insertCell(start);
   newCell1.innerHTML = '<b>Stoners</b>';

   var newCell2 = table.rows[0].insertCell(start+1);
   newCell2.innerHTML = '<b>Spears</b>';

   var newCell3 = table.rows[0].insertCell(start+2);
   newCell3.innerHTML = '<b>Archers</b>';

   var newCell4 = table.rows[0].insertCell(start+3);
   newCell4.innerHTML = '<b>Cats</b>';

   var newCell5 = table.rows[0].insertCell(start+4);
   newCell5.innerHTML = '<b>LWS</b>';

   var newCell6 = table.rows[0].insertCell(start+5);
   newCell6.innerHTML = '<b>LMS</b>';

   var newCell7 = table.rows[0].insertCell(start+6);
   newCell7.innerHTML = '<b>SWS</b>';

   var newCell8 = table.rows[0].insertCell(start+7);
   newCell8.innerHTML = '<b>SMS</b>';

   var newCell9 = table.rows[0].insertCell(start+8);
   newCell9.innerHTML = '<b>Colos</b>';

   var newCell10 = table.rows[0].insertCell(start+9);
   newCell10.innerHTML = '<b>Score</b>';

   var rows = table.getElementsByTagName('tr');

   for (var r = 1; r < rows.length; ++r) {
      newCell = table.rows[r].insertCell(start);
      newCell.innerHTML = getValue('Stone Throwers'+(r-1));

      newCell = table.rows[r].insertCell(start+1);
      newCell.innerHTML = getValue('Spearfighters'+(r-1));

      newCell = table.rows[r].insertCell(start+2);
      newCell.innerHTML = getValue('Archers'+(r-1));

      newCell = table.rows[r].insertCell(start+3);
      newCell.innerHTML = getValue('Catapults'+(r-1));

      newCell = table.rows[r].insertCell(start+4);
      newCell.innerHTML = getValue('Large Warships'+(r-1));

      newCell = table.rows[r].insertCell(start+5);
      newCell.innerHTML = getValue('Large Merchant Ships'+(r-1));

      newCell = table.rows[r].insertCell(start+6);
      newCell.innerHTML = getValue('Small Warships'+(r-1));

      newCell = table.rows[r].insertCell(start+7);
      newCell.innerHTML = getValue('Small Merchant Ships'+(r-1));

      newCell = table.rows[r].insertCell(start+8);
      newCell.innerHTML = getValue('Colonization Ships'+(r-1));

      newCell = table.rows[r].insertCell(start+9);
      newCell.innerHTML = getValue('Score'+(r-1));
   }
}

function createExtendedTableSchedule(table, start){

   table.rows[0].getElementsByTagName('td')[1].innerHTML = '<b>Stoners</b>';

   var newCell2 = table.rows[0].insertCell(start);
   newCell2.innerHTML = '<b>Spears</b>';

   var newCell3 = table.rows[0].insertCell(start+1);
   newCell3.innerHTML = '<b>Archers</b>';

   var newCell4 = table.rows[0].insertCell(start+2);
   newCell4.innerHTML = '<b>Cats</b>';

   var newCell5 = table.rows[0].insertCell(start+3);
   newCell5.innerHTML = '<b>LWS</b>';

   var newCell6 = table.rows[0].insertCell(start+4);
   newCell6.innerHTML = '<b>LMS</b>';

   var newCell7 = table.rows[0].insertCell(start+5);
   newCell7.innerHTML = '<b>SWS</b>';

   var newCell8 = table.rows[0].insertCell(start+6);
   newCell8.innerHTML = '<b>SMS</b>';

   var newCell9 = table.rows[0].insertCell(start+7);
   newCell9.innerHTML = '<b>Colos</b>';

   var rows = table.getElementsByTagName('tr');

   for (var r = 1; r < rows.length; ++r) {

      var schedules = table.rows[r].getElementsByTagName('td')[1].innerHTML;

      if(schedules.length == 0){
         table.rows[r].getElementsByTagName('td')[1].innerHTML = 0;

         newCell = table.rows[r].insertCell(start);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+1);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+2);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+3);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+4);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+5);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+6);
         newCell.innerHTML = 0;

         newCell = table.rows[r].insertCell(start+7);
         newCell.innerHTML = 0;
      }else{
         var schedules_array = schedules.split(",");

         table.rows[r].getElementsByTagName('td')[1].innerHTML = schedules_array[0];

         newCell = table.rows[r].insertCell(start);
         newCell.innerHTML = schedules_array[1];

         newCell = table.rows[r].insertCell(start+1);
         newCell.innerHTML = schedules_array[2];

         newCell = table.rows[r].insertCell(start+2);
         newCell.innerHTML = schedules_array[3];

         newCell = table.rows[r].insertCell(start+3);
         newCell.innerHTML = schedules_array[4];

         newCell = table.rows[r].insertCell(start+4);
         newCell.innerHTML = schedules_array[5];

         newCell = table.rows[r].insertCell(start+5);
         newCell.innerHTML = schedules_array[6];

         newCell = table.rows[r].insertCell(start+6);
         newCell.innerHTML = schedules_array[7];

         newCell = table.rows[r].insertCell(start+7);
         newCell.innerHTML = schedules_array[8];
      }
   }
}

/*
* Some wrapper functions
*/

function setValue(name, value) {
    if (value == undefined || value == null) {
        GM_setValue(playername+name, "");
    } else {
        GM_setValue(playername+name, value);
    }
}

function getValue(unit) {
    return GM_getValue(playername+unit, 0);
}

function calculate_score(theIsland)
{
  var score = 0;
  var levels = [];
  var points = [0, 0.5, 1.1, 1.9, 2.8, 3.9, 5.2, 6.8, 8.7, 11, 13.8, 17.1, 21.1, 25.9, 31.6, 38.5, 46.8, 56.7, 68.6, 82.9, 100];

  levels.push( parseInt(getValue('Main House'+theIsland)));
  levels.push( parseInt(getValue('Gold Mine'+theIsland)));
  levels.push( parseInt(getValue('Stone Quarry'+theIsland)));
  levels.push( parseInt(getValue('Lumber Mill'+theIsland)));
  levels.push( parseInt(getValue('Laboratory'+theIsland)));
  levels.push( parseInt(getValue('Barracks'+theIsland)));
  levels.push( parseInt(getValue('Harbour'+theIsland)));
  levels.push( parseInt(getValue('Storehouse'+theIsland)));
  levels.push( parseInt(getValue('Stone Wall'+theIsland)));
  levels.push( parseInt(getValue('Watch-Tower'+theIsland)));

  for (var i = 0; i < levels.length; i++) {
    score += points[levels[i]];
  }

  setValue('Score'+theIsland, Math.round(score));

}

if (window.addEventListener){
   window.addEventListener("load", init, false) //invoke function
}

var playername = '';
var activeIsland; // name will be set on visit to the List page

var Islands;

var startStoreClock = false;
var gold, stone, wood;
var goldprod, stoneprod, woodprod;
var minesunknown = false;

var startOrderClock = false;
var orderTotalTime = 0;
var orderTotalGold = 0, orderTotalStone = 0, orderTotalWood = 0;

var goldin  = 0;
var stonein = 0;
var woodin  = 0;

var golds = new Array();
var stones = new Array();
var woods = new Array();
var items = new Array();
var durs = new Array();

var clocks = new Array();

var tables = new Array();

var fullnames = new Array();
fullnames['s1'] = 'Large Warships';
fullnames['s2'] = 'Large Merchant Ships';
fullnames['s3'] = 'Small Warships';
fullnames['s4'] = 'Small Merchant Ships';
fullnames['s5'] = 'Colonization Ships';
fullnames['catapult'] = 'Catapults';
fullnames['u1'] = 'Stone throwers';
fullnames['u2'] = 'Spearfighters';
fullnames['u3'] = 'Archers';

var imtitles = new Array();
imtitles['gold.gif'] = 'Gold';
imtitles['stones.gif'] = 'Stone';
imtitles['wood.gif'] = 'Lumber';

var buildimgtitles = new Array();
buildimgtitles['u_2.gif'] = 'Barracks';
buildimgtitles['b_2.gif'] = 'Building';
buildimgtitles['s_2.gif'] = 'Harbour';
buildimgtitles['t_2.gif'] = 'Laboratory';
