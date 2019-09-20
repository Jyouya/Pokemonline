import React from "react";
import styles from "./OptionsWrapper.module.css";

function MainMenu(props) {
  switch (props.menu) {
    case "1":
      return (
        <Submenu id={1} closeMenu={props.closeMenu}/>
      );
    case "2":
      return (
        <Submenu id={2} closeMenu={props.closeMenu}/>
      );
    case "3":
      return (
        <Submenu id={3} closeMenu={props.closeMenu}/>
      );
    case "4":
      return (
        <Submenu id={4} closeMenu={props.closeMenu}/>
      );
    default:
      return (
        <ul className={styles["options-list"]}>
          <Option handleMenuChange={props.handleMenuChange} menuDisplayName="Pokemon" menuId="1" />
          <Option handleMenuChange={props.handleMenuChange} menuDisplayName="Pokedex" menuId="2" />
          <Option handleMenuChange={props.handleMenuChange} menuDisplayName="Settings" menuId="3" />
          <Option handleMenuChange={props.handleMenuChange} menuDisplayName="Logout" menuId="4" />
        </ul>
      );
  }
}

function Option(props) {
  const { menuDisplayName, menuId, handleMenuChange } = props;

  return (
    // <li onClick={}>
    <li
      className={styles["option"]}
      onClick={handleMenuChange}
      data-menu={menuId}>
      {menuDisplayName}
    </li>
  );
}

class Submenu extends React.Component {
  handleClose = event => {
    event.preventDefault();
    console.log("Handle close");
    this.props.closeMenu();
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClose}>X</button>
        I'm div. {this.props.id}
      </div>
    )
  }
}

class OptionsWrapper extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { socket: null };
  }

  state = {
    socket: this.props.socket,
    menu: 0 // Main Menu by default
  };
  
  componentDidMount = () => {
    this.setState({ socket: this.props.socket });
    console.log(this.props);
    console.log(this.state);
  };

  closeMenu = event => {
    this.setState({ menu: "0" });
  }

  handleMenuChange = event => {
    const newMenu = event.target.getAttribute("data-menu");

    this.setState({ menu: newMenu }, () => {
      console.log(this.state.menu);
    });
  };

  render() {
    return (
      <div className={styles["option-wrapper"]}>
        <MainMenu
          menu={this.state.menu}
          handleMenuChange={this.handleMenuChange} 
          closeMenu={this.closeMenu}/>
      </div>
    );
  }
}

export default OptionsWrapper;
