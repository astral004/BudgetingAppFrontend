import axios from "axios";

class UsersService {
    createUser(user) {
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/user`, user);
    }

    getUser(googleId){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/user/${googleId}`);
    }
}

export default new UsersService();