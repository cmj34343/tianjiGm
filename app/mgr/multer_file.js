/*
 * @Author: hsq
 * @Date: 2021-03-21 11:20:11
 * @LastEditors: hsq
 * @LastEditTime: 2021-03-21 12:26:42
 * @Description: file content
 */

var multer = require("multer");
var _gInstance = null;
var multer_file = function (){
    // this.init = function () {
    //     this.name = "multer_file";
    //     var storage = multer.diskStorage({
    //         destination: function(req, file, cb) {
    //         cb(null, './uploads');
    //         },
    //         filename: function(req, file, cb) {
    //         cb(null, `${Date.now()}-${file.originalname}`)
    //         }
    //     })
        
    //     this.upload = multer({ storage: storage });
    // }
    // function multer_file() {
        
    //     // var imgBaseUrl = '../'
    // }
}

multer_file.prototype.init = function(){
    this.name = "multer_file";
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
        cb(null, './uploads');
        },
        filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
        }
    })
    
    this.upload = multer({ storage: storage });
}

multer_file.getInstance = function () {
    if(_gInstance == null){
        _gInstance = new multer_file();
        _gInstance.init();
    }
    return _gInstance;
}
module.exports = multer_file;
// export default multer_file;
