/*
 * @Author: hsq
 * @Date: 2021-03-15 23:25:44
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-28 23:37:36
 * @Description: file content
 */
//新闻表
var Waterline = require('waterline');
var uuid = require('node-uuid');
var tool = require("../tool/tool");

module.exports = Waterline.Collection.extend({
    //identity: 'tb_user',
    tableName:'acl_wftable',
    connection: 'localMongo',
    schema: true,
    attributes: {
        id:{
            type:'string',
            primaryKey: true,
            unique: true,
            defaultsTo: function() {
                return uuid.v4();
            }
        },
        orderId: {
            type:'string',
            unique: true,
            defaultsTo: function() {
                return tool.orderCode();
            }
        },
        huzhuName: {
            type:'string',
        },
        idCard: {
            type:'string',
        },
        phone: {
            type:'string',
        },
        jiedao: {
            type:'string',
        },
        shequ: {
            type:'string',
        },
        xiangxidizhi: {
            type:'string',
        },
        longitude: {
            type:'string',
        },
        latitude: {
            type:'string',
        },
        buildyear: {
            type:'string',
        },
        jianzhugn: {
            type:'string',
        },
        jiegoulx: {
            type:'string',
        },
        jianzhumj: {
            type:'string',
        },
        cengnum: {
            type:'string',
        },
        jianzhugao: {
            type:'string',
        },
        qizhufs: {
            type:'string',
        },
        jichuqk: {
            type:'string',
        },
        wfzhoubian: {
            type:'string',
        },
        tudixz: {
            type:'string',
        },
        jiegoucg: {
            type:'string',
        },
        jiacenggz: {
            type:'string',
        },
        xiushanjg: {
            type:'string',
        },
        lishizh: {
            type:'string',
        },
        jianced: {
            type:'string',
        },
        jiancep: {
            type:'string',
        },
        pingjiadj: {
            type:'string',
        },
        chulijy: {
            type:'string',
        },
        shenhep: {
            type:'string',
        },
        shenhed: {
            type:'string',
        },
        state: {
            type:'string',
        },
        from: {
            type:'string',
        },
        anquznzs: {
            type:'string',
        },
        imgFiles: {
            type:'json',
        },
    },

});

