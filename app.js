const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const utilizadorRoutes = require('./routes/utilizadorRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const permissaoRoutes = require('./routes/permissaoRoutes');
const perfilPermissaoRoutes = require('./routes/perfilPermissaoRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const planoRoutes = require('./routes/planoRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const areaTematicaRoutes = require('./routes/areaTematicaRoutes');
const propostaRoutes = require('./routes/propostaRoutes');
const reunioesRoutes = require('./routes/reuniaoRoutes');
const app = express();

app.use(express.json()); 

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


// Rotas
app.use('/api', authRoutes);
app.use('/api', utilizadorRoutes);
app.use('/api', perfilRoutes);
app.use('/api', permissaoRoutes);
app.use('/api/perfis', perfilPermissaoRoutes);
app.use('/api', projetoRoutes);
app.use('/api', planoRoutes);
app.use('/api', atividadeRoutes);
app.use('/api', areaTematicaRoutes);
app.use('/api', propostaRoutes);
app.use('/api/', reunioesRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});

