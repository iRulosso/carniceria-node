import express from 'express';
import mysql from 'mysql2';

const router = express.Router();
const db = {
    host: 'srv1056.hstgr.io',
    user: 'u267385952_pampa',
    password: 'Pampa2024+',
    database: 'u267385952_pampa'
}

// Ruta POST para agregar una línea a la tabla de pedidos semanales    OK
router.post('/semana', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });

    const orden = req.body;
    let pesototal = parseFloat(orden.peso1) + parseFloat(orden.peso2) + parseFloat(orden.peso3) + parseFloat(orden.peso4) + parseFloat(orden.peso5) + parseFloat(orden.peso6) + parseFloat(orden.peso7) + parseFloat(orden.peso8);
    orden.pesototal = pesototal;

    connection.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ error: 'Error iniciando la transacción' });
            connection.end();
            return;
        }

        const sqlInsertPedido = `INSERT INTO pedidos_semanales (cliente, fecha, pedido, peso1, peso2, peso3, peso4, peso5, peso6, peso7, peso8, pesototal, precio, preciointerno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        connection.query(sqlInsertPedido, [parseInt(orden.cliente), orden.fecha, orden.pedido, orden.peso1, orden.peso2, orden.peso3, orden.peso4, orden.peso5, orden.peso6, orden.peso7, orden.peso8, orden.pesototal, orden.precio, orden.preciointerno], (error, results) => {
            if (error) {
                return connection.rollback(() => {
                    res.status(500).json({ error: 'Error al insertar el pedido' });
                    connection.end();
                });
            }

            const sqlUpdateCliente = 'UPDATE clientes SET deuda = deuda + ? WHERE cliente = ?';
            connection.query(sqlUpdateCliente, [parseFloat(orden.precio), parseInt(orden.cliente)], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al actualizar el cliente' });
                        connection.end();
                    });
                }

                const sqlUpdateCliente1 = 'UPDATE clientes SET deuda = deuda + ? WHERE cliente = 1';
                connection.query(sqlUpdateCliente1, [parseFloat(orden.preciointerno)], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error al actualizar el cliente 1' });
                            connection.end();
                        });
                    }

                    const sqlUpdateEstadisticasDeuda = 'UPDATE estadisticas SET deuda = deuda + ? WHERE ID = 1';
                    connection.query(sqlUpdateEstadisticasDeuda, [parseFloat(orden.precio)], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error al actualizar deuda en estadísticas' });
                                connection.end();
                            });
                        }

                        const sqlInsertPedidoInterno = `INSERT INTO pedidos_semanales (cliente, fecha, pedido, peso1, peso2, peso3, peso4, peso5, peso6, peso7, peso8, pesototal, precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        connection.query(sqlInsertPedidoInterno, [1, orden.fecha, orden.pedido, orden.peso1, orden.peso2, orden.peso3, orden.peso4, orden.peso5, orden.peso6, orden.peso7, orden.peso8, orden.pesototal, orden.preciointerno], (error, results) => {
                            if (error) {
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Error al insertar pedido interno' });
                                    connection.end();
                                });
                            }

                            const sqlUpdateEstadisticasDeudaInterna = 'UPDATE estadisticas SET deudainterna = deudainterna + ? WHERE ID = 1';
                            connection.query(sqlUpdateEstadisticasDeudaInterna, [parseFloat(orden.preciointerno)], (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ error: 'Error al actualizar deuda interna' });
                                        connection.end();
                                    });
                                }

                                const sqlUpdateEstadisticasPedidos = 'UPDATE estadisticas SET pedidos = pedidos + 1 WHERE ID = 1';
                                connection.query(sqlUpdateEstadisticasPedidos, (err, result) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).json({ error: 'Error al actualizar pedidos en estadísticas' });
                                            connection.end();
                                        });
                                    }

                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                                                connection.end();
                                            });
                                        }
                                        console.log('Transacción completada con éxito');
                                        res.status(200).json({ message: 'Línea agregada correctamente', status: 200 });
                                        connection.end();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


router.post('/add/cliente', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });

    const newClient = req.body;

    // Datos del cliente a insertar
    const nuevoCliente = {
        cliente: parseInt(newClient.cliente),
        mocho: parseFloat(newClient.mocho),
        parrillero: parseFloat(newClient.parrillero),
        pecho: parseFloat(newClient.pecho),
        asado: parseFloat(newClient.asado),
        bifes: parseFloat(newClient.bifes),
        media1: parseFloat(newClient.media1),
        media2: parseFloat(newClient.media2),
        media3: parseFloat(newClient.media3),
        media4: parseFloat(newClient.media4),
        nombre: newClient.nombre,
        direccion: newClient.direccion,
        cuit: newClient.cuit,
        telefono: newClient.telefono,
        deuda: parseFloat(newClient.deuda)
    };

    connection.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ error: 'Error iniciando la transacción' });
            connection.end();
            return;
        }

        connection.query('INSERT INTO clientes SET ?', nuevoCliente, (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ error: 'Error interno del servidor', message: err });
                    console.log(err);
                    connection.end();
                });
            }

            const updateQuery = 'UPDATE estadisticas SET clientes = clientes + 1 WHERE ID = 1';
            connection.query(updateQuery, (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al actualizar estadísticas', message: err });
                        console.log(err);
                        connection.end();
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                            connection.end();
                        });
                    }
                    console.log('Transacción completada con éxito');
                    res.status(200).json({ message: 'Cliente creado con éxito!' });
                    connection.end();
                });
            });
        });
    });
});


router.put('/update/cliente/:cliente', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });

    const clienteID = req.params.cliente;
    const newClient = req.body;

    // Datos del cliente a actualizar
    const nuevoCliente = {
        cliente: parseInt(newClient.cliente),
        mocho: parseFloat(newClient.mocho),
        parrillero: parseFloat(newClient.parrillero),
        pecho: parseFloat(newClient.pecho),
        asado: parseFloat(newClient.asado),
        bifes: parseFloat(newClient.bifes),
        media1: parseFloat(newClient.media1),
        media2: parseFloat(newClient.media2),
        media3: parseFloat(newClient.media3),
        media4: parseFloat(newClient.media4),
        nombre: newClient.nombre,
        direccion: newClient.direccion,
        cuit: newClient.cuit,
        telefono: newClient.telefono
    };

    connection.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ error: 'Error iniciando la transacción' });
            connection.end();
            return;
        }

        const updateQuery = 'UPDATE clientes SET ? WHERE cliente = ?';
        connection.query(updateQuery, [nuevoCliente, clienteID], (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ error: 'Error al actualizar el cliente', message: err });
                    console.log(err);
                    connection.end();
                });
            }

            connection.commit((err) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                        connection.end();
                    });
                }
                console.log('Transacción completada con éxito');
                res.status(200).json({ message: 'Usuario actualizado con éxito' });
                connection.end();
            });
        });
    });
});


router.get('/clientes', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');

        // Consulta SQL para seleccionar todos los clientes
        const query = 'SELECT * FROM clientes';

        // Ejecutar la consulta SQL
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener los clientes: ', err);
                res.status(500).send('Error interno del servidor');
            } else {
                // Devolver los resultados como respuesta
                res.json(results);
            }
            connection.end();
        });
    });
});


router.get('/clientes/:cliente', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });
    const clienteID = req.params.cliente;

    // Consulta SQL para seleccionar todos los clientes
    const query = 'SELECT * FROM clientes WHERE cliente = ?';

    // Ejecutar la consulta SQL
    connection.query(query, [clienteID], (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes: ', err);
            res.status(500).send('Error interno del servidor');
            connection.end();
            return;
        }
        // Devolver los resultados como respuesta
        res.json(results);
        console.log(results);
    });
    connection.end();
});

router.get('/pedidos', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');

        // Consulta SQL para seleccionar todos los pedidos
        const queryPedidos = 'SELECT * FROM pedidos_semanales';

        // Ejecutar la consulta SQL para pedidos
        connection.query(queryPedidos, (err, pedidosResults) => {
            if (err) {
                console.error('Error al obtener los pedidos: ', err);
                res.status(500).send('Error interno del servidor');
                connection.end();
                return;
            }

            // Consulta SQL para seleccionar todas las transferencias
            const queryTransferencias = 'SELECT * FROM transferencias';

            // Ejecutar la consulta SQL para transferencias
            connection.query(queryTransferencias, (err, transferenciasResults) => {
                if (err) {
                    console.error('Error al obtener las transferencias: ', err);
                    res.status(500).send('Error interno del servidor');
                } else {
                    // Devolver los resultados como respuesta
                    res.json({ pedidos: pedidosResults, transferencias: transferenciasResults });
                }
                connection.end();
            });
        });
    });
});


router.get('/estadisticas', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });
    // Consulta SQL para seleccionar todos los clientes
    const query = 'SELECT * FROM estadisticas';

    // Ejecutar la consulta SQL
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes: ', err);
            res.status(500).send('Error interno del servidor');
            connection.end();
            return;
        }
        // Devolver los resultados como respuesta
        res.json(results);
    });
    connection.end();
});

router.put('/update/estadisticas/deuda', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });
    let newDeuda = parseFloat(req.body.deuda);

    const updateQuery = 'UPDATE estadisticas SET deuda = deuda + ? WHERE ID = 1';

    connection.query(updateQuery, [newDeuda], (err, result) => {
        if (err) {
            console.error('Error al actualizar el cliente: ' + err.message);
            console.log(err);
            res.status(500).send('Error interno del servidor');
        } else {
            console.log('Usuario actualizado con éxito');
            res.status(200).json({ message: 'Línea agregada correctamente', status: 200 });
        }
    });
    connection.end();
});

router.put('/transferencia', (req, res) => {
    const { fecha, tipo, monto, cliente } = req.body;

    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');

        connection.beginTransaction((err) => {
            if (err) {
                res.status(500).json({ error: 'Error iniciando la transacción' });
                connection.end();
                return;
            }

            //aca le sacamos la deuda al cliente
            const updateClienteQuery = 'UPDATE clientes SET deuda = deuda - ? WHERE cliente = ?';
            connection.query(updateClienteQuery, [parseFloat(monto), parseFloat(cliente)], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al actualizar el cliente', message: err.message });
                        console.log(err);
                        connection.end();
                    });
                }
                //aca sacamos la deuda de estadisticas
                const updateEstadisticasQuery1 = 'UPDATE estadisticas SET deuda = deuda - ? WHERE ID = 1';
                connection.query(updateEstadisticasQuery1, [parseFloat(monto)], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error al actualizar las estadísticas', message: err.message });
                            console.log(err);
                            connection.end();
                        });
                    }
                    //aca lo sacamos de la deuda interna de estadisticas
                    const updateEstadisticasQuery2 = 'UPDATE estadisticas SET deudainterna = GREATEST(deudainterna - ?, 0) WHERE ID = 1';
                    connection.query(updateEstadisticasQuery2, [parseFloat(monto)], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error al actualizar las estadísticas internas', message: err.message });
                                console.log(err);
                                connection.end();
                            });
                        }
                        const updateClienteQuery = 'UPDATE clientes SET deuda = GREATEST(deuda - ?, 0) WHERE cliente = 1';
                        connection.query(updateClienteQuery, [parseFloat(monto)], (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Error al actualizar el cliente', message: err.message });
                                    console.log(err);
                                    connection.end();
                                });
                            }

                            const insertTransferenciaQuery = 'INSERT INTO transferencias (cliente, fecha, tipo, cantidad) VALUES (?, ?, ?, ?)';
                            connection.query(insertTransferenciaQuery, [cliente, fecha, tipo, monto], (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ error: 'Error al insertar la transferencia', message: err.message });
                                        console.log(err);
                                        connection.end();
                                    });
                                }

                                connection.commit((err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                                            connection.end();
                                        });
                                    }
                                    console.log('Transacción completada con éxito');
                                    res.status(200).json({ message: 'Línea agregada correctamente', status: 200 });
                                    connection.end();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


router.get('/deudores', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });
    // Consulta SQL para seleccionar todos los clientes
    const query = 'SELECT * FROM clientes WHERE deuda > 0';

    // Ejecutar la consulta SQL
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes: ', err);
            res.status(500).send('Error interno del servidor');
            connection.end();
            return;
        }
        // Devolver los resultados como respuesta
        res.json(results);
    });
    connection.end();
});

router.get('/transferencia', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });
    // Consulta SQL para seleccionar todos los clientes
    const query = 'SELECT * FROM transferencias';

    // Ejecutar la consulta SQL
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes: ', err);
            res.status(500).send('Error interno del servidor');
            connection.end();
            return;
        }
        // Devolver los resultados como respuesta
        res.json(results);
    });
    connection.end();
});

router.delete('/transferencia', (req, res) => {
    const { id, cliente, precio } = req.body;

    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');

        connection.beginTransaction((err) => {
            if (err) {
                res.status(500).json({ error: 'Error iniciando la transacción' });
                connection.end();
                return;
            }

            // Borrar la transferencia
            const deleteQuery = 'DELETE FROM transferencias WHERE ID = ?';
            connection.query(deleteQuery, [id], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al borrar la transferencia', message: err.message });
                        console.log(err);
                        connection.end();
                    });
                }

                // Actualizar la deuda del cliente
                const updateClienteQuery = 'UPDATE clientes SET deuda = deuda + ? WHERE cliente = ?';
                connection.query(updateClienteQuery, [parseFloat(precio), parseFloat(cliente)], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error al actualizar el cliente', message: err.message });
                            console.log(err);
                            connection.end();
                        });
                    }
                    // Actualizar la deuda del cliente 1
                    const updateClienteQuery = 'UPDATE clientes SET deuda = deuda + ? WHERE cliente = 1';
                    connection.query(updateClienteQuery, [parseFloat(precio)], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error al actualizar el cliente', message: err.message });
                                console.log(err);
                                connection.end();
                            });
                        }

                        // Actualizar la deuda en estadísticas
                        const updateEstadisticasQuery1 = 'UPDATE estadisticas SET deuda = deuda + ? WHERE ID = 1';
                        connection.query(updateEstadisticasQuery1, [parseFloat(precio)], (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Error al actualizar las estadísticas', message: err.message });
                                    console.log(err);
                                    connection.end();
                                });
                            }

                            // Actualizar la deuda interna en estadísticas
                            const updateEstadisticasQuery2 = 'UPDATE estadisticas SET deudainterna = deudainterna + ? WHERE ID = 1';
                            connection.query(updateEstadisticasQuery2, [parseFloat(precio)], (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ error: 'Error al actualizar la deuda interna', message: err.message });
                                        console.log(err);
                                        connection.end();
                                    });
                                }

                                // Commit de la transacción
                                connection.commit((err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                                            connection.end();
                                        });
                                    }
                                    console.log('Transacción completada con éxito');
                                    res.status(200).json({ message: 'Operación completada correctamente', status: 200 });
                                    connection.end();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.delete('/pedidos', (req, res) => {
    const connection = mysql.createConnection(db);
    connection.connect((err) => {
        if (err) {
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        console.log('Conexión establecida correctamente');
    });

    const { id, cliente, precio, preciointerno } = req.body;

    connection.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ error: 'Error iniciando la transacción' });
            connection.end();
            return;
        }

        const deletePedidoQuery = 'DELETE FROM pedidos_semanales WHERE ID = ?';
        connection.query(deletePedidoQuery, [id], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ error: 'Error al borrar el pedido' });
                    connection.end();
                });
            }

            const updateClienteDeudaQuery = 'UPDATE clientes SET deuda = deuda - ? WHERE cliente = ?';
            connection.query(updateClienteDeudaQuery, [parseFloat(precio), parseInt(cliente)], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al actualizar la deuda del cliente' });
                        connection.end();
                    });
                }

                let updateEstadisticasDeudaQuery;
                if (parseInt(cliente) === 1) {
                    updateEstadisticasDeudaQuery = 'UPDATE estadisticas SET deudainterna = deudainterna - ? WHERE ID = 1';
                } else {
                    updateEstadisticasDeudaQuery = 'UPDATE estadisticas SET deuda = deuda - ? WHERE ID = 1';
                }

                connection.query(updateEstadisticasDeudaQuery, [parseFloat(precio)], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error al actualizar la deuda en estadísticas' });
                            connection.end();
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error al realizar commit de la transacción' });
                                connection.end();
                            });
                        }
                        console.log('Transacción completada con éxito');
                        res.status(200).json({ message: 'Operación completada correctamente', status: 200 });
                        connection.end();
                    });
                });
            });
        });
    });
});


export default router;
