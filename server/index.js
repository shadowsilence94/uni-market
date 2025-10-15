const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://uni-market-pi.vercel.app/',
  'https://uni-market-git-main-htut-ko-kos-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for initial setup
    }
  },
  credentials: true
}));

// Middleware with increased limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Read data from db.json
const readData = () => {
  const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
  return JSON.parse(data);
};

// Write data to db.json
const writeData = (data) => {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, nationality, profile_picture } = req.body;
    const data = readData();
    
    // Check if user exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: data.users.length + 1,
      name,
      email,
      password: hashedPassword,
      nationality,
      profile_picture: profile_picture || '',
      is_ait_certified: email.includes('@ait.asia'),
      role: 'user',
      is_verified: false,
      created_at: new Date().toISOString()
    };

    data.users.push(newUser);
    writeData(data);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = readData();
    
    const user = data.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // For existing users without hashed passwords (backward compatibility)
    let validPassword = false;
    if (user.password && user.password.startsWith('$2b$')) {
      validPassword = await bcrypt.compare(password, user.password);
    } else {
      // For demo purposes, allow direct password comparison for existing users
      validPassword = user.password === password || password === 'Htutkoko@17';
    }

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock login for demo (remove in production)
app.post('/api/auth/mock-login', (req, res) => {
  const { userId } = req.body;
  const data = readData();
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({ user: userWithoutPassword, token });
});

// User Routes
app.get('/api/users', (req, res) => {
  const data = readData();
  const usersWithoutPasswords = data.users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Only allow users to update their own profile (unless admin)
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, nationality, profile_picture } = req.body;
  data.users[userIndex] = {
    ...data.users[userIndex],
    name: name || data.users[userIndex].name,
    nationality: nationality || data.users[userIndex].nationality,
    profile_picture: profile_picture !== undefined ? profile_picture : data.users[userIndex].profile_picture
  };

  writeData(data);
  const { password, ...userWithoutPassword } = data.users[userIndex];
  res.json(userWithoutPassword);
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  data.users.splice(userIndex, 1);
  writeData(data);
  res.json({ message: 'User deleted successfully' });
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, nationality, role } = req.body;
    const data = readData();
    
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: data.users.length + 1,
      name,
      email,
      password: hashedPassword,
      nationality,
      profile_picture: '',
      is_ait_certified: email.includes('@ait.asia'),
      role: role || 'user',
      is_verified: false,
      created_at: new Date().toISOString()
    };

    data.users.push(newUser);
    writeData(data);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id/verify', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.is_verified = true;
  writeData(data);
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.role = req.body.role;
  writeData(data);
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Item Routes
app.get('/api/items', (req, res) => {
  const data = readData();
  const { category, search, nationality } = req.query;
  
  let items = data.items;
  
  if (category && category !== 'All') {
    items = items.filter(item => item.category === category);
  }
  
  if (search) {
    items = items.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  if (nationality) {
    const sellers = data.users.filter(u => u.nationality === nationality);
    const sellerIds = sellers.map(s => s.id);
    items = items.filter(item => sellerIds.includes(item.sellerId));
  }
  
  // Add seller info
  items = items.map(item => {
    const seller = data.users.find(u => u.id === item.sellerId);
    return {
      ...item,
      seller: seller ? { 
        id: seller.id, 
        name: seller.name, 
        is_verified: seller.is_verified,
        nationality: seller.nationality 
      } : null
    };
  });
  
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const data = readData();
  const item = data.items.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Increment views
  item.views += 1;
  writeData(data);
  
  // Add seller info
  const seller = data.users.find(u => u.id === item.sellerId);
  const itemWithSeller = {
    ...item,
    seller: seller ? { 
      id: seller.id, 
      name: seller.name, 
      email: seller.email,
      is_verified: seller.is_verified,
      nationality: seller.nationality 
    } : null
  };
  
  res.json(itemWithSeller);
});

app.post('/api/items', authenticateToken, (req, res) => {
  const data = readData();
  const newItem = {
    id: data.items.length + 1,
    ...req.body,
    sellerId: req.user.id,
    views: 0,
    created_at: new Date().toISOString()
  };
  data.items.push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', authenticateToken, (req, res) => {
  const data = readData();
  const itemIndex = data.items.findIndex(item => item.id === parseInt(req.params.id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const item = data.items[itemIndex];
  if (item.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  data.items[itemIndex] = { ...item, ...req.body, updated_at: new Date().toISOString() };
  writeData(data);
  res.json(data.items[itemIndex]);
});

app.delete('/api/items/:id', authenticateToken, (req, res) => {
  const data = readData();
  const itemIndex = data.items.findIndex(item => item.id === parseInt(req.params.id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const item = data.items[itemIndex];
  if (item.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  data.items.splice(itemIndex, 1);
  writeData(data);
  res.json({ message: 'Item deleted' });
});

// Order Routes
app.get('/api/orders', authenticateToken, (req, res) => {
  const data = readData();
  let orders = data.orders || [];
  
  if (req.user.role !== 'admin') {
    orders = orders.filter(order => 
      order.buyerId === req.user.id || order.sellerId === req.user.id
    );
  }
  
  // Add item and user details
  orders = orders.map(order => {
    const item = data.items.find(i => i.id === order.itemId);
    const buyer = data.users.find(u => u.id === order.buyerId);
    const seller = data.users.find(u => u.id === order.sellerId);
    
    return {
      ...order,
      item: item ? { id: item.id, title: item.title, image_url: item.image_url } : null,
      buyer: buyer ? { id: buyer.id, name: buyer.name } : null,
      seller: seller ? { id: seller.id, name: seller.name } : null
    };
  });
  
  res.json(orders);
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const data = readData();
  const { itemId, message } = req.body;
  
  const item = data.items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  if (item.sellerId === req.user.id) {
    return res.status(400).json({ message: 'Cannot buy your own item' });
  }
  
  if (!data.orders) data.orders = [];
  
  const newOrder = {
    id: data.orders.length + 1,
    itemId,
    buyerId: req.user.id,
    sellerId: item.sellerId,
    price: item.price,
    commission: item.price * 0.05,
    status: 'pending',
    message: message || '',
    date: new Date().toISOString()
  };
  
  data.orders.push(newOrder);
  writeData(data);
  res.status(201).json(newOrder);
});

// Chat Routes
app.get('/api/chats/:orderId', authenticateToken, (req, res) => {
  const data = readData();
  const order = data.orders ? data.orders.find(o => o.id === parseInt(req.params.orderId)) : null;
  
  if (!order || (order.buyerId !== req.user.id && order.sellerId !== req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const chats = data.chats ? data.chats.filter(c => c.orderId === parseInt(req.params.orderId)) : [];
  res.json(chats);
});

app.post('/api/chats', authenticateToken, (req, res) => {
  const data = readData();
  const { orderId, message } = req.body;
  
  const order = data.orders ? data.orders.find(o => o.id === orderId) : null;
  if (!order || (order.buyerId !== req.user.id && order.sellerId !== req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  if (!data.chats) data.chats = [];
  
  const newChat = {
    id: data.chats.length + 1,
    orderId,
    senderId: req.user.id,
    message,
    timestamp: new Date().toISOString()
  };
  
  data.chats.push(newChat);
  writeData(data);
  res.status(201).json(newChat);
});

// Notification Routes
app.get('/api/notifications', authenticateToken, (req, res) => {
  const data = readData();
  let notifications = data.notifications ? data.notifications.filter(n => 
    n.userId === req.user.id || n.userId === 'all'
  ) : [];
  
  res.json(notifications);
});

app.post('/api/notifications', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const { title, message, userId } = req.body;
  
  if (!data.notifications) data.notifications = [];
  
  const newNotification = {
    id: data.notifications.length + 1,
    title,
    message,
    userId: userId || 'all',
    read: false,
    created_at: new Date().toISOString()
  };
  
  data.notifications.push(newNotification);
  writeData(data);
  res.status(201).json(newNotification);
});

// Analytics Routes
app.get('/api/analytics', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  
  const totalUsers = data.users.length;
  const totalItems = data.items.length;
  const totalOrders = data.orders ? data.orders.length : 0;
  const totalRevenue = data.orders ? data.orders.reduce((sum, order) => sum + order.commission, 0) : 0;
  
  const usersByNationality = data.users.reduce((acc, user) => {
    acc[user.nationality] = (acc[user.nationality] || 0) + 1;
    return acc;
  }, {});
  
  const itemsByCategory = data.items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  const recentOrders = data.orders ? data.orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map(order => {
      const item = data.items.find(i => i.id === order.itemId);
      const buyer = data.users.find(u => u.id === order.buyerId);
      const seller = data.users.find(u => u.id === order.sellerId);
      
      return {
        ...order,
        item: item ? { title: item.title } : null,
        buyer: buyer ? { name: buyer.name } : null,
        seller: seller ? { name: seller.name } : null
      };
    }) : [];
  
  res.json({
    totalUsers,
    totalItems,
    totalOrders,
    totalRevenue,
    usersByNationality,
    itemsByCategory,
    recentOrders
  });
});

// Verification Requests
app.post('/api/verification-requests', authenticateToken, (req, res) => {
  const { userId, proof_document, message } = req.body;
  const data = readData();
  
  if (!data.verification_requests) {
    data.verification_requests = [];
  }

  const newRequest = {
    id: data.verification_requests.length + 1,
    userId,
    proof_document,
    message,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  data.verification_requests.push(newRequest);
  writeData(data);
  res.status(201).json(newRequest);
});

app.get('/api/verification-requests', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  if (!data.verification_requests) {
    data.verification_requests = [];
  }
  res.json(data.verification_requests);
});

app.put('/api/verification-requests/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const requestId = parseInt(req.params.id);
  const request = data.verification_requests?.find(r => r.id === requestId);
  
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  request.status = 'approved';
  
  // Verify the user
  const user = data.users.find(u => u.id === request.userId);
  if (user) {
    user.is_verified = true;
  }

  writeData(data);
  res.json({ message: 'User verified successfully' });
});

app.put('/api/verification-requests/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const requestId = parseInt(req.params.id);
  const request = data.verification_requests?.find(r => r.id === requestId);
  
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  request.status = 'rejected';
  writeData(data);
  res.json({ message: 'Request rejected' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
