/*
 * @Descripttion: 
 * @version: 
 * @Author: hsq
 * @Date: 2021-03-15 10:19:07
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-27 11:59:29
 */
/**
 * Created by wuwanyu on 2017/5/23.
 */
var images = require("images");
var tool = require("../app/tool/tool");
var multiparty = require('multiparty'),
    fs = require('fs'),
    fs_extra = require('fs-extra');


var splitstr = String.fromCharCode(0x01);
exports.splitstr = splitstr;

//��������תΪjson
exports.formParse=function(req, next){
    var dir = "static/upload_temp/";
    if(req.session.curUserId != null) {
        dir = dir + req.session.curUserId + "/";
        console.log("dir",dir);
        try {
            fs.mkdirSync(dir);
        } catch (error) {
            
        }
        
    }
    var form = new multiparty.Form({
        encoding:"utf-8",
        uploadDir:dir,
        keepExtensions:true //������׺
    });

    

    form.parse(req,function(err,fields,files){
        // console.log("fields:",fields);
        // console.log("files:",files);
        var obj = {},temp = [];
        if(fields){
            Object.keys(fields).forEach(function(name){
                obj[name] = fields[name].join(",");
            });
        }
        // console.log("obj:",obj);
        if(files){
            Object.keys(files).forEach(function(name){
                //console.log("name:",name,"files[name]",files[name],"length:",files[name].length);
                var fileName = "";
                if(files[name].length>0 && files[name][0].size>0){
                    temp[name] = [];
                    files[name].forEach(function(file){
                        fileName = file.path;
                        
                        // fs.rename(file.path,form.uploadDir + file.originalFilename,function(err){
                        //     if(err) next(err);
                        //     fs_extra.removeSync(file.path);

                        //     temp[name].push(file.path);
                        // });
                        file.path = file.originalFilename;
                        var filePath = tool.disposePath(fileName,"static");
                        console.log("filePath");
                        if (filePath.indexOf('.jpg') >=0 || filePath.indexOf('.png') >=0) {
                            var mFile = "static"+filePath;
                            console.log(mFile);
                            images(mFile)                     //加载图像文件
                            // .size(400)                          //等比缩放图像到400像素宽
                            // .draw(images("logo.png"), 10, 10)   //在(10,10)处绘制Logo
                            .save(mFile, {               //保存图片到文件,图片质量为50
                                quality : 50                    
                            });
                        }
                        temp[name].push(filePath);
                    });
                    if(files[name].length==1){
                        obj[name+"_size"]= files[name][0].size;
                    }
                    // obj[name] = temp[name].join(splitstr);
                    obj[name] = temp[name].join(splitstr);
                }

            });
        }
        // console.log("obj:",obj);
        next(err,obj);
    });
}

exports.deleteTempFile=function(file){
    try {
        if (file.indexOf("upload_temp") >= 0) {
            fs_extra.removeSync("static"+file);
        }
        
    } catch (error) {
        console.log("deleteTempFile error:",error);
    }
    
}

exports.formNext=function(req, next){
    // console.log("req:",req);
    next({},req);
}

