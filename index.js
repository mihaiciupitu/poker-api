const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

let users = 0;
let usersArr = [];
let selectedCards = [];

io.on("connection", (socket) => {
  console.log("A user connected");
  users++;
  io.emit("totalUsers", users);

  socket.on("updateCardValue", (content) => {
    socket.broadcast.emit("updateCardValue", {
      socketId: socket.id,
      card: content.card,
    });
  });

  socket.on("SendUsername", (username) => {
    console.log("The name is: ", username);
    socket.username = username;
    usersArr.push({ socketID: socket.id, name: username });
    io.emit("UsernamesConnected", usersArr);
  });

  socket.on("cardValue", (card) => {
    console.log(`${socket.username} selected`, card);
    selectedCards.push(parseInt(card));

    io.emit("SelectedCard", {
      socketID: socket.id,
      name: socket.username,
      card: card,
    });

    const average = calculateAverage(selectedCards);
    io.emit("Average", average);
  });

  socket.on("resetAverage", () => {
    selectedCards = [];
    const average = calculateAverage(selectedCards);
    io.emit("Average", average);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    users--;
    io.emit("totalUsers", users);
    usersArr = usersArr.filter((user) => user.name !== socket.username);
    io.emit("UsernamesConnected", usersArr);
  });
});

function calculateAverage(cards) {
  if (cards.length === 0) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < cards.length; i++) {
    sum += cards[i];
  }
  return sum / cards.length;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
