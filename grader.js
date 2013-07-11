#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest= require('restler');
var urlFile ='urlfile.html';
var jsonFile='out.json';

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) 
{
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url>', 'Path to url')  //this works well no errors yet
        .parse(process.argv);
		//console.log("\nprocess.argv = " + process.argv);
		//console.log("\nprogram.url = " + program.url);
		
		//alot of help got from here https://class.coursera.org/startup-001/forum/thread?thread_id=3860
		if (program.url != null) { 
				//var urlAsString = urltoString(program.url); // Question 1
				//console.log("\nInside IF - program.url = " + program.url);
					rest.get(program.url).on('complete', function(result) {
							if (result instanceof Error) {										//***PointA
								sys.puts('Error: ' + result.message);
								this.retry(5000); // try again after 5 sec
							} else {
								fs.writeFileSync(urlFile, result); // Question 2
								var checkJson = checkHtmlFile(urlFile, program.checks); // Question 3
								var outJson = JSON.stringify(checkJson, null, 4);
								console.log(outJson);					
								//next 2 lines optional		
								//fs.writeFileSync(jsonFile, outJson);							//***PointB
								//console.log("\nScript:\n" + __filename + "\nWrote:\n" + outJson + "\nTo: \n" + jsonFile);
							}
					});
		} else {
												
			//console.log("\nInside IF - program.file = " + program.file);			
			var checkJson = checkHtmlFile(program.file, program.checks);
			var outJson = JSON.stringify(checkJson, null, 4);
			console.log(outJson);
			//next 2 lines optional
			//fs.writeFileSync(jsonFile, outJson);
			//console.log("\nScript:\n" + __filename + "\nWrote:\n" + outJson + "\nTo: \n" + jsonFile);
		}
			
} else 
{
    exports.checkHtmlFile = checkHtmlFile;
}

