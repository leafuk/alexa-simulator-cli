"use strict";
var fs = require('fs')

var FileUtil = (function () {

    function FileUtil() {
        
    }
    
    // StackOverflow code - always the best :-)
    // http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
    FileUtil.copyFile = function (source, target, callback) {
        var cbCalled = false;
        var readStream = fs.createReadStream(source);
        readStream.on("error", function (error) {
            done(error);
        });
        var writeStream = fs.createWriteStream(target);
        writeStream.on("error", function (error) {
            done(error);
        });
        writeStream.on("close", function () {
            done();
        });
        readStream.pipe(writeStream);
        function done(error) {
            if (!cbCalled) {
                if (callback !== undefined && callback !== null) {
                    callback(error);
                }
                cbCalled = true;
            }
        }
    };

    FileUtil.readFile = function (source, callback) {
        fs.readFile(source, null, function (error, data) {
            if (error !== null) {
                callback(null);
            }
            else {
                callback(data);
            }
        });
    };
    return FileUtil;
}());

exports.FileUtil = FileUtil;
