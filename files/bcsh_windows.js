//fixes
String.prototype.trim = function(){
    var str = this.toString();
    while(str.charAt(0) == " "){
        str = str.slice(1, str.length);
    }
    while(str.charAt(str.length-1) == " "){
        str = str.slice(0, str.length-1);
    }
    return str;
}
String.prototype.replaceAll = function(o, n){
    var str = this.toString();
    while(str.indexOf(o) > -1){
        str = str.replace(o, n);
    }
    return str;
}
function global(){
    return true;
}

var shell = WScript.CreateObject("WScript.Shell");
var fso = WScript.CreateObject("Scripting.FileSystemObject");

var bcsh = {
          commands: {
              "cmdlist": function(args){ return Object.keys(bcsh.commands).join(args[0]?args[0]:", ") },
              "help": function(args){ if(!args[0]) args[0] = "main"; return bcsh.help[args[0]] },
              "echo": function(args){ return args[0] },
              "print": function(args){ WScript.Echo(args[0]) },
              "set": function(args){ bcsh.variables[args[0]] = args[1] },
              "if": function(args){ var r = ''; if(eval(args[0])){ r = bcsh.exec(args[1]) }else{ r = bcsh.exec(args[2]) }; return r; },
              "loop": function(args){ var r = '', i = args[1]; while(i < args[2]){ r += bcsh.exec(args[3].replaceAll("@{"+args[0]+"}", i)); i++ }; return r; },
              "func": function(args){ bcsh.functions[args[0]] = args[1] },
              "funclist": function(args){ return Object.keys(bcsh.functions).join(args[0]?args[0]:", ") },
              "f": function(args){ var code = bcsh.functions[args[0]]; for(var i in args) code = code.replaceAll("@{#"+i+"}", args[i]); return bcsh.exec(code); },
              "math": function(args){ return eval(args.join("")) },
              "exec": function(args){ return bcsh.exec(args[0]) },
              "execScript": function(args){ return bcsh.execScript(args[0]) },
              "str.replace": function(args){ return (args[3]?args[0].replace(args[1], args[2]):args[0].replaceAll(args[1], args[2])) },
              "str.replaceRegEx": function(args){ return args[0].replace(new RegExp(args[1]), args[2]) },
              "str.join": function(args){ return args.join("") },
              "str.split": function(args){ return args[0].toString().split(args[1]) },
              "str.match": function(args){ return args[0].match(new RegExp(args[1])) },
              "str.contains": function(args){ return args[0].includes(args[1]) },
              "str.equals": function(args){ return (args[0] == args[1]) },
              "str.escapeHtml": function(args){ return args[0].replaceAll("<", "&lt;").replaceAll(">", "&gt;") },
              "obj.get": function(args){ return JSON.parse(args[0])[args[1]] },
              "obj.set": function(args){ var o = JSON.parse(args[0]); o[args[1]] = args[2]; return o },
              "obj.create": function(args){ return "{}" },
              "obj.save": function(args){ eval(args[0])[args[1]] = JSON.parse(args[2]) },
              "obj.foreach": function(args){ var o = JSON.parse(args[0]); var r = ''; for(var i in o){ r += bcsh.exec(args[1].replaceAll("@{name}", i).replaceAll("@{value}", o[i])) }; return r },
              "arr.create": function(args){ return "[]" },
              "arr.join": function(args){ return JSON.parse(args[0]).join(args[1]) },
              "js.new": function(args){ return eval("new "+args[0]+"("+args[1]+")") },
              "js.eval": function(args){ return eval(args[0]) },
              "js.get": function(args){ return eval(args[0])[args[1]] },
              "js.set": function(args){ eval(args[0])[args[1]] = args[2] },
              "js.call": function(args){ return eval(args[0]+"['"+args[1]+"']("+args[2]+")") },
              "js.math": function(args){ return eval("Math."+args[0]+"("+args[1]+")") },
              "js.random": function(args){ return Math.floor(Math.random()*args[0]) },
              "file.write": function(args){ var f = fso.OpenTextFile(args[0], 2, true); f.Write(args[1]); f.Close() },
              "file.read": function(args){ var f = fso.OpenTextFile(args[0], 1); var r = f.ReadAll(); f.Close(); return r },
              "window.msgbox": function(args){ alert(args[0]); },
              "data.decode": function(args){ return decodeURIComponent(atob(args[0])); },
              "data.encode": function(args){ return btoa(encodeURIComponent(args[0])); }
          },
          help: {
              main: "<h2>Справка BCSH</h2><b><i>cmdlist</i></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Список команд<br><b><i>help &lt;команда&gt;</i></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Описание команды<br><b><i>help about_syntax</i></b>&nbsp;&nbsp;&nbsp;&nbsp;Синтаксис<br><b><i>help about_variables</i></b>&nbsp;Переменные<br><b><i>help about_scripts</i></b>&nbsp;&nbsp;&nbsp;Скрипты",

              about_syntax: "<h2>Синтаксис оболочки BCSH</h2><h3>Общий синтаксис</h3>Команды в BCSH состоят из, собственно, команды и параметров (аргументов), перечисленных через запятую:<br><b><i>команда параметр1, параметр2, ...</i></b><br>Если в тексте параметра содержатся пробелы и/или запятые, то его нужно заключать в одинарные или двойные кавычки:<br><b><i>команда 'параметр 1', \"параметр, 2\", ...</i></b><br><h3>Операторы</h3>В BCSH есть следующие операторы: ;, &, @{}, $ и \`.<br><br>Оператор ; используется для выполнения сразу нескольких команд: <br><b><i>команда1 &lt;параметры&gt; ;  команда2 &lt;параметры&gt; ;  команда3 &lt;параметры&gt; ; ...</i></b><br><br>Оператор & используется, чтобы передать команде результат выполнения другой команды:<br><b><i>команда1 '&команда2 &lt;параметры второй команды&gt;', ...</i></b><br><br>Оператор @{} используется для вставки математических выражений и значений переменных в текст параметра: <br><b><i>команда '@{someVar}', ...</i></b><br><b><i>команда '@{2+3}', ...</i></b><br><b><i>команда '@{var1 + 5 * (var2 - 9)}', ...</i></b><br>Чтобы узнать подробнее о переменных, введите <b><i>help about_variables</i></b>.<br><br>Оператор $ используется для вставки спец.символа в строку. Допустимые символы: <br><b><i>$Q1</i></b> = '<br><b><i>$Q2</i></b> = \"<br><b><i>$Q3</i></b> = \`<br><b><i>$SP</i></b> = пробел<br><b><i>$CM</i></b> = ,<br><b><i>$AT</i></b> = @<br><b><i>$AM</i></b> = &<br><br>Оператор \` используется для блоков кода. Блоки кода нужны в командах, выполняющих другие команды (if, loop и пр.).<br><b><i>команда1 \`команда2 ; команда3\`, ...</i></b><br><br>Также BCSH игнорирует все лишние пробелы до и после команды: <br><b><i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;команда &lt;параметры&gt;&nbsp;&nbsp;</i></b><br>",

              about_variables: "<h2>Переменные</h2>Переменные задаются с помощью команды set: <br><b><i>set &lt;имя переменной&gt;, &lt;значение переменной&gt;</i></b><br>Вставить значение переменной в параметр команды можно с помощью оператора @{}: <br><b><i>команда '@{<имя переменной>}', ...</i></b><br>",

              about_scripts: "<h1>Скрипты</h2>Скрипты BCSH - это текстовые файлы, содержащие набор команд: <br><b><i>&nbsp;&nbsp;&nbsp;команда1 &lt;параметры&gt;<br>&nbsp;&nbsp;&nbsp;команда2 &lt;параметры&gt;<br>&nbsp;&nbsp;&nbsp;команда3 &lt;параметры&gt;<br>&nbsp;&nbsp;&nbsp;...</i></b><br><br>Также в скриптах можно создавать многострочные блоки кода, используя пробел и точку с запятой после каждой строки:<br><b><i>&nbsp;&nbsp;&nbsp;...<br>&nbsp;&nbsp;&nbsp;команда \` ;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;команда1 &lt;параметры&gt; ;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;команда2 &lt;параметры&gt; ;<br>&nbsp;&nbsp;&nbsp;\`<br>&nbsp;&nbsp;&nbsp;...</i></b><br>",
              
              cmdlist: "<h1>cmdlist</h1>Возвращает список всех доступных команд."
          },
          functions: {},
          variables: {},
          version: "BCSH v4.3",
          ver: 4.3,
          exec: function(cmdto){
                cmdto = cmdto.toString();
                if(!cmdto || cmdto.trim() == "") return "";

                if(cmdto.match(/[^\\]; /)){
                    cmdto = cmdto.split(/[^\\]; /);
                    var r = "";
                    for(var i in cmdto){
                        r += bcsh.exec(cmdto[i].trim());
                    }
                    return r;
                }
                cmdto = cmdto.replaceAll("\\;", ";");
                cmdto = cmdto.trim();

                var ret = null;
                var parsing = true;

                cmdto = cmdto.split("");
                var cmdt = cmdto, str = false, qt = null, estr = false;
                for(var i in cmdto){
                    var ch = cmdto[i];
                    if(ch == "`"){
                        qt = ch;
                        if(qt && qt == ch){
                            estr = !estr;
                            ch = "";
                        }
                    }else if(ch == "'" || ch == '"'){
                        if(!qt) qt = ch;
                        if(qt && qt == ch){
                            str = !str;
                            ch = "";
                        }
                    }
                    if(str){
                        if(ch == " ") ch = "$SP";
                        if(ch == ",") ch = "$CM";
                    }
                    if(estr){
                        if(ch == " ") ch = "$SP";
                        if(ch == ",") ch = "$CM";
                        if(ch == "@") ch = "$AT";
                        if(ch == "&") ch = "$AM";
                    }
                    cmdt[i] = ch;
                }
                cmdt = cmdt.join("").replaceAll(",", "");

                var pa = cmdt.split(" ");
                var cmda, cmdap, cmd;
                if(pa.length == 1){
                    cmd = pa[0];
                    pa = [];
                }else{
                    cmd = pa[0];
                    pa.shift();
                }

                if(!(cmd in this.commands)) return 'Команда "'+cmd+'" не найдена.';

                var found = false;

                    for(var i in pa){
                        var o = pa, e = o[i];
                        if(o[i] && typeof o[i] == "object") o[i] = JSON.stringify(o[i]);

                        o[i] = o[i].toString().replaceAll("$SP", " ");
                        o[i] = o[i].toString().replaceAll("$CM", ",");
                        o[i] = o[i].toString().replaceAll("$Q1", "'");
                        o[i] = o[i].toString().replaceAll("$Q2", '"');
                        o[i] = o[i].toString().replaceAll("$Q3", "`");
                        
                        if(o[i].toString().match(/@{.+}/)){
                            try{
                                o[i] = o[i].toString().replace(/@{([^}]+)}/g, function(p1){
                                    var c = p1.replaceAll('@{','').replaceAll('}','');
                                    if(bcsh.variables[c]) c = "bcsh.variables."+c;
                                    else{
                                        var o = c.split(" ");
                                        for(var i in o){
                                            var e = o[i];
                                            if(bcsh.variables[e]) o[i] = "bcsh.variables."+e;
                                        }
                                        c = o.join(" ");
                                    }
                                    return eval(c);
                                });
                            }catch(e){ 
                                ret = e; 
                            }
                        }

                        if(o[i].toString().match(/^&/)){
                            o[i] = bcsh.exec(o[i].toString().replace("&", ""));
                        }

                        o[i] = o[i].toString().replaceAll("$AT", "@");
                        o[i] = o[i].toString().replaceAll("$AM", "&");

                        if(!isNaN(o[i].toString()) && o[i].toString().length > 0) o[i] = +o[i];
                    }

                for(var i in this.commands){
                    if(cmd == i){
                        found = true;
                        try{
                            ret = this.commands[i](pa);
                        }catch(e){
                            ret = e.message;
                        }
                        break;
                    }
                }
                if(ret && typeof ret == "object") ret = JSON.stringify(ret);
                return ((ret || ret === 0)?ret:"");
          },
          execScript: function(code){
              code = code.replaceAll(";\n", "\\; ");
              code = code.split("\n");
              for(var i in code){
                  if(code[i].charAt(0) == "#" || code[i] == "") continue;
                  bcsh.exec(code[i]);
              }
          }
}

var args = WScript.Arguments.Unnamed;

switch(args(0)){
    case "-f": {
        var f = fso.OpenTextFile(args(1), 1);
        WScript.StdOut.Write(bcsh.execScript(f.ReadAll()));
        f.Close();
        break;
    }
    case "-c": {
        WScript.StdOut.Write(bcsh.exec(args(1)));
        break;
    }
    case "-s": {
        var cmd = "";
        while(true){
            WScript.StdOut.Write("> ");
            cmd = ""+WScript.StdIn.ReadLine();
            if(cmd == "exit") WScript.Quit();
            WScript.StdOut.WriteLine(bcsh.exec(cmd));
        }
    }
    case "-h": {
        WScript.StdOut.Write(
"bcsh [-v] [-h] [-s] [-f <скрипт>] [-c <команда>]\r\n\
        -v              Вывести версию BCSH\r\n\
        -h              Вывести справочное сообщение\r\n\
        -s              Открыть интерактивную оболочку\r\n\
        -f <скрипт>     Запустить скрипт\r\n\
        -с <команда>    Выполнить команду");
        break;
    }
    case "-v": {
        WScript.StdOut.Write(bcsh.version);
        break;
    }
    default: {
        WScript.StdOut.Write("Некорректный синтаксис. Введите \"bcsh -h\" для справки.");
    }
}