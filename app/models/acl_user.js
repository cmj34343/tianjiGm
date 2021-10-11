/*
 * @Author: hsq
 * @Date: 2021-03-15 23:25:44
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-18 21:02:18
 * @Description: file content
 */
//新闻表
var Waterline = require('waterline');
var uuid = require('node-uuid');

module.exports = Waterline.Collection.extend({
    //identity: 'tb_user',
    tableName:'acl_user',
    connection: 'localMongo',
    schema: true,
    attributes: {
        id:{
            type:'string',
            primaryKey: true,
            defaultsTo: function() {
                return uuid.v4();
            }
        },
        name: {
            type:'string',
            columnName: 'name'
        },
        account: {
            type:'string',
            columnName: 'account'
        },
        password: {
            type:'string',
            columnName: 'password'
        },
        email: {
            type:'string',
            columnName: 'email'
        },
        phone: {
            type:'string',
            columnName: 'phone'
        },
        jurisdiction: {
            type:'string',
            columnName: 'jurisdiction'
        },
        jurisdiction_type: {
            type:'string',
            columnName: 'jurisdiction_type'
        }
        
    },

});

