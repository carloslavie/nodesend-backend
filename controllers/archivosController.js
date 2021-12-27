//framework para subir archivos
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs'); //eliminar o crear nuevos archivos
const Enlaces = require('../models/Enlaces')

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
exports.descargar = async (req, res, next) => {

    //Obtiene el enlace
    const { archivo } = req.params;
    console.log(archivo)
    const enlace = await Enlaces.findOne({ nombre: archivo})
    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga)
    console.log(enlace)
    //Eliminar el archivo y la 
    const { descargas, nombre } = enlace;

    if(descargas === 1){
        //Eliminar achivo
        req.archivo = nombre;
        
        //Eliminar entrada de la bd
        await Enlaces.findOneAndRemove(enlace.id);
        next(); //Salta al siguiente controlador

    }else{
        enlace.descargas--;
        await enlace.save();
        console.log("todavia hay descargas")
    }
}