import mongoose from "mongoose";

const DBConnection = () => {
    mongoose.connect(process.env.DB!).then(() => console.log(`Database Connected`));
};

export default DBConnection;