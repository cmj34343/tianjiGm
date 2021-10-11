/**
 * Created by wuwy on 2016/2/17.
 */
var express = require('express');
var router = express.Router();
var async = require('async');
var roleController = require('../controllers/acl_role');
var resourceController = require('../controllers/acl_resource');
var userController = require('../controllers/acl_user');
var util = require('../../config/public.js');
var tool = require('../tool/tool.js');

//增加一条
router.post('/add', function(req,res){
    try{
        var arg = req.body;
        if (tool.keysIsNull(arg,["huzhuName","idCard"])) {
            res.send({
                code:"202",
                msg:"参数不正确！",
            });
            return;
        }

        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            save:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.Register,"w")) {
                    roleController.save(arg,cb);

                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
                

            }]
        },function(err,data){
            res.send({
                code:"200",
                msg:"创建成功！"
            });
        });
    }catch(err){
        res.end(err.stack);
    }

});


var path = require('path');

function disImgFiles (lastDict,mdict,mUserId,orderId) {
    for (var key1 in mdict) {
        var listTemp = mdict[key1];
        for (var key2 in listTemp) {
            var filePath = listTemp[key2];
            if (filePath.indexOf("upload_temp") >= 0) {
                var tagFilePath = "/upload_release/"+mUserId+"/"+orderId+"_"+key1+"_"+(Number(key2)+1)+path.extname(filePath);
                tool.moveFile("./static"+filePath, "./static"+tagFilePath);
                mdict[key1][key2] = tagFilePath;
            }
            if (lastDict && filePath == "" && lastDict[key1] && lastDict[key1][key2] != "") {
                var removeFile = "./static"+lastDict[key1][key2];
                tool.remove(removeFile);
            }

            
            
        }
        
        
    }
    return mdict;
}

function delImgFiles (mdict) {
    for (var key1 in mdict) {
        var listTemp = mdict[key1];
        for (var key2 in listTemp) {
            var filePath = listTemp[key2];
            if (filePath != "") {
                tool.remove("./static"+filePath);
            }
            
        }
        
        
    }
    return mdict;
}


//修改信息
router.post('/update',function(req,res){
    try{

        var arg = req.body;
        if (tool.keysIsNull(arg,["huzhuName","idCard"])) {
            res.send({
                code:"202",
                msg:"参数不正确！",
            });
            return;
        }
        // arg = disposeGetParam(arg);
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            info:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.Register,"w")) {
                    roleController.getOne({orderId:arg.orderId},cb);
                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
            }],
            save:["info",function(result,cb){
                if (result.info) {
                    tool.mkDir("./static/upload_release/"+req.session.curUserId);
                    arg["imgFiles"] = disImgFiles(result.info["imgFiles"],arg["imgFiles"], req.session.curUserId, result.info.id);
                    roleController.update(arg,cb);
                    
                } else {
                    res.send({
                        code:"201",
                        msg:"数据不存在！",
                    });
                    return;
                }
                
            }]
        },function(err,data){
            
            res.send({
                code: "200",
                msg: "更新成功！"
            });
            
        });

    }catch(err){
        res.end(err.stack);
    }
});
// router.post('/update',function(req,res){
//     try{
        
//         var arg = req.body;
//         // console.log("arg",arg);

//         if (tool.keysIsNull(arg,["huzhuName","idCard"])) {
//             res.send({
//                 code:"202",
//                 msg:"参数不正确！",
//             });
//             return;
//         }
        
        
        
//         async.auto({
//             getOne:function(cb){
//                 userController.getOne({id:req.session.curUserId},cb);
//             },
//             info:["getOne",function(result,cb){
//                 if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.GM,"w")) {
//                     roleController.getOne({id:arg.id},cb);
//                 } else {
//                     res.send({
//                         code:"201",
//                         msg:"没有权限！",
//                     });
//                     return;
//                 }
//             }],
//             save:["info",function(result,cb){
//                 // console.log("result",result);
//                 if (result.info) {
//                     roleController.update(arg,cb);
//                 } else {
//                     res.send({
//                         code:"201",
//                         msg:"数据不存在！",
//                     });
//                     return;
//                 }
                
//             }]
//         },function(err,data){
//             // console.log("data1",data);
//             res.send({
//                 code:"200",
//                 msg:"更新成功！",
//             });
//             console.log("data1");
//         });


//     }catch(err){
//         res.send({
//             code:"201",
//             msg:"更新失败！",
//         });
//     }
// });

//根据id查询一条
router.post('/getOne',function(req,res){
    var param = req.body;
    try{
        async.auto({
            info:function(cb){
                roleController.getOne(param,cb);
            },
            whatResources:function(cb){
                global.acl.whatResources(param.id,cb)
            },
      } ,function(err,data){
            res.send({
                code:"200",
                msg:"获取详情成功",
                result:{
                    info:data.info,
                    resources:data.whatResources
                }
            });
        });
    }catch(err){
        res.end(err.stack);
    }
});

//上传图片
router.post('/upload_img',function(req,res){
    // var files = req.files;
    // console(files);
    try{
        async.auto({
            formParse:function(cb){
                util.formParse(req,cb);
            }
        },function(err,data){
            res.send({
                code:"0",
                msg:"上传成功！",
                data:{
                    "file": data.formParse.file
                }
            });
        });

    }catch(err){
        res.end(err.stack);
    }
});
const xlsx = require('node-xlsx')
const fs = require('fs');
function disposeExcel(filePath) {
    console.log("filePath",filePath);
    filePath = "./static" + filePath
    try {
        var excelList = [];
        let sheetList = xlsx.parse(filePath);
        sheetList.forEach((sheet) => {
            var keyList = [];
            var sheetDatas = [];
            sheet.data.forEach((row, index) => {
                let rowIndex = index;
                var rowData = {};
                row.forEach((cell, index) => {
                    let colIndex = index;
                    if(cell !== undefined){
                        if (rowIndex == 0) {
                            keyList.push(cell);
                        } else {
                            if (colIndex < keyList.length) {
                                var key = keyList[colIndex];
                                rowData[key] = cell;
                            }
                        }
                    }
                })
                if (rowIndex != 0) {
                    sheetDatas.push(rowData);
                }
            })
            excelList.push(sheetDatas);
        });

        return excelList;

    } catch (error) {
        console.log("error",error);
        fs.remove(filePath);
        return false;
    }
    
}



//上传excel
router.post('/upload_excel',function(req,res){
    // var files = req.files;
    // console(files);
    try{
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            save:["getOne",function(result,cb){
                // console.log("result",result);
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.Register,"w")) {
                    cb();

                } else {
                    res.send({
                        code:"201",
                        msg:"没有权限！",
                    });
                    return;
                }
                

            }],
            formParse:function(cb){
                util.formParse(req,cb);
            },
            add:["formParse",function(result,cb){
                result.formParse.file
                if (result["formParse"] && result["formParse"]["file"]) {
                    var mFile = result["formParse"]["file"];
                    var excelDatas = disposeExcel(mFile);
                    if (excelDatas && excelDatas.length > 0) {
                        var dataList = [];
                        excelDatas.forEach((data)=>{
                            // console.log("data:",data);
                            data.forEach((rowData)=>{
                                var addData = {};
                                if(rowData["编号（年月村序次）"]){
                                    addData["orderId"] = rowData["编号（年月村序次）"];
                                    addData["huzhuName"] = (rowData["房屋户主姓名"] || "无");
                                    addData["idCard"] = (rowData["身份证号"] || "无");
                                    addData["phone"] = (rowData["房屋户主电话"] || "无");
                                    addData["jiedao"] = tool.getCodeByName(rowData["所在区域（镇、街道）"].trim());
                                    addData["shequ"] = tool.getCodeByName(rowData["所在区域（村）"].trim());
                                    addData["xiangxidizhi"] = (rowData["详细地址"] || "无");
                                    addData["longitude"] = (rowData["坐标X（经度）"] || "无");
                                    addData["latitude"] = (rowData["坐标Y（纬度）"] || "无");
                                    addData["buildyear"] = (rowData["建成年份"] || "无");
                                    addData["jianzhugn"] = (rowData["建筑功能"] || "无");
                                    addData["jiegoulx"] = (rowData["结构类型"] || "无");
                                    addData["jianzhumj"] = (rowData["建筑面积"] || "无");
                                    addData["cengnum"] = (rowData["建筑层数"] || "无");
                                    addData["jianzhugao"] = (rowData["建筑高度"] || "无");
                                    addData["qizhufs"] = (rowData["砌筑方式"] || "无");
                                    addData["jichuqk"] = (rowData["基础情况"] || "无");
                                    addData["wfzhoubian"] = (rowData["房屋周边情况"] || "无");
                                    addData["tudixz"] = (rowData["土地性质"] || "无");
                                    addData["jiegoucg"] = (rowData["结构拆改"] || "无");
                                    addData["jiacenggz"] = (rowData["加层改造"] || "无");
                                    addData["xiushanjg"] = (rowData["修缮加固"] || "无");
                                    addData["lishizh"] = (rowData["历史灾害"] || "无");
                                    addData["jianced"] = (rowData["检测日期"] || "无");
                                    if (addData["jianced"] != '无') {
                                        addData["jianced"] = new Date(1900, 0, addData["jianced"] - 1).toLocaleString().split(' ')[0]
                                    }
                                    addData["jiancep"] = (rowData["检测人员"] || "无");
                                    addData["pingjiadj"] = (rowData["评价等级"] || "无");
                                    addData["chulijy"] = (rowData["处理建议"] || "无");
                                    addData["shenhep"] = (rowData["审核人员"] || "无");
                                    addData["shenhed"] = (rowData["审核时间"] || "无");
                                    if (addData["shenhed"] != '无') {
                                        addData["shenhed"] = new Date(1900, 0, addData["shenhed"] - 1).toLocaleString().split(' ')[0]
                                    }
                                    addData["anquznzs"] = (rowData["安全隐患综述"] || "无");
                                    addData["state"] = "待审核";
                                    addData["from"] = "表格导入";
                                    dataList.push(addData);
                                    // var oterData = tool.deepClone(addData);
                                    // oterData["orderId"] += 1;
                                    // var list = [addData,oterData];
                                    // console.log(addData);

                                }
                                
                            });

                        }) ;
                        if (dataList.length > 0) {
                            roleController.save(dataList,cb);

                        } else {
                            res.send({
                                code:"1",
                                msg:"读取数据失败！"
                            });
                            return;
                        }
                        
                    } else {
                        res.send({
                            code:"1",
                            msg:"上传失败！"
                        });
                        return;
                    }
                } else {
                    res.send({
                        code:"1",
                        msg:"上传失败！"
                    });
                    return;
                }
            }],
        },function(err,data){
            // console.log("data:",data);
            if (data.add[0] == undefined) {
                res.send({
                    code:"1",
                    msg:"导入失败！"
                });
            } else {
                res.send({
                    code:"0",
                    msg:"导入成功！"
                });
            }
            
        });

    }catch(err){
        res.send({
            code:"1",
            msg:"上传失败！"
        });
    }
});

const execSync = require('child_process').execSync;

router.post('/getWord',function(req,res){
    // var param = req.query;
    var param = req.body;
    console.log("getList",param);
    // console.log("req",req);
    var mid = param["id"] || "6a6d9fb5-d50e-4478-a4f0-90086a9f4d2c";

    try{
        async.auto({
            getOne:function(cb){
                roleController.getOne({id:mid},cb);
            },
            disWord:["getOne",function(result,cb){
                
                tool.mkDir("./static/upload_temp/"+req.session.curUserId);
                var data = result.getOne;
                var outFile = "upload_temp/" + req.session.curUserId + "/"+data["huzhuName"]+".docx";
                var pyparam = "--outFile ../static/" + outFile
                pyparam += (" --orderId " + (data["orderId"] || "无"))
                pyparam += (" --huzhuName " + (data["huzhuName"] || "无"))
                pyparam += (" --idCard " + (data["idCard"] || "无"))
                pyparam += (" --phone " + (data["phone"] || "无"))
                pyparam += (" --jiedao " + (tool.getNameByCode(data["jiedao"]) || "无"))
                pyparam += (" --shequ " + (tool.getNameByCode(data["shequ"]) || "无"))
                pyparam += (" --xiangxidizhi " + (data["xiangxidizhi"] || "无"))
                pyparam += (" --longitude " + (data["longitude"] || "无"))
                pyparam += (" --latitude " + (data["latitude"] || "无"))
                pyparam += (" --buildyear " + (data["buildyear"] || "无"))
                pyparam += (" --jianzhugn " + (data["jianzhugn"] || "无"))
                pyparam += (" --jiegoulx " + (data["jiegoulx"] || "无"))
                pyparam += (" --jianzhumj " + (data["jianzhumj"] || "无"))
                pyparam += (" --cengnum " + (data["cengnum"] || "无"))
                pyparam += (" --jianzhugao " + (data["jianzhugao"] || "无"))
                pyparam += (" --qizhufs " + (data["qizhufs"] || "无"))
                pyparam += (" --jichuqk " + (data["jichuqk"] || "无"))
                pyparam += (" --wfzhoubian " + (data["wfzhoubian"] || "无"))
                pyparam += (" --tudixz " + (data["tudixz"] || "无"))
                pyparam += (" --jiegoucg " + (data["jiegoucg"] || "无"))
                pyparam += (" --jiacenggz " + (data["jiacenggz"] || "无"))
                pyparam += (" --xiushanjg " + (data["xiushanjg"] || "无"))
                pyparam += (" --lishizh " + (data["lishizh"] || "无"))
                pyparam += (" --jianced " + (data["jianced"] || "无"))
                pyparam += (" --jiancep " + (data["jiancep"] || "无"))
                pyparam += (" --pingjiadj " + (data["pingjiadj"] || "无"))
                pyparam += (" --chulijy " + (data["chulijy"] || "无"))
                pyparam += (" --shenhep " + (data["shenhep"] || "无"))
                pyparam += (" --shenhed " + (data["shenhed"] || "无").replace(" ", ""))
                pyparam += (" --anquznzs " + (data["anquznzs"] || "无"))
                try {
                    var output = execSync('python ./py/disWord.py '+ pyparam)
                    console.log(output);
                    res.send({
                        code: 200,
                        msg:"导出word成功!",
                        data: {file:outFile}
                    });
                } catch (error) {
                    res.send({
                        code: 201,
                        msg:"导出word失败!"
                    });
                }
                
            }],
        } ,function(err,data){
            var pushDate = [];
            
            
            res.send({
                code: 0,
                msg:"获取详情成功",
                data: pushDate,
                count:pushDate.length
            });
        });
    }catch(err){
        res.end({code:"201",error:err.stack});
    }
});


router.post('/getImgWord',function(req,res){
    // var param = req.query;
    var param = req.body;
    var mid = param["id"] || "6a6d9fb5-d50e-4478-a4f0-90086a9f4d2c";

    try{
        async.auto({
            getOne:function(cb){
                roleController.getOne({id:mid},cb);
            },
            disWord:["getOne",function(result,cb){
                
                tool.mkDir("./static/upload_temp/"+req.session.curUserId);
                var outFile = "upload_temp/" + req.session.curUserId + "/"+((new Date().getTime()) * 1.2+2)+".docx";
                var data = result.getOne;
                var pyparam = "--outFile ../static/" + outFile
                
                if (data["imgFiles"]) {
                    for (let index = 0; index < 5; index++) {
                        var lineData = data["imgFiles"]["list"+(index+1)];
                        for (let col = 0; col < 2; col++) {
                            var file = lineData[col];
                            if (file && file != "") {
                                pyparam += (" --img"+(index+1)+"_"+col+" ../static/" + file)
                            }
                            
                        }
                        
                    }

                }
                try {
                    console.log('python ./py/disWordImg.py '+ pyparam);
                    var output = execSync('python ./py/disWordImg.py '+ pyparam)
                    console.log(output);
                    res.send({
                        code: 200,
                        msg:"导出word成功!",
                        data: {file:outFile}
                    });
                } catch (error) {
                    res.send({
                        code: 201,
                        msg:"导出word失败!"
                    });
                }
                
            }],
        } ,function(err,data){
            var pushDate = [];
            
            
            res.send({
                code: 0,
                msg:"获取详情成功",
                data: pushDate,
                count:pushDate.length
            });
        });
    }catch(err){
        res.end({code:"201",error:err.stack});
    }
});

router.post('/delete_img',function(req,res){
    var param = req.body;
    
    try{
        if (tool.isNull(param["file"])) {
            res.send({
                code:"201",
                msg:"删除失败！",
            });
        } else {
            util.deleteTempFile(param.file);
            res.send({
                code:"200",
                msg:"删除成功！",
            });
        }

    }catch(err){
        res.end(err.stack);
    }
});


//根据id查询一条
router.post('/getList',function(req,res){
    var param = req.body;
    try{
        console.log("getList curUserId:",req.session.curUserId)
        console.log("getList curUser:",req.session.curUser)
        console.log("getList sessionID:",req.sessionID)
        console.log("getList curUserId is undefined:",req.session.curUserId == undefined)
        console.log("getList curUserId is null:",req.session.curUserId == null)
        console.log("getList curUserId is null:",typeof(req.session.curUserId) == "undefined")
        if(req.session.curUserId != undefined){ 
            
            async.auto({
                list:function(cb){
                    roleController.getList(param,cb);
                },
                count:function(cb){
                    roleController.count(param,cb);
                },
            } ,function(err,data){
                res.send({
                    code:"200",
                    msg:"获取详情成功",
                    result: data.list,
                    count:data.count
                });
            });
        } else {
            res.send({
                code:"401",
                msg:"请登录!",
            });
        }
        
    }catch(err){
        res.end(err.stack);
    }
});



//根据id查询一条
router.get('/getList',function(req,res){
    var param = req.query;
    console.log("getList",param);
    // console.log("req",req);
    var choose = param["param"] || {};
    var page = param["page"] || 1;
    var limit = param["limit"] || 10;
    page = Number(page);
    limit = Number(limit);
    var choose1 = {};
    var choose2 = {};
    if (choose["orderId"]  == "" || choose["orderId"] == undefined) {
        choose1 = {};
    } else {
        choose1["orderId"] = choose["orderId"];
        choose2["huzhuName"] = choose["orderId"];
    }

    try{
        async.auto({
            list:function(cb){
                roleController.getList(choose1,cb);
            },
            list2:["list",function(result,cb){
                if (result.list.length > 0) {
                    cb();
                } else {
                    roleController.getList(choose2,cb);
                }
            }],
            all:function(cb){
                roleController.getList({},cb);
            },
        } ,function(err,data){
            var pushDate = [];
            var startIdx = (page - 1) * limit;
            if (startIdx > data.list.length) {
                startIdx = 0
            }
            var endIdx = startIdx + limit;
            var mLIst = [];
            if (data.list) {
                data.list.sort(function(a,b){
                    return b["updatedAt"] - a["updatedAt"];
                })
                for (var key in data.list) {
                    // console.log("key",key);
                    var idx = Number(key);
                    var lineDate = data.list[key];
                    lineDate["idx"] = idx+1;
                    if (idx >= startIdx && idx < endIdx) {
                        lineDate['jiedao'] = (tool.getNameByCode(lineDate["jiedao"]) || "无")
                        lineDate['shequ'] = (tool.getNameByCode(lineDate["shequ"]) || "无")
                        pushDate.push(lineDate);
                    }
                }
            }
            if (data.list2) {
                data.list2.sort(function(a,b){
                    return b["updatedAt"] - a["updatedAt"];
                })
                for (var key in data.list2) {
                    var idx = Number(key);
                    var lineDate = data.list2[key];
                    lineDate["idx"] = idx+1;
                    if (idx >= startIdx && idx < endIdx) {
                        lineDate['jiedao'] = (tool.getNameByCode(lineDate["jiedao"]) || "无")
                        lineDate['shequ'] = (tool.getNameByCode(lineDate["shequ"]) || "无")
                        pushDate.push(lineDate);
                    }
                }
            }
            
            res.send({
                code: 0,
                msg:"获取详情成功",
                data: pushDate,
                count:data.all.length
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
        
        async.auto({
            getOne:function(cb){
                userController.getOne({id:req.session.curUserId},cb);
            },
            delete:["getOne",function(result,cb){
                if (tool.getPortByType(result.getOne["jurisdiction_type"],tool.Interface.Register,"w")) {
                    if (param["imgFiles"]) {
                        delImgFiles(param["imgFiles"]);
                    } else if (Array.isArray(param)) {
                        for (var key in param) {
                            var element = param[key];
                            if (element["imgFiles"]) {
                                delImgFiles(element["imgFiles"]);
                            }
                                
                        }

                    }
                    roleController.delete(param,cb);
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

router.post('/allow',function(req,res){
    var arg = req.body;
    console.log('arg:',arg);
    console.log(arg.role,JSON.parse(arg.resources));
    async.auto({
        resources:function(cb) {
            resourceController.getList({},function(err,resources){
                var resourceList = [];
                resources.forEach(function(item){
                    resourceList.push(item.id);
                });
                cb(err,resourceList);
            });
        },
        remove:["resources",function(data,cb) {
            console.log("resources:",data.resources);
            global.acl.removeAllow(arg.role,data.resources,'*',function(err){
                cb(err)
            })
        }],
        add:["remove",function(data,cb) {
            global.acl.allow(arg.role,JSON.parse(arg.resources),'*',function(err){
                cb(err)
            })
        }],
    },function(err,result){
        res.send({
            code:200,
            msg:"成功"
        });
    });
});

module.exports = router;


