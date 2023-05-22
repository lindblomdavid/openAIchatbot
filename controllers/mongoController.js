const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const saveChatHistory = async (message, auth0Id, email) => {
  try {
    await client.connect();

    const usersCollection = client.db('mimerchat').collection('users');
    const chatsCollection = client.db('mimerchat').collection('chats');

    // Check if the user already exists
    let user = await usersCollection.findOne({ auth0Id });

    if (!user) {
      // User doesn't exist, create a new user
      const newUser = {
        auth0Id,
        userId: new ObjectId(),
        email,
      };
      await usersCollection.insertOne(newUser);
      console.log('User created successfully!');
      user = newUser;
    }

    // Add userId, chatId and timestamp to chat history
    const chatHistory = {
      userId: user.userId,
      chatId: new ObjectId(),
      timestamp: new Date(),
      history: message.history,
    };

    await chatsCollection.insertOne(chatHistory);
    console.log('Chat history saved successfully!');
  } catch (error) {
    console.error('Error occurred while saving chat history:', error);
  } finally {
    await client.close();
  }
};

module.exports = { saveChatHistory };
