/**
 * Created by trungquandev.com's author on 17/08/2019.
 * multipleUploadController.js
 */
const multipleUploadMiddleware = require("../middleware/multipleUploadMiddleware");

let debug = console.log.bind(console);

let multipleUpload = async (req, res) => {
  try {
    // thực hiện upload
    await multipleUploadMiddleware(req, res);

    debug(req.files);

    if (req.files.length <= 0) {
      return res.redirect('/inpdata/'+'length');
    }

    return res.redirect('/inpdata/'+'success');
  } catch (error) {
    debug(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.redirect('/inpdata/'+'limit');
    }

    return res.send(`Error when trying upload many files: ${error}}`);
  }
};

module.exports = {
  multipleUpload: multipleUpload
};
