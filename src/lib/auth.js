import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('royality');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client
  }),
  emailAndPassword: { 
    enabled: true, 
  },
  user: {
       additionalFields: {
          role: {
              type: "string",
              defaultValue:"user"
            },
            block:{
                type:"boolean",
                defaultValue:false
            }
        }
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
            strategy: "jwt"
        }
    }
});