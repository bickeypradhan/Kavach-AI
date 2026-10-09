import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Users, Plus, Edit2, CheckSquare, Square, Save, X, QrCode } from 'lucide-react'
import QRCodeLib from 'qrcode'

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const AVAILABLE_PPE = [
  { id: 'ppe-1', name: 'helmet', label: 'Helmet', icon: '⛑️' },
  { id: 'ppe-2', name: 'vest', label: 'Safety Vest', icon: '🦺' },
  { id: 'ppe-3', name: 'boots', label: 'Safety Boots', icon: '👟' },
  { id: 'ppe-4', name: 'gloves', label: 'Gloves', icon: '🧤' },
  { id: 'ppe-5', name: 'goggles', label: 'Goggles', icon: '🥽' },
  { id: 'ppe-6', name: 'mask', label: 'Mask', icon: '😷' },
  { id: 'ppe-7', name: 'ear_protection', label: 'Ear Protection', icon: '🎧' }
]

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmp,  setEditingEmp]  = useState(null)
  const [qrEmp,       setQrEmp]       = useState(null)  // Employee whose QR to show
  const [qrDataUrl,   setQrDataUrl]   = useState('')
  const [formData, setFormData] = useState({
    card_number: '', name: '', department_id: '', category: '', ppe_item_ids: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [empRes, deptRes] = await Promise.all([
        axios.get(`${API}/api/employees`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/departments`)
      ])
      
      // Fetch PPE requirements for all employees
      const emps = await Promise.all(empRes.data.map(async (emp) => {
        try {
          const req = await axios.get(`${API}/api/employees/${emp.card_number}`)
          return { ...emp, required_ppe: req.data.required_ppe || [] }
        } catch(e) {
          return { ...emp, required_ppe: [] }
        }
      }))
      
      setEmployees(emps)
      setDepartments(deptRes.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp)
      // Map required_ppe names back to ppe_item_ids
      const assignedIds = AVAILABLE_PPE
        .filter(p => emp.required_ppe.includes(p.name))
        .map(p => p.id)
      
      setFormData({
        card_number: emp.card_number,
        name: emp.name,
        department_id: emp.department_id || '',
        category: emp.category || '',
        ppe_item_ids: assignedIds
      })
    } else {
      setEditingEmp(null)
      setFormData({ card_number: '', name: '', department_id: '', category: '', ppe_item_ids: [] })
    }
    setIsModalOpen(true)
  }

  const togglePPE = (ppeId) => {
    setFormData(prev => {
      const exists = prev.ppe_item_ids.includes(ppeId)
      return {
        ...prev,
        ppe_item_ids: exists 
          ? prev.ppe_item_ids.filter(id => id !== ppeId)
          : [...prev.ppe_item_ids, ppeId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingEmp) {
        await axios.put(`${API}/api/employees/${editingEmp.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
      } else {
        await axios.post(`${API}/api/employees`, formData, { headers: { Authorization: `Bearer ${token}` } })
      }
      setIsModalOpen(false)
      fetchData()
    } catch (e) {
      alert('Error saving employee: ' + (e.response?.data?.error || e.message))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-industrial-accent" /> Employee Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage personnel, ID cards, and custom PPE requirements.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-industrial-accent hover:bg-yellow-500 text-industrial-900 font-bold py-2 px-4 rounded flex items-center gap-2 transition">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-industrial-800 border border-industrial-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading employees...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-industrial-900/50 text-gray-400 border-b border-industrial-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Card / ID Number</th>
                <th className="px-6 py-4 font-semibold">Department / Role</th>
                <th className="px-6 py-4 font-semibold">Assigned PPE</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-700">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-industrial-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{emp.name}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-cyan-400">{emp.card_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-200">{emp.department_name || '—'}</div>
                    <div className="text-xs text-gray-500">{emp.category || 'Worker'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {emp.required_ppe?.length > 0 ? (
                      <div className="flex gap-2">
                        {emp.required_ppe.map(ppe => {
                          const icon = AVAILABLE_PPE.find(p => p.name === ppe)?.icon
                          return <span key={ppe} className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs" title={ppe}>{icon} {ppe.replace('_',' ')}</span>
                        })}
                      </div>
                    ) : (
                      <span className="text-blue-400 text-xs font-bold bg-blue-900/20 px-2 py-1 rounded">EXEMPT</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-1 justify-end">
                    <button onClick={async () => {
                      setQrEmp(emp)
                      const url = await QRCodeLib.toDataURL(emp.card_number, { width: 320, margin: 3, color: { dark: '#000000', light: '#ffffff' } })
                      setQrDataUrl(url)
                    }} className="text-gray-400 hover:text-yellow-400 p-2" title="Show QR Code"><QrCode size={16} /></button>
                    <button onClick={() => handleOpenModal(emp)} className="text-gray-400 hover:text-cyan-400 p-2" title="Edit"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-industrial-800 border border-industrial-700 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-industrial-700 flex justify-between items-center bg-industrial-900">
              <h2 className="text-lg font-bold text-white">{editingEmp ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="empForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Card / ID Number</label>
                    <input required value={formData.card_number} onChange={e => setFormData({...formData, card_number: e.target.value})}
                      disabled={!!editingEmp}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none font-mono" 
                      placeholder="e.g. 2401292298" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none" 
                      placeholder="e.g. Rahul Kumar" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Department</label>
                    <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none">
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Category / Role</label>
                    <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none" 
                      placeholder="e.g. Worker, Technician" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-700 pb-2">Assigned PPE Requirements</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_PPE.map(ppe => {
                      const isSelected = formData.ppe_item_ids.includes(ppe.id)
                      return (
                        <div key={ppe.id} onClick={() => togglePPE(ppe.id)}
                          className={`cursor-pointer flex items-center p-3 border rounded-lg transition-colors ${
                            isSelected ? 'bg-cyan-900/20 border-cyan-700' : 'bg-industrial-900 border-industrial-700 hover:border-gray-500'
                          }`}>
                          <div className="mr-3 text-cyan-400">
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-500" />}
                          </div>
                          <span className="mr-2 text-lg">{ppe.icon}</span>
                          <span className={isSelected ? 'text-white font-medium' : 'text-gray-400'}>{ppe.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Select the exact PPE required for this employee. If none are selected, the employee will be marked as EXEMPT.</p>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-industrial-700 bg-industrial-900 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
              <button form="empForm" type="submit" className="bg-industrial-accent hover:bg-yellow-500 text-industrial-900 font-bold px-6 py-2 rounded flex items-center gap-2 transition">
                <Save size={16} /> Save Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrEmp && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-950 border border-cyan-800 rounded-xl shadow-2xl p-8 w-80 text-center">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-white font-bold text-sm">{qrEmp.name}</div>
                <div className="text-cyan-400 font-mono text-xs">{qrEmp.card_number}</div>
              </div>
              <button onClick={() => { setQrEmp(null); setQrDataUrl('') }} className="text-gray-500 hover:text-white"><X size={18}/></button>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center shadow-xl">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>

            <div className="text-xs text-gray-500 mb-4">
              QR encodes only the card number.<br/>
              Print and attach to employee ID card.
            </div>

            <div className="flex gap-2">
              <a href={qrDataUrl} download={`qr-${qrEmp.card_number}.png`}
                className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded text-xs font-bold transition text-center">
                ⬇ Download PNG
              </a>
              <button onClick={() => { setQrEmp(null); setQrDataUrl('') }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-xs transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
