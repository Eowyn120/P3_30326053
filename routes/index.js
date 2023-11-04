require ('dotenv').config();
var express = require('express');
var router = express.Router();

const productosModel = require ('../models/admin')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

//login a la pagina del administrador
router.post('/login', function(req, res, next){
  const {user, password} = req.body;
  if ((process.env.USER == user) && (process.env.PASSWORD == password)) {
    console.log('Hola si estoy aqui');
    productosModel
    .obtener()
    .then(datos=>{
      res.render('reporte', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando archivos')
    })
  } else{
    res.render('loginfail', {title: 'Login Fail'});
  }
});

//Get principal page
router.get('/home', function(req, res, next){
  productosModel
    .obtener()
    .then(datos=>{
      res.render('reporte', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando archivos')
    })
})

//Get productos page
router.get('/productos', function(req, res, next){
  productosModel
  .obtenerprd()
  .then(productos =>{
    res.render('productos', {productos: productos});
  })
  .catch(err =>{
    return res.status(500).send("Error buscando producto");
  })
});

//Get categorias page
router.get('/categorias', function(req, res, next){
  productosModel
  .obtenerctg()
  .then(categorias =>{
    res.render('categorias', {categorias: categorias});
  })
  .catch(err =>{
    return res.status(500).send("Error buscando categorias");
  })
});

//Get imagenes page
router.get('/imagenes', function(req, res, next){
  productosModel
  .obtenerimg()
  .then(imagenes =>{
    res.render('imagenes', {imagenes: imagenes});
  })
  .catch(err =>{
    return res.status(500).send("Error buscando imagenes");
  })
});

//Get productos page agg
router.get('/prdagg', function(req, res, next){
  productosModel
  .obtenerctg()
  .then(categorias=>{
    res.render('aggprd', {categorias: categorias});
  })
  .catch(err =>{
    return res.status(500).send("Error a cargar la pagina");
  })
})

//Get categorias page agg
router.get('/ctgagg', function(req, res, next){
  res.render('aggctg');
})

//Get imagenes page agg
router.get('/imgagg', function(req, res, next){
  productosModel
  .obtenerprd()
  .then(productos=>{
    res.render('aggimg', {productos: productos});
  })
  .catch(err =>{
    return res.status(500).send("Error a cargar la pagina");
  })
})

//agregar categoria
router.post('/aggctg', function(req, res, next){
  const {nombre} = req.body;
  console.log(nombre);
  productosModel
  .insertarctg(nombre)
  .then(idCategoriaInsertado =>{
    res.redirect('/categorias');
  })
  .catch(err =>{
    console.error(err.message);
    return res.status(500).send("Error insertando producto");
  });
})

//agregar producto
router.post('/aggprd', function(req, res, next){
  const {nombre, precio, codigo, descripcion, marca, jugadores, categoria_id} = req.body;
  productosModel
  .insertarprd(nombre, precio, codigo, descripcion, marca, jugadores, categoria_id)
  .then(idProductoInsertado =>{
    res.redirect('/productos');
  })
  .catch(err =>{
    console.error(err.message);
    return res.status(500).send("Error insertando producto");
  })
});

//agregar imagenes
router.post('/aggimg', function(req, res, next){
  const {url, destacado, producto_id} = req.body;
  productosModel
  .insertarimg(url, destacado, producto_id)
  .then(idImagenInsertada=>{
    res.redirect('/imagenes');
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error insertando imagen');
  })
});

//Get productos page edit
router.get('/prdedit/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerprdPorId(id)
  .then(productos=>{
    res.render('editprd', {productos: productos});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando el producto')
  })
});

//Get categorias page edit
router.get('/ctgedit/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerctgPorId(id)
  .then(categorias=>{
    res.render('editctg', {categorias: categorias});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando la categoria')
  })
});

//Get imagenes page edit
router.get('/imgedit/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerimgPorId(id)
  .then(imagenes=>{
    res.render('editimg', {imagenes: imagenes});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando la imagen')
  })
});

//Update productos page
router.post('/updateprd/:id', function(req, res, nexte){
  const id= req.params.id;
  const {nombre, precio, codigo, descripcion, marca, jugadores} = req.body;
  productosModel
  .actualizarprd(nombre, precio, codigo, descripcion, marca, jugadores, id)
  .then(()=>{
    res.redirect('/productos');
  })
  .catch(err =>{
    console.error(err.message);
    res.status(500).send('Error actualizando el producto');
  })
});

//Update categorias page
router.post ('/updatectg/:id', function(req, res, next){
  const id = req.params.id;
  const {nombre} = req.body;
  productosModel
  .actualizarctg(nombre, id)
  .then(()=>{
    res.redirect('/categorias');
  })
  .catch(err =>{
    console.error(err.message);
    res.status(500).send('Error actualizando la categoria');
  })
});

//Update imagenes page
router.post('/updateimg/:id', function(req, res, next){
  const id = req.params.id;
  const {url, destacado} = req.body;
  productosModel
  .actualzarimg(url, destacado, id)
  .then(()=>{
    res.redirect('/imagenes');
  })
  .catch(err =>{
    console.error(err.message);
    res.status(500).send('Error actualizando la imagen');
  })
});

//Get productos page delete
router.get('/prddelete/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerprdPorId(id)
  .then(productos=>{
    res.render('deleteprd', {productos: productos});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando el producto')
  })
});

//Get categorias page delete
router.get('/ctgdelete/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerctgPorId(id)
  .then(categorias=>{
    res.render('deletectg', {categorias: categorias});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando la categoria')
  })
});

//Get imagenes page delete
router.get('/imgdelete/:id', function(req,res,next){
  const id=req.params.id;
  productosModel
  .obtenerimgPorId(id)
  .then(imagenes=>{
    res.render('deleteimg', {imagenes: imagenes});
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error buscando la imagen')
  })
});

//Delete productos page
router.get('/deleteprd/:id', function(req,res,next){
  const id = req.params.id;
  productosModel
  .eliminarprd(id)
  .then(()=>{
    res.redirect('/productos');
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error elimando el producto')
  })
});

//Delete categorias page
router.get('/deletectg/:id', function(req,res,next){
  const id = req.params.id;
  productosModel
  .eliminarctg(id)
  .then(()=>{
    res.redirect('/categorias');
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error elimando la categoria')
  })
});

//Delete imagenes page
router.get('/deleteimg/:id', function(req,res,next){
  const id = req.params.id;
  productosModel
  .eliminarimg(id)
  .then(()=>{
    res.redirect('/imagenes');
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error elimando la imagen')
  })
});

/*Non-existent route
router.get('/*', function(req, res, next) {
  res.render('error', { title: 'Error 404'});
});
*/
module.exports = router;