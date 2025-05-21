import { useRouter } from "next/router";
import React from "react";

interface CategoryProps {
    label: string;
    path: string;
}

interface TabBarProps {
    categories: CategoryProps[];
    selectedPath: string;
    onSelect: (category: CategoryProps) => void;
}

const ScrollableTabBar: React.FC<TabBarProps> = ({ categories, selectedPath, onSelect }) => {
    const router = useRouter();
    return (
        <div className="w-full overflow-x-auto border-b">
            <div className="flex space-x-4 px-4 py-2 whitespace-nowrap">
                {categories.map((category) => (
                    <button
                        key={category.path || "all"}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 
              ${selectedPath === category.path
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500"}`}
                        onClick={() => {
                            onSelect(category);
                            router.push(
                                {
                                    pathname: category.path === "all" ? "/" : `/categories/${category.path}/1`,
                                    query: { label: category.label }
                                })
                        }
                        }
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div >
    );
};

export default ScrollableTabBar;