/**
 * Created by wuwy on 2016/2/17.
 */
var express = require('express');
var router = express.Router();
var async = require('async');
var userController = require('../controllers/acl_user');
var resourceController = require('../controllers/acl_resource');
var util = require('../../config/public.js');
var tool = require('../tool/tool.js');



router.post('/login', function(req,res){
    try{
        var arg = req.body;
        async.auto({
            login:function(cb){
                userController.getOne(arg,function(err,data){
                    if(data){  //存在
                        req.session.curUserId = data.id;
                        req.session.curUser = data;
                        cb({
                            code:200,
                            msg:"登录成功",
                            // result:data
                        });
                    }else{
                        cb(null);
                    }
                });
            },
            hasAccount:["login",function(data,cb){
                userController.getOne({account:arg.account},function(err,data){
                    if(data){  //存在
                        cb({
                            code:400,
                            msg:"密码错误"
                        });
                    }else{
                        cb({
                            code:400,
                            msg:"账号不存在"
                        });
                    }
                });
            }]
        },function(err,data){
            //console.log("login:",err,data);
            res.send(err);

        });
    }catch(err){
        res.end(err.stack);
    }

});

router.post('/islogin', function(req,res){
    try{
        var sid = req.sessionID;
        console.log("islogin sid:",sid);
        console.log("islogin curUserId1:",req.session.curUserId);
        console.log("islogin curUserId2:",typeof(req.session.curUserId));
        if(typeof(req.session.curUserId)  != "undefined"){ 
            res.send({
                code:"200",
                msg:"已登录！",
                // result: data.list,
                // count:data.count
            });
            
        } else {
            res.send({
                code:"401",
                msg:"未登录!",
            });
        }
    }catch(err){
        res.end(err.stack);
    }

});

router.post('/get_self_role', function(req,res){
    try{
        var sid = req.sessionID;
        if(typeof(req.session.curUserId)  != "undefined"){ 
            async.auto({
                getOne:function(cb){
                    userController.getOne({id:req.session.curUserId},function(err,data){
                        if(data){  
                            res.send({
                                code:"200",
                                msg:"获取成功",
                                result:{type:data["jurisdiction_type"]}
                            });
                            
                        }else{
                            res.send({
                                code:"400",
                                msg:"账号不存在",
                            });
                        }
                    });
                }
                // hasAccount:["login",function(data,cb){
                //     userController.getOne({account:arg.account},function(err,data){
                //         if(data){  //存在
                //             cb({
                //                 code:400,
                //                 msg:"密码错误"
                //             });
                //         }else{
                //             cb({
                //                  code:400,
                //                 msg:"账号不存在"
                //             });
                //         }
                //     });
                // }]
            },function(err,data){
                //console.log("login:",err,data);
                res.send({
                    code:"401",
                    msg:err,
                });
    
            });
            
        } else {
            res.send({
                code:"401",
                msg:"未登录!",
            });
        }
    }catch(err){
        res.end(err.stack);
    }

});


router.post('/logout', function(req,res){
    try{
        var sid = req.sessionID;
        console.log("logout sid:",sid)
        delete req.session.curUserId;
        delete req.session.curUser;
        delete req.session.curUserPerms;
        console.log("logout curUserId:",req.session.curUserId)
        // delete req.sessionID;

        // delete req.sessionID;
        res.send({
            code:200,
            msg:"退出成功！"
        });

    }catch(err){
        res.end(err.stack);
    }

});

function disposeGetParam(object) {
    object["jurisdiction_type"] = tool.getJurisdictionTypeByName(object["jurisdiction"]);
    return object;
}

// function disposePushParam(object) {
//     object["jurisdiction_type"] = tool.getJurisdictionNameByType(object["jurisdiction"]);
//     return object;
// }

//增加一条
router.post('/add', function(req,res){
    try{
        var arg = req.body;
        if (tool.keysIsNull(arg,["name","account","password","jurisdiction"])) {
            res.send({
                code:"202",
                msg:"参数不正确！",
            });
            return;
        }
        arg = disposeGetParam(arg);

         
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            info:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.GM,"w")) {
                    userController.getOne({account:arg.account},cb);

                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
                

            }],
            save:["info",function(result,cb){
                // console.log(req.body);
                if (result.info) {
                    res.send({
                        code:"201",
                        msg:"账号已存在！",
                    });
                    return;
                } else {
                    userController.save(arg,cb);
                }
                
            }]
        },function(err,data){
            res.send({
                code:"200",
                msg:"创建成功！",
                result:data.save
            });
        });
    }catch(err){
        res.end(err.stack);
    }

});

//修改信息
router.post('/update',function(req,res){
    try{

        var arg = req.body;
        if (tool.keysIsNull(arg,["name","account","password"])) {
            res.send({
                code:"202",
                msg:"参数不正确！",
            });
            return;
        }
        arg = disposeGetParam(arg);
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            info:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.GM,"w")) {
                    userController.getOne({account:arg.account},cb);
                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
            }],
            save:["info",function(result,cb){
                // console.log(req.body);
                if (result.info) {
                    userController.update(arg,cb);
                    return;
                } else {
                    res.send({
                        code:"201",
                        msg:"账号不存在！",
                    });
                    return;
                }
                
            }]
        },function(err,data){
            res.send({
                code:"200",
                msg:"更新成功！",
                result:data.save
            });
        });

    }catch(err){
        res.end(err.stack);
    }
});
// router.post('/update',function(req,res){
//     try{
//         async.auto({
//             formParse:function(cb){
//                 util.formParse(req,cb);
//             },
//             update:["formParse",function(result,cb){
//                 userController.update(result.formParse,cb);
//             }]
//         },function(err,data){
//             res.send({
//                 code:"200",
//                 msg:"修改成功！",
//                 result:data.update
//             });
//         });

//     }catch(err){
//         res.end(err.stack);
//     }
// });

//根据id查询一条
router.post('/getOne',function(req,res){
    var param = req.body;
    try{
        async.auto({
            info:function(cb){
                userController.getOne(param,cb);
            },
            allowedPermissions:function(cb){
                userController.allowedPermissions(param,cb);
            },
        } ,function(err,data){
            res.send({
                code:"200",
                msg:"获取详情成功",
                result:{
                    info:data.info,
                    permissions:data.allowedPermissions
                }
            });
        });
    }catch(err){
        res.end(err.stack);
    }
});

//用户列表
router.post('/getList',function(req,res){
    var param = req.body;
    try{
        async.auto({
            list:function(cb){
                userController.getList(param,cb);
            },
            count:function(cb){
                userController.count(param,cb);
            },
        } ,function(err,data){
            res.send({
                code:"200",
                msg:"获取详情成功",
                data: data.list,
                count:data.count
            });
        });
    }catch(err){
        res.end({code:"201",error:err.stack});
    }
});
//用户列表
router.get('/getList',function(req,res){
    
    var param = req.query;
    console.log("getList",param);
    // console.log("req",req);
    var choose = param["param"] || {};
    var page = param["page"] || 1;
    var limit = param["limit"] || 10;
    page = Number(page);
    limit = Number(limit);
    if (choose["account"]  == "") {
        choose = {};
    }

    try{
        async.auto({
            list:function(cb){
                userController.getList(choose,cb);
            },
            count:function(cb){
                userController.count(choose,cb);
            },
        } ,function(err,data){
            var pushDate = [];
            var startIdx = (page - 1) * limit;
            if (startIdx > data.list.length) {
                startIdx = 0
            }
            var endIdx = startIdx + limit;
            for (var key in data.list) {
                var idx = Number(key);
                var lineDate = data.list[key];
                lineDate["idx"] = idx+1;
                if (idx >= startIdx && idx < endIdx) {
                    pushDate.push(lineDate);
                }
            }
            res.send({
                code: 0,
                msg:"获取详情成功",
                data: pushDate,
                count:data.count
            });
        });
    }catch(err){
        res.end({code:"201",error:err.stack});
    }
});


//删除
router.post('/delete',function(req,res){
    try{
        var param = req.body;
        console.log("delete param:",param);
        if(param.account == "admin") {
            res.send({
                code:"201",
                msg:"不允许删除此账号！",
            });
        }
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            delete:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.GM,"w")) {
                    userController.delete(param,cb);
                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
            }]
            // userRoles:function(cb){
            //     global.acl.userRoles(param.id,cb)
            // },
            // removeUserRoles:["userRoles",function(data,cb){
            //     console.log("roles:",data.userRoles);
            //     global.acl.removeUserRoles(param.id,data.userRoles,cb)
            // }],
            // removeUser:["removeUserRoles",function(data,cb){
            //     global.acl.removeUser(param.id,cb);
            // }],
        } ,function(err,data){
            res.send({
                code:"200",
                msg:"删除成功！",
                result:data
            });
        });
    }catch(err){
        res.send({
            code:"201",
            msg:"删除失败！",
            result:err.stack
        });
    }

});

router.post('/allowedPermissions',function(req,res){
    var arg = req.body;
    console.log('arg:',arg,arg.userId);
    async.auto({
        permission:function(data,cb) {
            global.acl.allowedPermissions(arg.userId,JSON.parse(arg.resources),cb)
        },
    },function(err,result){
        res.send({
            code:200,
            msg:"成功",
            result:result.permission
        });
    });
});

router.post('/addUserRoles',function(req,res){
    var arg = req.body;
    console.log("arg:",arg,arg.userId,JSON.parse(arg.roles));

    async.auto({
        userRoles:function(cb){
            global.acl.userRoles(arg.userId,cb)
        },
        removeUserRoles:["userRoles",function(data,cb){
            console.log(data.userRoles);
            if(data.userRoles.length>0){
                console.log("remove");
                global.acl.removeUserRoles(arg.userId,data.userRoles,cb)
            }else{
                cb();
            }

        }],
        addUserRoles:["removeUserRoles",function(data,cb){
            global.acl.addUserRoles(arg.userId,JSON.parse(arg.roles),cb)
        }],
    },function(err,data){
        res.send({
            code:"200",
            msg:"创建成功！",
            result:data
        });
    });
});

router.post('/userRoles',function(req,res){
    var arg = req.body;
    console.log('userRoles arg:',arg,arg.userId);
    global.acl.userRoles(arg.userId,function(err,data){
        console.log(err,data);
        res.send({
            code:200,
            msg:"成功",
            result:data
        });
    })
});
module.exports = router;


