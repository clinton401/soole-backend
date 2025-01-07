import multer from "multer"

// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//       const uniqueName = `${Date.now()}-${file.originalname}`;
//       cb(null, uniqueName);
//     },
//   });
  
//   const upload = multer({ storage: storage });
const upload = multer({ dest: 'uploads/' }); 
export default upload