/*
 This object interacts with websql in browsers that support it such as Chrome.

 */

function Database() {
    var _this = this;
    this.currentDatabase = null;

    function createDatabase(shortName, version, displayName, size) {
        try {
            if (!window.openDatabase) {
                alert('Databases are not supported in this browser.');
            } else {


                size = app.utilities.SQL.getDatabaseSize(size);
                console.log("Database Name:");
                console.log(shortName + "-" + version + "-" + displayName + "-" + size);
                this.currentDatabase = openDatabase(shortName, version, displayName, size);

            }
        } catch (e) {

            if (e == 2) {
                // Version number mismatch.
                console.log("Invalid database version.");
            } else {
                console.log("Unknown error " + e + ".");
            }
            return;
        }
    }

    function createTable(name, columns, callback) {
        var sql = "CREATE TABLE IF NOT EXISTS " + name + "(";


        var columnSQL = [];
        for (var x in columns) {
            columnSQL.push(x + " " + columns[x]);
        }
        sql += columnSQL.join(", ");
        sql += ");";
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, [], function () {
                    _this.currentDatabase.transaction(
                        function (transaction) {
                            // lets check for any missing columns
                            for (var i in columns) {
                                sql = "ALTER TABLE " + name + " ADD COLUMN " + i + " " + columns[i] + ";";
                                console.log(sql);
                                transaction.executeSql(sql, [], function (tx, results) {

                                    },
                                    function (transaction, error) {
                                        console.log(error);
                                        //alert("Error : " + error.message + " in " + sql);
                                    });
                            }

                        });


                });
            });
    }

    function querySelect(sql, values, callback) {
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, values, function (tx, results) {
                        var len = results.rows.length, i;
                        var data = [];
                        for (i = 0; i < len; i++) {
                            data.push(results.rows.item(i));

                        }
                        if (callback) {
                            console.log(data);
                            callback(data);
                        }
                    },
                    function (transaction, error) {
                        console.log(error);
                        alert("Error : " + error.message + " in " + sql);
                    });
            }
        );
    }

    function insert(table, values, callback) {
        var sql = "INSERT INTO `" + table + "` (";
        var columns = [];
        var vals = [];
        var placeHolders = [];
        values['date_created'] = Date.now();
        if (!values['date_updated']) {
            values['date_updated'] = Date.now();
        }
        values['user_id'] = app.utilities.Security.getUserId();
        for (var x in values) {
            columns.push(x);
        }
        sql += columns.join(", ");
        sql += ")";
        sql += " values (";

        for (var x in values) {
            vals.push(values[x]);
            placeHolders.push("?");
        }
        sql += placeHolders.join(", ");
        sql += ")";
        console.log(sql);
        console.log(vals);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, vals, function (tx, sql_res) {
                        console.log(tx);
                        console.log(sql_res);
                        var id = sql_res.insertId;
                        console.log("insert id=" + id);
                        if (callback) {
                            callback(id);
                        }
                    },
                    function (transaction, error) {
                        alert("Error : " + error.message + " in " + sql);
                    }
                );
            }
        );
    }

    function update(table, key, id, values, callback) {
        var sql = "UPDATE " + table + " set ";
        var columns = [];
        var vals = [];
        var placeHolders = [];
        if (!values['date_updated']) {
            values['date_updated'] = Date.now();
        }
        for (var x in values) {
            columns.push(x + " = ?");
            vals.push(values[x]);
        }
        sql += columns.join(", ");
        sql += " WHERE " + key + "=" + id;
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, vals, function (tx, sql_res) {


                        if (callback) {
                            callback(id);
                        }
                    },
                    function (transaction, error) {
                        alert("Error : " + error.message + " in " + sql);
                    });
            }
        );
    }

    function deleteRecord(table, key, id, callback) {
        var sql = "DELETE FROM `" + table;
        sql += "` WHERE " + key + "= ?";
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, [id], callback);
            }
        );
    }

    function deleteCustom(table, where, values, callback, id) {

        var sql = "DELETE FROM `" + table + "` ";
        if (where) {
            sql += " WHERE " + where;
        }
        // console.log(sql);
        // console.log(values);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, values, function (tx, results) {
                    if (callback) {
                        callback(id);
                    }
                });
            },
            function (transaction, error) {
                //  alert("Error : " + error + " in " + sql);
            }
        );
    }

    function getOne(table, key, id, callback) {
        var sql = "SELECT * FROM `" + table + "` ";
        sql += " WHERE " + key + "= ?";
        sql += " LIMIT 1 ";
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, [id], function (tx, results) {
                    var len = results.rows.length, i;
                    var data = null;
                    if (len > 0) {
                        for (i = 0; i < len; i++) {
                            data = results.rows.item(i);
                        }
                    }
                    if (callback) {
                        console.log(data);
                        callback(data);
                    }
                });
            },
            function (transaction, error) {
                alert("Error : " + error.message + " in " + sql);
            }
        );
    }

    function getAll(table, where, values, orderBy, limit, callback) {
        var sql = "SELECT * FROM `" + table + "` ";
        if (where) {
            sql += " WHERE " + where;
        }
        if (orderBy) {
            sql += " ORDER BY " + orderBy + " ";
        }

        if (limit) {
            sql += " LIMIT " + limit + " ";
        }


        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, values, function (tx, results) {
                    var len = results.rows.length, i;
                    var data = null;
                    if (len > 0) {
                        data = [];
                        for (i = 0; i < len; i++) {
                            data.push(results.rows.item(i));

                        }
                    }
                    if (callback) {
                        console.log(data);
                        callback(data);
                    }
                });
            },
            function (transaction, error) {
                alert("Error : " + error.message + " in " + sql);
            }
        );
    }

    function getDatabaseSize(size) {
        return (size * 1024 * 1024);
    }

    function truncateTable(table, callback) {
        var sql = "DELETE FROM `" + table + "`";
        console.log(sql);
        this.currentDatabase.transaction(
            function (transaction) {
                transaction.executeSql(sql, [], function () {
                    sql = "DELETE FROM SQLITE_SEQUENCE WHERE NAME = '" + table + "'";
                    app.utilities.SQL.currentDatabase.transaction(
                        function (transaction) {
                            transaction.executeSql(sql, [], callback)
                        });


                });
            }
        );

    }

}