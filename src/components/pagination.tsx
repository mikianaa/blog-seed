import Link from 'next/link';

const Pagination = (pagesProps: { pages :number[], current_page :number }) => {
    const current_page = 1;
    const pages  = pagesProps.pages;
  return (
    <div className="flex items-center space-x-1 mt-8">
      {pages.map((page) => (
        <Link href={`/page/${page}`} key={page}>
          <div
            className={`px-4 py-2 border hover:bg-black hover:text-white ${
              current_page == page && 'bg-black text-white'
            }`}
          >
            {page}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Pagination;