import React, { Component, Fragment } from "react";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link, withRouter } from "react-router-dom";
import "./App.css";
import Routes from "./Routes";
import {
    Stitch,
    UserPasswordCredential,
    RemoteMongoClient
} from "mongodb-stitch-browser-sdk";

class App extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isAuthenticated: false
      };

    }

    userHasAuthenticated = authenticated => {
      this.setState({ isAuthenticated: authenticated });
    }

    handleLogout = event => {
        //this.client.auth.logout();
        this.userHasAuthenticated(false);
        this.props.history.push("/login");
    }

    render() {
        const childProps = {
          isAuthenticated: this.state.isAuthenticated,
          userHasAuthenticated: this.userHasAuthenticated
        };
        return (
            <div className="App container">
                <Navbar fluid="true" collapseOnSelect="true">
                    <Navbar.Brand>
                        <Link to="/">Ness</Link>
                    </Navbar.Brand>
                    <Navbar.Collapse>
                        <Nav pullright="true">
                            {this.state.isAuthenticated
                              ? <NavItem onClick={this.handleLogout}>Logout</NavItem>
                              : <Fragment>
                                  <Link to="/signup">Signup</Link>
                                  <Link to="/login">Login</Link>
                                </Fragment>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes childProps={childProps} />
            </div>
        );
    }
}

export default withRouter(App);