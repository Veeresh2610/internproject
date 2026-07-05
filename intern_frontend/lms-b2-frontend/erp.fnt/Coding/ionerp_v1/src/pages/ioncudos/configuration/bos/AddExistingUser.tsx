import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBos } from "./bosApi";
import { BosMember } from "./types";
import "./Bos.css";

const AddExistingUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    school: "",
    staff: "",
    bos_for: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const payload: BosMember = {
      id: 0,
      faculty_type: "Teaching",
      title: "",
      first_name: form.staff,
      middle_name: "",
      last_name: "",
      organization: form.school,
      designation: "",
      email: "",
      school: form.school,
      bos_for: form.bos_for,
      active: true,
      status: 1,
    };

    await createBos(payload);

    alert("User added to BoS ✅");
    navigate("/bos");
  };

  const handleCancel = () => navigate("/bos");

  return (
    <div className="bos-wrapper">
      <div className="bos-title-bar">
        Add Existing User as BoS Member
      </div>

      <div className="bos-card">
        <div className="bos-form-grid">

          <label>School <span className="required">*</span></label>
          <select name="school" value={form.school} onChange={handleChange}>
            <option value="">Select School</option>
            <option>CSE</option>
            <option>ECE</option>
          </select>

          <label>Staff Name <span className="required">*</span></label>
          <select name="staff" value={form.staff} onChange={handleChange}>
            <option value="">Select User</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
          </select>

          <label>BoS for <span className="required">*</span></label>
          <select name="bos_for" value={form.bos_for} onChange={handleChange}>
            <option value="">Select School</option>
            <option>CSE</option>
            <option>ECE</option>
          </select>
        </div>

        <div className="bos-form-actions">
          <button className="save-btn" onClick={handleSave}>💾 Save</button>
          <button className="cancel-btn" onClick={handleCancel}>❌ Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddExistingUser;
