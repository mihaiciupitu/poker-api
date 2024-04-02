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
  socket.on("SendUsername", (username) => {
    console.log("The name is: ", username);
    socket.username = username;
    usersArr.push({ socketID: socket.id, name: username });
    socket.on("cardValue", (card) => {
      console.log(`${username} selected`, card);

      io.emit("SelectedCard", {
        socketID: socket.id,
        name: username,
        card: card,
      });
      values.push(card);
      let s = 0;
      for (var i = 0; i < values.length; i++) {
        s += parseInt(values[i]);
      }
      const average = parseInt(s) / values.length || 0;
      console.log("The average of the selected cards is : ", average);
      socket.emit("Average", average);
    });
    io.emit(
      "UsernamesConnected",
      usersArr.map((users) => {
        return users;
      })
    );
  });
  socket.on("resetAverage", () => {
    values = [];
    socket.emit("Average", 0);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
    users--;
    console.log("Users disconnected: ", users);
    usersArr = usersArr.filter((user) => user.name !== socket.username);

    io.emit(
      "UsernamesConnected",
      usersArr.map((users) => {
        return users.name;
      })
    );
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
