import React from 'react';
import { googleLogout } from '@react-oauth/google';
import Button from 'react-bootstrap/Button';

function Logout({ setUser }) {
    const onClick = () => {
        googleLogout();
        setUser(null);
        localStorage.setItem("login", null);
        localStorage.setItem("googleId", null);
        localStorage.clear();
        console.log('Logout made successfully');
    };

    return (
        <div>
            <Button
                variant='light'
                onClick={onClick}
            >Logout</Button>
        </div>
    );
}
export default Logout;