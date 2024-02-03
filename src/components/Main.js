import React, {useEffect, useState, useCallback} from 'react';
import "./Main.css";
import {Card, Container, ListGroup} from "react-bootstrap";
import ExpensesService from "../services/expenses";
import BudgetsService from "../services/budgets";


const Main = ({user}) => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const getExp = useCallback(() => {
        if (!user || !user.googleId) {
            console.log("User not authenticated or googleId missing.");
            return;
        }
        
        ExpensesService.getExpensesByMonth(user.googleId, month, year)
            .then(res => {
                setExpenses(res.data.response);
            })
            .catch(e => {
                console.log(e);
            });
    }, [user, month, year]);

    const getBudget = useCallback(() => {
        if (!user || !user.googleId) {
            console.log("User not authenticated or googleId missing.");
            return;
        }

        BudgetsService.getBudgets(user.googleId)
            .then(response => {
                setBudget(response.data.budgets.totalBudget);
            })
            .catch(e => {
                console.log(e);
            });
    }, [user]);

    const getTotalExpense = useCallback(() => {
        let amount = 0;
        if (expenses) {
            expenses?.map(expense => {
                amount += parseInt(expense.amount);
            })
            setTotalExpenses(amount);
        }
    }, [expenses]);

    useEffect(() => {
        getExp();
        getBudget();
    }, [user, getExp, getBudget]);

    useEffect(() => {
        getTotalExpense();
    }, [expenses, getTotalExpense]);

    return (
        <Container className={'main-container'}>
            {user ? (
                <div>
                    Hello {user.name}
                    <Card style={{margin:'20px', backgroundColor: '#D9D9D9'}}>
                        <Card.Body>
                            <Card.Title className={'title'}>{months[month - 1]} {year} Summary:</Card.Title>
                        </Card.Body>
                        <ListGroup horizontal className={'summary'}>
                            <ListGroup.Item className={'summary-item'}>Expenses: ${totalExpenses}</ListGroup.Item>
                            <ListGroup.Item className={'summary-item'}>Budget: ${budget}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </div>
            ) : (
                <Container className={'logged-out'}>
                    <h3>WELCOME TO THE BUDGET TOOL!</h3>
                    <br/>
                    <h4>Please log in to start saving!</h4>
                </Container>
            )}
        </Container>
    )
}

export default Main;