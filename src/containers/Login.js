import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import "./Login.css";
import LoaderButton from "../components/LoaderButton";
import {
    Stitch,
    UserPasswordCredential,
    RemoteMongoClient
} from "mongodb-stitch-browser-sdk";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      client: "",
      isLoading: false,
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    // Initialize the App Client
    this.client = Stitch.initializeDefaultAppClient("nessgaming-iimaq");
    
    const mongodb = this.client.getServiceClient(
        RemoteMongoClient.factory,
        "nessgaming-atlas"
    );
    const credential = new UserPasswordCredential(this.state.email, this.state.password);
    this.client.auth.loginWithCredential(credential)
        .then(authedUser => {
            console.log(`Successfully logged in with id: ${authedUser.id}`);
            this.props.userHasAuthenticated(true);
            this.props.history.push("/");
        })
        .catch(err => {
            console.error(`Login failed: ${err}`);
            this.setState({ isLoading: false });
        })
  }

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="email" bssize="large">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
              placeholder="Enter Email"
            />
            <br/>
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
          <br/>
          <Form.Group controlId="password" bssize="large">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
              placeholder="Password"
            />
          </Form.Group>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            loadingText="Logging in…"
          />
        </Form>
      </div>
    );
  }
}