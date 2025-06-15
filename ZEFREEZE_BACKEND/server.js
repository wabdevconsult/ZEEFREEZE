require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
// Ajoutez ce require avec les autres en haut du fichier
const seedUsers = require('./config/seedUsers');
const seedCompany = require('./config/seedCompany'); // Add this line


class Application {

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 7500;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.runSeed(); // Ajoutez cette ligne
    this.runSeedC(); // Ajoutez cette ligne
  }
  
  initializeDatabase() {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      setTimeout(() => this.initializeDatabase(), 5000);
    });

    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    }).catch(err => {
      console.error('MongoDB initial connection error:', err);
      process.exit(1);
    });
  }

  // Mettre à jour la configuration CORS pour accepter plusieurs origines
getCorsOptions() {
  const allowedOrigins = [
    'https://www.zeefreeze.fr',
    'https://zeefreeze.fr',
    'http://localhost:5173', // Ajoutez cette ligne pour le développement local
  ];

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Powered-By'],
    maxAge: 600
  };
}
    async runSeedC() {
    try {
      // Wait for MongoDB connection to be established
      await mongoose.connection.asPromise();
      console.log('Running company seed...');
      await seedCompany();
    } catch (err) {
      console.error('Failed to run seed:', err);
    }
  }
  
  async runSeed() { // Ajoutez 'async' ici
    try {
      // Attendre que la connexion MongoDB soit établie
      await mongoose.connection.asPromise();
      console.log('Running user seed...');
      await seedUsers();
    } catch (err) {
      console.error('Failed to run seed:', err);
    }
  }
  initializeMiddlewares() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(mongoSanitize());
    this.app.use(hpp());
    
    // Body parsers
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    
    // CORS
    this.app.use(cors(this.getCorsOptions()));
    
    // Rate limiting
    this.app.use('/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: 'Too many requests from this IP, please try again later'
    }));
    
    // Request logging
    if (typeof requestLogger === 'function') {
      this.app.use(requestLogger);
    } else {
      console.error('requestLogger is not a function. Using basic logger instead.');
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  initializeRoutes() {
    console.log('Loading routes from:', path.join(__dirname, 'routes'));
    
    // Liste de toutes les routes requises
      const requiredRoutes = [
          'auth',
          'user',
          'equipment',
          'intervention',
          'reports',
          'client',
          'company',
          'materialkit',
          'message',
          'notification',
          'payment',
          'quote',
          'quoterequest',  // Nom du fichier sans 'Routes.js'
          'technician'
      ];
    
    const loadedRoutes = [];

    fs.readdirSync(path.join(__dirname, 'routes'))
      .forEach(file => {
        if (!file.endsWith('.js')) return;
        
        const routeName = file.replace('.js', '');
        let baseRouteName = routeName.replace('Routes', '').toLowerCase();
        
        // Cas particulier pour quoteRequest
        if (baseRouteName === 'quoterequest') {
          baseRouteName = 'quote-request';
        }
        
        const routePath = `/api/${baseRouteName}`;
        
        try {
          const route = require(path.join(__dirname, 'routes', file));
          this.app.use(routePath, route);
          loadedRoutes.push(baseRouteName.replace('-', '')); // Normalize for comparison
          console.log(`Route loaded: ${routePath}`);
        } catch (err) {
          console.error(`Error loading ${file}:`, err);
          process.exit(1);
        }
      });

    // Vérification des routes requises
   requiredRoutes.forEach(route => {
  const normalizedLoaded = loadedRoutes.map(r => r.toLowerCase());
  const normalizedRequired = route.toLowerCase();
  
  if (!normalizedLoaded.includes(normalizedRequired)) {
    console.error(`❌ Missing required route: ${route}`);
    process.exit(1);
  }
});

    console.log('All routes loaded successfully');
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
      });
    });
    
    // Global error handler
    this.app.use(errorHandler);
  }

  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`Server running on port ${this.port} in ${process.env.NODE_ENV} mode`);
      console.log(`Available routes:`);
      console.log(`- /auth`);
      console.log(`- /user`);
      console.log(`- /equipment`);
      console.log(`- /intervention`);
      console.log(`- /report`);
      console.log(`- /client`);
      console.log(`- /company`);
      console.log(`- /materialkit`);
      console.log(`- /message`);
      console.log(`- /notification`);
      console.log(`- /payment`);
      console.log(`- /quote`);
      console.log(`- /quote-request`);
      console.log(`- /technician`);
    });
  }
}

// Vérification du errorHandler
if (typeof errorHandler !== 'function') {
  console.error('Error: errorHandler is not a function');
  process.exit(1);
}

const app = new Application();
app.start();