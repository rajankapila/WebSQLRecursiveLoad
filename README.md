#WebSQLRecursiveLoad

WebSQLRecursiveLoad allows you easily load many associated tables in 1 to 1 relationship to an initial array returned from a select query.


Usage:

```
var database = new Database();
var recursiveLoadObject = new WebSQLRecursiveLoad();


database.createDatabase("test", "1", "Test", 50);


databse.getAll("user", "", [], "", "", function(data) {
    recursiveLoadObject.loadSubData(data, ['user_id', 'user_id'], ['user_profile', 'user_address], "", function(data) {
        //fully loaded data here
    
    }, null);
});
```