import { app } from './app.js'
import mongoose from "mongoose"

const port = process.env.PORT || 3000;

console.log(process.env.MONGO_URL_PROD)

mongoose.connect(process.env.MONGO_URL_PROD)
    .then(() => {
        console.log(`Connected to Mongo`);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    })
