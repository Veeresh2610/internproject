import React, { useState } from "react";
import MentoringPageLayout from "./MentoringPageLayout";
import { FaPencilAlt, FaTrash, FaPlus, FaCaretDown } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa6";
import { toast } from "react-toastify";

interface Question {
  id: number;
  qno: number;
  questionText: string;
  options: string[];
}

const MOCK_MMP_QUESTIONS: Question[] = [
  {
    id: 1,
    qno: 1,
    questionText: "Are you satisfied with the teaching staff and their teaching methods",
    options: [
      "A. Extremely satisfied", "B. Satisfied",
      "C. Dissatisfied________(Specify)", "D. Extremely dissatisfied________(Specify)"
    ]
  },
  {
    id: 2,
    qno: 2,
    questionText: "Was it easy to obtain necessary resources from college library?",
    options: [
      "A. Yes", "B. No________(Specify)"
    ]
  }
];

const FIELD_SETTING_OPTIONS = [
  "Allow to add / modify / delete Questionnaire",
  "Allow to modify / delete Questionnaire only",
  "Do not allow to add / modify / delete Questionnaire",
  "Do not allow to modify / delete questions added by higher authority"
];

const QuestionnairePage: React.FC = () => {
  const [selectedTitle, setSelectedTitle] = useState("");
  const [isAddingMore, setIsAddingMore] = useState(false);

  // Dynamic states for blocks
  const [createTitle, setCreateTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [createBlocks, setCreateBlocks] = useState([{ id: 1, type: "", text: "", typeError: "", textError: "" }]);
  const [addMoreBlocks, setAddMoreBlocks] = useState([{ id: 1, type: "", text: "", typeError: "", textError: "" }]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTitle(e.target.value);
    setIsAddingMore(false);
  };

  const isCreating = selectedTitle === "Create Questionnaire";

  // Reusable component for the question block
  const QuestionBlock = ({ 
    num, 
    isPlus, 
    onAction,
    typeValue,
    onTypeChange,
    textValue,
    onTextChange,
    typeError,
    textError
  }: { 
    num: number; 
    isPlus: boolean; 
    onAction: () => void;
    typeValue: string;
    onTypeChange: (val: string) => void;
    textValue: string;
    onTextChange: (val: string) => void;
    typeError?: string;
    textError?: string;
  }) => (
    <div className="border border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col md:flex-row gap-4 mt-2 bg-white dark:bg-gray-800/50 shadow-sm max-w-5xl">
      <div className="flex-grow flex flex-col gap-3">
         <div className="flex flex-wrap gap-4">
            <input type="text" value={num} readOnly className="w-12 text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-[13px] bg-white dark:bg-gray-700" />
            <select className="w-64 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700">
               <option value="">Select question type</option>
               <option value="single select">single select</option>
               <option value="multiple select">multiple select</option>
               <option value="open-ended">open-ended</option>
            </select>
            <div className="flex flex-col">
              <select 
                value={typeValue}
                onChange={(e) => onTypeChange(e.target.value)}
                className={`w-64 border rounded px-3 py-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 ${typeError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                 <option value="">Select questionnaire type</option>
                 <option value="self Assessment/Personal questionaire">self Assessment/Personal questionaire</option>
                 <option value="Academic and Non Academic skills">Academic and Non Academic skills</option>
              </select>
              {typeError && <span className="text-red-500 text-[11px] mt-1">{typeError}</span>}
            </div>
         </div>
         <div className="flex flex-col gap-1">
            <textarea 
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              rows={3} 
              placeholder="Enter question" 
              className={`w-full border rounded px-3 py-2 text-[13px] text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-400 ${textError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            ></textarea>
            <div className="flex justify-between items-start mt-1">
              <div className="text-red-500 text-[11px]">{textError}</div>
              <div className="text-right text-[11px] text-[#337ab7] dark:text-blue-400 font-medium">{textValue.length} / 2000 characters</div>
            </div>
         </div>
      </div>
      
      <div className="w-48 shrink-0 flex flex-col gap-6 pl-4 border-l border-transparent">
         <div className="flex items-center gap-6 mt-1">
            <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Mandatory:</label>
            <input type="checkbox" defaultChecked className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
         </div>
         <button 
            type="button"
            onClick={onAction}
            className={`w-8 h-8 rounded-full text-white font-bold text-xl leading-none flex items-center justify-center shadow-sm transition-colors cursor-pointer pb-1 ${isPlus ? 'bg-[#337ab7] hover:bg-[#286090]' : 'bg-[#d9534f] hover:bg-[#c9302c]'}`}
         >
            {isPlus ? "+" : "-"}
         </button>
      </div>
    </div>
  );

  const handleSaveCreate = () => {
    let hasError = false;
    setTitleError("");
    const newBlocks = [...createBlocks];

    if (!createTitle.trim()) {
      setTitleError("Please enter questionnaire title");
      hasError = true;
    }
    
    for (let i = 0; i < newBlocks.length; i++) {
      newBlocks[i].textError = "";
      newBlocks[i].typeError = "";

      if (!newBlocks[i].text.trim()) {
        newBlocks[i].textError = "Please enter question";
        hasError = true;
      }
      if (!newBlocks[i].type) {
        newBlocks[i].typeError = "Please select questionnaire type";
        hasError = true;
      }
    }
    
    if (hasError) {
      setCreateBlocks(newBlocks);
      return;
    }

    toast.success("Questionnaire saved successfully!");
    setCreateTitle("");
    setTitleError("");
    setCreateBlocks([{ id: Date.now(), type: "", text: "", typeError: "", textError: "" }]);
  };

  const handleSaveAddMore = () => {
    let hasError = false;
    const newBlocks = [...addMoreBlocks];

    for (let i = 0; i < newBlocks.length; i++) {
      newBlocks[i].textError = "";
      newBlocks[i].typeError = "";

      if (!newBlocks[i].text.trim()) {
        newBlocks[i].textError = "Please enter question";
        hasError = true;
      }
      if (!newBlocks[i].type) {
        newBlocks[i].typeError = "Please select questionnaire type";
        hasError = true;
      }
    }
    
    if (hasError) {
      setAddMoreBlocks(newBlocks);
      return;
    }

    toast.success("Questions added successfully!");
    setAddMoreBlocks([{ id: Date.now(), type: "", text: "", typeError: "", textError: "" }]);
    setIsAddingMore(false);
  };

  return (
    <MentoringPageLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Banner Title */}
        <div className="bg-slate-800 dark:bg-slate-950 px-6 py-2.5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white tracking-wide">
            {isAddingMore ? "Add More Questions" : isCreating ? "Add Questionnaires" : "Questionnaires"}
          </h2>
        </div>

        {isAddingMore ? (
          // --- Add More Questions View ---
          <div className="p-6 flex flex-col gap-4 bg-white dark:bg-gray-800">
            {/* Read-only top info block */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-[200px_1fr] gap-4">
                <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Questionnaire Title:</div>
                <div className="text-[13px] text-gray-700 dark:text-gray-300">Student MMP Questionnaire</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] gap-4">
                <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Message to Mentees:</div>
                <div className="text-[13px] text-gray-700 dark:text-gray-300">Answer all mandatory questions.</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] gap-4">
                <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200 uppercase">field setting:</div>
                <div className="text-[13px] text-gray-700 dark:text-gray-300">Allow to add / modify / delete Questionnaire</div>
              </div>
            </div>

            {/* Question Builder Blocks */}
            {addMoreBlocks.map((block, index) => (
              <QuestionBlock 
                key={block.id} 
                num={3 + index} 
                isPlus={index === 0} 
                onAction={() => {
                  if (index === 0) setAddMoreBlocks(prev => [...prev, { id: Date.now(), type: "", text: "", typeError: "", textError: "" }]);
                  else setAddMoreBlocks(prev => prev.filter(b => b.id !== block.id));
                }}
                typeValue={block.type}
                onTypeChange={(val) => setAddMoreBlocks(prev => prev.map(b => b.id === block.id ? { ...b, type: val, typeError: "" } : b))}
                textValue={block.text}
                onTextChange={(val) => setAddMoreBlocks(prev => prev.map(b => b.id === block.id ? { ...b, text: val, textError: "" } : b))}
                typeError={block.typeError}
                textError={block.textError}
              />
            ))}

            {/* Bottom Buttons */}
            <div className="flex flex-col items-end gap-2 mt-4 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 w-full max-w-5xl">
              <button 
                type="button"
                onClick={() => setAddMoreBlocks(prev => [...prev, { id: Date.now(), type: "", text: "", typeError: "", textError: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#337ab7] rounded hover:bg-[#286090] shadow-sm transition-colors"
              >
                 <FaPlus size={12} /> Add Question
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAddingMore(false)} 
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#d9534f] rounded hover:bg-[#c9302c] shadow-sm transition-colors"
                >
                   Close
                </button>
                <button 
                  onClick={handleSaveAddMore}
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#337ab7] rounded hover:bg-[#286090] shadow-sm transition-colors"
                >
                   Save
                </button>
              </div>
            </div>
          </div>
        ) : isCreating ? (
          // --- Add Questionnaire View ---
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-gray-800">
            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 w-48 shrink-0 mt-2">
                Questionnaire Title: <span className="text-red-500">*</span>
              </label>
              <div className="w-full max-w-lg flex flex-col">
                <input 
                  type="text" 
                  value={createTitle}
                  onChange={(e) => {
                    setCreateTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError("");
                  }}
                  placeholder="Enter questionnaire title" 
                  className={`w-full px-3 py-1.5 text-[13px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border rounded focus:outline-none focus:border-blue-400 shadow-sm ${titleError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
                />
                {titleError && <span className="text-red-500 text-[11px] mt-1">{titleError}</span>}
              </div>
            </div>
            
            {/* Message */}
            <div className="flex flex-col md:flex-row gap-4">
              <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 w-48 shrink-0 mt-1">
                Message to Mentees:
              </label>
              <div className="w-full max-w-lg flex flex-col gap-1">
                <textarea 
                  rows={2} 
                  placeholder="Enter message to mentees" 
                  className="w-full px-3 py-1.5 text-[13px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-400 shadow-sm resize-y"
                ></textarea>
                <div className="text-right text-[11px] text-[#337ab7] dark:text-blue-400 font-medium">0 / 2000 characters</div>
              </div>
            </div>
            
            {/* Field Setting */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 w-48 shrink-0">
                Field Setting: <span className="text-red-500">*</span>
              </label>
              <select className="w-full max-w-lg px-3 py-1.5 text-[13px] bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-400 shadow-sm">
                {FIELD_SETTING_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            {/* Question Builder Blocks */}
            {createBlocks.map((block, index) => (
              <QuestionBlock 
                key={block.id} 
                num={index + 1} 
                isPlus={index === 0} 
                onAction={() => {
                  if (index === 0) setCreateBlocks(prev => [...prev, { id: Date.now(), type: "", text: "", typeError: "", textError: "" }]);
                  else setCreateBlocks(prev => prev.filter(b => b.id !== block.id));
                }}
                typeValue={block.type}
                onTypeChange={(val) => setCreateBlocks(prev => prev.map(b => b.id === block.id ? { ...b, type: val, typeError: "" } : b))}
                textValue={block.text}
                onTextChange={(val) => setCreateBlocks(prev => prev.map(b => b.id === block.id ? { ...b, text: val, textError: "" } : b))}
                typeError={block.typeError}
                textError={block.textError}
              />
            ))}

            {/* Bottom Buttons */}
            <div className="flex flex-col items-end gap-2 mt-4 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 w-full max-w-5xl">
              <button 
                type="button"
                onClick={() => setCreateBlocks(prev => [...prev, { id: Date.now(), type: "", text: "", typeError: "", textError: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#337ab7] rounded hover:bg-[#286090] shadow-sm transition-colors"
              >
                 <FaPlus size={12} /> Add Question
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedTitle("")} 
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#d9534f] rounded hover:bg-[#c9302c] shadow-sm transition-colors"
                >
                   Close
                </button>
                <button 
                  onClick={handleSaveCreate}
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#337ab7] rounded hover:bg-[#286090] shadow-sm transition-colors"
                >
                   Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          // --- Questionnaires List View ---
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              
              {/* Dropdown */}
              <div className="flex flex-col gap-1 w-72">
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
                  Questionnaire Title: <span className="text-red-500">*</span>
                </label>
                <select 
                  value={selectedTitle}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-1.5 text-[13px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-500 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="">Select Questionnaire</option>
                  <option value="Create Questionnaire">Create Questionnaire</option>
                  <option value="Student MMP Questionnaire">Student MMP Questionnaire</option>
                </select>
              </div>

              {/* Top Right Buttons */}
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-white bg-[#5cb85c] rounded hover:bg-[#4cae4c] shadow-sm transition-colors">
                  <FaFileExport size={12} /> Export <FaCaretDown size={12} />
                </button>
                <button 
                  onClick={() => setIsAddingMore(true)}
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#337ab7] rounded hover:bg-[#286090] shadow-sm transition-colors"
                >
                  Add More Questions
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-[13px]">
                <thead className="bg-white dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 w-16"></th>
                    <th className="px-4 py-2 text-left"></th>
                    <th className="px-4 py-2 text-center w-24 font-bold text-gray-800 dark:text-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedTitle === "Student MMP Questionnaire" ? (
                    <>
                      {/* Subheader */}
                      <tr className="bg-[#d9edf7] dark:bg-[#1f3a4d]">
                        <td colSpan={3} className="px-4 py-2 text-[13px] font-bold text-gray-800 dark:text-gray-200">
                          Field Setting: <span className="font-normal text-gray-600 dark:text-gray-400">Allow to add / modify / delete Questionnaire</span>
                        </td>
                      </tr>
                      {/* Rows */}
                      {MOCK_MMP_QUESTIONS.map(q => (
                        <tr key={q.id}>
                          <td className="px-4 py-4 text-center align-top font-medium text-gray-700 dark:text-gray-300">{q.qno}</td>
                          <td className="px-4 py-4">
                            <p className="mb-2 text-gray-800 dark:text-gray-200">{q.questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                              {q.options.map((opt, idx) => (
                                <div key={idx}>{opt}</div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-3">
                              <button className="text-[#337ab7] hover:text-[#286090] dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                <FaPencilAlt size={13} />
                              </button>
                              <button className="text-[#d9534f] hover:text-[#c9302c] dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                <FaTrash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Select a questionnaire to view its questions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </MentoringPageLayout>
  );
};

export default QuestionnairePage;
