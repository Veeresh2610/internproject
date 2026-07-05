import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Filter, Plus } from 'lucide-react';

const DepartmentConfig = () => {
  const [activeTab, setActiveTab] = useState('from');
  const [mentorsFrom, setMentorsFrom] = useState([]);
  const [mentorsTo, setMentorsTo] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add Mentor Form
  const [mentorUserId, setMentorUserId] = useState('');
  const [mentorDeptId, setMentorDeptId] = useState('');
  
  // Filter
  const [filterDeptId, setFilterDeptId] = useState('');

  // Dropdown options
  const [curriculums, setCurriculums] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('');

  useEffect(() => {
    if (activeTab === 'from') {
      fetchMentorsFrom();
    } else {
      fetchMentorsTo();
    }
  }, [activeTab, filterDeptId]);

  useEffect(() => {
    fetchCurriculums();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers(mentorDeptId);
  }, [mentorDeptId]);

  const fetchCurriculums = async () => {
    try {
      const response = await api.get('/cross-dept-mentor/curriculums');
      if (response.data.status_code === 200) {
        setCurriculums(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching curriculums:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/cross-dept-mentor/departments');
      if (response.data.status_code === 200) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchUsers = async (deptId) => {
    if (!deptId) {
      setUsers([]);
      return;
    }
    try {
      const response = await api.get(`/cross-dept-mentor/users?dept_id=${deptId}`);
      if (response.data.status_code === 200) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleUserChange = (userId) => {
    setMentorUserId(userId);
    const selectedUser = users.find(u => String(u.id) === String(userId));
    if (selectedUser && selectedUser.dept_id) {
      setMentorDeptId(String(selectedUser.dept_id));
    }
  };

  const filteredUsers = mentorDeptId 
    ? users.filter(u => String(u.dept_id) === String(mentorDeptId))
    : users;

  const fetchMentorsFrom = async () => {
    try {
      setLoading(true);
      let url = '/cross-dept-mentor/mentors-from-other-dept';
      if (filterDeptId) {
        url += `?filter_dept_id=${filterDeptId}`;
      }
      const response = await api.get(url);
      if (response.data.status_code === 200) {
        setMentorsFrom(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorsTo = async () => {
    try {
      setLoading(true);
      let url = '/cross-dept-mentor/mentors-to-other-dept';
      if (filterDeptId) {
        url += `?filter_dept_id=${filterDeptId}`;
      }
      const response = await api.get(url);
      if (response.data.status_code === 200) {
        setMentorsTo(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/cross-dept-mentor/add', {
        mentor_user_id: parseInt(mentorUserId),
        mentor_dept_id: parseInt(mentorDeptId),
        curriculum_id: selectedCurriculumId ? parseInt(selectedCurriculumId) : null
      });
      if (response.data.status_code === 200) {
        alert('Mentor added successfully');
        setMentorUserId('');
        setMentorDeptId('');
        setSelectedCurriculumId('');
        if (activeTab === 'from') {
          fetchMentorsFrom();
        }
      } else {
        alert(response.data.message || 'Failed to add mentor');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding mentor');
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <h2 style={{ marginBottom: '24px' }}>Department Configuration</h2>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'from' ? 'active' : ''}`}
          onClick={() => setActiveTab('from')}
        >
          Mentors from Other Departments
        </div>
        <div 
          className={`tab ${activeTab === 'to' ? 'active' : ''}`}
          onClick={() => setActiveTab('to')}
        >
          Mentors to other Department
        </div>
      </div>

      {activeTab === 'from' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.9)' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>Add Mentor from Other Department</h4>
              <form onSubmit={handleAddMentor} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Curriculum</label>
                  <select 
                    className="input-field" 
                    value={selectedCurriculumId} 
                    onChange={e => setSelectedCurriculumId(e.target.value)} 
                    required 
                  >
                    <option value="">Select Curriculum</option>
                    {curriculums.map(c => (
                      <option key={c.crclm_id} value={c.crclm_id}>{c.crclm_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Mentor Department</label>
                  <select 
                    className="input-field" 
                    value={mentorDeptId} 
                    onChange={e => {
                      setMentorDeptId(e.target.value);
                      setMentorUserId(''); // clear user on department change
                    }} 
                    required 
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Mentor User</label>
                  <select 
                    className="input-field" 
                    value={mentorUserId} 
                    onChange={e => handleUserChange(e.target.value)} 
                    required 
                  >
                    <option value="">Select User</option>
                    {filteredUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email || u.id})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                  <Plus size={16} /> Add Mentor
                </button>
              </form>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0 }}>Cross Department Mentors</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--text-muted)" />
                <select 
                  className="input-field" 
                  style={{ width: '200px', padding: '8px 12px' }}
                  value={filterDeptId}
                  onChange={e => setFilterDeptId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
            ) : mentorsFrom.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No mentors found.</div>
            ) : (
              <table className="datatable">
                <thead>
                  <tr>
                    <th>Mentor Name</th>
                    <th>Mentor Email</th>
                    <th>Mentor Department</th>
                    <th>Curriculum</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorsFrom.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{m.mentor_name}</td>
                      <td>{m.mentor_email || '-'}</td>
                      <td>{m.mentor_dept_name || m.mentor_dept_id}</td>
                      <td>{m.curriculum_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'to' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0 }}>Our Mentors in Other Departments</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select 
                className="input-field" 
                style={{ width: '200px', padding: '8px 12px' }}
                value={filterDeptId}
                onChange={e => setFilterDeptId(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : mentorsTo.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No mentors found.</div>
          ) : (
            <table className="datatable">
              <thead>
                <tr>
                  <th>Mentor Name</th>
                  <th>Mentor Email</th>
                  <th>Assigned Department</th>
                  <th>Curriculum</th>
                </tr>
              </thead>
              <tbody>
                {mentorsTo.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{m.mentor_name}</td>
                    <td>{m.mentor_email || '-'}</td>
                    <td>{m.assigned_dept_name || m.assigned_dept_id}</td>
                    <td>{m.curriculum_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentConfig;
