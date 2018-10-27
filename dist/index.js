"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _awsSdk = require("aws-sdk");

var _mime = _interopRequireDefault(require("mime"));

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

var _helpers = require("./helpers");

var _states = require("./states");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Uploader =
/*#__PURE__*/
function () {
  function Uploader(options) {
    _classCallCheck(this, Uploader);

    if ((0, _helpers.isNone)(options) || (0, _helpers.isNone)(options.s3) || (0, _helpers.isNone)(options.upload)) {
      throw new Error(error('Missing config!'));
    }

    var s3 = options.s3,
        upload = options.upload;
    this.count = 0;
    this.s3Options = s3;
    this.uploadOptions = upload;
    this.s3 = new _awsSdk.S3(this.s3Options);
  }

  _createClass(Uploader, [{
    key: "handleUpload",
    value: function handleUpload(files) {
      var _this = this;

      var _this$uploadOptions = this.uploadOptions,
          bucket = _this$uploadOptions.bucket,
          directory = _this$uploadOptions.directory;
      var partialDirs = directory.split('/');
      var finalPart = partialDirs[partialDirs.length - 1];
      var count = this.count;
      files.forEach(function (file) {
        var fileStream = _fs.default.createReadStream(file);

        fileStream.on('error', function (err) {
          this.emitter.emit('fail', "File error: ".concat(err));
        });
        var uploadParams = (0, _helpers.getUploadObject)({
          Bucket: bucket,
          Key: file.replace(directory, finalPart),
          Body: fileStream,
          ContentType: _mime.default.getType(file)
        });

        _this.s3.upload(uploadParams, function (err, data) {
          if (err) {
            (0, _states.handleUploadError)(err);
          }

          if (data) {
            count++;
            (0, _states.handleUploadSuccessfully)({
              data: data,
              fileLength: files.length,
              count: count
            });
          }
        });
      });
    }
  }, {
    key: "upload",
    value: function upload() {
      var _this2 = this;

      var directory = this.uploadOptions.directory;
      (0, _recursiveReaddir.default)(directory).then(function (files) {
        _this2.handleUpload(files);
      });
    }
  }]);

  return Uploader;
}();

var _default = Uploader;
exports.default = _default;