import { headers } from "next/headers";
import { auth } from "./auth";

export  const UserDetails = async()=>{
    const session = await  auth.api.getSession({
        header:await headers()
   })
   return session;
}