import mongoose from "mongoose";
const connectDb=async () => {
    try{
        mongoose.connection.on("connected", () => console.log("Database connected successfully"));
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`)

    }
    catch(err){
        console.error( err.message || "Failed to connect to the database");
        process.exit(1); // Exit the process with failure
    }
}
export default connectDb;