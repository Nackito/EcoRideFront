# Protection XSS côté Backend - Recommandations

## Headers de sécurité HTTP à implémenter

```javascript
// Express.js
app.use((req, res, next) => {
  // Protection XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self' http://localhost:3010"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
```

## Validation et échappement des données

```javascript
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

// Middleware de validation
function sanitizeInput(req, res, next) {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      // Échapper les caractères HTML
      req.body[key] = validator.escape(req.body[key]);
      
      // Nettoyer le HTML si nécessaire
      if (key.includes('description') || key.includes('content')) {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    }
  });
  next();
}
```

## Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## Validation des tokens JWT

```javascript
const jwt = require('jsonwebtoken');

function validateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
```

## Packages recommandés

```bash
npm install helmet express-rate-limit validator isomorphic-dompurify
```

## Configuration Helmet (sécurité automatique)

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:3010"]
    },
  },
}));
```
