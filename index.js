const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const mongoose = require("mongoose");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const { createServer } = require("http");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB } = require("./config.js");
const express = require("express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const env=require('dotenv')
const cors=require("cors")
env.config();

(async function(){
const app = express();
const pubsub = new PubSub();
app.use(cors())
const httpServer = createServer(app);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
const server = new ApolloServer({
  schema,
  context: ({ req }) => ({ req, pubsub }),
  plugins: [
    {
      async serverWillStart() {
        return{
          async drainServer(){
            subscriptionserver.close()
          }
        }
      },
    },
  ],

});
const subscriptionserver = SubscriptionServer.create(
  { schema, execute, subscribe },
  { server: httpServer, path: "/graphql" }
);
await server.start()
server.applyMiddleware({app})
mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected");
  })
  // .then((res) => {
  //   console.log(`Server running at ${res.url}`);
  // });
  const PORT=process.env.PORT || 5002
  httpServer.listen(PORT,()=>console.log(`sever is running at ${PORT}`))
})();