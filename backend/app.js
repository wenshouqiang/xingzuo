require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const testsRoutes = require('./routes/tests');
const reportsRoutes = require('./routes/reports');
const alipayRoutes = require('./routes/alipay');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alipay', alipayRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));