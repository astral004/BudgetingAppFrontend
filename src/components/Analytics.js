import React, {useState, useCallback, useEffect} from "react";
import {Accordion, Button, Card, Container} from "react-bootstrap";
import {Bar} from "react-chartjs-2";
import {Chart, registerables} from "chart.js";

import ExpensesService from '../services/expenses.js';
import CategoriesService from '../services/categories.js';
import BudgetsService from '../services/budgets.js';

import "./Analytics.css";

Chart.register(...registerables);

const prepareData = (expenses, categories, budgets) => {
    return categories.map(category => {
        const expensesForCategory = expenses.filter(
            expense => expense.categoryId === category._id
        );

        const totalForCategory = expensesForCategory.reduce((sum, expense) => sum + expense.amount, 0);

        const categoryBudgetItem = budgets.budgetBreakdown.find(breakdown => breakdown.categoryId === category._id);

        const categoryBudgetAmount = categoryBudgetItem ? (categoryBudgetItem.allocatedPercent / 100) * budgets.totalBudget : 0;

        return {
            category: category.categoryName,
            expenses: expensesForCategory,
            total: totalForCategory,
            budget: categoryBudgetAmount
        };
    });
};

const AccordionItem = ({category, expenses, total, budget}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card>
            <Card.Header className="card-header-content">
                <div className="header-section">
                    <Button className="dropdown-button" onClick={() => setIsOpen(prev => !prev)}>
                        {category}
                    </Button>
                </div>
                <div className="header-section">
                    Total: $ {total.toFixed(2)}
                </div>
                <div className="header-section">
                    Budget: $ {budget.toFixed(2)}
                </div>
            </Card.Header>
            {expenses && expenses.length === 0 ? (
                <Accordion.Collapse in={isOpen}>
                    <Card.Body>Frugal you - no expenses in this category.</Card.Body>
                </Accordion.Collapse>
            ) : (
                expenses.map((expense, index) => (
                    <Accordion.Collapse key={index} in={isOpen}>
                        <Card.Body>
                            {expense.transactionName}: $ {expense.amount.toFixed(2)}
                        </Card.Body>
                    </Accordion.Collapse>
                ))
            )}
        </Card>
    );
};

const Analytics = ({user}) => {

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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

    const retrieveAllExpenses = useCallback(() => {
        ExpensesService.getExpensesByMonth(user.googleId, month, year)
            .then(response => {
                if (response.data.response === 0) {
                    setExpenses([]);
                } else {
                    setExpenses(response.data.response);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }, [user, month, year]);

    useEffect(() => {
        if (user) {
            retrieveAllExpenses();
        }
    }, [user, retrieveAllExpenses, month, year]);

    const retrieveAllCategories = useCallback(() => {
        CategoriesService.getCategories()
            .then(response => {
                setCategories(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    useEffect(() => {
        retrieveAllCategories();
    }, [retrieveAllCategories]);

    const retrieveBudgets = useCallback(() => {
        BudgetsService.getBudgets(user.googleId)
            .then(response => {
                setBudgets(response.data.budgets);
            })
            .catch(e => {
                console.log(e);
            });
    }, [user]);

    useEffect(() => {
        if (user) {
            retrieveBudgets();
        }
    }, [user, retrieveBudgets]);

    if(!user){
        return (
            <Container className="analytics-container">
                <h3>Login to access analytics</h3>
            </Container>
        );
    }

    if (!expenses || !categories || !budgets || !Array.isArray(categories)) {
        return <div>Loading...</div>;
    }

    const displayData = prepareData(expenses, categories, budgets);

    const budgetData = displayData.map(data => data.budget);
    const categoriesLabels = displayData.map(data => data.category);
    const expensesData = displayData.map(data => data.total);

    const chartData = {
        labels: categoriesLabels,
        datasets: [
            {
                backgroundColor: "#182628",
                data: expensesData,
                label: "Expenses",
            },
            {
                backgroundColor: "#65CCB8",
                data: budgetData,
                label: "Budget",
            }
        ]
    };

    return (
        <Container className="analytics-container">
            {user ? (
                <div>
                    <div className="date-container">
                        <Button variant={"success"} style={{borderRadius: "50%"}} onClick={decrementMonth}>
                            –
                        </Button>
                        <h5 className={'date'}>{months[month - 1]} {year}</h5>
                        <Button variant={"success"} style={{borderRadius: "50%"}} onClick={incrementMonth}>
                            +
                        </Button>
                    </div>
                    <div className="analytics-header">
                        <div className="analytics-header-item">Category</div>
                        <div className="analytics-header-item">Expense</div>
                        <div className="analytics-header-item">Budget</div>
                    </div>
                    <Accordion>
                        {displayData.map((dataItem, index) => (
                            <AccordionItem
                                key={index}
                                category={dataItem.category}
                                expenses={dataItem.expenses}
                                total={dataItem.total}
                                budget={dataItem.budget}
                            />
                        ))}
                    </Accordion>
                    <div className="bar-chart-container">
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        type: "linear",
                                        beginAtZero: true,
                                        ticks: {
                                            font: {
                                                size: 20
                                            }
                                        }
                                    },
                                    x: {
                                        type: "category",
                                        ticks: {
                                            font: {
                                                size: 16
                                            }
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        labels: {
                                            font: {
                                                size: 24
                                            }
                                        }
                                    }
                                }
                        }}
                    />
                    </div>
                </div>
            ) : (
                <h3>Login to access analytics</h3>
            )}
        </Container>
    );
};

export default Analytics;