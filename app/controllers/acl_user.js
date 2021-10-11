/*
 * @Descripttion: 
 * @version: 
 * @Author: hsq
 * @Date: 2021-03-15 10:19:07
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-18 15:45:17
 */
var waterline = require('../../config/waterline');


module.exports = {
    //增加
    save: function(item, next){
        console.log("item:",item);
        waterline.models.acl_user
            .create(item, next);
    },
    //修改
    update:function(param, next){
        console.log("update param:",param);
        waterline.models.acl_user
            .update({account:param.account},param)
            .exec(next);
    },

    //删除
    delete:function(param, next){
        waterline.models.acl_user
            .destroy({ id: param.id })
            .exec(next);
    },


    getOne:function( param, next){
        waterline.models.acl_user
            .findOne(param)
            .exec(next);
    },

    //查询全部新闻
    getList: function( param, next){
        console.log("param:",param);

        waterline.models.acl_user
            .find(param)
            .exec(next);

    },


    //查询数量
    count:function(param,next){

        waterline.models.acl_user
            .count(param)
            .exec(next);
    }
};