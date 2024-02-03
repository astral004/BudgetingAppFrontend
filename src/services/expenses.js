import axios from 'axios';

class ExpensesService {

    createExpense(expense){
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/expenses`, expense);
    }

    getExpensesByMonth(googleId, month, year){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/expenses/${googleId}?month=${month}&year=${year}`);
    }

    getAll(id) {
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/listExpenses/${id}`);
    }
}

/* eslint import/no-anonymous-default-export: [2, {"allowNew": true}] */
export default new ExpensesService();

