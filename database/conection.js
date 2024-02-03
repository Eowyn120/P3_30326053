const sqlite3 = require ('sqlite3').verbose();
const { Console } = require('console');
const path = require ('path');


//Conection Data Base
const db_name = path.join(__dirname, '../db', 'base.db');
const db = new sqlite3.Database(db_name, err =>{
    if (err) { 
        console.error(err.message);
    }else {
        console.log('conexion a la Base de Datos Exitosa!!!');
    }
});

db.serialize(() =>{
const sql_create="CREATE TABLE IF NOT EXISTS categorias ( id INTEGER PRIMARY KEY  AUTOINCREMENT, nombre varchar (25) NOT NULL);";
db.run(sql_create, err =>{
  if (err) {
    console.error (err.message);
  } else {
    console.log("Anexada de la tabla categorias exitosa!!!");
  }
})
const sql_create2="CREATE TABLE IF NOT EXISTS productos ( id INTEGER PRIMARY KEY AUTOINCREMENT, nombre varchar (25) NOT NULL, precio double NOT NULL, codigo int NOT NULL UNIQUE, descripcion varchar (60) NULL DEFAULT 'Sin descripcion', marca varchar (25) NOT NULL, jugadores int NOT NULL, categoria_id INTEGER, FOREIGN KEY (categoria_id) REFERENCES categorias (id));";
db.run(sql_create2, err =>{

  if (err) {
    console.error (err.message);
  } else {
    console.log("Anexada de la tabla productos exitosa!!!");
  }
})
const sql_create3="CREATE TABLE IF NOT EXISTS imagenes ( id INTEGER PRIMARY KEY AUTOINCREMENT, url varchar (200) NOT NULL, destacado VARCHAR (20) NOT NULL, producto_id INTEGER, FOREIGN KEY (producto_id) REFERENCES productos (id));";
db.run(sql_create3, err =>{
  if (err) {
    console.error (err.message);
  } else {
    console.log("Anexada de la tabla imagenes exitosa!!!");
  }
});
const sql_create4="CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR (30) NOT NULL, password VARCHAR (16) NOT NULL, preg_seg varchar (16) NOT NULL, resp_seg varchar (8) NOT NULL)";
db.run(sql_create4, err =>{
  if (err){
    console.error(err.message);
  } else{
    console.log("Anexada de la tabla clientes exitosa!!!");
  }
});
const sql_create5 = "CREATE TABLE IF NOT EXISTS monedas (id INTEGER PRIMARY KEY AUTOINCREMENT, nomenclatura VARCHAR (6) NOT NULL, descripcion VARCHAR (30) NOT NULL)";
db.run(sql_create5, err =>{
  if (err){
    console.error(err.message);
  } else{
    console.log("Anexada de la tabla de monedas exitosa!!!");
  }
});

const sql_create6="CREATE TABLE IF NOT EXISTS compras (id INTEGER PRIMARY KEY AUTOINCREMENT, cantidad INTEGER NOT NULL, total_pagado double NOT NULL, fecha DATETIME NOT NULL, ip_cliente varchar (18) NOT NULL, transaccion_id varchar (40) NOT NULL, descripcion varchar (100) NOT NULL, referencia varchar (50) NOT NULL, moneda_id INTEGER, cliente_id INTEGER, producto_id INTEGER, FOREIGN KEY (moneda_id) REFERENCES monedas (id), FOREIGN KEY (cliente_id) REFERENCES clientes (id), FOREIGN KEY (producto_id) REFERENCES productos (id))";
db.run(sql_create6, err =>{
  if(err){
    console.error(err.message);
  } else{
    console.log("Anexada de la tabla compras exitosa!!!");
  }
});
const sql_create7="CREATE TABLE IF NOT EXISTS calificaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, puntos INTEGER NOT NULL, cliente_id INTEGER, producto_id INTEGER, FOREIGN KEY (cliente_id) REFERENCES clientes (id), FOREIGN KEY (producto_id) REFERENCES productos (id))";
db.run(sql_create7, err =>{
  if (err){
    console.error(err.message);
  }else{
    console.log("Anexada de la tabla calificaciones exitosa!!!");
  }
});
const sql_create8="ALTER TABLE productos ADD promedio DOUBLE NULL DEFAULT 0";
db.run(sql_create8, err =>{
  if (err) {
    console.error(err.message);
  } else{
    console.log("Edicion de la tabla productos EXITOSA!!! ");
  }
});
})

module.exports = db;