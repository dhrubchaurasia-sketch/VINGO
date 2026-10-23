// import multer from "multer";
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public");
//   },
//   filename:  (req, file, cb)=> {
//     cb(null,file.originalname);
//   }
// });
// export const upload =multer({ storage });

import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});