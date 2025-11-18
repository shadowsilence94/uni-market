const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendVerificationEmail, sendPurchaseConfirmation } = require('./emailService');
const stripe = require('./stripe');

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
    
    // Generate verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const newUser = {
      id: data.users.length + 1,
      name,
      email,
      password: hashedPassword,
      nationality,
      profile_picture: profile_picture || '',
      is_ait_certified: email.includes('@ait.asia'),
      role: 'user',
      is_verified: false, // Not verified initially but can still use basic features
      verification_token: verificationToken,
      verification_expires: verificationExpires.toISOString(),
      created_at: new Date().toISOString()
    };

    data.users.push(newUser);
    writeData(data);

    // Send verification email (for advanced features access)
    try {
      await sendVerificationEmail(email, name, verificationToken);
      console.log(`📧 Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError);
      // Don't fail registration if email fails
    }

    // Generate token and log them in immediately
    const token = jwt.sign({ 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name,
      role: newUser.role 
    }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, verification_token: __, ...userWithoutSensitiveData } = newUser;
    
    res.status(201).json({ 
      message: 'Registration successful! Verify your email to access advanced features like chat and payments.',
      user: userWithoutSensitiveData,
      token, // Send token to log them in
      requiresVerification: false // Don't block login
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Check if email is verified (just for info, don't block login)
    // Unverified users can login but can't access advanced features

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

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    }, JWT_SECRET);
    const { password: _, verification_token: __, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email endpoint
app.get('/api/auth/verify-email/:token', (req, res) => {
  try {
    const { token } = req.params;
    const data = readData();
    
    const user = data.users.find(u => u.verification_token === token);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    // Check if token has expired
    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ message: 'Verification link has expired. Please request a new one.' });
    }
    
    // Mark user as verified
    user.is_verified = true;
    user.verification_token = null;
    user.verification_expires = null;
    
    writeData(data);
    
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const data = readData();
    
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.is_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.verification_token = verificationToken;
    user.verification_expires = verificationExpires.toISOString();
    
    writeData(data);
    
    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);
    
    res.json({ message: 'Verification email sent! Please check your inbox.' });
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

  const token = jwt.sign({ 
    id: user.id, 
    email: user.email, 
    name: user.name,
    role: user.role 
  }, JWT_SECRET);
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
  const { category, search, nationality, tag } = req.query;
  
  let items = data.items;
  
  if (category && category !== 'All') {
    items = items.filter(item => item.category === category);
  }
  
  if (tag) {
    // Filter by exact tag match
    items = items.filter(item => 
      item.tags && item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
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
        nationality: seller.nationality,
        profile_picture: seller.profile_picture || ''
      } : null
    };
  });
  
  res.json(items);
});

// Get tag statistics (admin only) - Must be before /api/tags
app.get('/api/tags/stats', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const tagStats = {};
  
  // Count tag usage across all items
  data.items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { tag, count: 0, category: item.category };
        }
        tagStats[tag].count++;
      });
    }
  });
  
  // Convert to array and sort by count
  const tagArray = Object.values(tagStats).sort((a, b) => b.count - a.count);
  res.json(tagArray);
});

// Merge tags (admin only)
app.post('/api/tags/merge', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const { sourceTag, targetTag } = req.body;
  let mergedCount = 0;
  
  if (!sourceTag || !targetTag) {
    return res.status(400).json({ message: 'Source and target tags are required' });
  }
  
  data.items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      const hasSource = item.tags.includes(sourceTag);
      if (hasSource) {
        // Remove source tag
        item.tags = item.tags.filter(tag => tag !== sourceTag);
        // Add target tag if not already present
        if (!item.tags.includes(targetTag)) {
          item.tags.push(targetTag);
        }
        mergedCount++;
      }
    }
  });
  
  writeData(data);
  res.json({ message: `Merged "${sourceTag}" into "${targetTag}" in ${mergedCount} items`, mergedCount });
});

// Delete a tag from all items (admin only)
app.delete('/api/tags/:tag', authenticateToken, requireAdmin, (req, res) => {
  const data = readData();
  const tagToDelete = decodeURIComponent(req.params.tag);
  let deletedCount = 0;
  
  data.items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      const originalLength = item.tags.length;
      item.tags = item.tags.filter(tag => tag !== tagToDelete);
      if (item.tags.length < originalLength) {
        deletedCount++;
      }
    }
  });
  
  writeData(data);
  res.json({ message: `Tag removed from ${deletedCount} items`, deletedCount });
});

// Get tags by category - Must be last
app.get('/api/tags', (req, res) => {
  const data = readData();
  const { category } = req.query;
  
  let items = data.items;
  
  // Filter by category if provided
  if (category && category !== 'All') {
    items = items.filter(item => item.category === category);
  }
  
  // Extract all unique tags
  const tags = [...new Set(items.flatMap(item => item.tags || []))].sort();
  
  res.json(tags);
});

app.get('/api/items/:id', (req, res) => {
  const data = readData();
  const item = data.items.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Add seller info
  const seller = data.users.find(u => u.id === item.sellerId);
  const itemWithSeller = {
    ...item,
    seller: seller ? { 
      id: seller.id, 
      name: seller.name, 
      email: seller.email,
      is_verified: seller.is_verified,
      nationality: seller.nationality,
      profile_picture: seller.profile_picture || ''
    } : null
  };
  
  res.json(itemWithSeller);
});

// Increment view count for an item
app.post('/api/items/:id/view', (req, res) => {
  const data = readData();
  const item = data.items.find(item => item.id === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Increment views
  item.views = (item.views || 0) + 1;
  writeData(data);
  
  res.json({ views: item.views });
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
  
  let notifications = data.notifications ? data.notifications.filter(n => {
    return Number(n.userId) === Number(req.user.id) || n.userId === 'all';
  }) : [];
  
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
    userId: userId === 'all' ? 'all' : Number(userId),
    read: false,
    created_at: new Date().toISOString()
  };
  
  data.notifications.push(newNotification);
  writeData(data);
  res.status(201).json(newNotification);
});

// Contact form endpoint (allows regular users to send messages to admins)
app.post('/api/contact', authenticateToken, (req, res) => {
  const data = readData();
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }
  
  if (!data.notifications) data.notifications = [];
  
  // Get all admin users
  const adminUsers = data.users.filter(u => u.role === 'admin');
  
  if (adminUsers.length === 0) {
    return res.status(404).json({ message: 'No admin users found' });
  }
  
  // Create notification for each admin
  const notifications = [];
  adminUsers.forEach(admin => {
    const newNotification = {
      id: data.notifications.length + 1 + notifications.length,
      title: `Contact from ${req.user.name || req.user.email || 'Unknown User'}`,
      message: message,
      userId: admin.id,
      read: false,
      created_at: new Date().toISOString()
    };
    data.notifications.push(newNotification);
    notifications.push(newNotification);
  });
  
  writeData(data);
  res.status(201).json({ 
    message: 'Message sent successfully',
    notificationsSent: notifications.length 
  });
});

app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.createPaymentIntent(amount, currency);
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/notifications/:id', authenticateToken, (req, res) => {
  const data = readData();
  const notificationId = parseInt(req.params.id);
  const { read } = req.body;
  
  if (!data.notifications) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  const notification = data.notifications.find(n => n.id === notificationId);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user has access to this notification
  const canAccess = notification.userId === req.user.id || 
                   notification.userId === 'all' || 
                   notification.userId === "all" ||
                   notification.userId === null;
  
  if (!canAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  notification.read = read;
  writeData(data);
  res.json(notification);
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const data = readData();
  const notificationId = parseInt(req.params.id);
  
  if (!data.notifications) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  const notification = data.notifications.find(n => n.id === notificationId);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user has access to this notification
  const canAccess = notification.userId === req.user.id || 
                   notification.userId === 'all' || 
                   notification.userId === "all" ||
                   notification.userId === null;
  
  if (!canAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  notification.read = true;
  writeData(data);
  res.json(notification);
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

// Chat/Conversation Routes
app.get('/api/conversations', authenticateToken, (req, res) => {
  try {
    const data = readData();
    
    // Initialize conversations array if it doesn't exist
    if (!data.conversations) {
      data.conversations = [];
    }
    
    // Get conversations where user is buyer or seller
    const userConversations = data.conversations.filter(
      conv => conv.buyer_id === req.user.id || conv.seller_id === req.user.id
    );
    
    // Format conversations with other user info and item details
    const formattedConversations = userConversations.map(conv => {
      const otherId = conv.buyer_id === req.user.id ? conv.seller_id : conv.buyer_id;
      const otherUser = data.users?.find(u => u.id === otherId);
      const item = data.items?.find(i => i.id === conv.item_id);
      
      // Get last message for this conversation
      const conversationMessages = data.messages?.filter(m => m.conversation_id === conv.id) || [];
      const lastMsg = conversationMessages.length > 0 
        ? conversationMessages[conversationMessages.length - 1].message 
        : conv.last_message || '';
      
      return {
        ...conv,
        other_user_name: otherUser?.name || 'Unknown User',
        item_title: item?.title || 'Item not found',
        last_message: lastMsg,
        unread_count: conv.unread_count || 0
      };
    });
    
    // Sort by most recent update
    formattedConversations.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

app.post('/api/conversations', authenticateToken, (req, res) => {
  try {
    const { item_id, seller_id } = req.body;
    console.log('Creating conversation request:', { item_id, seller_id, buyer_id: req.user.id });
    const data = readData();
    
    // Validate input
    if (!item_id || !seller_id) {
      console.log('Missing required fields:', { item_id, seller_id });
      return res.status(400).json({ message: 'Missing item_id or seller_id' });
    }
    
    // Convert to numbers
    const itemId = parseInt(item_id);
    const sellerId = parseInt(seller_id);
    const buyerId = req.user.id;
    
    if (isNaN(itemId) || isNaN(sellerId)) {
      return res.status(400).json({ message: 'Invalid item_id or seller_id format' });
    }
    
    // Prevent self-conversation
    if (buyerId === sellerId) {
      console.log('User trying to message themselves');
      return res.status(400).json({ message: 'You cannot start a conversation with yourself' });
    }
    
    // Check if item exists
    const item = data.items?.find(i => i.id === itemId);
    if (!item) {
      console.log('Item not found:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if seller exists
    const seller = data.users?.find(u => u.id === sellerId);
    if (!seller) {
      console.log('Seller not found:', sellerId);
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    // Check if buyer exists (current user)
    const buyer = data.users?.find(u => u.id === buyerId);
    if (!buyer) {
      console.log('Buyer not found:', buyerId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize arrays if they don't exist
    if (!data.conversations) data.conversations = [];
    if (!data.messages) data.messages = [];
    
    // Check if conversation already exists
    const existing = data.conversations.find(
      conv => conv.item_id === itemId && 
      conv.buyer_id === buyerId && 
      conv.seller_id === sellerId
    );
    
    if (existing) {
      console.log('Conversation already exists:', existing.id);
      // Return with formatted data
      return res.json({
        ...existing,
        other_user_name: seller.name,
        item_title: item.title
      });
    }
    
    // Generate unique ID
    const newConversationId = data.conversations.length > 0
      ? Math.max(...data.conversations.map(c => c.id)) + 1
      : 1;
    
    // Create new conversation
    const newConversation = {
      id: newConversationId,
      item_id: itemId,
      buyer_id: buyerId,
      seller_id: sellerId,
      last_message: '',
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.conversations.push(newConversation);
    writeData(data);
    
    console.log('New conversation created:', newConversation.id);
    
    // Return with formatted data
    res.json({
      ...newConversation,
      other_user_name: seller.name,
      item_title: item.title
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
});

app.get('/api/conversations/:id/messages', authenticateToken, (req, res) => {
  try {
    const data = readData();
    const conversationId = parseInt(req.params.id);
    
    // Validate conversation ID
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    // Initialize arrays if they don't exist
    if (!data.messages) data.messages = [];
    if (!data.conversations) data.conversations = [];
    
    // Check if conversation exists and user has access
    const conversation = data.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Verify user is part of the conversation
    if (conversation.buyer_id !== req.user.id && conversation.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }
    
    // Get messages for this conversation
    const messages = data.messages.filter(msg => msg.conversation_id === conversationId);
    
    // Add sender names
    const messagesWithNames = messages.map(msg => {
      const sender = data.users?.find(u => u.id === msg.sender_id);
      return {
        ...msg,
        sender_name: sender?.name || 'Unknown User'
      };
    });
    
    // Mark messages as read for current user
    if (conversation.buyer_id === req.user.id) {
      conversation.unread_count = 0;
      writeData(data);
    }
    
    res.json(messagesWithNames);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

app.post('/api/conversations/:id/messages', authenticateToken, (req, res) => {
  try {
    const { message } = req.body;
    const conversationId = parseInt(req.params.id);
    const data = readData();
    
    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    // Initialize arrays if they don't exist
    if (!data.messages) data.messages = [];
    if (!data.conversations) data.conversations = [];
    
    const conversation = data.conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    if (conversation.buyer_id !== req.user.id && conversation.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }
    
    // Generate unique ID for message
    const newMessageId = data.messages.length > 0 
      ? Math.max(...data.messages.map(m => m.id)) + 1 
      : 1;
    
    const newMessage = {
      id: newMessageId,
      conversation_id: conversationId,
      sender_id: req.user.id,
      message: message.trim(),
      read: false,
      created_at: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    
    // Update conversation
    conversation.last_message = message.trim();
    conversation.updated_at = new Date().toISOString();
    
    // Increment unread count for the other user
    if (conversation.buyer_id === req.user.id) {
      // Message from buyer, seller should see it as unread
      // Don't increment buyer's own unread count
      conversation.unread_count = (conversation.unread_count || 0);
    } else {
      // Message from seller, increment buyer's unread
      conversation.unread_count = (conversation.unread_count || 0) + 1;
    }
    
    writeData(data);
    
    // Return message with sender name
    const sender = data.users?.find(u => u.id === req.user.id);
    res.json({
      ...newMessage,
      sender_name: sender?.name || 'Unknown User'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Delete conversation (for existing chat widget)
app.delete('/api/conversations/:id', authenticateToken, (req, res) => {
  const conversationId = parseInt(req.params.id);
  const data = readData();
  
  if (!data.messages) data.messages = [];
  if (!data.conversations) data.conversations = [];
  
  // Find conversation
  const conversationIndex = data.conversations.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) {
    return res.status(404).json({ message: 'Conversation not found' });
  }
  
  const conversation = data.conversations[conversationIndex];
  
  // Check if user is part of this conversation
  if (conversation.buyer_id !== req.user.id && conversation.seller_id !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  // Delete all messages in this conversation
  data.messages = data.messages.filter(m => m.conversation_id !== conversation.id);
  
  // Delete conversation
  data.conversations.splice(conversationIndex, 1);
  
  writeData(data);
  
  res.json({ message: 'Conversation deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
