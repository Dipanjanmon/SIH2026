import { useApp } from '../App.jsx'
import Icon from '../icons.jsx'

export default function MapModal() {
  const { mapModalOpen, modalData, closeModal, switchTab } = useApp()
  if (!mapModalOpen) return null

  const dispatch = () => {
    closeModal()
    switchTab('cases')
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gov-900 text-white p-3 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider">Outbreak Focus Details</h3>
          <button onClick={closeModal} className="text-slate-300 hover:text-white">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Disease Agent:</span>
            <span id="modalDisease" className="font-bold text-slate-900">{modalData.disease}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Risk Severity:</span>
            <span id="modalRisk" className="font-bold text-red-600">{modalData.risk}</span>
          </div>
          <div className="border-b border-slate-100 pb-2">
            <span className="text-slate-500 block mb-1">Status Summary:</span>
            <p id="modalDesc" className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">{modalData.desc}</p>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button onClick={closeModal} className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50">Close</button>
            <button onClick={dispatch} className="px-3 py-1.5 bg-blue-700 text-white rounded font-bold hover:bg-blue-800">Dispatch MVU Response</button>
          </div>
        </div>
      </div>
    </div>
  )
}