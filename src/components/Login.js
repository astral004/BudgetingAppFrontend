import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import UsersService from "../services/users.js";
import BudgetsService from "../services/budgets.js";
import CategoriesService from "../services/categories.js";


function Login({ setUser }) {
    const onSuccess = (res) => {
        let tokenData = jwt_decode(res.credential);
        const googleId = tokenData.sub;
        //check if user exists
        UsersService.getUser(googleId).catch(e => {
            //if not, create user
            if(e.response.status === 404){
                UsersService.createUser({name: tokenData.name, email: tokenData.email, googleId: googleId})
                    .then(res => {
                        console.log(res);
                    });
                     //TODO: create a budget object with 0 budget amount and each category set to 0% alloc
                    CategoriesService.getCategories()
                    .then(categories => {
                        console.log(categories);
                    let budgetData = {
                        userGoogleId: googleId,
                        totalBudget: 0, 
                        budgetBreakdown: []
                    };

                    budgetData.budgetBreakdown = categories.data.map(category => ({
                        categoryId: category._id,
                        categoryName: category.categoryName,
                        allocatedPercent: 0
                    }));

                    console.log(budgetData);

                    BudgetsService.createBudget(budgetData)
                        .then(res => {
                        console.log(res);
                        });

                    })
                    .catch(err => {
                    console.log(err);
                    });
                     // end
            }
        })
        let loginData = {
            googleId,
            ...tokenData
        }
        setUser(loginData);
        localStorage.setItem("googleId", googleId);
        localStorage.setItem("login", JSON.stringify(loginData));
        console.log('Login Success: currentUser:', loginData);
    };

    const onFailure = (res) => {
        console.log('Login failed: res', res);
    }

    return (
        <div>
            <GoogleLogin
                id='login'
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                style={{ marginTop: '100px'}}
                isSignedIn={true}
                auto_select={true}
            />
        </div>
    );
}

export default Login;