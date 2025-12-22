import { useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useCategoriesQuery, useDeleteCategory } from "../../hooks/useCategories"; // Assuming these exist
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { 
  PlusIcon, 
  TrashIcon, 
  TagIcon,
  ArchiveBoxIcon 
} from "@heroicons/react/24/outline";

export default function CategoryList() {
  const { data: categories, isLoading, refetch } = useCategoriesQuery();
  const deleteMutation = useDeleteCategory();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader />
          <p className="mt-4 text-slate-500 animate-pulse">Loading categories...</p>
        </div>
      </DashboardLayout>
    );
  }

  const columns = [
    { 
      title: "Category Name", 
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <TagIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wide">{row.name}</span>
        </div>
      )
    },
    { 
      title: "Category ID", 
      key: "id",
      render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>
    },
    {
      title: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if(confirm(`Delete "${row.name}"? This may affect products linked to it.`)) deleteMutation.mutate(row.id)}}
            disabled={deleteMutation.isPending}
            className="p-2 hover:bg-red-50 rounded-full group transition-colors"
            title="Delete Category"
          >
            <TrashIcon className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Categories</h1>
          <p className="text-slate-500 text-sm">Manage the dynamic categories for your inventory.</p>
        </div>
        
        <Link to="/categories/new">
          <Button className="flex items-center gap-2 px-5 shadow-lg shadow-indigo-200">
            <PlusIcon className="w-5 h-5" />
            Add New Category
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {categories?.length > 0 ? (
          <Table columns={columns} data={categories} className="min-w-full divide-y divide-slate-200" />
        ) : (
          <div className="p-20 text-center">
            <ArchiveBoxIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-900 font-semibold">No categories found</h3>
            <p className="text-slate-500 text-sm">Start by adding a new product category.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}