import React, {useCallback, useEffect, useState} from 'react';
import ExpensesService from "../services/expenses.js";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import CategoriesService from "../services/categories.js";

import "./Expenses.css"


const Expenses = ({user}) => {
    const [expenses, setExpenses] = useState([]);
    const [transactionName, setTransactionName] = useState('');
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const retrieveCategories = useCallback(() => {
        CategoriesService.getCategories().then(response => {
            setCategories([].concat(response.data));
            setCategory(response.data[0]._id);
        }).catch(e => {
            console.log("Error", e);
        });
    }, []);

    const onChangeTransactionName = (e) => {
        setTransactionName(e.target.value);
    }

    const onChangeTransactionAmount = e => {
        setTransactionAmount(e.target.value);
    }

    const onChangeCategory = (e) => {
        setCategory(e.target.value);
    }

    const getExp = () => {
        ExpensesService.getExpensesByMonth(localStorage.getItem("googleId"), month, year)
            .then(res => {
                setExpenses(res.data.response);
            })
    }

    const getCatName = (id) => {
        let name;
        categories.map(cat => {
            if (cat._id === id) {
                name = cat.categoryName;
            }
        })
        return name;
    }

    useEffect(() => {
        retrieveCategories();
    }, [retrieveCategories]);

    useEffect(() => {
        getExp();
    }, [month]);

    const saveExpense = () => {
        let data = {
            userGoogleId: localStorage.getItem("googleId"),
            categoryId: category,
            transactionName: transactionName,
            amount: transactionAmount
        }
        ExpensesService.createExpense(data).then(() => {
            getExp();
        }).catch(e => {
            console.error(e);
        })

    }

    function decrementMonth() {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    }

    function incrementMonth() {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    }

    return (
        <Container className="expenses-container">
            {user ? (
                <>
                    <div className="date-container">
                        <Button variant={"success"} style={{borderRadius: "50%"}} onClick={decrementMonth}>
                            –
                        </Button>
                        <h5 className={'date'}>{months[month - 1]} {year}</h5>
                        <Button variant={"success"} style={{borderRadius: "50%"}} onClick={incrementMonth}>
                            +
                        </Button>
                    </div>
                    <div className="expenses-header">
                        <div className="expenses-header-item">Name</div>
                        <div className="expenses-header-item">Amount</div>
                        <div className="expenses-header-item">Category</div>
                    </div>
                    {expenses.length > 0 ? expenses.map((exp, i) => {
                            return (
                                <div key={i} className="expenses-row-content">
                                    <div className="expenses-row-section">{exp.transactionName}</div>
                                    <div className="expenses-row-section">{exp.amount}</div>
                                    <div className="expenses-row-section">{getCatName(exp.categoryId)}</div>
                                </div>
                            );
                        })
                        : <div>You have no expenses</div>}

                    {/*add expenses*/}
                    <h5 style={{margin: "10px 0"}}>Add expense to current month:</h5>
                    <div className="input-form">
                        <Form>
                            <Row>
                                <Col>
                                    <Form.Group className={"mb-3"}>
                                        <Form.Control
                                            type="text"
                                            placeholder={"Transaction Name"}
                                            value={transactionName}
                                            onChange={onChangeTransactionName}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className={"mb-3"}>
                                        <Form.Control
                                            type="number"
                                            placeholder={"Transaction Amount"}
                                            value={transactionAmount}
                                            onChange={onChangeTransactionAmount}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            as={"select"}
                                            onChange={onChangeCategory}
                                        >
                                            {categories.map((cat, i) => {
                                                return (
                                                    <option value={cat._id}
                                                            key={i}>
                                                        {cat.categoryName}
                                                    </option>
                                                )
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Button variant={"success"} onClick={saveExpense}>
                                        Submit Expense
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </>
            ) : (
                <h3>Login to access expenses</h3>
            )}
        </Container>
    );
}

export default Expenses;