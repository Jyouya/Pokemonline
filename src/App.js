import React from "react";
import Game from "./components/Game";
import LoginPage from "./pages/authentication/LoginPage";
import RegisterPage from "./pages/authentication/RegisterPage";
import OptionsWrapper from "./components/OptionsWrapper";
import ChatBox from "./components/Chat";
import "./App.css";
import socketIOClient from "socket.io-client";
import {BrowserRouter as Router, Route } from 'react-router-dom';

function Button(props) {
  return <button id="button" onClick={(e)=> {
    e.preventDefault();
    props.onClick();
  }}>Click me</button>;
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      onlineUsers: [],
      socket: null,
      user: null,
      endpoint: "http://localhost:3001"
    };
  }

  componentWillMount() {
    this.initSocket();
  }
  // socket connection established, and then socket listening events defined
  initSocket() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);

    // bread and butter connection confirmation
    socket.on("connect", data => console.log("Connected"));

    socket.on('connectedUserCheck', data => {
      console.log(data)
    })

    // allows messages to be passed back and forth from client to server
    socket.on("chat", data => console.log("message received", data));



    socket.on("disconnection", disconnectedUser => {
      console.log(disconnectedUser + " disconnected");
      const index = this.state.onlineUsers.find(user => {
        console.log(user);
        console.log(user===disconnectedUser);
        return 
      })

    });

    socket.on('poke', data => {
      
    })

    socket.on('move', data => {
      console.log('user is moving ', data);
    })

    socket.on('', data => {

    })
    // state is set once all the events are defined
    this.setState({ socket });
    console.log(socket);
  }

  setUser = user => {
    const { socket } = this.state;
    socket.emit("user_connected", user);
    // this.setState
  };

  logout = () => {
    const { socket } = this.state;
    socket.emit("logout");
    this.setState({ user: null });
  };


  //eventually we wanna do this without a button
  buttonClick() {
    const { socket } = this.state;
    socket.emit("connectedUserCheck");
    //console.log(this.state.socket);
    
  }

  render() {
    const { socket } = this.state;
    return (
      <Router>
        <Route
          exact path="/game"
          component={() => 
            <main className="container">
            {/* button is for testing some sockets */}
              <Button
                onClick={() => {
                  this.buttonClick();
                }}
              />
              <div className="game">
                <Game socket={socket} />
              </div>
              <div className="options">
                <OptionsWrapper socket={socket} pressLogout={this.logout}/>
              </div>
              <div className="chat">
                <ChatBox socket={socket} />
              </div>
            </main>
          }
        />
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
      </Router>
    );
  }
}

export default App;
