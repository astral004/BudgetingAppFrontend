import axios from "axios";

class CategoriesService {
    getCategories(){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/categories`);
    }

    getCategoryById(id){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/budget/categories/${id}`);
    }
}

/* eslint import/no-anonymous-default-export: [2, {"allowNew": true}] */
export default new CategoriesService();
