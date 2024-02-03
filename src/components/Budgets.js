import React, {useEffect, useState} from 'react';
import BudgetsService from '../services/budgets';
import Container from 'react-bootstrap/Container';
import "./Budgets.css";
import {Button, Form} from "react-bootstrap";
import { Pie } from 'react-chartjs-2';

const Budgets = ({user}) => {
    const [budgets, setBudgets] = useState([]);
    const [insertedId, setInsertedId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchBudgetData(user.googleId);
        }
    }, [user]);

    const fetchBudgetData = (googleId) => {
        BudgetsService.getBudgets(googleId)
            .then(response => {
                setBudgets([response.data.budgets]);
                setInsertedId(response.data.budgets._id);
                setEditedBudget(parseInt(response.data.budgets.totalBudget));
            })
            .catch(error => console.error("Error fetching budgets:", error));
    };

    const [editedBudget, setEditedBudget] = useState(budgets.length > 0 ? parseInt(budgets[0].totalBudget) : 0);
    const [isEditingBudget, setIsEditingBudget] = useState(false);

    const handleBudgetUpdate = () => {
        const newBudget = {
            _id: insertedId,
            userGoogleId: user.googleId,
            totalBudget: parseInt(editedBudget),
            budgetBreakdown: budgets[0].budgetBreakdown,
        };
        BudgetsService.updateBudgets(newBudget)
            .then(newresponse => {
                setBudgets([newresponse.data.updatedBudget]);
                setEditedBudget(newresponse.data.updatedBudget.totalBudget);
                setIsEditingBudget(false);
            })
            .catch(error => console.error("Error updating budgets:", error));
    };

    const [isEditingBreakdown, setIsEditingBreakdown] = useState(false);

    const handlePercentageUpdate = (index, newValue) => {
        const updatedBudgets = [...budgets];
        updatedBudgets[0].budgetBreakdown[index].allocatedPercent = parseInt(newValue);
        setBudgets(updatedBudgets);
    };

    const handlePercentageSubmit = (index) => {
        const updatedBudget = budgets[0].budgetBreakdown[index];
        const newBudgetBreakdown = budgets[0].budgetBreakdown.map((item, i) => {
            if (i === index) {
                return {...item, allocatedPercent: parseInt(updatedBudget.allocatedPercent)};
            }
            return item;
        });
        const newBudget = {
            _id: insertedId,
            userGoogleId: user.googleId,
            totalBudget: parseInt(editedBudget),
            budgetBreakdown: newBudgetBreakdown,
        };
        BudgetsService.updateBudgets(newBudget)
            .then(newresponse => {
                setBudgets([newresponse.data.updatedBudget]);
                setIsEditingBreakdown(false);
            })
            .catch(error => console.error("Error updating budgets:", error));
    };

    const calculateTotalAllocatedPercentage = () => {
      let totalAllocatedPercentage = 0;
      if (budgets.length > 0 && budgets[0].budgetBreakdown) {
      budgets[0].budgetBreakdown.forEach(item => {
          totalAllocatedPercentage += item.allocatedPercent;
      });
    }
      return totalAllocatedPercentage;
  };

  const generatePieChartData = () => {
    if (budgets.length === 0 || !budgets[0].budgetBreakdown) {
        return {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                },
            ],
        };
    }

    const labels = budgets[0].budgetBreakdown.map(item => item.categoryName.toUpperCase());
    const data = budgets[0].budgetBreakdown.map(item => item.allocatedPercent);
    const backgroundColors = Colors.slice(0, budgets[0].budgetBreakdown.length);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                },
            ],
        };
    };

  const Colors = [
      '#65CCB8',   
      'rgba(0, 0, 0, 0.25)',   
      '#FFB933',   
      '#3B945E',   
      '#D9D9D9',   
      '#000000'
  ];

  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 20,
          },
        },
      },
    },
  };

    return (
        <Container style={{padding: '20px'}}>
            {user ? (
                <div className="total-budget-container">
                    <div className="rounded-box">
                        <div className="total-amount">
                            TOTAL BUDGET: $
                            {isEditingBudget ? (
                            <input
                                type="number"
                                value={editedBudget}
                                onChange={(e) => setEditedBudget(e.target.value)}
                            />
                        ) : (
                            <span>{editedBudget}</span>
                        )}
                            {isEditingBudget ? (
                                <Button variant={"light"} onClick={handleBudgetUpdate}>Submit</Button>
                            ) : (
                                <Button variant={"light"} onClick={() => setIsEditingBudget(true)}>Adjust</Button>
                            )}
                        </div>
                    </div>
                    <div>
                        <table className="centered-table">
                            <thead>
                            <tr>
                                <th>CATEGORY</th>
                                <th>PERCENTAGE</th>
                                <th>BUDGET</th>
                            </tr>
                            </thead>
                            <tbody>
                            {budgets.length > 0 &&
                            budgets[0].budgetBreakdown.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.categoryName.toUpperCase()}</td>
                                    <td>
                                        {isEditingBreakdown ? (
                                            <span>
                                                <Form.Group style={{width: '30%'}}>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder={"Transaction Amount"}
                                                        value={item.allocatedPercent}
                                                        onChange={(e) => handlePercentageUpdate(index, e.target.value)}
                                                    />
                                                </Form.Group>
                                            </span>
                                        ) : (
                                            <span>{item.allocatedPercent}%</span>
                                        )}
                                    </td>
                                    <td>${((item.allocatedPercent / 100) * budgets[0].totalBudget).toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {isEditingBreakdown ? (
                        <Button variant={"success"} onClick={() => handlePercentageSubmit(0)} style={{marginTop: '20px'}} disabled={calculateTotalAllocatedPercentage() > 100}>Submit my budgets</Button>
                    ) : (
                        <Button variant={"success"} onClick={() => setIsEditingBreakdown(true)} style={{marginTop: '20px'}}>Adjust my budgets</Button>
                    )}
                    <div className="pie-chart-container">  
                    {calculateTotalAllocatedPercentage() <= 100? (
                        <Pie data={generatePieChartData()} options={options} />) :
                        <h3>Budgets exceed the total budget!</h3>
                    }
                    </div>
                </div>
            ) : (
                <h3>Login to access Budget Information</h3>
            )}
        </Container>
    );
};

export default Budgets;