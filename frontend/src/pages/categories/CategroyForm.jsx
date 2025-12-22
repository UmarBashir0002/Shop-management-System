import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useCreateCategory } from "../../hooks/useCategories";
import Button from "../../components/common/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CategoryForm() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const createMutation = useCreateCategory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({ name }, {
      onSuccess: () => {
        navigate("/categories");
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Create New Category</h1>
          <p className="text-slate-500 text-sm mb-8">This will appear in the dropdown when adding new products.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MONITORS, PRINTERS, etc."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium uppercase placeholder:normal-case"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/categories")}
                className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
                className="px-8"
              >
                {createMutation.isPending ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}