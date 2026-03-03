import {connectDB} from "@/lib/db";
import user from "@/models/user";
import bcrypt  from "bcryptjs";

export async function POST(req: Request) {
    await connectDB();
const {name , email , password} = await req.json();
const hashedpassword = await bcrypt.hash(password,10);
await user.create({
    name,
    email,
    password: hashedpassword
});
return Response.json({
    message: "User created succesfully",
});
}