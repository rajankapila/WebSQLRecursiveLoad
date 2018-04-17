/*
This object can be used to recursively load data from websql from multiple tables that are related to another table.
Example: a user can have a profile, addresses, and any other related tables.

 */


function WebSQLRecursiveLoad(database) {
    this.checkSubData = {};
    this.looped = 0;
    this.originalData = null;
    this.database = database;

    /*
        @params data - data set
        @params primaryKeys - keys used select from tables
        @params tables - tables to select from
        @param _this - set as null
        @param callback - function that is called to return data
     */
    function loadSubData(data, primaryKeys, tables, _this, callback) {
        if (!_this) {
            _this = this;
        }

        //original call to function
        if (primaryKeys != null && tables != null) {
            _this.originalData = data;
            _this.checkSubData = {};
            _this.subDataCounter = 0;
        }
        if (primaryKeys != null && tables != null) {

            if (data && data.length > 0) {
                // loop through tables
                for (var i in tables) {
                    for (var x in data) {
                        if (!_this.checkSubData[_this.subDataCounter]) {
                            _this.checkSubData[_this.subDataCounter] = {};
                        }
                        // keeping track of the tables we have looped through and indicated they are not loaded yet.
                        _this.checkSubData[_this.subDataCounter][tables[i]] = -1;
                        // call to load subdata
                        _this._loadSubData(_this, data[x], primaryKeys[i], tables[i], _this.subDataCounter, callback, _this.loadSubData);
                        _this.subDataCounter++;
                    }
                }
                // recursive call to this function to check if we are done loading yet.
                setTimeout(function () {
                    _this.loadSubData(_this.originalData, null, null, null, callback, _this);
                }, 100);

            }
        } else {
            // recursive call so we have to check if we are done yet.
            var check = true;
            // check if we have looped through all the data
            if (_this.subDataCounter < _this.originalData.length) {
                check = false;
            }
            if(check) {
                // check if we have loaded all data
                for (var x in _this.checkSubData) {
                    for (var i in _this.checkSubData[x]) {
                        // found data not loaded yet.
                        if (_this.checkSubData[x][i] == -1) {
                            check = false;
                        }
                    }
                }
            }
            // if all data is loaded lets reset variables and call callback
            if (check) {
                _this.looped = 0;
                _this.checkSubData = {};
                _this.subDataCounter = 0;
                callback(_this.originalData);
                _this.originalData = null;
                return;
            } else {
                // loading not done yet, so call this function again
                setTimeout(function () {
                    _this.loadSubData(_this.originalData, null, null, 1, callback, _this);
                }, 100);
            }
        }
    }


    function _loadSubData (_this, data, key, model, count, originalCallback, callback) {

        var where = _this.primaryKey + "=" + data[_this.primaryKey];
        this.database.getAll({"where": where}, function (d) {
            data[key] = d;

            console.log(_this.checkSubData);
            console.log(count + "-" + model);

            _this.checkSubData[count][model] = 1;

        });
    }
}