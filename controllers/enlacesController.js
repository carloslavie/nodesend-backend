const Enlaces = require('../models/Enlaces');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async(req, res, next) =>{
    
    //Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    //Crear un objeto enlace
    const { nombre_original } = req.body;

    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = shortid.generate();
    enlace.nombre_original = nombre_original;
    

    //Si el usuario esta autenticado
    if(req.usuario){
        const { password, descargas } = req.body;

        //Asignar a enlace el numero de descargas
        if(descargas){
            enlace.descargas = descargas;
        };
        //Asignar un password
        if(password){
            const salt= await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hashSync(password, salt);
        };

        //Asgignar el autor
        enlace.autor = req.usuario.id;

    };
    //Almacenar enlace en la BD
    try {
        await enlace.save();
        return res.json({msg: `${enlace.url}`});
        next();

    } catch (error) {
        console.log(error);
    }
}

//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) =>{

    const { url } = req.params;
    const enlace = await Enlaces.findOne({ url });
    if(!enlace){
        res.status(404).json({msg: 'el enlace no existe'});
        return next();
    }

    res.json({archivo: enlace.nombre})

    const { descargas, nombre } = enlace;

    if(descargas === 1){
        //Eliminar achivo
        req.archivo = nombre;
        
        //Eliminar entrada de la bd
        await Enlaces.findOneAndRemove(req.params.url);
        next(); //Salta al siguiente controlador

    }else{
        enlace.descargas--;
        await enlace.save();
        console.log("todavia hay descargas")
    }
}