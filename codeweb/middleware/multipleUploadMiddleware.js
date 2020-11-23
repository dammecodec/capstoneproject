const util = require("util");
const path = require("path");
const multer = require("multer");
const fs = require('fs');
// Khởi tạo biến cấu hình cho việc lưu trữ file upload
let storage = multer.diskStorage({
  // Định nghĩa nơi file upload sẽ được lưu lại
  destination: (req, file, callback) => {
    const localpath= `${__dirname}/../dataface/${req.params.iduser}`
    fs.mkdirSync(localpath, { recursive: true })
    callback(null, localpath);
  },
  filename: (req, file, callback) => {
    // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
    // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg
    let math = ["image/png", "image/jpeg"];
    if (math.indexOf(file.mimetype) === -1) {
      let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
      return callback(errorMess, null);
    }

    // Tên của file thì mình nối thêm một cái nhãn thời gian để tránh bị trùng tên file.
    let filename = `${Date.now()}-data-${file.originalname}`;
    callback(null, filename);
  }
});

let uploadManyFiles = multer({storage: storage}).array("many-files", 20);

// Mục đích của util.promisify() là để bên controller có thể dùng async-await để gọi tới middleware này
let multipleUploadMiddleware = util.promisify(uploadManyFiles);

module.exports = multipleUploadMiddleware;
