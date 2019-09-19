import React from 'react';
import styles from './LoginForm.module.css';
import { Link } from 'react-router-dom';

class LoginForm extends React.Component {
  state = {
    email: "",
    password: ""
  };

  handleInputChange = event => {
    const {name, value} = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit = event => {
    event.preventDefault();
    console.log(this.state.email) // Do whatever with authentication here using the component's state.
    this.setState({
      password: ""
    });
  }

  render() {
    return (
      <div id="authenticate-form-container">
        <form>
          <input
            name="email"
            onChange={this.handleInputChange}
            value={this.state.email}
          />
          <input
            name="password"
            onChange={this.handleInputChange}
            value={this.state.password}
            type="password"
          />
          <button onClick={this.handleSubmit}>Login</button>
          <div>
            <span>
              Don't have an account? <Link to="/register">Register!</Link>
            </span>
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForm;