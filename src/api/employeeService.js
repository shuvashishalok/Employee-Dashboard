import axios from "axios";

const BASE_URL = "http://localhost:5001/employees";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

// Add new employee
export const addEmployee = async (employee) => {
  try {
    const response = await axios.post(BASE_URL, employee);
    return response.data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

// Update existing employee
export const updateEmployee = async (id, updatedData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

// Soft delete / archive employee
export const archiveEmployee = async (id, status) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error archiving employee:", error);
    throw error;
  }
};

// Default export for Dashboard.jsx
export default { getEmployees, addEmployee, updateEmployee, archiveEmployee };
