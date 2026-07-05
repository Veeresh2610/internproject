import { BosMember } from "./types";

interface Props {
  form: BosMember;
  setForm: React.Dispatch<React.SetStateAction<BosMember>>;
  onSubmit: () => void;
  onCancel: () => void;
  editing: boolean;
}

const BosForm = ({ form, setForm, onSubmit, onCancel, editing }: Props) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <tr className="bos-form-row">
      <td>
        <input
          name="faculty_type"
          value={form.faculty_type}
          onChange={handleChange}
          placeholder="Teaching"
        />
      </td>

      <td>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First"
        />
      </td>

      <td>
        <input
          name="middle_name"
          value={form.middle_name || ""}
          onChange={handleChange}
          placeholder="Middle"
        />
      </td>

      <td>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last"
        />
      </td>

      <td>
        <input
          name="designation"
          value={form.designation}
          onChange={handleChange}
          placeholder="Designation"
        />
      </td>

      <td>
        <input
          name="organization"
          value={form.organization}
          onChange={handleChange}
          placeholder="School"
        />
      </td>

      <td>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={form.active}
          onChange={() =>
            setForm({ ...form, active: !form.active })
          }
        />
      </td>

      <td>
        <button className="save-btn" onClick={onSubmit}>
          Save
        </button>

        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </td>
    </tr>
  );
};

export default BosForm;
