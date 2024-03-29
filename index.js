const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});
let users = 0;
let values = [];
let usersArr = [];
io.on("connection", (socket) => {
  console.log("A user connected");
  users++;
  console.log("Total users:", users);
  socket.on("Username", (username) => {
    console.log("The name is: ", username);
    usersArr.push(username);
    socket.on("cardValue", (card) => {
      console.log(`${username} selected`, card);
      values.push(card);
      let s = 0;
      for (var i = 0; i < values.length; i++) {
        s += parseInt(values[i]);
      }
      const average = parseInt(s) / values.length;
      console.log("The average of the selected cards is : ", average);
      socket.emit("Average", average);
      socket.emit("Selected cards", values);
    });
    io.emit("Usernames", usersArr);
  });
  socket.on("resetAverage", () => {
    values = [];
    socket.emit("Average", 0);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
    users--;
    console.log("Users disconnected: ", users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
