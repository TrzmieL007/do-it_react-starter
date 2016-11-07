/**
 * Created by trzmiel007 on 25/08/16.
 */

var mysql = require('mysql');

module.exports = function(config, logger, params){
    Object.assign(config,params);
    var pool = mysql.createPool(config);
    pool.on('enqueue', function(){
        logger.debug('MySQL is waiting for available connection slot. If that happens often, maybe it is time to increase connectionLimit for the pool?');
    });

    /**
     * 0 - success,
     * 1 - unknown error,
     * 2 - sql error while quering,
     * 3 - other sql error,
     * 4 - invalid params
     */
    return {
        getConnectionPool : function(){ return pool; },
        getConnection : function(){
            return mysql.createConnection(config);
        },
        // prepareQuery : mysql.format,
        // escape : mysql.escape,
        mysql : mysql,
        insert : function(params){
            return new Promise(function(resolve,reject){
                if(typeof params.data !== 'object') return reject({code: 4, message: "No data or data not as object"});
                if(typeof params.table !== 'string') return reject({code: 4, message: "No table specified"});
                var values = Object.keys(params.data).map(function(key){ return params.data[key]; });
                var query = mysql.format(
                    'INSERT INTO ?? (??) VALUES (?)',
                    [params.table,Object.keys(params.data),values]
                );
                logger.mySQLlogger.info(query+(params.executor?'\t { executor : '+JSON.stringify(params.executor)+' }':''));
                pool.getConnection(function(conError,connection) {
                    if(conError){
                        logger.mySQLlogger.error(conError);
                        return reject({code: 1, message: "Error while getting connection from pool", error: conError});
                    }
                    connection.query(query, function (error, result) {
                            if(error){
                                logger.mySQLlogger.error(error);
                                return reject({code: 2, message: "Error executing query: " + query, error: error});
                            }
                            return resolve(result.insertId);
                        }
                    );
                });
            });
        },
        get : function(params){
            return new Promise(function(resolve,reject){
                if(typeof params.table !== 'string') return reject({code: 4, message: "No table specified"});
                var skeleton = 'SELECT ?? FROM ?? WHERE ?'
                    + (params.orderBy ? (' ORDER BY ?? ' + params.DESC ? 'DESC' : 'ASC') : '');
                var query = mysql.format(
                    skeleton,
                    [params.fields || '*',params.table,params.where || '1', params.orderBy]
                );
                logger.mySQLlogger.info(query+(params.executor?'\t { executor : '+JSON.stringify(params.executor)+' }':''));
                pool.getConnection(function(conError,connection){
                    if(conError){
                        logger.mySQLlogger.error(conError);
                        return reject({code: 1, message: "Error while getting connection from pool", error: conError});
                    }
                    connection.query(query, function(error,result,fields){
                            connection.release();
                            if(error){
                                logger.mySQLlogger.error(error);
                                return reject({code: 2, message: "Error executing query: " + query, error: error});
                            }
                            if(params.details)
                                result = { result : result, fields : fields };
                            return resolve(result);
                        }
                    );
                });
            });
        },
        update : function(params){
            return new Promise(function(resolve,reject){
                if(typeof params.data !== 'object') return reject({code: 4, message: "No data or data not as object"});
                if(typeof params.table !== 'string') return reject({code: 4, message: "No table specified"});
                if(!params.where) return reject({code: 4, message: "No WHERE object or string specified" });
                var query = mysql.format(
                    'UPDATE ?? SET ? WHERE ?',
                    [params.table, params.data, params.where]
                );
                logger.mySQLlogger.info(query+(params.executor?'\t { executor : '+JSON.stringify(params.executor)+' }':''));
                pool.getConnection(function(conError,connection) {
                    if(conError){
                        logger.mySQLlogger.error(conError);
                        return reject({code: 1, message: "Error while getting connection from pool", error: conError});
                    }
                    connection.query(query, function (error, result) {
                            if(error){
                                logger.mySQLlogger.error(error);
                                return reject({code: 2, message: "Error executing query: " + query, error: error});
                            }
                            return resolve(result.changedRows);
                        }
                    );
                });
            });
        },
        delete : function(params){
            return new Promise(function(resolve,reject){
                if(typeof params.table !== 'string') return reject({code: 4, message: "No table specified"});
                if(!params.where) return reject({code: 4, message: "No WHERE object or string specified"});
                var query = mysql.format(
                    'DELETE FROM ?? WHERE ?',
                    [params.table, params.where]
                );
                logger.mySQLlogger.info(query+(params.executor?'\t { executor : '+JSON.stringify(params.executor)+' }':''));
                pool.getConnection(function(conError,connection) {
                    if(conError){
                        logger.mySQLlogger.error(conError);
                        return reject({code: 1, message: "Error while getting connection from pool", error: conError});
                    }
                    connection.query(query, function (error, result) {
                            if(error){
                                logger.mySQLlogger.error(error);
                                return reject({code: 2, message: "Error executing query: " + query, error: error});
                            }
                            return resolve(result.affectedRows);
                        }
                    );
                });
            });
        }
    };
};