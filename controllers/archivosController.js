//framework para subir archivos
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs'); //eliminar o crear nuevos archivos

exports.subirArchivo = async (req, res, next) => {
    const configuracionMulter = {
        limits : {fileSize : req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 }, //1MG (1000000 o 1024 * 1024)
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) =>{
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) =>{
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb( null, `${shortid.generate()}${extension}`); 
            }
        })
    }
    const upload = multer(configuracionMulter).single('archivo')

    upload(req, res, async (error) => {
        if(!error){
            res.json({archivo: req.file.filename})
        }else {
            console.log(error);
            return next();
        }
    })
}

exports.eliminarArchivo = async (req, res) => {
     try {
         fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`)
     } catch (error) {
         console.log(error)
     }
}