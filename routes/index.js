require ('dotenv').config();
var express = require('express');
var router = express.Router();
var axios = require ('axios');


const productosModel = require ('../models/admin');
const { Axios } = require('axios');



//Pagina principal
router.get('/', function(req, res, next){
  res.render('index', {title: 'Pagina inicio'})
})

//Inicio de sesion clientes
router.get('/loginclientes', function(req, res, next){
  if (req.session.auth){
    res.redirect('/clientes');
  } else {
  res.render('login_clientes', {title: 'Login Clientes'})}
});

//logeo de inicio de sesion cliente
router.post('/login2', function(req, res, next){
  const {email, password} =req.body;
  let concat, concat2;
  productosModel
  .iniciosesionclientes(email)
  .then(datos=>{
    concat = datos[0].password;
    concat2 = datos[0].id
    console.log(concat2);
    if (password == concat){
      req.session.auth = true;
      req.session.username = concat2;
      res.redirect('/clientes');
    }else{
      res.send('esto no funciona')
    }
  })
  .catch(err=>{
    console.error(err.message);
    return res.status(500).send('Error en el inicio de sesion')
  })
});

//Pagina registros clientes
router.get('/register-pag', function(req, res, next){
  res.render('register_clientes', {title: 'Registro Clientes'})
});

//Registro de clientes
router.post('/register', function(req, res, next){
  const {email, password1, password2, preg_seg, resp_seg} = req.body;
  if (password1 != password2){
    res.redirect('/passwordfail')
  } else{
  productosModel
    .registroclientes(email, password1, preg_seg, resp_seg)
    .then(idClienteRegistrado=>{
      res.redirect('/loginclientes')
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error en el registro')
    })}
});

//Pagina error en contraseñas
router.get('/passwordfail', function(req, res, next){
  res.render('clavefail', {title: 'Contraseñas incorrectas'})
})

//Pagina recuperar contraseña
router.get('/recuperar', function(req, res, next){
  res.render('recuperar', {title: 'Recuperar Contraseña'})
});


//Responder pregunta de Seguridad
router.post('/resclave', function(req, res, next){
  const {pregunta, respuesta} = req.body;
  productosModel
    .recuperarclave(pregunta, respuesta)
    .then(datos=>{
      res.render('claverec', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Pregunta y respuesta no coincidente')
    })
});

//Pagina principal compras
router.get('/clientes', function(req, res, next){
  productosModel
    .obteneradmin()
    .then(datos=>{
      res.render('clientes', {datos: datos});
    }) 
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando archivos')
    })
});

//Pagina detalles productos
router.get('/detalles/:id', function(req, res, next){
  const id = req.params.id
  productosModel
    .obtenerPorId(id)
    .then(datos=>{
      res.render('detallesprd', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('No se encuentra el producto')
    })
});

//Pagina formulario de compra 
router.get('/pedidoprd/:id', function(req, res, next){
  if(req.session.auth){
    const id = req.params.id;
    productosModel
      .obtenerPorId(id)
      .then(datos=>{
        res.render('pedidoprd', {datos: datos});
      })
      .catch(err=>{
        console.error(err.message);
        return res.status(500).send('No se encuentra el producto')
      })
  } else{
    res.redirect('/loginclientes');
  }
})

//Pago productos API 
router.post('/payments', async (req, res, next)=>{
  var monto, moneda;
  const {producto_id, descripcion, nombre, numero_tarjeta, cvv, mes_ven, year_ven, moneda_id, cantidad, referencia, precio} = req.body;
  const ip_cliente = req.ip;
  const cliente_id = req.session.username;
  if (moneda_id == 1) {
    moneda= 'USD';
    monto = cantidad * precio;
  }else{
    if (moneda_id == 2) {
      moneda= 'EUR';
      monto = (cantidad * precio) * 0.91;
    } else {
      if (moneda_id == 3) {
        moneda= 'VES';
        monto = (cantidad * precio) * 35.94; 
      }
    }
  }
  const payments ={
    "amount": monto,
    "card-number": numero_tarjeta,
    "cvv": cvv,
    "expiration-month": mes_ven,
    "expiration-year": year_ven,
    "full-name": nombre,
    "currency": moneda,
    "description": descripcion,
    "reference": referencia
  }
  try{
    const response = await axios.post ('https://fakepayment.onrender.com/payments', payments, {headers:{ Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0xMVQyMjoxMzoyMC41NTZaIiwiaWF0IjoxNzA1MDExMjAwfQ.MC2WfwWwfyRT4Q6q9-D1n73rrorClhC1Ih4Lb0o1_sI'}});
    const data = JSON.parse(JSON.stringify(response.data));
      const transaccion_id = data.data.transaction_id;
      const total_pagado = data.data.amount;
      const fecha = data.data.date;
      const referencia = data.data.reference;
      const descripcion = data.data.description;
      const message = data.message;
      console.log(message);
      productosModel
      .facturas(cantidad, total_pagado, fecha, ip_cliente, transaccion_id, descripcion, referencia, moneda_id, cliente_id, producto_id)
      .then(idFacturaRealizada =>{
        res.render('pagosuccess', {title: 'Compra Exitosa'})
      })
  } catch (err) {
    res.render('pagofails');
  }
})

//Busqueda nombre productos
router.post('/search', function(req, res, next){
  const {nombre} = req.body;
  productosModel
    .obtenerprdPorNombre(nombre)
    .then(datos=>{
      res.render('clientes', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error buscando archivos')
    })
});

//Busqueda descripcion productos
router.post('/searchdescrp', function(req, res, next){
  const {descripcion} = req.body;
  productosModel
    .obtenerprdPorDescripcion(descripcion)
    .then(datos=>{
      res.render('clientes', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error buscando archivos')
    })
});

//Filtrado de productos por categoria
router.post('/filtroctg', function(req, res, next){
  const {categoria} = req.body;  
  console.log(req.body);
  productosModel
    .filtradoctg(categoria)
    .then(datos=>{
      res.render('clientes', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error buscando archivos')
    })
});

//Filtrado de productos por marcas
router.post('/filtromarca', function(req, res, next){
  const {marca} = req.body;
  console.log(req.body); 
  productosModel
    .filtradomarca(marca)
    .then(datos=>{
      res.render('clientes', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error buscando archivos')
    })
});

//Filtrado de productos por jugadores
router.post('/filtrojgd', function(req, res, next){
  const {jugadores} = req.body;  
  console.log(req.body);
  productosModel
    .filtradojgd(jugadores)
    .then(datos=>{
      res.render('clientes', {datos: datos});
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error buscando archivos')
    })
});

// Pagina inicio de sesion administrador
router.get('/admin', function(req, res, next) {
  if (req.session.auth){
    res.redirect('/report');
  } else{
  res.render('login_admin', { title: 'Login Admin' });}
});

//login a la pagina del administrador
router.post('/login', function(req, res, next){
  const {user, password} = req.body;
  if ((process.env.USER == user) && (process.env.PASSWORD == password)) {
    req.session.auth = true;
    res.redirect('/report');
  } else{
    res.render('loginfail', {title: 'Login Fail'});
  }
});

//Get principal page
router.get('/report', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obteneradmin()
    .then(datos=>{
      res.render('reporte', {datos: datos});
    }) 
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando archivos')
    })
  } else{
    res.redirect('/admin');
  }
  
})

//Get productos page
router.get('/productos', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obtenerprd()
    .then(productos =>{
      res.render('productos', {productos: productos});
    })
    .catch(err =>{
      return res.status(500).send("Error buscando producto");
    })
  } else {
    res.redirect('/admin');
  }
});

//Get categorias page
router.get('/categorias', function(req, res, next){
  if (req.session.auth){
    productosModel
  .obtenerctg()
  .then(categorias =>{
    res.render('categorias', {categorias: categorias});
  })
  .catch(err =>{
    return res.status(500).send("Error buscando categorias");
  })
  } else{
    res.redirect('/admin');
  }
});

//Get imagenes page
router.get('/imagenes', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obtenerimg()
    .then(imagenes =>{
      res.render('imagenes', {imagenes: imagenes});
    })
    .catch(err =>{
      return res.status(500).send("Error buscando imagenes");
    })
  } else{
    res.redirect('/admin');
  }
});

//Get productos page agg
router.get('/prdagg', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obtenerctg()
    .then(categorias=>{
      res.render('aggprd', {categorias: categorias});
    })
    .catch(err =>{
      return res.status(500).send("Error a cargar la pagina");
    }) 
  } else{
    res.redirect('/admin');
  }
})

//Get categorias page agg
router.get('/ctgagg', function(req, res, next){
  if (req.session.auth){
    res.render('aggctg');
  } else{
    res.redirect('/admin');
  }
});

//Get imagenes page agg
router.get('/imgagg', function(req, res, next){
  if (req.session.auth){
    productosModel
  .obtenerprd()
  .then(productos=>{
    res.render('aggimg', {productos: productos});
  })
  .catch(err =>{
    return res.status(500).send("Error a cargar la pagina");
  })
  } else{
    res.redirect('/admin');
  }
});

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
  if (req.session.auth){
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
  } else{
    res.redirect('/admin');
  }
});

//Get categorias page edit
router.get('/ctgedit/:id', function(req,res,next){
  if (req.session.auth){
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
  } else{
    res.redirect('/admin')
  }
});

//Get imagenes page edit
router.get('/imgedit/:id', function(req,res,next){
  if (req.session.auth){
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
  } else{
    res.redirect('/admin');
  }
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
  if (req.session.auth){
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
  } else{
    res.redirect('/admin');
  }
});

//Get categorias page delete
router.get('/ctgdelete/:id', function(req,res,next){
  if (req.session.auth){
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
  } else{
    res.redirect('/admin');
  }
});

//Get imagenes page delete
router.get('/imgdelete/:id', function(req,res,next){
  if (req.session.auth){
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
  }else{
    res.redirect('/admin')
  }
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

//Vista tabla de compras
router.get('/tablacompras', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obtenerfacturas()
    .then(facturas=>{
      res.render('tablacompras', {facturas: facturas})
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando las facturas')
    })
  } else{
    res.redirect('/admin')
  }
});

//Vista tabla de clientes
router.get('/tablaclientes', function(req, res, next){
  if (req.session.auth){
    productosModel
    .obtenerclientes()
    .then(clientes=>{
      res.render('tablaclientes', {clientes: clientes})
    })
    .catch(err=>{
      console.error(err.message);
      return res.status(500).send('Error cargando los clientes')
    })
  } else{
    res.redirect('/admin')
  }
});

//Cerrar sesion
router.get('/logout', function (req, res, next){
  req.session.destroy();
  res.redirect('/');
})

router.get('/*', function(req, res, next) {
  res.render('error', { title: 'Error 404'});
});
module.exports = router;
