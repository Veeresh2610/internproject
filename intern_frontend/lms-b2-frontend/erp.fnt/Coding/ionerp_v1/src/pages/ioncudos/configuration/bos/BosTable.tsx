import { BosMember } from "./types";
import { useState } from "react";

interface Props {
  members: BosMember[];
  onEdit: (m: BosMember) => void;
  onDelete: (id: number) => void;
  onToggle: (m: BosMember) => void;
}

const emptyRow: BosMember = {
  id: 0,
  faculty_type: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  designation: "",
  email: "",
  active: true,
  title: "",
  organization: "",
  school: "",
  bos_for: "",
  status: 1,
};

const BosTable = ({
  members,
  onEdit,
  onDelete,
  onToggle,
}: Props) => {
  const [adding, setAdding] = useState(false);
  const [row, setRow] = useState<BosMember>(emptyRow);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRow({ ...row, [e.target.name]: e.target.value });
  };

  return (
    <table className="bos-table">
      <thead>
        <tr>
          <th>Faculty Type</th>
          <th>First Name</th>
          <th>Middle Name</th>
          <th>Last Name</th>
          <th>Designation</th>
          <th>School</th>
          <th>Email</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {/* ===== ADD MEMBER ROW ===== */}
        {adding && (
          <tr>
            <td>
              <input name="faculty_type" onChange={handleChange} />
            </td>

            <td>
              <input name="first_name" onChange={handleChange} />
            </td>

            <td>
              <input name="title" onChange={handleChange} />
            </td>

            <td>
              <input name="last_name" onChange={handleChange} />
            </td>

            <td>
              <input name="designation" onChange={handleChange} />
            </td>

            <td>
              <input name="organization" onChange={handleChange} />
            </td>

            <td>
              <input name="email" onChange={handleChange} />
            </td>

            <td>—</td>

            <td>
              <button
                className="edit-btn"
                onClick={() => {
                  setAdding(false);
                  setRow(emptyRow);
                }}
              >
                Save
              </button>

              <button
                className="delete-btn"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
            </td>
          </tr>
        )}

        {/* ===== EXISTING MEMBERS ===== */}
        {members.length === 0 && !adding ? (
          <tr>
            <td colSpan={9} style={{ textAlign: "center" }}>
              No members found
            </td>
          </tr>
        ) : (
          members.map((m) => (
            <tr key={m.id}>
              <td>{m.faculty_type}</td>
              <td>{m.first_name}</td>
              <td>{m.title}</td>
              <td>{m.last_name}</td>
              <td>{m.designation}</td>
              <td>{m.organization}</td>
              <td>{m.email}</td>

              <td>
                <button
                  className={`toggle-btn ${m.active ? "on" : "off"}`}
                  onClick={() => onToggle(m)}
                >
                  {m.active ? "Active" : "Inactive"}
                </button>
              </td>

              <td>
                <button className="edit-btn" onClick={() => onEdit(m)}>
                ✏️ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => onDelete(m.id!)}
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))
        )}

        {/* ===== ADD BUTTON ROW ===== */}
        {!adding && (
          <tr>
            <td colSpan={9}>
              <button
                className="add-btn"
                onClick={() => setAdding(true)}
              >
                + Add Member
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default BosTable;
