const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const express = require("express");
const cors = require("cors");

const app = express();
const userRouter = require("./routes/userRoutes");
const badgeRouter = require("./routes/badgeRoutes");

//BODY-PARSER
app.use(express.json());

//DATABASE CONNECTION
const connectDB = require("./mongo");
connectDB();

//access-control-allow-credentials:true
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//ROUTE

app.use("/user", userRouter);
app.use("/badges", badgeRouter);

//LISTENING BY SERVER
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
