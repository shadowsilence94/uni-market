const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Fixing notification userIds...');
console.log('Before:', data.notifications.map(n => ({ id: n.id, userId: n.userId, type: typeof n.userId })));

// Fix all notifications
data.notifications = data.notifications.map(notification => {
  if (notification.userId !== 'all' && typeof notification.userId !== 'number') {
    console.log(`Converting notification ${notification.id}: "${notification.userId}" (${typeof notification.userId}) -> ${Number(notification.userId)} (number)`);
    return {
      ...notification,
      userId: Number(notification.userId)
    };
  }
  return notification;
});

console.log('After:', data.notifications.map(n => ({ id: n.id, userId: n.userId, type: typeof n.userId })));

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Database fixed! All userIds are now numbers or "all"');
