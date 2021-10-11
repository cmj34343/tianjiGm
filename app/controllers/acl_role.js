/*
 * @Author: hsq
 * @Date: 2021-03-15 23:25:44
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-29 21:37:45
 * @Description: file content
 */
var waterline = require('../../config/waterline');
var ObjectID = require('mongodb').ObjectID;


module.exports = {
    //增加
    save: function(item, next){
        console.log("item:",item);
        waterline.models.acl_wftable
            .create(item, next);
    },
    //修改
    update:function(param, next){
        // console.log(">> param:",param);
        waterline.models.acl_wftable
            .update({id:param.id},param)
            .exec(next);
    },

    //删除
    delete:function(param, next, ){
        var self = this;
        // console.log(">> param:",param);
        if (Array.isArray(param)) {
            // console.log(">> 111");
            if (param.length == 1) {
                waterline.models.acl_wftable
                    .destroy({ id: param[0].id })
                    .exec(next);
            } else {
                var pop = param.pop();
                waterline.models.acl_wftable
                .destroy({ id: pop.id })
                .exec(function() {
                    self.delete(param,next);
                });
            }
            
            // for (var i = 0; i < param.length; i++) {
            //     console.log(">> i:",i);
            //     console.log(">> id:",param[i].id);
            //     if(i == param.length - 1) {
            //         waterline.models.acl_wftable
            //         .destroy({ id: param[i].id })
            //         .exec(next);
            //     } else {
            //         waterline.models.acl_wftable
            //         .destroy({ id: param[i].id });
            //     }
                
            // }
        } else {
            console.log(">> 222");
            // data = { id: param.id };
            waterline.models.acl_wftable
            .destroy({ id: param.id })
            .exec(next);
        }
        // waterline.models.acl_wftable
        //     .destroy(data)
        //     .exec(next);
    },


    getOne:function( param, next){
        // console.log("param:",param);
        waterline.models.acl_wftable
            .findOne(param)
            .exec(next);
    },

    //查询全部新闻
    getList: function( param, next){
        console.log("param:",param);
        waterline.models.acl_wftable
            .find(param)
            .exec(next);
    },


    //查询数量
    count:function(param,next){

        waterline.models.acl_wftable
            .count(param)
            .exec(next);
    }
};