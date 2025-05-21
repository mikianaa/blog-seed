import Link from "next/link";

type PageProps = {
  pages: number[];
  current_page: number;
  category?: string;
};

const Pagination = ({ pages, current_page = 1, category }: PageProps) => {
  return (
    <div className="flex items-center space-x-1 mt-8">
      {pages.map((page) => {
        const href = category
          ? `/categories/${category}/${page}`
          : `/${page}`;

        return (
          <Link href={href} key={page}>
            <div
              className={`px-4 py-2 border hover:bg-black hover:text-white ${current_page === page ? "bg-black text-white" : ""
                }`}
            >
              {page}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Pagination;
