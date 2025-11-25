import React, { useEffect } from "react";
import { Drawer, Form, Input, Button, Select, DatePicker, InputNumber, message } from "antd";
import moment from "moment";

const { Option } = Select;

const EmployeeDrawer = ({ visible, onClose, onSave, employee }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        ...employee,
        joiningDate: moment(employee.joiningDate),
      });
    } else {
      form.resetFields();
    }
  }, [employee, form]);

  const handleFinish = (values, continueEditing = false) => {
    if (values.performance < 1 || values.performance > 100) {
      message.error("Performance must be between 1 and 100");
      return;
    }

    const formatted = {
      ...values,
      joiningDate: values.joiningDate.format("YYYY-MM-DD"),
    };

    onSave(formatted);

    if (!continueEditing) {
      form.resetFields();
    }
  };

  return (
    <Drawer
      title={employee ? "Edit Employee" : "Add Employee"}
      width={400}
      onClose={onClose}
      open={visible}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button style={{ marginRight: 8 }} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
          >
            Save
          </Button>
          {employee && (
            <Button
              type="default"
              style={{ marginLeft: 8 }}
              onClick={() => form.submit()}
            >
              Save & Continue Editing
            </Button>
          )}
        </div>
      }
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={(values) => handleFinish(values, false)}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: "Please select department" }]}
        >
          <Select placeholder="Select department">
            <Option value="HR">HR</Option>
            <Option value="Engineering">Engineering</Option>
            <Option value="Sales">Sales</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please input role" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Joining Date"
          name="joiningDate"
          rules={[
            { required: true, message: "Please select joining date" },
            {
              validator: (_, value) =>
                value && value.isAfter(moment())
                  ? Promise.reject("Joining date cannot be in the future")
                  : Promise.resolve(),
            },
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select placeholder="Select status">
            <Option value="Active">Active</Option>
            <Option value="Archived">Archived</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Performance"
          name="performance"
          rules={[{ required: true, message: "Enter performance (1-100)" }]}
        >
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EmployeeDrawer;
