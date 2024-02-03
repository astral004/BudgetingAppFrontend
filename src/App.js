import {useEffect, useState} from 'react';
import {GoogleOAuthProvider} from '@react-oauth/google';

import Login from "./components/Login";
import Logout from "./components/Logout";

import {Link, Route, Routes} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import {Nav, Navbar} from "react-bootstrap";

import Main from "./components/Main.js";
import Expenses from "./components/Expenses.js";
import Budgets from "./components/Budgets.js";
import Analytics from "./components/Analytics.js";

import logo from './logo.png';

import './App.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        let loginData = JSON.parse(localStorage.getItem("login"));
        if (loginData) {
            let loginExp = loginData.exp;
            let now = Date.now() / 1000;
            if (now < loginExp) {
                // Not expired
                setUser(loginData);
            } else {
                // Expired
                localStorage.removeItem("login");
            }
        }
    }, []);

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="App">
                <Navbar bg="success" expand="lg" sticky="top" variant="dark">
                    <Container className="container-fluid">
                        <Navbar.Brand href="/">
                            <img src={logo} alt="app logo" className="appLogo"/>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="ml-auto">
                                <Nav.Link as={Link} to="/expenses">
                                    Expenses
                                </Nav.Link>
                                <Nav.Link as={Link} to="/budget">
                                    Budgets
                                </Nav.Link>
                                <Nav.Link as={Link} to="/analytics">
                                    Analytics
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                        {user ? (
                            <Logout setUser={setUser} clientId={clientId}/>
                        ) : (
                            <Login setUser={setUser}/>
                        )}
                    </Container>
                </Navbar>
                <Routes>
                    <Route exact path='/' element={
                        <Main
                            user={user}
                        />}
                    />
                    <Route exact path='/expenses' element={
                        <Expenses
                            user={user}
                        />}
                    />
                    <Route exact path='/budget' element={
                        <Budgets
                            user={user}
                        />}
                    />
                    <Route exact path='/analytics' element={
                        <Analytics
                            user={user}
                        />}
                    />
                </Routes>
                <Navbar fixed="bottom" bg="dark" style={{height: '40px'}}>
                </Navbar>
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;

