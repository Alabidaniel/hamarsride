const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const port = Number(process.env.PORT || 5501);
app.listen(port, () => {
  console.log(`HamarsRide admin backend running on port ${port}`);
});
