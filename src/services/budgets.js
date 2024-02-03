
import axios from 'axios';

class BudgetsService {
    getBudgets(googleId){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/budgets/${googleId}`);
    }

    createBudget(data){
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/userBudgets`, data)
    }

    updateBudgets(data) {
        return axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/userBudgets`, data);
    }

}

/* eslint import/no-anonymous-default-export: [2, {"allowNew": true}] */
export default new BudgetsService();

