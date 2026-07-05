import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Bos.css";

import { BosMember } from "./types";
import { getAllBos, updateBos, deleteBos } from "./bosApi";
import BosTable from "./BosTable";

const Bos = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState<BosMember[]>([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    const res = await getAllBos();
    setMembers(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteBos(id);
    loadData();
  };

  const handleToggle = async (member: BosMember) => {
    await updateBos(member.id!, { ...member, active: !member.active });
    loadData();
  };

  const filtered = members.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bos-wrapper">

      {/* ===== BLACK HEADER ===== */}
      <div className="bos-title-bar">
        Board of Studies (BoS) Member List
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="bos-actions">

        <button
          className="primary-btn"
          onClick={() => navigate("/bos/add-existing")}
        >
          <span className="plus-icon">+</span>
          Add Existing User
        </button>

        <button
          className="primary-btn"
          onClick={() => navigate("/bos/add-new")}
        >
          <span className="plus-icon">+</span>
          Add New
        </button>

      </div>

      {/* ===== CONTROLS ===== */}
      <div className="bos-controls">
        <div>
          Show
          <select>
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          entries
        </div>

        <div>
          Search:
          <input
            className="bos-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bos-card">
        <BosTable
          members={filtered}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onEdit={() => {}}
        />
      </div>
    </div>
  );
};

export default Bos;
