const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not found in environment variables');
      console.log('📝 Using in-memory storage for development');
      return null;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port}`);
    
    return conn;
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:');
    console.log(`   Error: ${error.message}`);
    
    // Check if it's a connection error
    if (error.name === 'MongoServerSelectionError') {
      console.log('💡 Possible solutions:');
      console.log('   1. Make sure MongoDB is installed and running');
      console.log('   2. Check if MongoDB service is started');
      console.log('   3. Verify the connection string in .env file');
      console.log('   4. For Windows: Run "mongod" in command prompt');
      console.log('');
      console.log('📝 Falling back to in-memory storage for development');
    }
    
    return null;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.log('❌ Error closing MongoDB connection:', error.message);
    process.exit(1);
  }
});

module.exports = connectDB;