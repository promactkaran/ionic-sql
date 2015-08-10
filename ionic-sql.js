
angular.module('ionic-sql', [])

.factory('DataBaseService', function ($cordovaSQLite, $q, $log) {

    var DB = window.sqlitePlugin.openDatabase({name: "myDB.db", location: 1});

    function exeSQL(query) {
        return $cordovaSQLite.execute(DB, query)
    }

    function parseIntoString(obj) {
        var result = "";
        for (var p in obj) {
            if( obj.hasOwnProperty(p) ) {
                result += p + " " + obj[p] +",";
            }
        }
        return result;
    }

    function parseToStringFromArray(array){
        var result ="";
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            result += ""+ obj.toString() +",";
        }
        return result;
    }

    function parseToStringFromArrayAndQuote(array){
        var result = "";
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            result += ""+ "'"+ obj.toString()+ "'" +",";
        }
        return result;
    }

    return {
        createTable: function (tableName, parameters) { //string, array - > array with objects
            var q = $q.defer();
            var string ="";
            if (parameters.constructor != Array)return false;
            for (var i = 0; i < parameters.length; i++) {
                var obj = parameters[i];
                string += "" + parseIntoString(obj);
            }
            var QueryToMake = string.substring(0, string.length - 1);

            var query = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + QueryToMake +')';
            $log.log('---------------------------------------->>>>>>>>>>>>>' + query);
            exeSQL(query).then(function (res) {
                q.resolve(res)
            }, function (err) {
                q.reject(err);
            });
            return q.promise
        },

        //'INSERT OR REPLACE INTO UserTable (id, data) VALUES (1,'
        updateOrInsert: function (tableName, columnsToChange , dataToInsert ) { // string , array , array
            var q = $q.defer();
            var string = parseToStringFromArray(columnsToChange);
            var QueryToMake = string.substring(0, string.length - 1);
            var rawData = parseToStringFromArrayAndQuote(dataToInsert);
            var data = rawData.substring(0, rawData.length - 1);
            var query = 'INSERT OR REPLACE INTO '+tableName+' (' +QueryToMake+') VALUES ('+data+')' ;
            $log.log('query that is important ' + query);
            exeSQL(query).then(function (res) {
                q.resolve(res);
            }, function (err) {
                q.reject(err)
            });
            return q.promise;
        },
        //'select': 'SELECT data FROM UserTable where id =1',
        select: function (tableName, columnToSelect , queryParameters) {  // string, array, object
            var q = $q.defer();
            var columns = parseToStringFromArray(columnToSelect).substring(0, parseToStringFromArray(columnToSelect).length - 1);
            var QueryPara = parseIntoString(queryParameters).substring(0, parseIntoString(queryParameters).length - 1);
            var query = 'SELECT '+ columns + ' FROM ' + tableName +" "+ QueryPara;
            $log.info(  '--------->' + query);
            exeSQL(query).then(function (res) {
                q.resolve(res);
            }, function (err) {
                q.reject(err)
            });
            return q.promise
        },
        //'delete': 'DROP TABLE IF EXISTS Token'
        deleteTable: function (tableName) {
            var q = $q.defer();
            var query = 'DROP TABLE IF EXISTS '+ tableName;
            exeSQL(query).then(function (res) {
                q.resolve(res);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }
    }
})