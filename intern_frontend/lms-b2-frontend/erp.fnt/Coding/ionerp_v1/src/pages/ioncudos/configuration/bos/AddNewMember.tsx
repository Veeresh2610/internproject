import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Bos.css";

const AddNewMember = () => {
  const navigate = useNavigate();

  const initialState = {
    faculty_type: "",
    title: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    organization: "",
    email: "",
    contact: "",
    aadhar: "",
    qualification: "",
    experience: "",
    password: "",
    designation: "",
    school: "",
  };

  const [form, setForm] = useState(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm({ ...form, password: pass });
  };

  return (
    <div className="bos-wrapper">
      {/* HEADER */}
      <div className="bos-title-bar">
        Add New Board of Studies (BoS) Member
      </div>

      {/* CARD */}
      <div className="bos-card bos-form-card">

        {/* ===== 2 COLUMN GRID ===== */}
        <div className="bos-two-col">

          {/* LEFT */}
          <div className="form-col">
            <label>Faculty Type <span className="req">*</span></label>
            <select name="faculty_type" onChange={handleChange}>
              <option>Select Faculty Type</option>
              <option>Teaching</option>
              <option>Lab</option>
              <option>Administration</option>
              <option>Supporting</option>
              <option>Visiting</option>
            </select>

            <label>Title <span className="req">*</span></label>
            <select name="title" onChange={handleChange}>
              <option>Select Title</option>
              <option>Dr.</option>
              <option>Mr.</option>
              <option>Mrs.</option>
              <option>Miss</option>
              <option>Prof.</option>
            </select>

            <label>First Name <span className="req">*</span></label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
            />

            <label>Middle Name</label>
            <input
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              placeholder="Enter your middle name"
            />
            <label>Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
            <label>Organization <span className="req">*</span></label>
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="Enter organization name"
            />
            <label>Email Id <span className="req">*</span></label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />          </div>


          {/* RIGHT */}
          <div className="form-col">
            <label>Contact Number</label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
            <label>Aadhaar Number</label>
            <input
              name="aadhar"
              value={form.aadhar}
              onChange={handleChange}
              placeholder="Enter Aadhaar number"
            />
            <label>Highest Qualification</label>
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="Enter highest qualification"
            />

            <label>Experience (Years)</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Enter years of experience"
            />
            <label>Password <span className="req">*</span></label>
            <div className="password-group">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Generate or enter password"
              />
              <button className="generate-btn" onClick={generatePassword} type="button">
                🔄
              </button>

            </div>

            <label>Designation <span className="req">*</span></label>
            <select name="designation" onChange={handleChange}>
              <option>Select Designation</option>
              <option>HoD</option>
              <option>Professor</option>
              <option>Assistant Professor</option>
              <option>Lecturer</option>
            </select>

            <label>BoS for <span className="req">*</span></label>
            <select name="school" onChange={handleChange}>
              <option>Select School</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>Mechanical</option>
            </select>
          </div>
        </div>


        {/* BUTTONS */}
        <div className="bos-form-actions">
          <button className="save-btn">💾 Save</button>
          <button className="reset-btn">🔁 Reset</button>
          <button className="cancel-btn" onClick={() => navigate("/bos")}>❌ Cancel</button>
        </div>

      </div>
    </div>
  );
};

export default AddNewMember;
