import React from "react";
import Game from "./components/Game";
import OptionsWrapper from "./components/Options";
import ChatBox from "./components/Chat";
import "./App.css";
import socketIOClient from "socket.io-client";


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      socket: false,
      response: false,
      endpoint: "http://localhost:3001"
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("connect", data => this.setState({ response: data, socket: socket }));
    console.log(socket);
  }

  buttonClick() {
    
  }

  render() {
    
    return (
      <main className="container">
      {/* <Game width={160 * 4} height={144 * 4}/> */}
      <div className="game"></div>
      <div className="options">
        <OptionsWrapper />
      </div>
      <div className="chat">
        <ChatBox />
      </div>
    </main>
    );
  }
}





export default App;
