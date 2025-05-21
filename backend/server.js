const express = require("express");
const session = require("express-session");
const path = require("path");
const { connectDB } = require('./db');
const cors = require('cors');
const sql = require('mssql');  
const bcrypt = require('bcrypt');

const PORT = 3000;
const app = express();

let pool; 

app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000', // Origen para desarrollo local
  'https://hypernovagaming.onrender.com' // Origen para producción en Render (reemplaza con tu URL real)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (por ejemplo, desde Postman) y solo acepta los orígenes que definimos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Acepta la solicitud
    } else {
      callback(new Error('No permitido por CORS')); // Rechaza la solicitud si no es de un origen permitido
    }
  },
  credentials: true // Habilita el uso de cookies si es necesario
}));

app.use(session({
  secret: 'ECC14DMIN', 
  resave: false,      
  saveUninitialized: true, 
  cookie: {
    secure: false,         
    httpOnly: true,        
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Conexión a Base de Datos

let db; // Guardaremos la conexión aquí

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Conexión y arranque del servidor
connectDB().then(connection => {
  db = connection;

  app.locals.db = db; // opcional, por si quieres acceder desde rutas

  app.listen(PORT, () => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : `http://localhost:${PORT}`;
      
    console.log(`Servidor corriendo en ${baseUrl}`);
  });
}).catch(err => {
  console.error('No se pudo conectar a la base de datos:', err.message);
});


// Servir el frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get('/check-session', (req, res) => {
  if (req.session.user) {
    console.log('Usuario en sesión:', req.session.user);  
    res.json({ success: true, user: req.session.user }); 
  } else {
    res.json({ success: false });
  }
});



// CUENTA // 

// Registro
app.post('/register', async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    birthdate,
    country,
    city,
    address
  } = req.body;

  try {
    const connection = await connectDB();

    // Verifica si el usuario o correo ya existen
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      const userExists = existing.find(u => u.username === username);
      const emailExists = existing.find(u => u.email === email);
      const message = userExists ? 'El nombre de usuario ya está en uso.' :
                        emailExists ? 'El correo electrónico ya está registrado.' :
                        'Usuario o correo ya existentes.';
      return res.status(400).json({ success: false, message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    // Realiza la inserción del nuevo usuario
    await connection.execute(
      `INSERT INTO users (username, email, password, first_name, last_name, birthdate, country, city, address, created_at, updated_at, user_type_id, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1)`, 
      [username, email, hashedPassword, first_name || null, last_name || null, birthdate || null, country || null, city || null, address || null, now, now]
    );

    res.json({ success: true, message: 'Usuario registrado exitosamente' });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validación del nombre de usuario
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'El nombre de usuario solo puede contener letras y números.'
    });
  }

  try {
    // Conexión a la base de datos
    const connection = await connectDB();

    // Verificar si el usuario existe en la base de datos
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      const user = existing[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        console.log('user_type_id:', user.user_type_id); // Verificar el valor de user_type_id

        // Guardar detalles del usuario en la sesión
        req.session.user = {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          user_type_id: user.user_type_id,
          isAdmin: user.user_type_id === 1 // Asumiendo que 1 es para admin
        };

        return res.json({ success: true, user_id: user.user_id, user_type_id: user.user_type_id });
      } else {
        return res.json({ success: false, message: 'Contraseña incorrecta' });
      }
    } else {
      return res.json({ success: false, message: 'Usuario no existe' });
    }
  } catch (err) {
    console.error('Error al consultar SQL Server:', err);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});


// Mi cuenta
app.get('/account', async (req, res) => {
  if (!req.session.user || !req.session.user.username) {
    console.log("Sesión no autorizada");
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  try {
    console.log("Sesión autorizada");

    const connection = await connectDB();  // ✅ conexión estilo MySQL

    const [rows] = await connection.execute(
      'SELECT username, email, first_name, last_name, birthdate, country, city, address FROM users WHERE username = ?',
      [req.session.user.username]
    );

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener datos del usuario:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});


// Update Account
app.put('/account', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const {
    email,
    first_name,
    last_name,
    birthdate,
    country,
    city,
    address
  } = req.body;

  try {
    const connection = await connectDB();  // ✅ conexión estilo MySQL

    const updated_at = new Date();

    await connection.execute(`
      UPDATE users SET 
        email = ?,
        first_name = ?,
        last_name = ?,
        birthdate = ?,
        country = ?,
        city = ?,
        address = ?,
        updated_at = ?
      WHERE user_id = ?
    `, [
      email,
      first_name || null,
      last_name || null,
      birthdate || null,
      country || null,
      city || null,
      address || null,
      updated_at,
      req.session.user.user_id
    ]);

    await connection.execute(`
      INSERT INTO user_activity_log
        (user_id, action, timestamp, details)
      VALUES
        (?, 'update_account', NOW(), ?)
    `, [
      req.session.user.user_id,
      `Actualizó perfil: email=${email}, name=${first_name} ${last_name}, birthdate=${birthdate}, country=${country}, city=${city}, address=${address}`
    ]);

    console.log("Datos actualizados correctamente:", req.body);
    res.json({ success: true, message: 'Datos actualizados correctamente' });

  } catch (err) {
    console.error('Error al actualizar cuenta:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


// Ruta para probar la conexión
app.get("/test-db", async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute("SELECT 1 AS resultado");

    if (rows.length > 0) {
      res.json(rows); // Devuelve el resultado como JSON
    } else {
      res.status(404).send("No se encontraron registros");
    }

    await connection.end(); // Cierra la conexión (importante)
  } catch (err) {
    console.error("Error al consultar la base de datos:", err.message);
    res.status(500).send("Error al consultar la base de datos");
  }
});

// Perfil
app.get('/profile', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.status(401).json({ loggedIn: false });
  }
});

app.listen(PORT, () => {
  const url = process.env.NODE_ENV === 'production'
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'https://hypernovagaming.onrender.com'}`
    : `http://localhost:${PORT}`;

  console.log(`Servidor escuchando en ${url}`);
});

// Cerar Sesión
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // Opcional: limpia la cookie de sesión
    res.json({ success: true });
  });
});

// TORNEOS // 

app.get('/tournaments', async (req, res) => {
  try {
    const { isAdmin } = req.session || {}; // Aseguramos que exista session

    const connection = await connectDB();

    let query = `
      SELECT 
        t.tournament_id,
        t.name,
        t.description,
        t.start_date,
        t.end_date,
        t.registration_fee,
        t.max_participants,
        COUNT(r.registration_id) AS current_participants,
        t.status,
        t.winner_id,
        u.username AS winner_username
      FROM tournaments t
      LEFT JOIN tournament_registrations r 
        ON t.tournament_id = r.tournament_id AND r.status = 'Inscrito'
      LEFT JOIN users u 
        ON t.winner_id = u.user_id
    `;

    const queryParams = [];

    // Si no es admin, filtrar torneos inactivos
    if (!isAdmin) {
      query += " WHERE t.status IN (2,3)"; // Activo o Finalizado
    }

    query += `
      GROUP BY 
        t.tournament_id,
        t.name,
        t.description,
        t.start_date,
        t.end_date,
        t.registration_fee,
        t.max_participants,
        t.status,
        t.winner_id,
        u.username
      ORDER BY t.start_date DESC
    `;

    const [rows] = await connection.execute(query, queryParams);

    res.json({ success: true, tournaments: rows });
  } catch (err) {
    console.error('Error al obtener torneos:', err);
    res.status(500).json({ success: false, message: 'Error del servidor al obtener torneos' });
  }
});

app.post('/tournaments', async (req, res) => {
  const {
    name,
    description,
    start_date,
    end_date,
    registration_fee,
    max_participants
  } = req.body;

  // Validación básica de campos requeridos
  if (!name || !start_date || !end_date || registration_fee === undefined || max_participants === undefined) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const connection = await connectDB();

    const now = new Date();

    await connection.execute(
      `INSERT INTO tournaments 
        (name, description, start_date, end_date, registration_fee, max_participants, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        new Date(start_date),
        new Date(end_date),
        registration_fee,
        max_participants,
        now,
        2 // status por defecto: Activo
      ]
    );

    res.status(201).json({ message: 'Torneo creado correctamente' });

  } catch (error) {
    console.error('Error al crear el torneo:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear el torneo' });
  }
});

app.get('/tournaments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectDB();

    const [rows] = await connection.execute(
      'SELECT * FROM tournaments WHERE tournament_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Error al obtener torneo:', err);
    res.status(500).json({ message: 'Error al obtener torneo' });
  }
});

app.put('/tournaments/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    start_date,
    end_date,
    registration_fee,
    max_participants
  } = req.body;

  if (!name || !start_date || !end_date || registration_fee === undefined || max_participants === undefined) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const connection = await connectDB();

    const [result] = await connection.execute(
      `UPDATE tournaments
       SET 
         name = ?,
         description = ?,
         start_date = ?,
         end_date = ?,
         registration_fee = ?,
         max_participants = ?
       WHERE tournament_id = ?`,
      [name, description || '', new Date(start_date), new Date(end_date), registration_fee, max_participants, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.status(200).json({ message: 'Torneo actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar torneo:', err);
    res.status(500).json({ message: 'Error al actualizar el torneo' });
  }
});

app.put('/tournaments/status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    return res.status(400).json({ message: 'Estado no proporcionado' });
  }

  try {
    const connection = await connectDB();

    const [result] = await connection.execute(
      `UPDATE tournaments
       SET status = ?
       WHERE tournament_id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.status(200).json({ message: 'Estado del torneo actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar estado del torneo:', err);
    res.status(500).json({ message: 'Error al actualizar el estado del torneo' });
  }
});

app.delete('/tournaments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectDB();

    const [result] = await connection.execute(
      'DELETE FROM tournaments WHERE tournament_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.json({ message: 'Torneo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar torneo:', err);
    res.status(500).json({ message: 'Error interno al eliminar torneo' });
  }
});

app.get('/tournaments/:id/participants', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectDB();

    const [rows] = await connection.execute(`
      SELECT 
        u.user_id, 
        u.username
      FROM tournament_registrations tr
      INNER JOIN users u ON tr.user_id = u.user_id
      WHERE tr.tournament_id = ?
    `, [id]);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al obtener participantes del torneo:', err);
    res.status(500).json({ message: 'Error al obtener los participantes' });
  }
});

app.post('/tournaments/:id/winner', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const connection = await connectDB();

    // Verificar si el usuario está registrado en el torneo
    const [userCheck] = await connection.execute(
      `SELECT 1 FROM tournament_registrations 
       WHERE tournament_id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'El usuario no está inscrito en este torneo.' });
    }

    // Asignar ganador y finalizar torneo (status = 2)
    const [result] = await connection.execute(
      `UPDATE tournaments 
       SET winner_id = ?, status = 2 
       WHERE tournament_id = ?`,
      [user_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado o ya finalizado' });
    }

    res.status(200).json({ message: 'Ganador asignado correctamente.' });

  } catch (err) {
    console.error('Error al asignar ganador:', err);
    res.status(500).json({ message: 'Error al asignar el ganador' });
  }
});

app.get('/user-registrations', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });

  try {
    const connection = await connectDB();

    // Obtener los torneos a los que el usuario está inscrito
    const [result] = await connection.execute(
      'SELECT tournament_id FROM tournament_registrations WHERE user_id = ?',
      [req.session.user.user_id]
    );

    const inscritos = result.map(row => row.tournament_id);

    res.json({ success: true, inscritos });

  } catch (err) {
    console.error("Error al obtener inscripciones:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

app.post('/inscribirse', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  const { tournament_id } = req.body;
  const user_id = req.session.user.user_id;

  try {
    const connection = await connectDB();

    // Insertar inscripción del usuario en el torneo
    const [result] = await connection.execute(
      `INSERT INTO tournament_registrations
         (user_id, tournament_id, registration_date, status)
       VALUES (?, ?, NOW(), 'Inscrito')`,
      [user_id, tournament_id]
    );

    res.json({
      success: true,
      message: 'Inscripción exitosa',
      registration_id: result.insertId
    });

  } catch (err) {
    console.error('Error al inscribirse:', err);
    res.status(500).json({ success: false, message: 'Error en la inscripción' });
  }
});

app.get('/users', async (req, res) => {
  // Validar sesión y rol de administrador
  if (!req.session || !req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }

  try {
    const connection = await connectDB();

    // Consulta para obtener todos los usuarios
    const [users] = await connection.execute(
      'SELECT * FROM users ORDER BY username'
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ success: false, message: 'Error del servidor al obtener usuarios' });
  }
});

app.put('/users/active/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const connection = await connectDB();

    // Actualizar el estado de un usuario (activo o inactivo)
    const [result] = await connection.execute(
      'UPDATE users SET active = ? WHERE user_id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar Usuario:', err);
    res.status(500).json({ message: 'Error al actualizar el Usuario' });
  }
});

app.put('/users/type/:id', async (req, res) => {
  const { id } = req.params;
  const { user_type_id } = req.body;

  try {
    const connection = await connectDB();

    // Actualizar el tipo de usuario (1: Admin, 2: Usuario)
    const [result] = await connection.execute(
      'UPDATE users SET user_type_id = ? WHERE user_id = ?',
      [user_type_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Tipo de usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error al cambiar tipo de usuario:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.post('/payments', async (req, res) => {
  const { registration_id, payment_date, amount, currency, payment_method, payment_status } = req.body;

  console.log(req.body);

  if (!registration_id || !payment_date || !amount || !currency || !payment_method || !payment_status) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    const connection = await connectDB(); // Tu función de conexión desde `db.js`

    const [result] = await connection.execute(
      `INSERT INTO payments (registration_id, payment_date, amount, currency, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [registration_id, payment_date, amount, currency, payment_method, payment_status]
    );

    res.status(201).json({
      success: true,
      message: 'Pago registrado correctamente',
      payment_id: result.insertId
    });

  } catch (error) {
    console.error('Error al insertar el pago:', error);
    res.status(500).json({ message: 'Error del servidor al insertar el pago' });
  }
});


// PAYPAL
const paypalRoutes = require('./routes/paypalRoutes');

app.use(express.json());

// Usar las rutas de PayPal con prefijo /api
app.use('/api', paypalRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

app.get('/api/my-tournaments/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log("id:", userId);

  try {
    const [rows] = await db.query(`
        SELECT 
        t.name AS nombre_torneo,
        t.start_date AS fecha_inicio,
        ts.description AS estado,
        tr.user_id
      FROM tournament_registrations tr
      JOIN tournaments t ON tr.tournament_id = t.tournament_id
      LEFT JOIN tournament_statuses ts ON t.status = ts.id
      WHERE tr.user_id = ?;

    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Error consultando torneos del usuario:', err);
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});
