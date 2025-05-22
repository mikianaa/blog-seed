import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 border-b h-20 z-10 bg-white">
      <div className="max-w-[70rem] mx-auto flex justify-between items-center h-20">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="text-3xl font-serif font-medium">
            Seed
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
