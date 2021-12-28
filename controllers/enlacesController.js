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
    const { nombre_original, nombre } = req.body;

    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
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
//OBTIENE UN LISTADO DE TODOS LOS ENLACES
exports.todosEnlaces = async(req, res)=>{
    try {
        const enlaces = await Enlaces.find({}).select('url')
        res.json({enlaces})
    } catch (error) {
        console.log(error)
    }
}

//Si el enlace tiene password
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params;
    const enlace = await Enlaces.findOne({ url });
    if(!enlace){
        res.status(404).json({msg: 'el enlace no existe'});
        return next();
    }

    if(enlace.password){
        return res.json({password: true, enlace: enlace.url})
    }

    next();
}
//Verificar Password
exports.verificarPassword = async(req, res, next) =>{
    const { url } = req.params;
    const { password } = req.body;

    const enlace = await Enlaces.findOne({url})
    if(bcrypt.compareSync(password, enlace.password)){
        console.log("EXTITOOOOOOO")
        res.json({password: false, enlace: enlace.url})
        next();
    }else{
        return res.status(401).json({msg:'Password Incorrecto'})
    }

    console.log(req.body)
    console.log(req.params)
}
//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) =>{

    const { url } = req.params;
    const enlace = await Enlaces.findOne({ url });
    if(!enlace){
        res.status(404).json({msg: 'el enlace no existe'});
        return next();
    }

    res.json({archivo: enlace.nombre, password: false})

    next();    
}