import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Switch,
  Tag,
  message,
  Progress,
  Row,
  Col,
  Card,
  Space,
} from "antd";
import { SearchOutlined, AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import moment from "moment";
import employeeService from "../api/employeeService";
import EmployeeDrawer from "../components/EmployeeDrawer";
import useDebounce from "../hooks/useDebounce";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    dateRange: [],
  });
  const [sortInfo, setSortInfo] = useState(
    JSON.parse(localStorage.getItem("sortInfo")) || {}
  );
  const [cardView, setCardView] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      message.error("Failed to fetch employees.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle Add/Edit Drawer
  const openDrawer = (employee = null) => {
    setEditingEmployee(employee);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setEditingEmployee(null);
    setDrawerVisible(false);
  };

  // Save employee (Add or Update)
  const handleSave = async (employee) => {
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, employee);
        message.success("Employee updated successfully!");
      } else {
        await employeeService.addEmployee(employee);
        message.success("Employee added successfully!");
      }
      closeDrawer();
      fetchEmployees();
    } catch (error) {
      message.error("Failed to save employee.");
    }
  };

  // Archive / Unarchive
  const handleArchive = async (record, archived) => {
    try {
      await employeeService.archiveEmployee(record.id, archived ? "Archived" : "Active");
      message.success("Employee status updated!");
      fetchEmployees();
    } catch {
      message.error("Failed to update status.");
    }
  };

  // Global search + filters
  const filteredEmployees = employees
    .filter((emp) =>
      [emp.name, emp.department, emp.role, emp.status]
        .join(" ")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    )
    .filter((emp) =>
      filters.department ? emp.department === filters.department : true
    )
    .filter((emp) =>
      filters.status ? emp.status === filters.status : true
    )
    .filter((emp) =>
      filters.dateRange.length === 2
        ? moment(emp.joiningDate).isBetween(
            filters.dateRange[0],
            filters.dateRange[1],
            null,
            "[]"
          )
        : true
    )
    .filter((emp) => (showArchived ? emp.status === "Archived" : emp.status !== "Archived"));

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortInfo.columnKey === "name" && sortInfo.order,
    },
    {
      title: "Department",
      dataIndex: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
      sortOrder: sortInfo.columnKey === "department" && sortInfo.order,
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
      sorter: (a, b) => moment(a.joiningDate).unix() - moment(b.joiningDate).unix(),
      sortOrder: sortInfo.columnKey === "joiningDate" && sortInfo.order,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Performance",
      dataIndex: "performance",
      render: (score) => <Progress percent={score} size="small" />,
      sorter: (a, b) => a.performance - b.performance,
    },
    {
      title: "Actions",
      render: (text, record) => (
        <Space>
          <Button type="link" onClick={() => openDrawer(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger={record.status !== "Archived"}
            onClick={() => handleArchive(record, record.status !== "Archived")}
          >
            {record.status !== "Archived" ? "Archive" : "Restore"}
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortInfo(sorter);
    localStorage.setItem("sortInfo", JSON.stringify(sorter));
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Department"
            style={{ width: "100%" }}
            value={filters.department}
            onChange={(val) => setFilters({ ...filters, department: val })}
          >
            <Option value="">All</Option>
            <Option value="HR">HR</Option>
            <Option value="Engineering">Engineering</Option>
            <Option value="Sales">Sales</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Status"
            style={{ width: "100%" }}
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val })}
          >
            <Option value="">All</Option>
            <Option value="Active">Active</Option>
            <Option value="Archived">Archived</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: "100%" }}
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" onClick={() => openDrawer()}>
            Add Employee
          </Button>
          <Switch
            checkedChildren={<AppstoreOutlined />}
            unCheckedChildren={<TableOutlined />}
            checked={cardView}
            onChange={setCardView}
            style={{ marginLeft: 16 }}
          />
          <Switch
            checkedChildren="Archived"
            unCheckedChildren="Active"
            checked={showArchived}
            onChange={setShowArchived}
            style={{ marginLeft: 16 }}
          />
        </Col>
      </Row>

      {cardView ? (
        <Row gutter={16}>
          {filteredEmployees.map((emp) => (
            <Col xs={24} sm={12} md={8} lg={6} key={emp.id}>
              <Card
                title={emp.name}
                extra={
                  <Space>
                    <Button type="link" onClick={() => openDrawer(emp)}>
                      Edit
                    </Button>
                    <Button
                      type="link"
                      danger={emp.status !== "Archived"}
                      onClick={() =>
                        handleArchive(emp, emp.status !== "Archived")
                      }
                    >
                      {emp.status !== "Archived" ? "Archive" : "Restore"}
                    </Button>
                  </Space>
                }
              >
                <p>Department: {emp.department}</p>
                <p>Role: {emp.role}</p>
                <p>Joining: {moment(emp.joiningDate).format("YYYY-MM-DD")}</p>
                <p>Status: {emp.status}</p>
                <Progress percent={emp.performance} size="small" />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{ pageSizeOptions: ["5", "10", "20"], showSizeChanger: true }}
        />
      )}

      <EmployeeDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onSave={handleSave}
        employee={editingEmployee}
      />
    </div>
  );
};

export default Dashboard;
